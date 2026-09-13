import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  Habit, 
  HabitCompletion, 
  MoodEntry, 
  HealthMetric, 
  NotificationSettings, 
  AICoachMessage, 
  AIInsight,
  WellnessScoreBreakdown,
  SyncQueueItem,
  DailyRecord
} from '../types';
import { 
  StorageService, 
  getTodayDateString, 
  calculateHabitStreaks, 
  calculateWellnessScore 
} from '../services/storage';
import { IndexedDBService } from '../services/db';
import { ApiService } from '../services/api';
import { SupabaseDataService } from '../services/supabaseData';
import { FirestoreDataService } from '../services/firestoreData';
import { getSupabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from './AuthContext';
import { NotificationService } from '../services/notifications';
import { formatTimeTo12Hour } from '../utils/timeFormat';
import confetti from 'canvas-confetti';

interface AppContextType {
  habits: Habit[];
  completions: HabitCompletion[];
  dailyRecords: DailyRecord[];
  moodEntries: MoodEntry[];
  healthMetrics: HealthMetric[];
  notificationSettings: NotificationSettings;
  aiMessages: AICoachMessage[];
  aiInsight: AIInsight;
  wellnessScore: WellnessScoreBreakdown;
  isOnline: boolean;
  syncQueue: SyncQueueItem[];
  isSyncing: boolean;
  theme: 'light' | 'dark';
  celebrationEvent: { type: 'streak' | 'all_done'; streakCount?: number } | null;
  activeReminderNotification: { id: string; title: string; body: string; habitId?: string; reminderTime?: string } | null;

  // Actions
  toggleHabitCompletion: (habitId: string, date?: string) => void;
  createHabit: (habit: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'streak' | 'bestStreak' | 'totalCompletions'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitArchive: (id: string) => void;
  toggleHabitPause: (id: string) => void;
  dismissReminder: () => void;
  reconcileHabits: () => Promise<void>;
  
  // Mood
  logMood: (score: 1 | 2 | 3 | 4 | 5, emotions: any[], notes?: string, date?: string) => void;
  
  // Health
  logHealthMetric: (metric: Partial<HealthMetric>, date?: string) => void;

  // AI
  sendAIChatMessage: (text: string) => Promise<void>;
  refreshAIInsights: () => Promise<void>;
  clearAIConversation: () => void;

  todayUnfinishedHabitsCount: number;
  requestNotificationPermission: () => Promise<'granted' | 'denied' | 'default'>;
  sendTestNotification: () => Promise<{ success: boolean; message: string }>;

  // Settings & Theme & Backup
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<boolean>;
  setTheme: (theme: 'light' | 'dark') => void;
  triggerManualSync: () => Promise<void>;
  clearCelebration: () => void;
  exportBackupJSON: () => Promise<string>;
  importBackupJSON: (jsonString: string) => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, firebaseUser } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(StorageService.getNotificationSettings());
  const [aiMessages, setAiMessages] = useState<AICoachMessage[]>([]);
  const [aiInsight, setAiInsight] = useState<AIInsight>(StorageService.getAIInsight());
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [celebrationEvent, setCelebrationEvent] = useState<{ type: 'streak' | 'all_done'; streakCount?: number } | null>(null);
  const [activeReminderNotification, setActiveReminderNotification] = useState<{
    id: string;
    title: string;
    body: string;
    habitId?: string;
    reminderTime?: string;
  } | null>(null);

  // Helper to determine if a habit is scheduled for a given date
  const isHabitDueOnDate = (h: Habit, dateStr: string): boolean => {
    if (h.isArchived || h.isPaused) return false;
    if (!h.frequency || h.frequency === 'daily') return true;
    const dayOfWeek = new Date(dateStr + 'T12:00:00').getDay();
    if (h.frequency === 'weekdays') {
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
    if (h.frequency === 'custom' && Array.isArray(h.customDays) && h.customDays.length > 0) {
      return h.customDays.includes(dayOfWeek);
    }
    return true;
  };

  const todayDateStr = getTodayDateString();
  const habitsDueTodayList = habits.filter(h => isHabitDueOnDate(h, todayDateStr));
  const completedTodayIdsSet = new Set(
    completions.filter(c => c.date === todayDateStr).map(c => c.habitId)
  );
  const todayUnfinishedHabitsList = habitsDueTodayList.filter(h => !completedTodayIdsSet.has(h.id));
  const todayUnfinishedHabitsCount = todayUnfinishedHabitsList.length;

  // Periodic real daily habit reminder & on-time reminder engine
  useEffect(() => {
    if (!user || habits.length === 0) return;

    const checkReminders = async () => {
      // If notifications are disabled globally, skip
      if (!notificationSettings.enabled) return;
      if (NotificationService.getPermissionStatus() !== 'granted') return;

      const now = new Date();
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMin = String(now.getMinutes()).padStart(2, '0');
      const currentTime24 = `${currentHour}:${currentMin}`;
      const today = getTodayDateString();

      const activeDueToday = habits.filter(h => isHabitDueOnDate(h, today));
      const doneTodayIds = new Set(
        completions.filter(c => c.date === today).map(c => c.habitId)
      );

      // 1. Daily Unfinished Habit Reminder (at notificationSettings.reminderTime)
      if (notificationSettings.dailyUnfinishedReminder !== false) {
        if (currentTime24 === notificationSettings.reminderTime) {
          const reminderKey = `daily_reminder_${user.id}_${today}_${notificationSettings.reminderTime}`;
          if (localStorage.getItem(reminderKey) !== 'true') {
            const unfinished = activeDueToday.filter(h => !doneTodayIds.has(h.id));
            if (unfinished.length > 0) {
              await NotificationService.sendDailyUnfinishedReminder(
                unfinished.length,
                notificationSettings.reminderTime,
                unfinished.map(h => h.name)
              );
              localStorage.setItem(reminderKey, 'true');
            } else {
              // IMPORTANT: Do NOT notify the user about habits that are already completed.
              localStorage.setItem(reminderKey, 'true');
            }
          }
        }
      }

      // 2. Individual On-Time Habit Reminders (if habitsEnabled is true)
      if (notificationSettings.habitsEnabled) {
        for (const habit of activeDueToday) {
          if (doneTodayIds.has(habit.id)) continue;
          if (habit.reminderTime === currentTime24) {
            if (!NotificationService.hasFiredThisMinute(`habit_${habit.id}`)) {
              const time12 = formatTimeTo12Hour(habit.reminderTime);
              const title = `Routine Reminder: ${habit.name}`;
              const body = `It's ${time12}! Time for your ${habit.category} routine.`;
              await NotificationService.triggerNotification(title, body, {
                tag: `routine-${habit.id}-${today}`,
              });
              break;
            }
          }
        }
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [habits, completions, user, notificationSettings]);

  const dismissReminder = () => {
    setActiveReminderNotification(null);
  };

  // Load user data whenever authenticated user changes
  useEffect(() => {
    if (!user?.id) {
      // Unauthenticated: clear data
      setHabits([]);
      setCompletions([]);
      setMoodEntries([]);
      setHealthMetrics([]);
      return;
    }

    const currentUserId = user.id;

    // Load from local storage initially for this profile
    const localHabits = StorageService.getHabits(currentUserId);
    const localCompletions = StorageService.getCompletions(currentUserId);
    const localMoods = StorageService.getMoods(currentUserId);
    const localMetrics = StorageService.getHealthMetrics(currentUserId);

    const updatedHabits = localHabits.map(h => {
      const stats = calculateHabitStreaks(h.id, localCompletions);
      return {
        ...h,
        userId: currentUserId,
        streak: stats.currentStreak,
        bestStreak: stats.bestStreak,
        totalCompletions: stats.totalCompletions,
      };
    });

    setHabits(updatedHabits);
    setCompletions(localCompletions);
    setMoodEntries(localMoods);
    setHealthMetrics(localMetrics);
    setAiMessages(StorageService.getAIMessages());
    setAiInsight(StorageService.getAIInsight());
    setSyncQueue(StorageService.getSyncQueue());

    // Automatically reconcile missed days across past dates in IndexedDB
    IndexedDBService.reconcileMissedDays(currentUserId, updatedHabits, localCompletions)
      .then(({ updatedHabits: reconciledHabits, newDailyRecords }) => {
        setHabits(reconciledHabits);
        StorageService.saveHabitsForUser(currentUserId, reconciledHabits);
        setDailyRecords(newDailyRecords);
      })
      .catch((err) => {
        console.warn('IDB reconciliation note:', err);
      });

    // 1. SUPABASE DATA FETCH & REALTIME SUBSCRIPTION
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      Promise.all([
        SupabaseDataService.fetchHabits(currentUserId),
        SupabaseDataService.fetchCompletions(currentUserId),
        SupabaseDataService.fetchMoods(currentUserId),
        SupabaseDataService.fetchHealthMetrics(currentUserId),
      ]).then(([remoteHabits, remoteComps, remoteMoods, remoteMetrics]) => {
        if (remoteHabits.length > 0 || remoteComps.length > 0) {
          const recalculated = remoteHabits.map(h => {
            const stats = calculateHabitStreaks(h.id, remoteComps);
            return {
              ...h,
              streak: stats.currentStreak,
              bestStreak: stats.bestStreak,
              totalCompletions: stats.totalCompletions,
            };
          });
          setHabits(recalculated);
          StorageService.saveHabits(recalculated);
          setCompletions(remoteComps);
          StorageService.saveCompletions(remoteComps);
        }
        if (remoteMoods.length > 0) {
          setMoodEntries(remoteMoods);
          StorageService.saveMoods(remoteMoods);
        }
        if (remoteMetrics.length > 0) {
          setHealthMetrics(remoteMetrics);
          StorageService.saveHealthMetrics(remoteMetrics);
        }
      });

      const unsubSupabase = SupabaseDataService.subscribeUserChanges(currentUserId, async () => {
        const [rHabits, rComps, rMoods, rMetrics] = await Promise.all([
          SupabaseDataService.fetchHabits(currentUserId),
          SupabaseDataService.fetchCompletions(currentUserId),
          SupabaseDataService.fetchMoods(currentUserId),
          SupabaseDataService.fetchHealthMetrics(currentUserId),
        ]);
        if (rHabits.length > 0) {
          setHabits(rHabits);
          StorageService.saveHabits(rHabits);
        }
        if (rComps.length > 0) {
          setCompletions(rComps);
          StorageService.saveCompletions(rComps);
        }
        if (rMoods.length > 0) {
          setMoodEntries(rMoods);
          StorageService.saveMoods(rMoods);
        }
        if (rMetrics.length > 0) {
          setHealthMetrics(rMetrics);
          StorageService.saveHealthMetrics(rMetrics);
        }
      });

      return () => {
        unsubSupabase();
      };
    }

    // 2. FIREBASE REALTIME SUBSCRIPTION FALLBACK
    if (firebaseUser?.uid) {
      const unsubHabits = FirestoreDataService.subscribeHabits(currentUserId, (remoteHabits) => {
        if (remoteHabits.length > 0) {
          setHabits(remoteHabits);
          StorageService.saveHabits(remoteHabits);
        }
      });

      const unsubCompletions = FirestoreDataService.subscribeCompletions(currentUserId, (remoteComps) => {
        if (remoteComps.length > 0) {
          setCompletions(remoteComps);
          StorageService.saveCompletions(remoteComps);
        }
      });

      const unsubMoods = FirestoreDataService.subscribeMoods(currentUserId, (remoteMoods) => {
        if (remoteMoods.length > 0) {
          setMoodEntries(remoteMoods);
          StorageService.saveMoods(remoteMoods);
        }
      });

      const unsubMetrics = FirestoreDataService.subscribeHealthMetrics(currentUserId, (remoteMetrics) => {
        if (remoteMetrics.length > 0) {
          setHealthMetrics(remoteMetrics);
          StorageService.saveHealthMetrics(remoteMetrics);
        }
      });

      return () => {
        unsubHabits();
        unsubCompletions();
        unsubMoods();
        unsubMetrics();
      };
    }
  }, [user?.id, firebaseUser?.uid]);

  // Initial theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('aura_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerManualSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('aura_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#10b981', '#06b6d4', '#6366f1', '#f59e0b'],
      });
    } catch {
      // safe fallback
    }
  };

  // Sync Queue Runner
  const triggerManualSync = useCallback(async () => {
    const queue = StorageService.getSyncQueue();
    if (queue.length === 0 || !navigator.onLine) return;

    setIsSyncing(true);
    try {
      await ApiService.syncOfflineQueue(queue);
      StorageService.clearSyncQueue();
      setSyncQueue([]);
    } catch (e) {
      console.warn('Sync attempt note:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Toggle habit completion for a specific date
  const toggleHabitCompletion = (habitId: string, dateStr: string = getTodayDateString()) => {
    if (!user?.id) return;
    const currentUserId = user.id;

    const existingIndex = completions.findIndex(c => c.habitId === habitId && c.date === dateStr);
    let newCompletions: HabitCompletion[] = [];
    let isCompletedNow = false;

    if (existingIndex >= 0) {
      // Uncomplete
      const existingComp = completions[existingIndex];
      newCompletions = completions.filter((_, idx) => idx !== existingIndex);
      StorageService.addToSyncQueue({
        entity: 'completion',
        action: 'delete',
        payload: { habitId, date: dateStr },
      });
      if (existingComp?.id) {
        IndexedDBService.deleteCompletion(existingComp.id).catch(() => {});
        const supabase = getSupabase();
        if (supabase && isSupabaseConfigured) {
          SupabaseDataService.deleteCompletion(existingComp.id, currentUserId);
        } else {
          FirestoreDataService.deleteCompletion(existingComp.id);
        }
      }
    } else {
      // Complete
      isCompletedNow = true;
      const targetHabit = habits.find(h => h.id === habitId);
      const newCompletion: HabitCompletion = {
        id: `comp-${habitId}-${dateStr}-${Date.now()}`,
        habitId,
        userId: currentUserId,
        date: dateStr,
        completedAt: new Date().toISOString(),
        value: targetHabit?.goalTarget || 1,
      };
      newCompletions = [...completions, newCompletion];
      StorageService.addToSyncQueue({
        entity: 'completion',
        action: 'create',
        payload: newCompletion,
      });

      const supabase = getSupabase();
      if (supabase && isSupabaseConfigured) {
        SupabaseDataService.saveCompletion(newCompletion);
      } else {
        FirestoreDataService.saveCompletion(newCompletion);
      }

      NotificationService.playChime('completion');
      triggerConfetti();
    }

    StorageService.saveCompletionsForUser(currentUserId, newCompletions);
    setCompletions(newCompletions);

    // Recalculate habit streak stats
    const updatedHabits = habits.map(h => {
      if (h.id === habitId) {
        const stats = calculateHabitStreaks(h.id, newCompletions);
        if (isCompletedNow && stats.currentStreak > 0 && stats.currentStreak % 5 === 0) {
          NotificationService.playChime('streak');
          setCelebrationEvent({ type: 'streak', streakCount: stats.currentStreak });
        }
        const updatedHabitItem: Habit = {
          ...h,
          streak: stats.currentStreak,
          bestStreak: stats.bestStreak,
          totalCompletions: stats.totalCompletions,
          updatedAt: new Date().toISOString(),
        };

        const supabase = getSupabase();
        if (supabase && isSupabaseConfigured) {
          SupabaseDataService.saveHabit(updatedHabitItem);
        } else {
          FirestoreDataService.saveHabit(updatedHabitItem);
        }
        return updatedHabitItem;
      }
      return h;
    });

    StorageService.saveHabitsForUser(currentUserId, updatedHabits);
    setHabits(updatedHabits);

    // Update DailyRecord in IndexedDB
    const todayStr = getTodayDateString();
    const recordId = `${currentUserId}_${habitId}_${dateStr}`;
    const newDailyRecord: DailyRecord = {
      id: recordId,
      userId: currentUserId,
      habitId,
      date: dateStr,
      status: isCompletedNow ? 'completed' : (dateStr < todayStr ? 'missed' : 'pending'),
      completedAt: isCompletedNow ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };
    IndexedDBService.saveDailyRecord(newDailyRecord).catch(() => {});
    setDailyRecords(prev => {
      const filtered = prev.filter(r => r.id !== recordId);
      return [...filtered, newDailyRecord];
    });

    // Check if all active habits for today are now completed
    const activeHabitsToday = updatedHabits.filter(h => !h.isArchived && !h.isPaused);
    const completedTodayCount = newCompletions.filter(c => c.date === dateStr).length;
    if (isCompletedNow && activeHabitsToday.length > 0 && completedTodayCount >= activeHabitsToday.length) {
      NotificationService.playChime('streak');
      setCelebrationEvent({ type: 'all_done' });
    }
  };

  const createHabit = (newHabitData: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'streak' | 'bestStreak' | 'totalCompletions'>) => {
    if (!user?.id) return;
    const currentUserId = user.id;
    const habitId = 'habit-' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const newHabit: Habit = {
      ...newHabitData,
      id: habitId,
      userId: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      streak: 0,
      bestStreak: 0,
      totalCompletions: 0,
    };

    const updated = [newHabit, ...habits];
    StorageService.saveHabitsForUser(currentUserId, updated);
    setHabits(updated);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      SupabaseDataService.saveHabit(newHabit);
    } else {
      FirestoreDataService.saveHabit(newHabit);
    }

    StorageService.addToSyncQueue({
      entity: 'habit',
      action: 'create',
      payload: newHabit,
    });
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    if (!user?.id) return;
    const currentUserId = user.id;
    const updated = habits.map(h => {
      if (h.id === id) {
        const item = { ...h, ...updates, updatedAt: new Date().toISOString() };
        const supabase = getSupabase();
        if (supabase && isSupabaseConfigured) {
          SupabaseDataService.saveHabit(item);
        } else {
          FirestoreDataService.saveHabit(item);
        }
        return item;
      }
      return h;
    });
    StorageService.saveHabitsForUser(currentUserId, updated);
    setHabits(updated);
    StorageService.addToSyncQueue({
      entity: 'habit',
      action: 'update',
      payload: { id, updates },
    });
  };

  const deleteHabit = (id: string) => {
    if (!user?.id) return;
    const currentUserId = user.id;
    const updated = habits.filter(h => h.id !== id);
    const updatedCompletions = completions.filter(c => c.habitId !== id);
    StorageService.saveHabitsForUser(currentUserId, updated);
    StorageService.saveCompletionsForUser(currentUserId, updatedCompletions);
    IndexedDBService.deleteHabit(id).catch(() => {});
    for (const comp of completions.filter(c => c.habitId === id)) {
      IndexedDBService.deleteCompletion(comp.id).catch(() => {});
    }
    setHabits(updated);
    setCompletions(updatedCompletions);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      SupabaseDataService.deleteHabit(id, currentUserId);
    } else {
      FirestoreDataService.deleteHabit(id);
    }

    StorageService.addToSyncQueue({
      entity: 'habit',
      action: 'delete',
      payload: { id },
    });
  };

  const toggleHabitArchive = (id: string) => {
    const target = habits.find(h => h.id === id);
    if (!target) return;
    updateHabit(id, { isArchived: !target.isArchived });
  };

  const toggleHabitPause = (id: string) => {
    const target = habits.find(h => h.id === id);
    if (!target) return;
    updateHabit(id, { isPaused: !target.isPaused });
  };

  // Log Mood Entry
  const logMood = (score: 1 | 2 | 3 | 4 | 5, emotions: any[], notes?: string, dateStr: string = getTodayDateString()) => {
    if (!user?.id) return;
    const currentUserId = user.id;
    const newEntry: MoodEntry = {
      id: `mood-${dateStr}-${Date.now()}`,
      userId: currentUserId,
      date: dateStr,
      timestamp: new Date().toISOString(),
      score,
      emotions,
      notes,
    };
    const filtered = moodEntries.filter(m => m.date !== dateStr);
    const updated = [newEntry, ...filtered];
    StorageService.saveMoodsForUser(currentUserId, updated);
    setMoodEntries(updated);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      SupabaseDataService.saveMood(newEntry);
    } else {
      FirestoreDataService.saveMood(newEntry);
    }

    StorageService.addToSyncQueue({
      entity: 'mood',
      action: 'create',
      payload: newEntry,
    });
  };

  // Log Health Metric
  const logHealthMetric = (metricUpdates: Partial<HealthMetric>, dateStr: string = getTodayDateString()) => {
    if (!user?.id) return;
    const currentUserId = user.id;
    const existingIndex = healthMetrics.findIndex(m => m.date === dateStr);
    let updated: HealthMetric[];
    let targetMetric: HealthMetric;

    if (existingIndex >= 0) {
      const current = healthMetrics[existingIndex];
      targetMetric = {
        ...current,
        ...metricUpdates,
        updatedAt: new Date().toISOString(),
      };
      updated = [...healthMetrics];
      updated[existingIndex] = targetMetric;
    } else {
      targetMetric = {
        id: `health-${dateStr}-${Date.now()}`,
        userId: currentUserId,
        date: dateStr,
        ...metricUpdates,
        updatedAt: new Date().toISOString(),
      };
      updated = [targetMetric, ...healthMetrics];
    }

    StorageService.saveHealthMetricsForUser(currentUserId, updated);
    setHealthMetrics(updated);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      SupabaseDataService.saveHealthMetric(targetMetric);
    } else {
      FirestoreDataService.saveHealthMetric(targetMetric);
    }

    StorageService.addToSyncQueue({
      entity: 'metric',
      action: 'create',
      payload: targetMetric,
    });
  };

  // AI Coach Interactions
  const sendAIChatMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: AICoachMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...aiMessages, userMsg];
    setAiMessages(newMessages);
    StorageService.saveAIMessages(newMessages);

    try {
      const activeUser = user || StorageService.getProfile() || {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        selectedCategories: ['Fitness', 'Nutrition', 'Mental wellness', 'Productivity'],
        goals: ['Build consistency'],
        reminderTimePreference: '08:00',
        wakeTime: '07:00',
        sleepTime: '23:00',
        isOnboarded: true,
        theme: 'light' as const,
        units: 'metric' as const,
        createdAt: new Date().toISOString(),
      };

      const response = await ApiService.askAICoach({
        messages: newMessages,
        userProfile: activeUser,
        habits,
        completions,
        moodEntries,
        healthMetrics,
      });

      const coachMsg: AICoachMessage = {
        id: 'msg-reply-' + Date.now(),
        sender: 'assistant',
        text: response.reply,
        suggestions: response.suggestions,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...newMessages, coachMsg];
      setAiMessages(finalMessages);
      StorageService.saveAIMessages(finalMessages);
    } catch (e) {
      console.warn('AI reply generation warning:', e);
      const fallbackMsg: AICoachMessage = {
        id: 'msg-fallback-' + Date.now(),
        sender: 'assistant',
        text: "I'm focusing on your daily habits right now. Consistency is key: keep ticking off your daily routines!",
        timestamp: new Date().toISOString(),
      };
      const finalFallback = [...newMessages, fallbackMsg];
      setAiMessages(finalFallback);
      StorageService.saveAIMessages(finalFallback);
    }
  };

  const refreshAIInsights = async () => {
    try {
      const activeUser = user || StorageService.getProfile() || {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        selectedCategories: ['Fitness', 'Nutrition', 'Mental wellness', 'Productivity'],
        goals: ['Build consistency'],
        reminderTimePreference: '08:00',
        wakeTime: '07:00',
        sleepTime: '23:00',
        isOnboarded: true,
        theme: 'light' as const,
        units: 'metric' as const,
        createdAt: new Date().toISOString(),
      };

      const response = await ApiService.getAIInsights({
        userProfile: activeUser,
        habits,
        completions,
        moodEntries,
        healthMetrics,
      });

      if (response?.insight) {
        setAiInsight(response.insight);
        StorageService.saveAIInsight(response.insight);
      }
    } catch (e) {
      console.warn('Insight refresh note:', e);
    }
  };

  const clearAIConversation = () => {
    StorageService.saveAIMessages([]);
    setAiMessages([]);
  };

  const updateNotificationSettings = (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...notificationSettings, ...newSettings };
    setNotificationSettings(updated);
    StorageService.saveNotificationSettings(updated);
  };

  const clearCelebration = () => {
    setCelebrationEvent(null);
  };

  const reconcileHabits = async () => {
    if (!user?.id) return;
    const currentUserId = user.id;
    const currentHabits = StorageService.getHabits(currentUserId);
    const currentComps = StorageService.getCompletions(currentUserId);
    try {
      const result = await IndexedDBService.reconcileMissedDays(currentUserId, currentHabits, currentComps);
      setHabits(result.updatedHabits);
      StorageService.saveHabitsForUser(currentUserId, result.updatedHabits);
      setDailyRecords(result.newDailyRecords);
    } catch (e) {
      console.warn('Reconcile error:', e);
    }
  };

  const exportBackupJSON = async (): Promise<string> => {
    return await IndexedDBService.exportAllDataJSON();
  };

  const importBackupJSON = async (jsonString: string): Promise<{ success: boolean; message: string }> => {
    const result = await IndexedDBService.importAllDataJSON(jsonString);
    if (result.success && user?.id) {
      await StorageService.syncFromIndexedDB();
      await reconcileHabits();
    }
    return result;
  };

  const wellnessScore = calculateWellnessScore(habits, completions, moodEntries, healthMetrics);

  return (
    <AppContext.Provider
      value={{
        habits,
        completions,
        dailyRecords,
        moodEntries,
        healthMetrics,
        notificationSettings,
        aiMessages,
        aiInsight,
        wellnessScore,
        isOnline,
        syncQueue,
        isSyncing,
        theme,
        celebrationEvent,
        activeReminderNotification,
        dismissReminder,
        reconcileHabits,
        toggleHabitCompletion,
        createHabit,
        updateHabit,
        deleteHabit,
        toggleHabitArchive,
        toggleHabitPause,
        logMood,
        logHealthMetric,
        sendAIChatMessage,
        refreshAIInsights,
        clearAIConversation,
        updateNotificationSettings,
        setTheme,
        triggerManualSync,
        clearCelebration,
        exportBackupJSON,
        importBackupJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

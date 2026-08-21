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
  SyncQueueItem
} from '../types';
import { 
  StorageService, 
  getTodayDateString, 
  calculateHabitStreaks, 
  calculateWellnessScore 
} from '../services/storage';
import { ApiService } from '../services/api';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

interface AppContextType {
  habits: Habit[];
  completions: HabitCompletion[];
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

  // Actions
  toggleHabitCompletion: (habitId: string, date?: string) => void;
  createHabit: (habit: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'streak' | 'bestStreak' | 'totalCompletions'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitArchive: (id: string) => void;
  toggleHabitPause: (id: string) => void;
  
  // Mood
  logMood: (score: 1 | 2 | 3 | 4 | 5, emotions: any[], notes?: string, date?: string) => void;
  
  // Health
  logHealthMetric: (metric: Partial<HealthMetric>, date?: string) => void;

  // AI
  sendAIChatMessage: (text: string) => Promise<void>;
  refreshAIInsights: () => Promise<void>;
  clearAIConversation: () => void;

  // Settings & Theme
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  triggerManualSync: () => Promise<void>;
  clearCelebration: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
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

  // Initialize data from local durable storage
  useEffect(() => {
    const loadedHabits = StorageService.getHabits();
    const loadedCompletions = StorageService.getCompletions();
    const loadedMoods = StorageService.getMoods();
    const loadedMetrics = StorageService.getHealthMetrics();
    const loadedMsgs = StorageService.getAIMessages();
    const loadedInsight = StorageService.getAIInsight();
    const loadedQueue = StorageService.getSyncQueue();

    // Recalculate streaks
    const updatedHabits = loadedHabits.map(h => {
      const stats = calculateHabitStreaks(h.id, loadedCompletions);
      return {
        ...h,
        streak: stats.currentStreak,
        bestStreak: stats.bestStreak,
        totalCompletions: stats.totalCompletions,
      };
    });

    setHabits(updatedHabits);
    setCompletions(loadedCompletions);
    setMoodEntries(loadedMoods);
    setHealthMetrics(loadedMetrics);
    setAiMessages(loadedMsgs);
    setAiInsight(loadedInsight);
    setSyncQueue(loadedQueue);

    // Initial theme
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
      // Auto-trigger sync when back online
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
      // Fallback safe
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
      console.warn('Sync attempt postponed', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Toggle habit completion for a specific date (defaults to today)
  const toggleHabitCompletion = (habitId: string, dateStr: string = getTodayDateString()) => {
    const existingIndex = completions.findIndex(c => c.habitId === habitId && c.date === dateStr);
    let newCompletions: HabitCompletion[] = [];
    let isCompletedNow = false;

    if (existingIndex >= 0) {
      // Uncomplete
      newCompletions = completions.filter((_, idx) => idx !== existingIndex);
      StorageService.addToSyncQueue({
        entity: 'completion',
        action: 'delete',
        payload: { habitId, date: dateStr },
      });
    } else {
      // Complete
      isCompletedNow = true;
      const targetHabit = habits.find(h => h.id === habitId);
      const newCompletion: HabitCompletion = {
        id: `comp-${habitId}-${dateStr}-${Date.now()}`,
        habitId,
        userId: user?.id || 'demo-user',
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

      // Trigger celebratory micro-interaction
      triggerConfetti();
    }

    StorageService.saveCompletions(newCompletions);
    setCompletions(newCompletions);

    // Update habit streak stats
    const updatedHabits = habits.map(h => {
      if (h.id === habitId) {
        const stats = calculateHabitStreaks(h.id, newCompletions);
        if (isCompletedNow && stats.currentStreak > 0 && stats.currentStreak % 5 === 0) {
          setCelebrationEvent({ type: 'streak', streakCount: stats.currentStreak });
        }
        return {
          ...h,
          streak: stats.currentStreak,
          bestStreak: stats.bestStreak,
          totalCompletions: stats.totalCompletions,
          updatedAt: new Date().toISOString(),
        };
      }
      return h;
    });

    StorageService.saveHabits(updatedHabits);
    setHabits(updatedHabits);

    // Check if all active habits for today are now completed
    const activeHabitsToday = updatedHabits.filter(h => !h.isArchived && !h.isPaused);
    const completedTodayCount = newCompletions.filter(c => c.date === dateStr).length;
    if (isCompletedNow && activeHabitsToday.length > 0 && completedTodayCount >= activeHabitsToday.length) {
      setCelebrationEvent({ type: 'all_done' });
    }
  };

  const createHabit = (newHabitData: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'streak' | 'bestStreak' | 'totalCompletions'>) => {
    const habitId = 'habit-' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const newHabit: Habit = {
      ...newHabitData,
      id: habitId,
      userId: user?.id || 'demo-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      streak: 0,
      bestStreak: 0,
      totalCompletions: 0,
    };

    const updated = [newHabit, ...habits];
    StorageService.saveHabits(updated);
    setHabits(updated);
    StorageService.addToSyncQueue({
      entity: 'habit',
      action: 'create',
      payload: newHabit,
    });
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    const updated = habits.map(h => (h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h));
    StorageService.saveHabits(updated);
    setHabits(updated);
    StorageService.addToSyncQueue({
      entity: 'habit',
      action: 'update',
      payload: { id, updates },
    });
  };

  const deleteHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    const updatedCompletions = completions.filter(c => c.habitId !== id);
    StorageService.saveHabits(updated);
    StorageService.saveCompletions(updatedCompletions);
    setHabits(updated);
    setCompletions(updatedCompletions);
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
    const newEntry: MoodEntry = {
      id: `mood-${dateStr}-${Date.now()}`,
      userId: user?.id || 'demo-user',
      date: dateStr,
      timestamp: new Date().toISOString(),
      score,
      emotions,
      notes,
    };
    const filtered = moodEntries.filter(m => m.date !== dateStr);
    const updated = [newEntry, ...filtered];
    StorageService.saveMoods(updated);
    setMoodEntries(updated);
    StorageService.addToSyncQueue({
      entity: 'mood',
      action: 'create',
      payload: newEntry,
    });
  };

  // Log Health Metric
  const logHealthMetric = (metricUpdates: Partial<HealthMetric>, dateStr: string = getTodayDateString()) => {
    const existingIndex = healthMetrics.findIndex(m => m.date === dateStr);
    let updated: HealthMetric[];

    if (existingIndex >= 0) {
      const current = healthMetrics[existingIndex];
      const merged: HealthMetric = {
        ...current,
        ...metricUpdates,
        updatedAt: new Date().toISOString(),
      };
      updated = [...healthMetrics];
      updated[existingIndex] = merged;
    } else {
      const newMetric: HealthMetric = {
        id: `metric-${dateStr}-${Date.now()}`,
        userId: user?.id || 'demo-user',
        date: dateStr,
        updatedAt: new Date().toISOString(),
        ...metricUpdates,
      };
      updated = [newMetric, ...healthMetrics];
    }

    StorageService.saveHealthMetrics(updated);
    setHealthMetrics(updated);
    StorageService.addToSyncQueue({
      entity: 'metric',
      action: 'update',
      payload: { date: dateStr, metricUpdates },
    });
  };

  // AI Coach Chat
  const sendAIChatMessage = async (text: string) => {
    const userMsg: AICoachMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...aiMessages, userMsg];
    setAiMessages(newMessages);
    StorageService.saveAIMessages(newMessages);

    try {
      const response = await ApiService.askAICoach({
        messages: newMessages,
        userProfile: user || StorageService.getProfile(),
        habits,
        completions,
        moodEntries,
        healthMetrics,
      });

      const assistantMsg: AICoachMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions,
      };

      const finalMessages = [...newMessages, assistantMsg];
      setAiMessages(finalMessages);
      StorageService.saveAIMessages(finalMessages);
    } catch (e) {
      console.error('AI chat failed', e);
    }
  };

  const refreshAIInsights = async () => {
    try {
      const res = await ApiService.getAIInsights({
        userProfile: user || StorageService.getProfile(),
        habits,
        completions,
        moodEntries,
        healthMetrics,
      });
      setAiInsight(res.insight);
      StorageService.saveAIInsight(res.insight);
    } catch (e) {
      console.error('Failed to refresh AI insights', e);
    }
  };

  const clearAIConversation = () => {
    StorageService.saveAIMessages([]);
    setAiMessages([]);
  };

  const updateNotificationSettings = (updates: Partial<NotificationSettings>) => {
    const updated = { ...notificationSettings, ...updates };
    StorageService.saveNotificationSettings(updated);
    setNotificationSettings(updated);
  };

  const clearCelebration = () => {
    setCelebrationEvent(null);
  };

  // Compute live wellness score
  const wellnessScore = calculateWellnessScore(habits, completions, moodEntries, healthMetrics);

  return (
    <AppContext.Provider
      value={{
        habits,
        completions,
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

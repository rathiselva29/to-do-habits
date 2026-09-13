import { 
  Habit, 
  HabitCategory,
  HabitCompletion, 
  MoodEntry, 
  HealthMetric, 
  UserProfile, 
  NotificationSettings, 
  AICoachMessage, 
  AIInsight,
  WellnessScoreBreakdown,
  SyncQueueItem
} from '../types';
import { IndexedDBService } from './db';

const STORAGE_KEYS = {
  USER_PROFILE: 'todo_habits_user_profile',
  PROFILES_LIST: 'todo_habits_profiles_list',
  ACTIVE_PROFILE_ID: 'todo_habits_active_profile_id',
  ONBOARDING_COMPLETED: 'todo_habits_onboarding_completed',
  AUTH_TOKEN: 'todo_habits_auth_token',
  HABITS: 'todo_habits_items',
  COMPLETIONS: 'todo_habits_completions',
  MOODS: 'todo_habits_moods',
  HEALTH_METRICS: 'todo_habits_health_metrics',
  NOTIFICATION_SETTINGS: 'todo_habits_notification_settings',
  AI_MESSAGES: 'todo_habits_ai_messages',
  AI_INSIGHT: 'todo_habits_ai_insight',
  SYNC_QUEUE: 'todo_habits_sync_queue',
  THEME: 'todo_habits_theme',
};

// Helper for formatting local date
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPastDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Initial default profile template
export const DEFAULT_PROFILE: UserProfile = {
  id: '',
  email: '',
  name: '',
  selectedCategories: ['Fitness', 'Nutrition', 'Mental wellness', 'Productivity'],
  goals: ['Build consistency', 'Improve health', 'Reduce stress'],
  reminderTimePreference: '08:00',
  wakeTime: '07:00',
  sleepTime: '23:00',
  heightCm: 175,
  weightKg: 70,
  age: 28,
  gender: 'male',
  bpSystolic: 120,
  bpDiastolic: 80,
  isOnboarded: false,
  theme: 'light',
  units: 'metric',
  createdAt: new Date().toISOString(),
};

export const INITIAL_HABITS: Habit[] = [];

export function generateStarterHabitsForUser(categories: HabitCategory[], userId: string): Habit[] {
  const starterMap: Partial<Record<HabitCategory, Partial<Habit>>> = {
    'Fitness': { name: 'Morning 20-Min Movement', icon: 'dumbbell', color: '#10b981', frequency: 'daily', goalTarget: 20, goalUnit: 'mins' },
    'Nutrition': { name: 'Drink 2 Liters of Water', icon: 'droplet', color: '#06b6d4', frequency: 'daily', goalTarget: 2000, goalUnit: 'ml' },
    'Mental wellness': { name: '10-Min Morning Mindfulness', icon: 'brain', color: '#8b5cf6', frequency: 'daily', goalTarget: 10, goalUnit: 'mins' },
    'Productivity': { name: 'Deep Work Focus Block', icon: 'target', color: '#f59e0b', frequency: 'daily', goalTarget: 60, goalUnit: 'mins' },
    'Learning': { name: 'Read 15 Pages of a Book', icon: 'book', color: '#ec4899', frequency: 'daily', goalTarget: 15, goalUnit: 'pages' },
    'Sleep': { name: 'Wind Down & Sleep on Schedule', icon: 'moon', color: '#6366f1', frequency: 'daily', goalTarget: 1, goalUnit: 'session' },
    'Self-care': { name: 'Evening Relax & Self-Care', icon: 'heart', color: '#14b8a6', frequency: 'daily', goalTarget: 1, goalUnit: 'session' },
    'Relationships': { name: 'Connect with a Friend or Family', icon: 'users', color: '#3b82f6', frequency: 'daily', goalTarget: 1, goalUnit: 'check-in' },
    'Finances': { name: 'Review Daily Budget & Expenses', icon: 'coins', color: '#10b981', frequency: 'daily', goalTarget: 1, goalUnit: 'check' },
    'Personal growth': { name: 'Daily Wins & Journal Reflection', icon: 'trending-up', color: '#f97316', frequency: 'daily', goalTarget: 1, goalUnit: 'entry' },
    'Other': { name: 'Daily Habit Routine', icon: 'star', color: '#6366f1', frequency: 'daily', goalTarget: 1, goalUnit: 'times' }
  };

  const selected = categories && categories.length > 0 ? categories.slice(0, 3) : (['Fitness', 'Nutrition', 'Mental wellness'] as HabitCategory[]);
  return selected.map((cat, idx) => {
    const template = starterMap[cat] || starterMap['Fitness'];
    return {
      id: `habit-starter-${idx}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      name: template.name || 'Daily Routine',
      category: cat,
      icon: template.icon || 'star',
      color: template.color || '#6366f1',
      frequency: template.frequency || 'daily',
      goalTarget: template.goalTarget || 1,
      goalUnit: template.goalUnit || 'times',
      difficulty: 'medium',
      startDate: getTodayDateString(),
      streak: 0,
      bestStreak: 0,
      totalCompletions: 0,
      isArchived: false,
      isPaused: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

export function generateInitialCompletions(): HabitCompletion[] {
  return [];
}

export function generateInitialMoods(): MoodEntry[] {
  return [];
}

export function generateInitialHealthMetrics(): HealthMetric[] {
  return [];
}

export const INITIAL_NOTIFICATIONS: NotificationSettings = {
  enabled: true,
  reminderTime: '08:00',
  habitsEnabled: true,
  dailyUnfinishedReminder: true,
  soundEnabled: true,
  waterReminders: true,
  sleepReminders: true,
  moodReminders: true,
  dailyReview: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:30',
  quietHoursEnd: '07:00',
  browserPermission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',
  lastNotifiedDate: '',
};

export const INITIAL_AI_MESSAGES: AICoachMessage[] = [
  {
    id: 'ai-init-1',
    sender: 'assistant',
    text: "Welcome to To-Do-Habits! I am your AI Habit & Wellness Coach. Create your first habit or log your daily mood to get started, and I'll provide actionable insights and honest motivation.",
    timestamp: new Date().toISOString(),
    suggestions: [
      'What are good starter habits for daily consistency?',
      'How to build an unbreakable morning routine?',
      'Tips for tracking daily moods effectively',
    ],
  },
];

export const INITIAL_AI_INSIGHT: AIInsight = {
  strength: 'Fresh start ready.',
  challenge: 'No active habits logged yet.',
  recommendation: 'Create 1 or 2 small anchor daily habits to build momentum.',
  nextBestAction: 'Tap the + button to add your first habit.',
  generatedAt: new Date().toISOString(),
};

// Storage Service API with Dual Persistence (Instant LocalStorage + Durable IndexedDB)
export const StorageService = {
  // Onboarding Status Persistence
  isOnboardingCompleted(): boolean {
    const raw = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    if (raw === 'true') return true;
    const profile = this.getProfile();
    return !!profile?.isOnboarded;
  },

  setOnboardingCompleted(val: boolean): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, val ? 'true' : 'false');
    IndexedDBService.setSetting('onboarding_completed', val).catch(() => {});
  },

  // Hydrate local cache from IndexedDB on boot
  async syncFromIndexedDB(): Promise<void> {
    try {
      // 1. PROFILES
      const dbProfiles = await IndexedDBService.getAllProfiles();
      const localProfiles = this.getProfiles();

      if (dbProfiles && dbProfiles.length > 0) {
        // Merge profiles by ID
        const profileMap = new Map<string, UserProfile>();
        for (const p of dbProfiles) profileMap.set(p.id, p);
        for (const p of localProfiles) {
          if (!profileMap.has(p.id)) profileMap.set(p.id, p);
        }
        const mergedProfiles = Array.from(profileMap.values());
        localStorage.setItem(STORAGE_KEYS.PROFILES_LIST, JSON.stringify(mergedProfiles));

        let activeId = this.getActiveProfileId();
        if (!activeId || !profileMap.has(activeId)) {
          const active = mergedProfiles.find(p => p.isOnboarded) || mergedProfiles[0];
          if (active) {
            this.setActiveProfileId(active.id);
            if (active.isOnboarded) {
              this.setOnboardingCompleted(true);
            }
          }
        }
      } else if (localProfiles.length > 0) {
        await IndexedDBService.saveProfiles(localProfiles);
      }

      // 2. HABITS
      const dbHabits = await IndexedDBService.getAllHabits();
      const localHabits = this.getAllHabits();
      if (dbHabits && dbHabits.length > 0) {
        const habitMap = new Map<string, Habit>();
        for (const h of dbHabits) habitMap.set(h.id, h);
        for (const h of localHabits) {
          if (!habitMap.has(h.id)) habitMap.set(h.id, h);
        }
        const mergedHabits = Array.from(habitMap.values());
        localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(mergedHabits));
        await IndexedDBService.saveHabits(mergedHabits);
      } else if (localHabits.length > 0) {
        await IndexedDBService.saveHabits(localHabits);
      }

      // 3. COMPLETIONS
      const dbCompletions = await IndexedDBService.getAllCompletions();
      const localCompletions = this.getAllCompletions();
      if (dbCompletions && dbCompletions.length > 0) {
        const compMap = new Map<string, HabitCompletion>();
        for (const c of dbCompletions) compMap.set(c.id, c);
        for (const c of localCompletions) {
          if (!compMap.has(c.id)) compMap.set(c.id, c);
        }
        const mergedCompletions = Array.from(compMap.values());
        localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(mergedCompletions));
        await IndexedDBService.saveCompletions(mergedCompletions);
      } else if (localCompletions.length > 0) {
        await IndexedDBService.saveCompletions(localCompletions);
      }

      // 4. MOODS
      const dbMoods = await IndexedDBService.getAllMoods();
      const localMoods = this.getAllMoods();
      if (dbMoods && dbMoods.length > 0) {
        const moodMap = new Map<string, MoodEntry>();
        for (const m of dbMoods) moodMap.set(m.id, m);
        for (const m of localMoods) {
          if (!moodMap.has(m.id)) moodMap.set(m.id, m);
        }
        const mergedMoods = Array.from(moodMap.values());
        localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(mergedMoods));
        await IndexedDBService.saveMoods(mergedMoods);
      } else if (localMoods.length > 0) {
        await IndexedDBService.saveMoods(localMoods);
      }

      // 5. HEALTH METRICS
      const dbMetrics = await IndexedDBService.getAllHealthMetrics();
      const localMetrics = this.getAllHealthMetrics();
      if (dbMetrics && dbMetrics.length > 0) {
        const metricMap = new Map<string, HealthMetric>();
        for (const m of dbMetrics) metricMap.set(m.id, m);
        for (const m of localMetrics) {
          if (!metricMap.has(m.id)) metricMap.set(m.id, m);
        }
        const mergedMetrics = Array.from(metricMap.values());
        localStorage.setItem(STORAGE_KEYS.HEALTH_METRICS, JSON.stringify(mergedMetrics));
        await IndexedDBService.saveHealthMetrics(mergedMetrics);
      } else if (localMetrics.length > 0) {
        await IndexedDBService.saveHealthMetrics(localMetrics);
      }
    } catch (e) {
      console.warn('StorageService: IndexedDB sync note', e);
    }
  },

  getProfiles(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES_LIST);
    if (!raw) {
      const single = this.getProfile();
      if (single) {
        this.saveProfiles([single]);
        return [single];
      }
      return [];
    }
    try {
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  saveProfiles(profiles: UserProfile[]): void {
    localStorage.setItem(STORAGE_KEYS.PROFILES_LIST, JSON.stringify(profiles));
    IndexedDBService.saveProfiles(profiles).catch(() => {});
  },

  getActiveProfileId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
  },

  setActiveProfileId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);
    IndexedDBService.setSetting('active_profile_id', id).catch(() => {});
    const profiles = this.getProfiles();
    const active = profiles.find(p => p.id === id);
    if (active) {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(active));
    }
  },

  getProfile(): UserProfile | null {
    const activeId = this.getActiveProfileId();
    if (activeId) {
      const profiles = this.getProfiles();
      const match = profiles.find(p => p.id === activeId);
      if (match) return match;
    }

    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.id || parsed.email || parsed.name)) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === profile.id);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    this.saveProfiles(profiles);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, profile.id);
    if (profile.isOnboarded) {
      this.setOnboardingCompleted(true);
    }
    IndexedDBService.saveProfile(profile).catch(() => {});
  },

  deleteProfile(profileId: string): UserProfile | null {
    let profiles = this.getProfiles();
    profiles = profiles.filter(p => p.id !== profileId);
    this.saveProfiles(profiles);
    IndexedDBService.deleteProfile(profileId).catch(() => {});

    // Remove habit/completions/moods/metrics for this profile
    const allHabits = this.getAllHabits().filter(h => h.userId !== profileId);
    this.saveHabits(allHabits);

    const allCompletions = this.getAllCompletions().filter(c => c.userId !== profileId);
    this.saveCompletions(allCompletions);

    const allMoods = this.getAllMoods().filter(m => m.userId !== profileId);
    this.saveMoods(allMoods);

    const allMetrics = this.getAllHealthMetrics().filter(m => m.userId !== profileId);
    this.saveHealthMetrics(allMetrics);

    const activeId = this.getActiveProfileId();
    if (activeId === profileId) {
      if (profiles.length > 0) {
        this.setActiveProfileId(profiles[0].id);
        return profiles[0];
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
        localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
        return null;
      }
    }
    return this.getProfile();
  },

  getAllHabits(): Habit[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  getHabits(userId?: string): Habit[] {
    const all = this.getAllHabits();
    if (!userId) {
      const active = this.getProfile();
      if (active && active.id) {
        const userHabits = all.filter(h => h.userId === active.id);
        return userHabits;
      }
      return all;
    }
    return all.filter(h => h.userId === userId);
  },

  saveHabits(habits: Habit[]): void {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    IndexedDBService.saveHabits(habits).catch(() => {});
  },

  saveHabitsForUser(userId: string, userHabits: Habit[]): void {
    const all = this.getAllHabits();
    const otherUsersHabits = all.filter(h => h.userId && h.userId !== userId);
    const updated = [...otherUsersHabits, ...userHabits];
    this.saveHabits(updated);
  },

  getAllCompletions(): HabitCompletion[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  getCompletions(userId?: string): HabitCompletion[] {
    const all = this.getAllCompletions();
    if (!userId) {
      const active = this.getProfile();
      if (active && active.id) {
        return all.filter(c => c.userId === active.id);
      }
      return all;
    }
    return all.filter(c => c.userId === userId);
  },

  saveCompletions(completions: HabitCompletion[]): void {
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
    IndexedDBService.saveCompletions(completions).catch(() => {});
  },

  saveCompletionsForUser(userId: string, userCompletions: HabitCompletion[]): void {
    const all = this.getAllCompletions();
    const others = all.filter(c => c.userId && c.userId !== userId);
    const updated = [...others, ...userCompletions];
    this.saveCompletions(updated);
  },

  getAllMoods(): MoodEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MOODS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  getMoods(userId?: string): MoodEntry[] {
    const all = this.getAllMoods();
    if (!userId) {
      const active = this.getProfile();
      if (active && active.id) {
        return all.filter(m => m.userId === active.id);
      }
      return all;
    }
    return all.filter(m => m.userId === userId);
  },

  saveMoods(moods: MoodEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(moods));
    IndexedDBService.saveMoods(moods).catch(() => {});
  },

  saveMoodsForUser(userId: string, userMoods: MoodEntry[]): void {
    const all = this.getAllMoods();
    const others = all.filter(m => m.userId && m.userId !== userId);
    const updated = [...others, ...userMoods];
    this.saveMoods(updated);
  },

  getAllHealthMetrics(): HealthMetric[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HEALTH_METRICS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  getHealthMetrics(userId?: string): HealthMetric[] {
    const all = this.getAllHealthMetrics();
    if (!userId) {
      const active = this.getProfile();
      if (active && active.id) {
        return all.filter(m => m.userId === active.id);
      }
      return all;
    }
    return all.filter(m => m.userId === userId);
  },

  saveHealthMetrics(metrics: HealthMetric[]): void {
    localStorage.setItem(STORAGE_KEYS.HEALTH_METRICS, JSON.stringify(metrics));
    IndexedDBService.saveHealthMetrics(metrics).catch(() => {});
  },

  saveHealthMetricsForUser(userId: string, userMetrics: HealthMetric[]): void {
    const all = this.getAllHealthMetrics();
    const others = all.filter(m => m.userId && m.userId !== userId);
    const updated = [...others, ...userMetrics];
    this.saveHealthMetrics(updated);
  },

  getNotificationSettings(): NotificationSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    if (!raw) {
      this.saveNotificationSettings(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_NOTIFICATIONS,
        ...parsed,
        browserPermission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : (parsed.browserPermission || 'default'),
      };
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  saveNotificationSettings(settings: NotificationSettings): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
  },

  getAIMessages(): AICoachMessage[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_MESSAGES);
    if (!raw) {
      this.saveAIMessages(INITIAL_AI_MESSAGES);
      return INITIAL_AI_MESSAGES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_AI_MESSAGES;
    }
  },

  saveAIMessages(messages: AICoachMessage[]): void {
    localStorage.setItem(STORAGE_KEYS.AI_MESSAGES, JSON.stringify(messages));
  },

  getAIInsight(): AIInsight {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_INSIGHT);
    if (!raw) {
      this.saveAIInsight(INITIAL_AI_INSIGHT);
      return INITIAL_AI_INSIGHT;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_AI_INSIGHT;
    }
  },

  saveAIInsight(insight: AIInsight): void {
    localStorage.setItem(STORAGE_KEYS.AI_INSIGHT, JSON.stringify(insight));
  },

  // Offline Sync Queue
  getSyncQueue(): SyncQueueItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp'>): void {
    const queue = this.getSyncQueue();
    const newItem: SyncQueueItem = {
      ...item,
      id: 'sync_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      timestamp: Date.now(),
    };
    queue.push(newItem);
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
  },

  clearSyncQueue(): void {
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
  },

  // Export & Reset
  exportAllData(): string {
    const data = {
      profile: this.getProfile(),
      habits: this.getHabits(),
      completions: this.getCompletions(),
      moods: this.getMoods(),
      healthMetrics: this.getHealthMetrics(),
      notifications: this.getNotificationSettings(),
      exportedAt: new Date().toISOString(),
      app: 'To-Do-Habits',
    };
    return JSON.stringify(data, null, 2);
  },

  exportCompletionsCSV(): string {
    const completions = this.getCompletions();
    const habits = this.getHabits();

    let csv = 'Date,HabitName,Category,CompletedAt,Value\n';
    completions.forEach(c => {
      const h = habits.find(habit => habit.id === c.habitId);
      const name = h ? `"${h.name.replace(/"/g, '""')}"` : 'Unknown';
      const category = h ? h.category : '';
      csv += `${c.date},${name},${category},${c.completedAt},${c.value || 1}\n`;
    });
    return csv;
  },

  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETIONS);
    localStorage.removeItem(STORAGE_KEYS.MOODS);
    localStorage.removeItem(STORAGE_KEYS.HEALTH_METRICS);
    localStorage.removeItem(STORAGE_KEYS.AI_MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.AI_INSIGHT);
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
  },
};

// Calculate streak stats dynamically for any habit
export function calculateHabitStreaks(
  habitId: string,
  completions: HabitCompletion[],
  _frequency: string = 'daily'
): { currentStreak: number; bestStreak: number; totalCompletions: number } {
  const habitComps = completions
    .filter(c => c.habitId === habitId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalCompletions = habitComps.length;
  if (totalCompletions === 0) {
    return { currentStreak: 0, bestStreak: 0, totalCompletions: 0 };
  }

  const completionDates = new Set(habitComps.map(c => c.date));
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const today = getTodayDateString();
  const yesterday = getPastDateString(1);

  // Check if active streak exists (done today or yesterday)
  const startFrom = completionDates.has(today) ? today : completionDates.has(yesterday) ? yesterday : null;

  if (startFrom) {
    const d = new Date(startFrom);
    while (true) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dStr = `${year}-${month}-${day}`;
      if (completionDates.has(dStr)) {
        currentStreak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate best streak historically
  const sortedDates = Array.from(completionDates).sort();
  if (sortedDates.length > 0) {
    tempStreak = 1;
    bestStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
  }

  bestStreak = Math.max(bestStreak, currentStreak);

  return { currentStreak, bestStreak, totalCompletions };
}

// Calculate Composite Holistic Wellness Score (0-100)
export function calculateWellnessScore(
  habits: Habit[],
  completions: HabitCompletion[],
  moods: MoodEntry[],
  metrics: HealthMetric[]
): WellnessScoreBreakdown {
  const activeHabits = habits.filter(h => !h.isArchived && !h.isPaused);
  
  // 1. Habit Completion Score (last 7 days)
  let totalHabitOpportunities = 0;
  let totalHabitDone = 0;
  for (let i = 0; i < 7; i++) {
    const dStr = getPastDateString(i);
    totalHabitOpportunities += activeHabits.length;
    const doneOnDay = completions.filter(c => c.date === dStr).length;
    totalHabitDone += Math.min(doneOnDay, activeHabits.length);
  }
  
  const habitScore = totalHabitOpportunities > 0 
    ? Math.min(100, Math.round((totalHabitDone / totalHabitOpportunities) * 100))
    : activeHabits.length > 0 ? 0 : 100;

  // 2. Sleep Score (avg of last 5 days)
  const recentMetrics = metrics.slice(-5);
  let sleepScore = 0;
  if (recentMetrics.length > 0) {
    const validSleep = recentMetrics.filter(m => m.sleepHours && m.sleepHours > 0);
    if (validSleep.length > 0) {
      const avgSleep = validSleep.reduce((acc, m) => acc + (m.sleepHours || 0), 0) / validSleep.length;
      if (avgSleep >= 7 && avgSleep <= 9) sleepScore = 95;
      else if (avgSleep >= 6 && avgSleep < 7) sleepScore = 80;
      else if (avgSleep > 9) sleepScore = 85;
      else sleepScore = 60;
    }
  }

  // 3. Movement & Exercise Score
  let movementScore = 0;
  if (recentMetrics.length > 0) {
    const validMovement = recentMetrics.filter(m => (m.steps && m.steps > 0) || (m.exerciseMinutes && m.exerciseMinutes > 0));
    if (validMovement.length > 0) {
      const avgSteps = validMovement.reduce((acc, m) => acc + (m.steps || 0), 0) / validMovement.length;
      const avgExercise = validMovement.reduce((acc, m) => acc + (m.exerciseMinutes || 0), 0) / validMovement.length;
      if (avgSteps >= 8000 || avgExercise >= 30) movementScore = 92;
      else if (avgSteps >= 5000 || avgExercise >= 20) movementScore = 80;
      else movementScore = 65;
    }
  }

  // 4. Mood Score
  const recentMoods = moods.slice(-7);
  let moodScore = 0;
  if (recentMoods.length > 0) {
    const avgMood = recentMoods.reduce((acc, m) => acc + m.score, 0) / recentMoods.length;
    moodScore = Math.round((avgMood / 5) * 100);
  }

  // 5. Hydration Score
  let hydrationScore = 0;
  if (recentMetrics.length > 0) {
    const validWater = recentMetrics.filter(m => m.waterMl && m.waterMl > 0);
    if (validWater.length > 0) {
      const avgWater = validWater.reduce((acc, m) => acc + (m.waterMl || 0), 0) / validWater.length;
      if (avgWater >= 2000) hydrationScore = 95;
      else if (avgWater >= 1500) hydrationScore = 80;
      else hydrationScore = 60;
    }
  }

  // 6. Mindfulness Score
  let mindfulnessScore = 0;
  const meditationHabit = habits.find(h => h.category === 'Mental wellness' || h.name.toLowerCase().includes('meditat'));
  if (meditationHabit && meditationHabit.streak >= 1) {
    mindfulnessScore = Math.min(100, 50 + meditationHabit.streak * 10);
  }

  // Composite Total Score (Calculated only from available metrics or baseline)
  let componentsCount = 0;
  let scoreSum = 0;

  if (activeHabits.length > 0) {
    scoreSum += habitScore * 0.35;
    componentsCount += 0.35;
  }
  if (sleepScore > 0) {
    scoreSum += sleepScore * 0.20;
    componentsCount += 0.20;
  }
  if (movementScore > 0) {
    scoreSum += movementScore * 0.15;
    componentsCount += 0.15;
  }
  if (moodScore > 0) {
    scoreSum += moodScore * 0.15;
    componentsCount += 0.15;
  }
  if (hydrationScore > 0) {
    scoreSum += hydrationScore * 0.10;
    componentsCount += 0.10;
  }
  if (mindfulnessScore > 0) {
    scoreSum += mindfulnessScore * 0.05;
    componentsCount += 0.05;
  }

  const totalScore = componentsCount > 0 
    ? Math.round(scoreSum / componentsCount)
    : 0;

  const influencingFactors = [
    {
      title: 'Habit Consistency',
      impact: activeHabits.length === 0 ? 'neutral' : habitScore >= 80 ? 'positive' : habitScore >= 50 ? 'neutral' : 'negative',
      description: activeHabits.length === 0 ? 'No habits active yet. Add your first routine.' : `${habitScore}% completion rate over the past 7 days.`,
    },
    {
      title: 'Sleep Tracking',
      impact: sleepScore >= 80 ? 'positive' : sleepScore > 0 ? 'neutral' : 'neutral',
      description: recentMetrics.length > 0 && recentMetrics[0]?.sleepHours ? `Averaging ${recentMetrics[0].sleepHours.toFixed(1)} hrs per night.` : 'Log your sleep in Health metrics.',
    },
    {
      title: 'Mood & Emotional Wellbeing',
      impact: moodScore >= 70 ? 'positive' : moodScore > 0 ? 'neutral' : 'neutral',
      description: recentMoods.length > 0 ? `Consistent ratings logged (${recentMoods.length} entries).` : 'Record how you feel today in Mood Tracker.',
    },
    {
      title: 'Daily Movement & Steps',
      impact: movementScore >= 75 ? 'positive' : 'neutral',
      description: movementScore > 0 ? 'Physical activity logged.' : 'Track daily steps and exercise.',
    },
  ] as const;

  return {
    totalScore,
    habitScore: habitScore || 0,
    sleepScore: sleepScore || 0,
    movementScore: movementScore || 0,
    moodScore: moodScore || 0,
    hydrationScore: hydrationScore || 0,
    mindfulnessScore: mindfulnessScore || 0,
    influencingFactors: [...influencingFactors],
  };
}

import { 
  Habit, 
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

const STORAGE_KEYS = {
  USER_PROFILE: 'aura_user_profile',
  AUTH_TOKEN: 'aura_auth_token',
  HABITS: 'aura_habits',
  COMPLETIONS: 'aura_completions',
  MOODS: 'aura_moods',
  HEALTH_METRICS: 'aura_health_metrics',
  NOTIFICATION_SETTINGS: 'aura_notification_settings',
  AI_MESSAGES: 'aura_ai_messages',
  AI_INSIGHT: 'aura_ai_insight',
  SYNC_QUEUE: 'aura_sync_queue',
  THEME: 'aura_theme',
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

// Initial default profile
export const DEFAULT_PROFILE: UserProfile = {
  id: 'demo-user-aura-1',
  email: 'demo@aura.wellness',
  name: 'Alex Rivera',
  selectedCategories: ['Fitness', 'Sleep', 'Nutrition', 'Mental wellness', 'Productivity'],
  goals: ['Build consistency', 'Improve health', 'Reduce stress', 'Sleep better'],
  reminderTimePreference: '08:00',
  wakeTime: '07:00',
  sleepTime: '23:00',
  isOnboarded: true,
  theme: 'light',
  units: 'metric',
  createdAt: new Date().toISOString(),
};

// Default starter habits
export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    userId: 'demo-user-aura-1',
    name: 'Morning Hydration',
    description: 'Drink 500ml of room temperature water with lemon',
    category: 'Nutrition',
    icon: 'Droplets',
    color: 'emerald',
    frequency: 'daily',
    goalTarget: 1,
    goalUnit: 'glass',
    reminderTime: '07:30',
    startDate: getPastDateString(30),
    difficulty: 'easy',
    isArchived: false,
    isPaused: false,
    createdAt: getPastDateString(30),
    updatedAt: getPastDateString(1),
    streak: 8,
    bestStreak: 14,
    totalCompletions: 26,
  },
  {
    id: 'habit-2',
    userId: 'demo-user-aura-1',
    name: '15-Min Outdoor Walk',
    description: 'Brisk walk in morning daylight to set circadian rhythm',
    category: 'Fitness',
    icon: 'Footprints',
    color: 'blue',
    frequency: 'daily',
    goalTarget: 15,
    goalUnit: 'mins',
    reminderTime: '08:15',
    startDate: getPastDateString(25),
    difficulty: 'easy',
    isArchived: false,
    isPaused: false,
    createdAt: getPastDateString(25),
    updatedAt: getPastDateString(1),
    streak: 6,
    bestStreak: 12,
    totalCompletions: 21,
  },
  {
    id: 'habit-3',
    userId: 'demo-user-aura-1',
    name: 'Deep Work Focus Block',
    description: '90 minutes of distraction-free creative or analytical work',
    category: 'Productivity',
    icon: 'Target',
    color: 'purple',
    frequency: 'weekdays',
    goalTarget: 90,
    goalUnit: 'mins',
    reminderTime: '09:30',
    startDate: getPastDateString(20),
    difficulty: 'medium',
    isArchived: false,
    isPaused: false,
    createdAt: getPastDateString(20),
    updatedAt: getPastDateString(1),
    streak: 4,
    bestStreak: 9,
    totalCompletions: 17,
  },
  {
    id: 'habit-4',
    userId: 'demo-user-aura-1',
    name: 'Mindful Meditation',
    description: 'Box breathing and calm body scan session',
    category: 'Mental wellness',
    icon: 'Brain',
    color: 'indigo',
    frequency: 'daily',
    goalTarget: 10,
    goalUnit: 'mins',
    reminderTime: '18:00',
    startDate: getPastDateString(18),
    difficulty: 'easy',
    isArchived: false,
    isPaused: false,
    createdAt: getPastDateString(18),
    updatedAt: getPastDateString(1),
    streak: 5,
    bestStreak: 8,
    totalCompletions: 15,
  },
  {
    id: 'habit-5',
    userId: 'demo-user-aura-1',
    name: 'Screen-Free Wind Down',
    description: 'No phones or monitors 30 mins before sleep; light reading instead',
    category: 'Sleep',
    icon: 'Moon',
    color: 'rose',
    frequency: 'daily',
    goalTarget: 30,
    goalUnit: 'mins',
    reminderTime: '22:30',
    startDate: getPastDateString(15),
    difficulty: 'medium',
    isArchived: false,
    isPaused: false,
    createdAt: getPastDateString(15),
    updatedAt: getPastDateString(1),
    streak: 3,
    bestStreak: 7,
    totalCompletions: 12,
  },
];

// Generate realistic past completions for the last 30 days
export function generateInitialCompletions(): HabitCompletion[] {
  const completions: HabitCompletion[] = [];
  const habits = INITIAL_HABITS;

  for (let i = 28; i >= 1; i--) {
    const dateStr = getPastDateString(i);
    const dayOfWeek = new Date(dateStr).getDay();

    habits.forEach((habit) => {
      // Create high consistency with occasional missed days
      let shouldComplete = true;
      if (habit.id === 'habit-5' && (i === 4 || i === 11 || i === 18)) shouldComplete = false;
      if (habit.id === 'habit-3' && (dayOfWeek === 0 || dayOfWeek === 6)) shouldComplete = false;
      if (habit.id === 'habit-2' && (i === 7 || i === 15)) shouldComplete = false;

      if (shouldComplete) {
        completions.push({
          id: `comp-${habit.id}-${dateStr}`,
          habitId: habit.id,
          userId: 'demo-user-aura-1',
          date: dateStr,
          completedAt: `${dateStr}T10:30:00.000Z`,
          value: habit.goalTarget,
        });
      }
    });
  }

  // Add 2 completions for today to show immediate interactive state
  const today = getTodayDateString();
  completions.push({
    id: `comp-habit-1-${today}`,
    habitId: 'habit-1',
    userId: 'demo-user-aura-1',
    date: today,
    completedAt: `${today}T08:10:00.000Z`,
    value: 1,
  });
  completions.push({
    id: `comp-habit-2-${today}`,
    habitId: 'habit-2',
    userId: 'demo-user-aura-1',
    date: today,
    completedAt: `${today}T09:00:00.000Z`,
    value: 15,
  });

  return completions;
}

// Generate realistic mood entries
export function generateInitialMoods(): MoodEntry[] {
  const moods: MoodEntry[] = [];
  const sampleEmotions: Array<{ score: 1 | 2 | 3 | 4 | 5; emotions: any[]; notes: string }> = [
    { score: 5, emotions: ['Motivated', 'Energized', 'Happy'], notes: 'Finished all morning habits early and had a super productive session!' },
    { score: 4, emotions: ['Calm', 'Focused'], notes: 'Steady workday with solid focus blocks.' },
    { score: 4, emotions: ['Grateful', 'Happy'], notes: 'Nice evening walk with great weather.' },
    { score: 3, emotions: ['Tired'], notes: 'Slightly low energy after long meeting afternoon.' },
    { score: 5, emotions: ['Motivated', 'Excited', 'Grateful'], notes: 'Hit a 7-day streak on morning hydration!' },
    { score: 4, emotions: ['Calm', 'Focused'], notes: 'Good deep work block completed.' },
    { score: 5, emotions: ['Happy', 'Energized'], notes: 'Feeling fresh and rejuvenated today.' },
  ];

  for (let i = 14; i >= 0; i--) {
    const dateStr = getPastDateString(i);
    const sample = sampleEmotions[i % sampleEmotions.length];
    moods.push({
      id: `mood-${dateStr}`,
      userId: 'demo-user-aura-1',
      date: dateStr,
      timestamp: `${dateStr}T19:30:00.000Z`,
      score: sample.score,
      emotions: sample.emotions,
      notes: sample.notes,
    });
  }
  return moods;
}

// Generate realistic health metrics
export function generateInitialHealthMetrics(): HealthMetric[] {
  const metrics: HealthMetric[] = [];
  for (let i = 14; i >= 0; i--) {
    const dateStr = getPastDateString(i);
    metrics.push({
      id: `metric-${dateStr}`,
      userId: 'demo-user-aura-1',
      date: dateStr,
      sleepHours: 7.2 + ((i % 3) * 0.3) - 0.2,
      waterMl: 2200 + ((i % 4) * 250),
      steps: 8400 + ((i % 5) * 850),
      exerciseMinutes: 30 + ((i % 3) * 15),
      weightKg: 70.5 - (i * 0.05),
      restingHeartRate: 62 + (i % 3),
      meditationMinutes: 10 + ((i % 2) * 5),
      energyLevel: 8 - (i % 2),
      updatedAt: `${dateStr}T20:00:00.000Z`,
    });
  }
  return metrics;
}

export const INITIAL_NOTIFICATIONS: NotificationSettings = {
  habitsEnabled: true,
  waterReminders: true,
  sleepReminders: true,
  moodReminders: true,
  dailyReview: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:30',
  quietHoursEnd: '07:00',
  browserPermission: 'default',
};

export const INITIAL_AI_MESSAGES: AICoachMessage[] = [
  {
    id: 'ai-init-1',
    sender: 'assistant',
    text: "Welcome to Aura! I am your AI Wellness Coach. I've analyzed your daily goals and habit schedules. You're already off to a great start with a strong hydration streak. How are you feeling today?",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    suggestions: [
      'How can I optimize my sleep wind-down?',
      'Suggest a 5-minute stress reset',
      'How is my weekly habit consistency looking?',
    ],
  },
];

export const INITIAL_AI_INSIGHT: AIInsight = {
  strength: 'Strong morning routine momentum with 8-day consecutive hydration streak.',
  challenge: 'Evening screen-free wind-down is occasionally skipped on late work evenings.',
  recommendation: 'Stack your evening reading right after placing your phone on the bedside charger at 22:30.',
  nextBestAction: 'Complete your 10-minute mindful meditation before dinner to decompress.',
  generatedAt: new Date().toISOString(),
};

// Storage Service API
export const StorageService = {
  getProfile(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) {
      this.saveProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  getHabits(): Habit[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) {
      this.saveHabits(INITIAL_HABITS);
      return INITIAL_HABITS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_HABITS;
    }
  },

  saveHabits(habits: Habit[]): void {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  },

  getCompletions(): HabitCompletion[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    if (!raw) {
      const initial = generateInitialCompletions();
      this.saveCompletions(initial);
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveCompletions(completions: HabitCompletion[]): void {
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
  },

  getMoods(): MoodEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MOODS);
    if (!raw) {
      const initial = generateInitialMoods();
      this.saveMoods(initial);
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveMoods(moods: MoodEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(moods));
  },

  getHealthMetrics(): HealthMetric[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HEALTH_METRICS);
    if (!raw) {
      const initial = generateInitialHealthMetrics();
      this.saveHealthMetrics(initial);
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveHealthMetrics(metrics: HealthMetric[]): void {
    localStorage.setItem(STORAGE_KEYS.HEALTH_METRICS, JSON.stringify(metrics));
  },

  getNotificationSettings(): NotificationSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    if (!raw) {
      this.saveNotificationSettings(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    try {
      return JSON.parse(raw);
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
    };
    return JSON.stringify(data, null, 2);
  },

  exportCompletionsCSV(): string {
    const completions = this.getCompletions();
    const habits = this.getHabits();
    const habitMap = new Map(habits.map(h => [h.id, h.name]));

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
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETIONS);
    localStorage.removeItem(STORAGE_KEYS.MOODS);
    localStorage.removeItem(STORAGE_KEYS.HEALTH_METRICS);
    localStorage.removeItem(STORAGE_KEYS.AI_MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.AI_INSIGHT);
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    // Re-initialize with clean seed
    this.getHabits();
    this.getCompletions();
    this.getMoods();
    this.getHealthMetrics();
  }
};

// Calculate real streaks for habits
export function calculateHabitStreaks(habitId: string, completions: HabitCompletion[]): { currentStreak: number; bestStreak: number; totalCompletions: number } {
  const habitCompletions = completions
    .filter(c => c.habitId === habitId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const completedDates = new Set(habitCompletions.map(c => c.date));
  const totalCompletions = completedDates.size;

  if (totalCompletions === 0) {
    return { currentStreak: 0, bestStreak: 0, totalCompletions: 0 };
  }

  const todayStr = getTodayDateString();
  const yesterdayStr = getPastDateString(1);

  // Check if completed today or yesterday to continue current streak
  let currentStreak = 0;
  let checkDate = new Date();
  
  // If not completed today, check if yesterday was completed
  if (!completedDates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const year = checkDate.getFullYear();
    const month = String(checkDate.getMonth() + 1).padStart(2, '0');
    const day = String(checkDate.getDate()).padStart(2, '0');
    const dateFormatted = `${year}-${month}-${day}`;

    if (completedDates.has(dateFormatted)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate best historic streak
  const sortedDatesAsc = Array.from(completedDates).sort();
  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dStr of sortedDatesAsc) {
    const d = new Date(dStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((d.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > bestStreak) bestStreak = tempStreak;
    prevDate = d;
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    totalCompletions,
  };
}

// Calculate composite Wellness Score
export function calculateWellnessScore(
  habits: Habit[],
  completions: HabitCompletion[],
  moods: MoodEntry[],
  metrics: HealthMetric[]
): WellnessScoreBreakdown {
  const todayStr = getTodayDateString();
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
    : 75;

  // 2. Sleep Score (avg of last 5 days)
  const recentMetrics = metrics.slice(-5);
  let sleepScore = 70;
  if (recentMetrics.length > 0) {
    const avgSleep = recentMetrics.reduce((acc, m) => acc + (m.sleepHours || 7), 0) / recentMetrics.length;
    // Ideal sleep 7-9 hours
    if (avgSleep >= 7 && avgSleep <= 9) sleepScore = 95;
    else if (avgSleep >= 6 && avgSleep < 7) sleepScore = 80;
    else if (avgSleep > 9) sleepScore = 85;
    else sleepScore = 60;
  }

  // 3. Movement & Exercise Score
  let movementScore = 70;
  if (recentMetrics.length > 0) {
    const avgSteps = recentMetrics.reduce((acc, m) => acc + (m.steps || 7000), 0) / recentMetrics.length;
    const avgExercise = recentMetrics.reduce((acc, m) => acc + (m.exerciseMinutes || 20), 0) / recentMetrics.length;
    if (avgSteps >= 8000 || avgExercise >= 30) movementScore = 92;
    else if (avgSteps >= 5000 || avgExercise >= 20) movementScore = 80;
    else movementScore = 65;
  }

  // 4. Mood Score
  const recentMoods = moods.slice(-7);
  let moodScore = 75;
  if (recentMoods.length > 0) {
    const avgMood = recentMoods.reduce((acc, m) => acc + m.score, 0) / recentMoods.length;
    moodScore = Math.round((avgMood / 5) * 100);
  }

  // 5. Hydration Score
  let hydrationScore = 75;
  if (recentMetrics.length > 0) {
    const avgWater = recentMetrics.reduce((acc, m) => acc + (m.waterMl || 2000), 0) / recentMetrics.length;
    if (avgWater >= 2000) hydrationScore = 95;
    else if (avgWater >= 1500) hydrationScore = 80;
    else hydrationScore = 60;
  }

  // 6. Mindfulness Score
  let mindfulnessScore = 70;
  const meditationHabit = habits.find(h => h.category === 'Mental wellness' || h.name.toLowerCase().includes('meditat'));
  if (meditationHabit && meditationHabit.streak >= 3) {
    mindfulnessScore = 90;
  }

  // Composite Total Score (Weighted)
  // 30% Habits + 20% Sleep + 15% Movement + 15% Mood + 10% Hydration + 10% Mindfulness
  const totalScore = Math.round(
    habitScore * 0.30 +
    sleepScore * 0.20 +
    movementScore * 0.15 +
    moodScore * 0.15 +
    hydrationScore * 0.10 +
    mindfulnessScore * 0.10
  );

  const influencingFactors = [
    {
      title: 'Habit Consistency',
      impact: habitScore >= 80 ? 'positive' : habitScore >= 60 ? 'neutral' : 'negative',
      description: `${habitScore}% completion rate over the past 7 days.`,
    },
    {
      title: 'Sleep Duration & Regularity',
      impact: sleepScore >= 85 ? 'positive' : sleepScore >= 70 ? 'neutral' : 'negative',
      description: `Averaging ${recentMetrics[0]?.sleepHours ? recentMetrics[0].sleepHours.toFixed(1) : '7.4'} hrs per night.`,
    },
    {
      title: 'Mood & Emotional Wellbeing',
      impact: moodScore >= 80 ? 'positive' : moodScore >= 60 ? 'neutral' : 'negative',
      description: `Consistent positive ratings and calm emotional balance.`,
    },
    {
      title: 'Daily Movement & Steps',
      impact: movementScore >= 80 ? 'positive' : 'neutral',
      description: `Solid physical activity and step targets maintained.`,
    },
  ] as const;

  return {
    totalScore,
    habitScore,
    sleepScore,
    movementScore,
    moodScore,
    hydrationScore,
    mindfulnessScore,
    influencingFactors: [...influencingFactors],
  };
}

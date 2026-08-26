export type HabitCategory = 
  | 'Fitness'
  | 'Sleep'
  | 'Nutrition'
  | 'Mental wellness'
  | 'Productivity'
  | 'Learning'
  | 'Self-care'
  | 'Relationships'
  | 'Finances'
  | 'Personal growth'
  | 'Other';

export type HabitFrequency = 'daily' | 'weekly' | 'weekdays' | 'custom';

export type HabitDifficulty = 'easy' | 'medium' | 'hard';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: HabitCategory;
  icon: string; // Lucide icon name string e.g. "Flame", "Droplets", "Moon", "Dumbbell"
  color: string; // Tailwind color token or hex
  frequency: HabitFrequency;
  customDays?: number[]; // 0 for Sun, 1 for Mon, ..., 6 for Sat
  goalTarget: number;
  goalUnit: string;
  reminderTime?: string; // e.g. "08:00"
  startDate: string; // YYYY-MM-DD
  durationMinutes?: number;
  difficulty: HabitDifficulty;
  isArchived: boolean;
  isPaused: boolean;
  createdAt: string;
  updatedAt: string;
  streak: number;
  bestStreak: number;
  totalCompletions: number;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completedAt: string; // ISO String
  value?: number;
  notes?: string;
}

export type MoodScore = 1 | 2 | 3 | 4 | 5; // 1: Difficult, 2: Low, 3: Okay, 4: Good, 5: Excellent

export type EmotionTag = 
  | 'Calm'
  | 'Happy'
  | 'Motivated'
  | 'Focused'
  | 'Tired'
  | 'Stressed'
  | 'Anxious'
  | 'Sad'
  | 'Angry'
  | 'Excited'
  | 'Grateful'
  | 'Energized'
  | 'Inspired'
  | 'Content'
  | 'Proud'
  | 'Neutral'
  | 'Busy'
  | 'Reflective'
  | 'Overwhelmed'
  | 'Irritable'
  | 'Burned out';

export interface MoodEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  score: MoodScore;
  emotions: EmotionTag[];
  notes?: string;
}

export interface HealthMetric {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  // Core Biometrics
  heightCm?: number;
  weightKg?: number;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say';
  // Blood Pressure (mmHg)
  bpSystolic?: number;
  bpDiastolic?: number;
  // Sleep & Circadian Rhythm
  sleepingTime?: string; // Bedtime e.g. "23:00"
  wakeUpTime?: string; // Wakeup time e.g. "07:00"
  sleepHours?: number;
  sleepQuality?: number; // 0-100%
  // Physical & Lifestyle Metrics
  waterMl?: number;
  steps?: number;
  activeMinutes?: number;
  exerciseMinutes?: number;
  restingHeartRate?: number;
  meditationMinutes?: number;
  energyLevel?: number; // 1-10
  notes?: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  motivation?: string;
  selectedCategories: HabitCategory[];
  goals: string[];
  reminderTimePreference: string;
  wakeTime: string;
  sleepTime: string;
  heightCm?: number;
  weightKg?: number;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say';
  bpSystolic?: number;
  bpDiastolic?: number;
  isOnboarded: boolean;
  theme: 'light' | 'dark' | 'system';
  units: 'metric' | 'imperial';
  createdAt: string;
}

export interface HealthHabitRoutineAdvice {
  biometricSummary: {
    bmi: number;
    bmiCategory: string;
    bpCategory: string;
    sleepStatus: string;
    overallHealthRisk: 'low' | 'moderate' | 'high';
    keyObservations: string[];
  };
  moodSynergy: {
    moodTrend: string;
    emotionalStateSummary: string;
    correlationInsights: string[];
  };
  dailyRoutineBlueprint: {
    morning: {
      timeSlot: string;
      title: string;
      focus: string;
      steps: string[];
    };
    afternoon: {
      timeSlot: string;
      title: string;
      focus: string;
      steps: string[];
    };
    evening: {
      timeSlot: string;
      title: string;
      focus: string;
      steps: string[];
    };
  };
  prescribedHabits: Array<{
    name: string;
    description: string;
    category: HabitCategory;
    icon: string;
    color: string;
    goalTarget: number;
    goalUnit: string;
    reminderTime: string;
    durationMinutes: number;
    difficulty: HabitDifficulty;
    rationale: string;
    targetBiometric: string;
  }>;
  generatedAt: string;
}

export interface NotificationSettings {
  habitsEnabled: boolean;
  waterReminders: boolean;
  sleepReminders: boolean;
  moodReminders: boolean;
  dailyReview: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string; // e.g. "07:00"
  browserPermission: 'default' | 'granted' | 'denied';
}

export interface AICoachMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export interface AIInsight {
  strength: string;
  challenge: string;
  recommendation: string;
  nextBestAction: string;
  generatedAt: string;
}

export interface WellnessScoreBreakdown {
  totalScore: number; // 0 - 100
  habitScore: number; // 0 - 100
  sleepScore: number; // 0 - 100
  movementScore: number; // 0 - 100
  moodScore: number; // 0 - 100
  hydrationScore: number; // 0 - 100
  mindfulnessScore: number; // 0 - 100
  influencingFactors: {
    title: string;
    impact: 'positive' | 'neutral' | 'negative';
    description: string;
  }[];
}

export interface SyncQueueItem {
  id: string;
  entity: 'habit' | 'completion' | 'mood' | 'metric' | 'profile' | 'settings';
  action: 'create' | 'update' | 'delete';
  payload: any;
  timestamp: number;
}

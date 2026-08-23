import { getSupabase, isSupabaseConfigured } from './supabase';
import { Habit, HabitCompletion, MoodEntry, HealthMetric, UserProfile } from '../types';

/**
 * Transforms a DB profile row (snake_case) to application UserProfile (camelCase)
 */
export function mapDbToProfile(row: any): UserProfile {
  return {
    id: row.id,
    email: row.email || '',
    name: row.name || row.email?.split('@')[0] || 'User',
    avatarUrl: row.avatar_url || '',
    isOnboarded: Boolean(row.is_onboarded),
    selectedCategories: Array.isArray(row.selected_categories) ? row.selected_categories : [],
    goals: Array.isArray(row.goals) ? row.goals : [],
    reminderTimePreference: row.reminder_time_preference || '08:00',
    wakeTime: row.wake_time || '07:00',
    sleepTime: row.sleep_time || '23:00',
    theme: row.theme || 'light',
    units: row.units || 'metric',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/**
 * Transforms application UserProfile to DB profile row (snake_case)
 */
export function mapProfileToDb(profile: UserProfile): Record<string, any> {
  return {
    id: profile.id,
    email: profile.email || '',
    name: profile.name || '',
    avatar_url: profile.avatarUrl || '',
    is_onboarded: Boolean(profile.isOnboarded),
    selected_categories: profile.selectedCategories || [],
    goals: profile.goals || [],
    reminder_time_preference: profile.reminderTimePreference || '08:00',
    wake_time: profile.wakeTime || '07:00',
    sleep_time: profile.sleepTime || '23:00',
    theme: profile.theme || 'light',
    units: profile.units || 'metric',
    updated_at: new Date().toISOString(),
  };
}

/**
 * Transforms DB habit row to application Habit
 */
export function mapDbToHabit(row: any): Habit {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name || '',
    description: row.description || '',
    category: row.category || 'Fitness',
    icon: row.icon || 'Flame',
    color: row.color || '#6366f1',
    frequency: row.frequency || 'daily',
    goalTarget: Number(row.goal_target) || 1,
    goalUnit: row.goal_unit || 'times',
    reminderTime: row.reminder_time || '',
    difficulty: row.difficulty || 'medium',
    startDate: row.start_date || new Date().toISOString().split('T')[0],
    streak: Number(row.streak) || 0,
    bestStreak: Number(row.best_streak) || 0,
    totalCompletions: Number(row.total_completions) || 0,
    isArchived: Boolean(row.is_archived),
    isPaused: Boolean(row.is_paused),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

/**
 * Transforms Habit to DB habit row
 */
export function mapHabitToDb(habit: Habit): Record<string, any> {
  return {
    id: habit.id,
    user_id: habit.userId,
    name: habit.name,
    description: habit.description || '',
    category: habit.category,
    icon: habit.icon,
    color: habit.color,
    frequency: habit.frequency,
    goal_target: habit.goalTarget,
    goal_unit: habit.goalUnit,
    reminder_time: habit.reminderTime || '',
    difficulty: habit.difficulty || 'medium',
    start_date: habit.startDate,
    streak: habit.streak || 0,
    best_streak: habit.bestStreak || 0,
    total_completions: habit.totalCompletions || 0,
    is_archived: Boolean(habit.isArchived),
    is_paused: Boolean(habit.isPaused),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Transforms DB completion row to HabitCompletion
 */
export function mapDbToCompletion(row: any): HabitCompletion {
  return {
    id: row.id,
    habitId: row.habit_id,
    userId: row.user_id,
    date: row.date,
    completedAt: row.completed_at || new Date().toISOString(),
    value: Number(row.value) || 1,
    notes: row.notes || '',
  };
}

/**
 * Transforms HabitCompletion to DB completion row
 */
export function mapCompletionToDb(completion: HabitCompletion): Record<string, any> {
  return {
    id: completion.id,
    user_id: completion.userId,
    habit_id: completion.habitId,
    date: completion.date,
    completed_at: completion.completedAt || new Date().toISOString(),
    value: completion.value || 1,
    notes: completion.notes || '',
  };
}

/**
 * Transforms DB mood row to MoodEntry
 */
export function mapDbToMood(row: any): MoodEntry {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    timestamp: row.timestamp || row.created_at || new Date().toISOString(),
    score: (row.score || 3) as any,
    emotions: Array.isArray(row.emotions) ? row.emotions : [],
    notes: row.notes || '',
  };
}

/**
 * Transforms MoodEntry to DB mood row
 */
export function mapMoodToDb(mood: MoodEntry): Record<string, any> {
  return {
    id: mood.id,
    user_id: mood.userId,
    date: mood.date,
    timestamp: mood.timestamp,
    score: mood.score,
    emotions: mood.emotions || [],
    notes: mood.notes || '',
    created_at: mood.timestamp || new Date().toISOString(),
  };
}

/**
 * Transforms DB health metric row to HealthMetric
 */
export function mapDbToHealthMetric(row: any): HealthMetric {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    sleepHours: row.sleep_hours ?? undefined,
    waterMl: row.water_ml ?? undefined,
    steps: row.steps ?? undefined,
    exerciseMinutes: row.exercise_minutes ?? undefined,
    weightKg: row.weight_kg ?? undefined,
    restingHeartRate: row.resting_heart_rate ?? undefined,
    meditationMinutes: row.meditation_minutes ?? undefined,
    energyLevel: row.energy_level ?? undefined,
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

/**
 * Transforms HealthMetric to DB health metric row
 */
export function mapHealthMetricToDb(metric: HealthMetric): Record<string, any> {
  return {
    id: metric.id,
    user_id: metric.userId,
    date: metric.date,
    sleep_hours: metric.sleepHours ?? null,
    water_ml: metric.waterMl ?? null,
    steps: metric.steps ?? null,
    exercise_minutes: metric.exerciseMinutes ?? null,
    weight_kg: metric.weightKg ?? null,
    resting_heart_rate: metric.restingHeartRate ?? null,
    meditation_minutes: metric.meditationMinutes ?? null,
    energy_level: metric.energyLevel ?? null,
    updated_at: metric.updatedAt || new Date().toISOString(),
  };
}

/**
 * Supabase Data Service with RLS-compliant queries and real-time support
 */
export const SupabaseDataService = {
  // 1. User Profile
  async fetchProfile(userId: string): Promise<UserProfile | null> {
    const supabase = getSupabase();
    if (!supabase || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Supabase fetch profile warning:', error.message);
        return null;
      }
      return data ? mapDbToProfile(data) : null;
    } catch (err) {
      console.warn('Supabase profile fetch error:', err);
      return null;
    }
  },

  async upsertProfile(profile: UserProfile): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !profile.id) return false;
    try {
      const dbRow = mapProfileToDb(profile);
      const { error } = await supabase
        .from('profiles')
        .upsert(dbRow, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase profile upsert warning:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase profile upsert error:', err);
      return false;
    }
  },

  // 2. Habits
  async fetchHabits(userId: string): Promise<Habit[]> {
    const supabase = getSupabase();
    if (!supabase || !userId) return [];
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Supabase fetch habits warning:', error.message);
        return [];
      }
      return (data || []).map(mapDbToHabit);
    } catch (err) {
      console.warn('Supabase habits error:', err);
      return [];
    }
  },

  async saveHabit(habit: Habit): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !habit.userId) return false;
    try {
      const dbRow = mapHabitToDb(habit);
      const { error } = await supabase
        .from('habits')
        .upsert(dbRow, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase save habit warning:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase habit save error:', err);
      return false;
    }
  },

  async deleteHabit(habitId: string, userId: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !habitId) return false;
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .eq('user_id', userId);

      if (error) {
        console.warn('Supabase delete habit warning:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase habit delete error:', err);
      return false;
    }
  },

  // 3. Completions
  async fetchCompletions(userId: string): Promise<HabitCompletion[]> {
    const supabase = getSupabase();
    if (!supabase || !userId) return [];
    try {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        const alt = await supabase.from('completions').select('*').eq('user_id', userId);
        if (!alt.error && alt.data) {
          return alt.data.map(mapDbToCompletion);
        }
        console.warn('Supabase fetch completions warning:', error.message);
        return [];
      }
      return (data || []).map(mapDbToCompletion);
    } catch (err) {
      console.warn('Supabase completions error:', err);
      return [];
    }
  },

  async saveCompletion(completion: HabitCompletion): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !completion.userId) return false;
    try {
      const dbRow = mapCompletionToDb(completion);
      const { error } = await supabase
        .from('habit_completions')
        .upsert(dbRow, { onConflict: 'id' });

      if (error) {
        await supabase.from('completions').upsert(dbRow, { onConflict: 'id' });
        return true;
      }
      return true;
    } catch (err) {
      console.warn('Supabase completion save error:', err);
      return false;
    }
  },

  async deleteCompletion(completionId: string, userId: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !completionId) return false;
    try {
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', completionId)
        .eq('user_id', userId);

      if (error) {
        await supabase.from('completions').delete().eq('id', completionId).eq('user_id', userId);
      }
      return true;
    } catch (err) {
      console.warn('Supabase completion delete error:', err);
      return false;
    }
  },

  // 4. Mood Entries
  async fetchMoods(userId: string): Promise<MoodEntry[]> {
    const supabase = getSupabase();
    if (!supabase || !userId) return [];
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        const alt = await supabase.from('moods').select('*').eq('user_id', userId).order('date', { ascending: false });
        if (!alt.error && alt.data) {
          return alt.data.map(mapDbToMood);
        }
        console.warn('Supabase fetch moods warning:', error.message);
        return [];
      }
      return (data || []).map(mapDbToMood);
    } catch (err) {
      console.warn('Supabase moods error:', err);
      return [];
    }
  },

  async saveMood(mood: MoodEntry): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !mood.userId) return false;
    try {
      const dbRow = mapMoodToDb(mood);
      const { error } = await supabase
        .from('mood_entries')
        .upsert(dbRow, { onConflict: 'id' });

      if (error) {
        await supabase.from('moods').upsert(dbRow, { onConflict: 'id' });
      }
      return true;
    } catch (err) {
      console.warn('Supabase mood save error:', err);
      return false;
    }
  },

  // 5. Health Metrics
  async fetchHealthMetrics(userId: string): Promise<HealthMetric[]> {
    const supabase = getSupabase();
    if (!supabase || !userId) return [];
    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.warn('Supabase fetch health metrics warning:', error.message);
        return [];
      }
      return (data || []).map(mapDbToHealthMetric);
    } catch (err) {
      console.warn('Supabase health metrics error:', err);
      return [];
    }
  },

  async saveHealthMetric(metric: HealthMetric): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !metric.userId) return false;
    try {
      const dbRow = mapHealthMetricToDb(metric);
      const { error } = await supabase
        .from('health_metrics')
        .upsert(dbRow, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase health metric save warning:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase health metric save error:', err);
      return false;
    }
  },

  // 6. Real-time Subscriptions via Supabase Channels
  subscribeUserChanges(userId: string, onUpdate: () => void) {
    const supabase = getSupabase();
    if (!supabase || !userId) return () => {};

    try {
      const channel = supabase
        .channel(`user-data-${userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', filter: `user_id=eq.${userId}` },
          () => {
            onUpdate();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Supabase realtime channel subscription note:', err);
      return () => {};
    }
  },
};

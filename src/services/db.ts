import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { 
  UserProfile, 
  Habit, 
  HabitCompletion, 
  DailyRecord, 
  MoodEntry, 
  HealthMetric, 
  AppSettings 
} from '../types';

export interface HabitsDBSchema extends DBSchema {
  profiles: {
    key: string;
    value: UserProfile;
    indexes: { 'by-email': string };
  };
  habits: {
    key: string;
    value: Habit;
    indexes: { 'by-user': string };
  };
  completions: {
    key: string;
    value: HabitCompletion;
    indexes: {
      'by-user': string;
      'by-habit': string;
      'by-date': string;
      'by-user-date': [string, string];
      'by-habit-date': [string, string];
    };
  };
  daily_records: {
    key: string;
    value: DailyRecord;
    indexes: {
      'by-user': string;
      'by-habit': string;
      'by-date': string;
      'by-user-date': [string, string];
    };
  };
  moods: {
    key: string;
    value: MoodEntry;
    indexes: {
      'by-user': string;
      'by-date': string;
      'by-user-date': [string, string];
    };
  };
  health_metrics: {
    key: string;
    value: HealthMetric;
    indexes: {
      'by-user': string;
      'by-date': string;
      'by-user-date': [string, string];
    };
  };
  app_settings: {
    key: string;
    value: { key: string; value: any };
  };
}

const DB_NAME = 'todo_habits_offline_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<HabitsDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<HabitsDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<HabitsDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Profiles store
        if (!db.objectStoreNames.contains('profiles')) {
          const profileStore = db.createObjectStore('profiles', { keyPath: 'id' });
          profileStore.createIndex('by-email', 'email');
        }

        // Habits store
        if (!db.objectStoreNames.contains('habits')) {
          const habitStore = db.createObjectStore('habits', { keyPath: 'id' });
          habitStore.createIndex('by-user', 'userId');
        }

        // Completions store
        if (!db.objectStoreNames.contains('completions')) {
          const compStore = db.createObjectStore('completions', { keyPath: 'id' });
          compStore.createIndex('by-user', 'userId');
          compStore.createIndex('by-habit', 'habitId');
          compStore.createIndex('by-date', 'date');
          compStore.createIndex('by-user-date', ['userId', 'date']);
          compStore.createIndex('by-habit-date', ['habitId', 'date']);
        }

        // Daily records store
        if (!db.objectStoreNames.contains('daily_records')) {
          const drStore = db.createObjectStore('daily_records', { keyPath: 'id' });
          drStore.createIndex('by-user', 'userId');
          drStore.createIndex('by-habit', 'habitId');
          drStore.createIndex('by-date', 'date');
          drStore.createIndex('by-user-date', ['userId', 'date']);
        }

        // Moods store
        if (!db.objectStoreNames.contains('moods')) {
          const moodStore = db.createObjectStore('moods', { keyPath: 'id' });
          moodStore.createIndex('by-user', 'userId');
          moodStore.createIndex('by-date', 'date');
          moodStore.createIndex('by-user-date', ['userId', 'date']);
        }

        // Health metrics store
        if (!db.objectStoreNames.contains('health_metrics')) {
          const hmStore = db.createObjectStore('health_metrics', { keyPath: 'id' });
          hmStore.createIndex('by-user', 'userId');
          hmStore.createIndex('by-date', 'date');
          hmStore.createIndex('by-user-date', ['userId', 'date']);
        }

        // App settings store
        if (!db.objectStoreNames.contains('app_settings')) {
          db.createObjectStore('app_settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

export class IndexedDBService {
  // PROFILES
  static async getAllProfiles(): Promise<UserProfile[]> {
    try {
      const db = await getDB();
      return await db.getAll('profiles');
    } catch (e) {
      console.warn('IDB: Failed to get profiles', e);
      return [];
    }
  }

  static async getProfile(id: string): Promise<UserProfile | undefined> {
    try {
      const db = await getDB();
      return await db.get('profiles', id);
    } catch (e) {
      console.warn('IDB: Failed to get profile', e);
      return undefined;
    }
  }

  static async saveProfile(profile: UserProfile): Promise<void> {
    try {
      const db = await getDB();
      await db.put('profiles', profile);
    } catch (e) {
      console.warn('IDB: Failed to save profile', e);
    }
  }

  static async saveProfiles(profiles: UserProfile[]): Promise<void> {
    try {
      const db = await getDB();
      const tx = db.transaction('profiles', 'readwrite');
      for (const p of profiles) {
        await tx.store.put(p);
      }
      await tx.done;
    } catch (e) {
      console.warn('IDB: Failed to save profiles', e);
    }
  }

  static async deleteProfile(id: string): Promise<void> {
    try {
      const db = await getDB();
      await db.delete('profiles', id);
    } catch (e) {
      console.warn('IDB: Failed to delete profile', e);
    }
  }

  // HABITS
  static async getHabits(userId: string): Promise<Habit[]> {
    try {
      const db = await getDB();
      return await db.getAllFromIndex('habits', 'by-user', userId);
    } catch (e) {
      console.warn('IDB: Failed to get habits', e);
      return [];
    }
  }

  static async saveHabit(habit: Habit): Promise<void> {
    try {
      const db = await getDB();
      await db.put('habits', habit);
    } catch (e) {
      console.warn('IDB: Failed to save habit', e);
    }
  }

  static async saveHabits(habits: Habit[]): Promise<void> {
    try {
      const db = await getDB();
      const tx = db.transaction('habits', 'readwrite');
      for (const h of habits) {
        await tx.store.put(h);
      }
      await tx.done;
    } catch (e) {
      console.warn('IDB: Failed to bulk save habits', e);
    }
  }

  static async deleteHabit(id: string): Promise<void> {
    try {
      const db = await getDB();
      await db.delete('habits', id);
    } catch (e) {
      console.warn('IDB: Failed to delete habit', e);
    }
  }

  // COMPLETIONS
  static async getCompletions(userId: string): Promise<HabitCompletion[]> {
    try {
      const db = await getDB();
      return await db.getAllFromIndex('completions', 'by-user', userId);
    } catch (e) {
      console.warn('IDB: Failed to get completions', e);
      return [];
    }
  }

  static async saveCompletion(completion: HabitCompletion): Promise<void> {
    try {
      const db = await getDB();
      await db.put('completions', completion);
    } catch (e) {
      console.warn('IDB: Failed to save completion', e);
    }
  }

  static async saveCompletions(completions: HabitCompletion[]): Promise<void> {
    try {
      const db = await getDB();
      const tx = db.transaction('completions', 'readwrite');
      for (const c of completions) {
        await tx.store.put(c);
      }
      await tx.done;
    } catch (e) {
      console.warn('IDB: Failed to bulk save completions', e);
    }
  }

  static async deleteCompletion(id: string): Promise<void> {
    try {
      const db = await getDB();
      await db.delete('completions', id);
    } catch (e) {
      console.warn('IDB: Failed to delete completion', e);
    }
  }

  // DAILY RECORDS
  static async getDailyRecords(userId: string): Promise<DailyRecord[]> {
    try {
      const db = await getDB();
      return await db.getAllFromIndex('daily_records', 'by-user', userId);
    } catch (e) {
      console.warn('IDB: Failed to get daily records', e);
      return [];
    }
  }

  static async saveDailyRecord(record: DailyRecord): Promise<void> {
    try {
      const db = await getDB();
      await db.put('daily_records', record);
    } catch (e) {
      console.warn('IDB: Failed to save daily record', e);
    }
  }

  static async saveDailyRecords(records: DailyRecord[]): Promise<void> {
    try {
      const db = await getDB();
      const tx = db.transaction('daily_records', 'readwrite');
      for (const r of records) {
        await tx.store.put(r);
      }
      await tx.done;
    } catch (e) {
      console.warn('IDB: Failed to bulk save daily records', e);
    }
  }

  // MOODS
  static async getMoods(userId: string): Promise<MoodEntry[]> {
    try {
      const db = await getDB();
      return await db.getAllFromIndex('moods', 'by-user', userId);
    } catch (e) {
      console.warn('IDB: Failed to get moods', e);
      return [];
    }
  }

  static async saveMood(mood: MoodEntry): Promise<void> {
    try {
      const db = await getDB();
      await db.put('moods', mood);
    } catch (e) {
      console.warn('IDB: Failed to save mood', e);
    }
  }

  static async saveMoods(moods: MoodEntry[]): Promise<void> {
    try {
      const db = await getDB();
      const tx = db.transaction('moods', 'readwrite');
      for (const m of moods) {
        await tx.store.put(m);
      }
      await tx.done;
    } catch (e) {
      console.warn('IDB: Failed to bulk save moods', e);
    }
  }

  // HEALTH METRICS
  static async getHealthMetrics(userId: string): Promise<HealthMetric[]> {
    try {
      const db = await getDB();
      return await db.getAllFromIndex('health_metrics', 'by-user', userId);
    } catch (e) {
      console.warn('IDB: Failed to get health metrics', e);
      return [];
    }
  }

  static async saveHealthMetric(metric: HealthMetric): Promise<void> {
    try {
      const db = await getDB();
      await db.put('health_metrics', metric);
    } catch (e) {
      console.warn('IDB: Failed to save health metric', e);
    }
  }

  static async saveHealthMetrics(metrics: HealthMetric[]): Promise<void> {
    try {
      const db = await getDB();
      const tx = db.transaction('health_metrics', 'readwrite');
      for (const m of metrics) {
        await tx.store.put(m);
      }
      await tx.done;
    } catch (e) {
      console.warn('IDB: Failed to bulk save health metrics', e);
    }
  }

  // APP SETTINGS
  static async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const db = await getDB();
      const row = await db.get('app_settings', key);
      return row !== undefined ? (row.value as T) : defaultValue;
    } catch (e) {
      console.warn(`IDB: Failed to get setting ${key}`, e);
      return defaultValue;
    }
  }

  static async setSetting<T>(key: string, value: T): Promise<void> {
    try {
      const db = await getDB();
      await db.put('app_settings', { key, value });
    } catch (e) {
      console.warn(`IDB: Failed to set setting ${key}`, e);
    }
  }

  /**
   * Reconciles missed habit days automatically.
   * Scans all dates from habit start date (or last 30 days) up to today.
   * Records 'missed' for past uncompleted days, 'completed' for marked days, 'pending' for today.
   * Preserves full history and updates habit streaks without wiping data.
   */
  static async reconcileMissedDays(
    userId: string,
    habits: Habit[],
    completions: HabitCompletion[]
  ): Promise<{ updatedHabits: Habit[]; newDailyRecords: DailyRecord[] }> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const completionSet = new Set(
      completions.map((c) => `${c.habitId}_${c.date}`)
    );

    const newDailyRecords: DailyRecord[] = [];
    const updatedHabits: Habit[] = [];

    for (const habit of habits) {
      if (habit.isArchived || habit.isPaused) {
        updatedHabits.push(habit);
        continue;
      }

      // Determine date range: at least past 14 days or since habit startDate
      const habitStartDate = habit.startDate || todayStr;
      const daysToCheck = 30; // check up to last 30 days
      let currentStreak = 0;
      let bestStreak = habit.bestStreak || 0;
      let tempStreak = 0;

      // Iterate through past days up to today
      for (let i = daysToCheck; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        // Only evaluate if date is on or after habit creation
        if (dateStr < habitStartDate) continue;

        const isCompleted = completionSet.has(`${habit.id}_${dateStr}`);
        const isPast = dateStr < todayStr;
        const isToday = dateStr === todayStr;

        const recordId = `${userId}_${habit.id}_${dateStr}`;
        const status = isCompleted
          ? 'completed'
          : isPast
          ? 'missed'
          : 'pending';

        newDailyRecords.push({
          id: recordId,
          userId,
          habitId: habit.id,
          date: dateStr,
          status,
          updatedAt: new Date().toISOString(),
        });

        // Calculate streaks accurately
        if (isCompleted) {
          tempStreak++;
          if (tempStreak > bestStreak) {
            bestStreak = tempStreak;
          }
        } else if (isPast) {
          // Missed in the past resets temp streak counter
          tempStreak = 0;
        }
      }

      // Calculate current streak:
      // Check yesterday and today
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const completedToday = completionSet.has(`${habit.id}_${todayStr}`);
      const completedYesterday = completionSet.has(`${habit.id}_${yesterdayStr}`);

      if (completedToday) {
        // Count consecutive days ending today
        let streak = 1;
        let checkDate = new Date(today);
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const ds = checkDate.toISOString().split('T')[0];
          if (ds < habitStartDate) break;
          if (completionSet.has(`${habit.id}_${ds}`)) {
            streak++;
          } else {
            break;
          }
        }
        currentStreak = streak;
      } else if (completedYesterday) {
        // User still has today to complete
        let streak = 0;
        let checkDate = new Date(yesterday);
        while (true) {
          const ds = checkDate.toISOString().split('T')[0];
          if (ds < habitStartDate) break;
          if (completionSet.has(`${habit.id}_${ds}`)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
        currentStreak = streak;
      } else {
        // Missed yesterday and not completed today
        currentStreak = 0;
      }

      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }

      updatedHabits.push({
        ...habit,
        streak: currentStreak,
        bestStreak,
        updatedAt: new Date().toISOString(),
      });
    }

    // Persist daily records
    await this.saveDailyRecords(newDailyRecords);
    await this.saveHabits(updatedHabits);

    return { updatedHabits, newDailyRecords };
  }

  // EXPORT / BACKUP ALL DATA AS JSON
  static async exportAllDataJSON(): Promise<string> {
    try {
      const db = await getDB();
      const profiles = await db.getAll('profiles');
      const habits = await db.getAll('habits');
      const completions = await db.getAll('completions');
      const dailyRecords = await db.getAll('daily_records');
      const moods = await db.getAll('moods');
      const healthMetrics = await db.getAll('health_metrics');
      const settings = await db.getAll('app_settings');

      const backup = {
        app: 'To-Do-Habits',
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        data: {
          profiles,
          habits,
          completions,
          dailyRecords,
          moods,
          healthMetrics,
          settings,
        },
      };

      return JSON.stringify(backup, null, 2);
    } catch (e) {
      console.error('IDB: Export failed', e);
      throw e;
    }
  }

  // IMPORT ALL DATA FROM JSON
  static async importAllDataJSON(jsonString: string): Promise<{ success: boolean; message: string }> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data || (!parsed.data.profiles && !parsed.data.habits)) {
        return { success: false, message: 'Invalid backup file format.' };
      }

      const {
        profiles = [],
        habits = [],
        completions = [],
        dailyRecords = [],
        moods = [],
        healthMetrics = [],
        settings = [],
      } = parsed.data;

      const db = await getDB();

      if (profiles.length > 0) {
        const tx = db.transaction('profiles', 'readwrite');
        for (const p of profiles) await tx.store.put(p);
        await tx.done;
      }

      if (habits.length > 0) {
        const tx = db.transaction('habits', 'readwrite');
        for (const h of habits) await tx.store.put(h);
        await tx.done;
      }

      if (completions.length > 0) {
        const tx = db.transaction('completions', 'readwrite');
        for (const c of completions) await tx.store.put(c);
        await tx.done;
      }

      if (dailyRecords.length > 0) {
        const tx = db.transaction('daily_records', 'readwrite');
        for (const dr of dailyRecords) await tx.store.put(dr);
        await tx.done;
      }

      if (moods.length > 0) {
        const tx = db.transaction('moods', 'readwrite');
        for (const m of moods) await tx.store.put(m);
        await tx.done;
      }

      if (healthMetrics.length > 0) {
        const tx = db.transaction('health_metrics', 'readwrite');
        for (const hm of healthMetrics) await tx.store.put(hm);
        await tx.done;
      }

      if (settings.length > 0) {
        const tx = db.transaction('app_settings', 'readwrite');
        for (const s of settings) await tx.store.put(s);
        await tx.done;
      }

      return {
        success: true,
        message: `Imported ${profiles.length} profiles, ${habits.length} habits, ${completions.length} completions.`,
      };
    } catch (e: any) {
      console.error('IDB: Import failed', e);
      return { success: false, message: e?.message || 'Failed to import backup.' };
    }
  }
}

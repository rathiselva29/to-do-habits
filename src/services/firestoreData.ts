import {
  db,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot
} from './firebase';
import { Habit, HabitCompletion, MoodEntry, HealthMetric } from '../types';

export const FirestoreDataService = {
  // Real-time listener for user habits
  subscribeHabits: (userId: string, onUpdate: (habits: Habit[]) => void) => {
    try {
      const habitsCol = collection(db, 'habits');
      const q = query(habitsCol, where('userId', '==', userId));
      return onSnapshot(q, (snapshot) => {
        const list: Habit[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Habit);
        });
        // Sort by createdAt descending
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(list);
      }, (err) => {
        console.warn('Habits snapshot listener note:', err);
      });
    } catch (e) {
      console.warn('Firestore subscribeHabits note:', e);
      return () => {};
    }
  },

  // Real-time listener for user completions
  subscribeCompletions: (userId: string, onUpdate: (completions: HabitCompletion[]) => void) => {
    try {
      const compCol = collection(db, 'completions');
      const q = query(compCol, where('userId', '==', userId));
      return onSnapshot(q, (snapshot) => {
        const list: HabitCompletion[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as HabitCompletion);
        });
        onUpdate(list);
      }, (err) => {
        console.warn('Completions snapshot listener note:', err);
      });
    } catch (e) {
      console.warn('Firestore subscribeCompletions note:', e);
      return () => {};
    }
  },

  // Real-time listener for user moods
  subscribeMoods: (userId: string, onUpdate: (moods: MoodEntry[]) => void) => {
    try {
      const moodsCol = collection(db, 'moods');
      const q = query(moodsCol, where('userId', '==', userId));
      return onSnapshot(q, (snapshot) => {
        const list: MoodEntry[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as MoodEntry);
        });
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        onUpdate(list);
      }, (err) => {
        console.warn('Moods snapshot listener note:', err);
      });
    } catch (e) {
      console.warn('Firestore subscribeMoods note:', e);
      return () => {};
    }
  },

  // Real-time listener for user health metrics
  subscribeHealthMetrics: (userId: string, onUpdate: (metrics: HealthMetric[]) => void) => {
    try {
      const metricsCol = collection(db, 'health_metrics');
      const q = query(metricsCol, where('userId', '==', userId));
      return onSnapshot(q, (snapshot) => {
        const list: HealthMetric[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as HealthMetric);
        });
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        onUpdate(list);
      }, (err) => {
        console.warn('Health metrics snapshot listener note:', err);
      });
    } catch (e) {
      console.warn('Firestore subscribeHealthMetrics note:', e);
      return () => {};
    }
  },

  // Save Habit
  saveHabit: async (habit: Habit) => {
    try {
      const docRef = doc(db, 'habits', habit.id);
      await setDoc(docRef, habit, { merge: true });
    } catch (err) {
      console.warn('Error saving habit to Firestore:', err);
    }
  },

  // Delete Habit
  deleteHabit: async (habitId: string) => {
    try {
      const docRef = doc(db, 'habits', habitId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Error deleting habit from Firestore:', err);
    }
  },

  // Save Completion
  saveCompletion: async (completion: HabitCompletion) => {
    try {
      const docRef = doc(db, 'completions', completion.id);
      await setDoc(docRef, completion, { merge: true });
    } catch (err) {
      console.warn('Error saving completion to Firestore:', err);
    }
  },

  // Delete Completion
  deleteCompletion: async (completionId: string) => {
    try {
      const docRef = doc(db, 'completions', completionId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Error deleting completion from Firestore:', err);
    }
  },

  // Save Mood
  saveMood: async (mood: MoodEntry) => {
    try {
      const docRef = doc(db, 'moods', mood.id);
      await setDoc(docRef, mood, { merge: true });
    } catch (err) {
      console.warn('Error saving mood to Firestore:', err);
    }
  },

  // Save Health Metric
  saveHealthMetric: async (metric: HealthMetric) => {
    try {
      const docRef = doc(db, 'health_metrics', metric.id);
      await setDoc(docRef, metric, { merge: true });
    } catch (err) {
      console.warn('Error saving health metric to Firestore:', err);
    }
  },
};

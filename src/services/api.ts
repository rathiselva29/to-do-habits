import { 
  Habit, 
  HabitCompletion, 
  MoodEntry, 
  HealthMetric, 
  UserProfile, 
  AICoachMessage, 
  AIInsight,
  SyncQueueItem 
} from '../types';

export const ApiService = {
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: any }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to process password reset');
    return data;
  },

  async resetPassword(email: string, resetToken: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, resetToken, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  },

  async askAICoach(params: {
    messages: AICoachMessage[];
    userProfile: UserProfile;
    habits: Habit[];
    completions: HabitCompletion[];
    moodEntries: MoodEntry[];
    healthMetrics: HealthMetric[];
  }): Promise<{ reply: string; suggestions?: string[] }> {
    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('AI Coach request failed');
      return await res.json();
    } catch (err) {
      console.warn('AI Coach offline fallback', err);
      return {
        reply: "You're building wonderful consistency. Remember that small daily actions compound over time into life-changing wellness habits. Keep up the dedication!",
        suggestions: [
          'How can I improve my sleep routine?',
          'Suggest a 5-minute focus booster',
        ],
      };
    }
  },

  async getAIInsights(params: {
    userProfile: UserProfile;
    habits: Habit[];
    completions: HabitCompletion[];
    moodEntries: MoodEntry[];
    healthMetrics: HealthMetric[];
  }): Promise<{ insight: AIInsight }> {
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('AI Insights request failed');
      return await res.json();
    } catch (err) {
      return {
        insight: {
          strength: 'Consistent morning habit check-ins and steady streaks.',
          challenge: 'Maintaining evening wind-down rituals before bedtime.',
          recommendation: 'Try habit stacking: pair your meditation right before breakfast.',
          nextBestAction: 'Complete your pending physical movement goal today.',
          generatedAt: new Date().toISOString(),
        },
      };
    }
  },

  async getHabitSuggestions(category: string, goal: string): Promise<{ suggestions: any[] }> {
    try {
      const res = await fetch('/api/ai/habit-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, goal }),
      });
      if (!res.ok) throw new Error('Habit suggestions failed');
      return await res.json();
    } catch (err) {
      return {
        suggestions: [
          {
            name: 'Morning Hydration',
            description: 'Drink 500ml water right upon waking',
            category: category || 'Nutrition',
            icon: 'Droplets',
            color: 'emerald',
            goalTarget: 1,
            goalUnit: 'glass',
            difficulty: 'easy',
            frequency: 'daily',
          },
          {
            name: '15-Min Daylight Walk',
            description: 'Brisk walk outside to boost energy and dopamine',
            category: category || 'Fitness',
            icon: 'Footprints',
            color: 'blue',
            goalTarget: 15,
            goalUnit: 'mins',
            difficulty: 'easy',
            frequency: 'daily',
          },
        ],
      };
    }
  },

  async syncOfflineQueue(items: SyncQueueItem[]): Promise<{ success: boolean; syncedCount: number }> {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error('Sync failed');
    return await res.json();
  }
};

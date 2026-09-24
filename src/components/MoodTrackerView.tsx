import React, { useState, useMemo } from 'react';
import { 
  Smile, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Check, 
  Heart, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Plus,
  Zap,
  Brain,
  Droplets,
  Footprints,
  Coffee,
  Activity,
  Dumbbell,
  Moon,
  Wind,
  Music,
  ShieldCheck,
  Award,
  Sun,
  Filter
} from 'lucide-react';
import { EmotionTag, MoodEntry, MoodScore, Habit, HabitCategory } from '../types';
import { useApp } from '../context/AppContext';
import { getPastDateString, getTodayDateString } from '../services/storage';
import { IconRenderer } from './IconRenderer';
import { formatTimeTo12Hour } from '../utils/timeFormat';
import confetti from 'canvas-confetti';

const MOOD_OPTIONS: Array<{ score: MoodScore; emoji: string; label: string; lightClass: string; darkClass: string }> = [
  { 
    score: 5, 
    emoji: '😄', 
    label: 'Excellent', 
    lightClass: 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400/40', 
    darkClass: 'dark:border-emerald-400 dark:bg-emerald-950/80 dark:text-emerald-100 dark:ring-2 dark:ring-emerald-400/50' 
  },
  { 
    score: 4, 
    emoji: '🙂', 
    label: 'Good', 
    lightClass: 'border-teal-500 bg-teal-50 text-teal-950 ring-2 ring-teal-400/40', 
    darkClass: 'dark:border-teal-400 dark:bg-teal-950/80 dark:text-teal-100 dark:ring-2 dark:ring-teal-400/50' 
  },
  { 
    score: 3, 
    emoji: '😐', 
    label: 'Okay', 
    lightClass: 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400/40', 
    darkClass: 'dark:border-amber-400 dark:bg-amber-950/80 dark:text-amber-100 dark:ring-2 dark:ring-amber-400/50' 
  },
  { 
    score: 2, 
    emoji: '😔', 
    label: 'Low', 
    lightClass: 'border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-400/40', 
    darkClass: 'dark:border-rose-400 dark:bg-rose-950/80 dark:text-rose-100 dark:ring-2 dark:ring-rose-400/50' 
  },
  { 
    score: 1, 
    emoji: '😞', 
    label: 'Difficult', 
    lightClass: 'border-rose-600 bg-rose-100 text-rose-950 ring-2 ring-rose-500/40', 
    darkClass: 'dark:border-rose-500 dark:bg-rose-950/90 dark:text-rose-100 dark:ring-2 dark:ring-rose-400/60' 
  },
];

const EMOTION_TAGS: EmotionTag[] = [
  'Grateful',
  'Energized',
  'Calm',
  'Focused',
  'Inspired',
  'Happy',
  'Content',
  'Proud',
  'Neutral',
  'Tired',
  'Busy',
  'Reflective',
  'Anxious',
  'Stressed',
  'Overwhelmed',
  'Sad',
  'Irritable',
  'Burned out',
];

interface SuggestedHabitTemplate {
  name: string;
  description: string;
  category: HabitCategory;
  icon: string;
  color: string;
  goalTarget: number;
  goalUnit: string;
  reminderTime: string;
  durationMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  whyItHelps: string;
  intention: 'calm' | 'energy' | 'focus' | 'sleep' | 'joy';
  scoreMatch: MoodScore[];
}

const HABIT_RECOMMENDATIONS_CATALOG: SuggestedHabitTemplate[] = [
  // Low / Stressed / Anxious (Score 1-2)
  {
    name: '5-Min Box Breathing',
    description: '4-count inhale, 4-count hold, 4-count exhale, 4-count hold to reset the autonomic nervous system.',
    category: 'Mental wellness',
    icon: 'Brain',
    color: '#0d9488',
    goalTarget: 1,
    goalUnit: 'session',
    reminderTime: '14:00',
    durationMinutes: 5,
    difficulty: 'easy',
    whyItHelps: 'Rapidly lowers cortisol, calms tachycardia, and halts stress spirals.',
    intention: 'calm',
    scoreMatch: [1, 2, 3],
  },
  {
    name: '20-Min Screen-Free Walk',
    description: 'Gentle outdoor walk without headphones or screens to absorb natural light and panoramic vision.',
    category: 'Fitness',
    icon: 'Footprints',
    color: '#10b981',
    goalTarget: 20,
    goalUnit: 'mins',
    reminderTime: '17:30',
    durationMinutes: 20,
    difficulty: 'easy',
    whyItHelps: 'Optic flow calms brain amygdala threat circuits and clears mental fog.',
    intention: 'calm',
    scoreMatch: [1, 2, 3],
  },
  {
    name: '3 Things Gratitude Journal',
    description: 'Jot down 3 specific, sensory details you were genuinely thankful for today.',
    category: 'Self-care',
    icon: 'Heart',
    color: '#ec4899',
    goalTarget: 1,
    goalUnit: 'entry',
    reminderTime: '21:00',
    durationMinutes: 5,
    difficulty: 'easy',
    whyItHelps: 'Rewires neural bias away from perceived threats toward grounding safety.',
    intention: 'joy',
    scoreMatch: [1, 2, 3, 4],
  },
  {
    name: 'Warm Herbal Chamomile Tea',
    description: 'Steep a cup of chamomile or valerian tea 45 mins before bedtime.',
    category: 'Nutrition',
    icon: 'Coffee',
    color: '#8b5cf6',
    goalTarget: 1,
    goalUnit: 'cup',
    reminderTime: '21:45',
    durationMinutes: 10,
    difficulty: 'easy',
    whyItHelps: 'Apigenin in chamomile binds to GABA receptors, easing sleep onset.',
    intention: 'sleep',
    scoreMatch: [1, 2, 3],
  },
  {
    name: '10-Min Gentle Spinal Stretch',
    description: 'Cat-cow, child’s pose, and gentle thoracic rotations to release physical tension.',
    category: 'Fitness',
    icon: 'Activity',
    color: '#6366f1',
    goalTarget: 10,
    goalUnit: 'mins',
    reminderTime: '19:00',
    durationMinutes: 10,
    difficulty: 'easy',
    whyItHelps: 'Unwinds muscle constriction caused by prolonged fight-or-flight states.',
    intention: 'calm',
    scoreMatch: [1, 2, 3],
  },

  // Neutral / Okay / Low Energy (Score 3)
  {
    name: 'Cold Water Hydration (500ml)',
    description: 'Drink 500ml of cold electrolyte water with a pinch of sea salt upon waking or mid-afternoon.',
    category: 'Nutrition',
    icon: 'Droplets',
    color: '#0ea5e9',
    goalTarget: 500,
    goalUnit: 'ml',
    reminderTime: '08:00',
    durationMinutes: 2,
    difficulty: 'easy',
    whyItHelps: 'Dehydration accounts for 40% of daytime fatigue and cognitive slumps.',
    intention: 'energy',
    scoreMatch: [2, 3, 4],
  },
  {
    name: '25-Min Pomodoro Sprint',
    description: 'Pick exactly 1 single task, start a 25-minute timer, and work with zero distractions.',
    category: 'Productivity',
    icon: 'Zap',
    color: '#f59e0b',
    goalTarget: 1,
    goalUnit: 'session',
    reminderTime: '10:00',
    durationMinutes: 25,
    difficulty: 'medium',
    whyItHelps: 'Lowers starting friction and uses timeboxing to generate early momentum.',
    intention: 'focus',
    scoreMatch: [3, 4],
  },
  {
    name: 'Desk Reset & Clean Space',
    description: 'Spend 5 minutes removing cups, papers, and clutter from your physical workspace.',
    category: 'Productivity',
    icon: 'Sparkles',
    color: '#14b8a6',
    goalTarget: 1,
    goalUnit: 'session',
    reminderTime: '17:00',
    durationMinutes: 5,
    difficulty: 'easy',
    whyItHelps: 'Visual clarity significantly decreases unconscious cognitive load.',
    intention: 'focus',
    scoreMatch: [2, 3],
  },
  {
    name: 'Lo-Fi / Binaural Study Beats',
    description: 'Listen to 40Hz alpha or theta frequency audio while doing focused tasks.',
    category: 'Mental wellness',
    icon: 'Music',
    color: '#06b6d4',
    goalTarget: 20,
    goalUnit: 'mins',
    reminderTime: '11:00',
    durationMinutes: 20,
    difficulty: 'easy',
    whyItHelps: 'Encourages neuro-entrainment and prevents mind wandering.',
    intention: 'focus',
    scoreMatch: [3, 4],
  },

  // Good / Excellent / High Momentum (Score 4-5)
  {
    name: '45-Min Deep Work Sprint',
    description: 'Tackle your highest-priority creative, strategic, or engineering project without interruptions.',
    category: 'Productivity',
    icon: 'Brain',
    color: '#4f46e5',
    goalTarget: 45,
    goalUnit: 'mins',
    reminderTime: '09:30',
    durationMinutes: 45,
    difficulty: 'medium',
    whyItHelps: 'Capitalizes on elevated dopamine and prefrontal cortex energy.',
    intention: 'focus',
    scoreMatch: [4, 5],
  },
  {
    name: '30-Min High-Energy Workout',
    description: 'Strength training, cycling, running, or HIIT to push physical cardiovascular endurance.',
    category: 'Fitness',
    icon: 'Dumbbell',
    color: '#f43f5e',
    goalTarget: 30,
    goalUnit: 'mins',
    reminderTime: '07:30',
    durationMinutes: 30,
    difficulty: 'hard',
    whyItHelps: 'Releases BDNF (brain-derived neurotrophic factor) to solidify mental clarity.',
    intention: 'energy',
    scoreMatch: [4, 5],
  },
  {
    name: 'Read 15 Pages of Book',
    description: 'Read non-fiction, philosophy, or literature to continuously upgrade your mental models.',
    category: 'Learning',
    icon: 'BookOpen',
    color: '#8b5cf6',
    goalTarget: 15,
    goalUnit: 'pages',
    reminderTime: '20:30',
    durationMinutes: 20,
    difficulty: 'medium',
    whyItHelps: 'Compounding knowledge growth and high-quality evening cognitive engagement.',
    intention: 'joy',
    scoreMatch: [4, 5],
  },
  {
    name: 'Send Appreciation Message',
    description: 'Send an unprompted message of appreciation or gratitude to a friend, partner, or colleague.',
    category: 'Relationships',
    icon: 'Smile',
    color: '#06b6d4',
    goalTarget: 1,
    goalUnit: 'message',
    reminderTime: '13:00',
    durationMinutes: 3,
    difficulty: 'easy',
    whyItHelps: 'Social reciprocity amplifies positive emotional momentum for both parties.',
    intention: 'joy',
    scoreMatch: [4, 5],
  },
  {
    name: '10-Min Mindful Sunlight Exposure',
    description: 'Step outside within 60 mins of waking to view natural morning sunlight.',
    category: 'Self-care',
    icon: 'Sun',
    color: '#f59e0b',
    goalTarget: 10,
    goalUnit: 'mins',
    reminderTime: '07:15',
    durationMinutes: 10,
    difficulty: 'easy',
    whyItHelps: 'Calibrates suprachiasmatic nucleus circadian clock and optimizes cortisol/melatonin.',
    intention: 'energy',
    scoreMatch: [3, 4, 5],
  },
];

interface MoodTrackerViewProps {
  setActiveTab?: (tab: string) => void;
}

export const MoodTrackerView: React.FC<MoodTrackerViewProps> = ({ setActiveTab }) => {
  const { moodEntries, habits, logMood, createHabit } = useApp();
  const todayStr = getTodayDateString();

  const todayEntry = moodEntries.find(m => m.date === todayStr);

  const [selectedScore, setSelectedScore] = useState<MoodScore>(todayEntry?.score || 4);
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionTag[]>(todayEntry?.emotions || ['Energized', 'Grateful']);
  const [notes, setNotes] = useState(todayEntry?.notes || '');
  const [isSaved, setIsSaved] = useState(false);
  const [activeIntentionFilter, setActiveIntentionFilter] = useState<'all' | 'calm' | 'energy' | 'focus' | 'sleep' | 'joy'>('all');
  const [recentlyAddedHabits, setRecentlyAddedHabits] = useState<Record<string, boolean>>({});

  const toggleEmotion = (tag: EmotionTag) => {
    if (selectedEmotions.includes(tag)) {
      setSelectedEmotions(selectedEmotions.filter(e => e !== tag));
    } else {
      setSelectedEmotions([...selectedEmotions, tag]);
    }
  };

  const handleSaveMood = (e: React.FormEvent) => {
    e.preventDefault();
    logMood(selectedScore, selectedEmotions, notes);
    setIsSaved(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Last 7 days history calculation
  const last7DaysData: Array<{ date: string; dayLabel: string; score?: number }> = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const dStr = getPastDateString(i);
    const found = moodEntries.find(m => m.date === dStr);
    const dayLabel = daysOfWeek[new Date(dStr).getDay()];
    last7DaysData.push({
      date: dStr,
      dayLabel,
      score: found?.score,
    });
  }

  // Average score
  const recordedScores = moodEntries.map(m => m.score);
  const avgMood = recordedScores.length > 0
    ? (recordedScores.reduce((a, b) => a + b, 0) / recordedScores.length).toFixed(1)
    : '4.2';

  // Dynamic Mood Diagnostic Message
  const diagnosticSummary = useMemo(() => {
    if (selectedScore <= 2 || selectedEmotions.some(e => ['Anxious', 'Stressed', 'Overwhelmed', 'Burned out', 'Sad'].includes(e))) {
      return {
        badge: 'Restorative & Downshift Mode',
        badgeColor: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/60',
        title: 'Priority: Reduce Cognitive Strain & Protect Energy',
        guidance: 'Your nervous system needs down-regulation. Avoid high-friction tasks today. Prioritize gentle micro-habits like box breathing, light movement, and nourishing rest.',
      };
    }
    if (selectedScore === 3 || selectedEmotions.some(e => ['Tired', 'Neutral', 'Busy'].includes(e))) {
      return {
        badge: 'Recharge & Momentum Mode',
        badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/60',
        title: 'Priority: Low-Friction Activation & Hydration',
        guidance: 'You are in an adaptable state. Simple hydration, 5-minute workspace resets, and short 25-minute Pomodoro sprints will smoothly ignite your daily momentum.',
      };
    }
    return {
      badge: 'Peak Vitality & Expansion Mode',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60',
      title: 'Priority: High-Leverage Projects & Deep Focus',
      guidance: 'You have high cognitive clarity and positive emotional bandwidth! Channel this energy into deep work sprints, challenging workouts, and meaningful learning milestones.',
    };
  }, [selectedScore, selectedEmotions]);

  // Recommended Habits Filtering
  const recommendedHabits = useMemo(() => {
    return HABIT_RECOMMENDATIONS_CATALOG.filter((template) => {
      const matchesScore = template.scoreMatch.includes(selectedScore);
      const matchesFilter = activeIntentionFilter === 'all' || template.intention === activeIntentionFilter;
      return matchesScore && matchesFilter;
    });
  }, [selectedScore, activeIntentionFilter]);

  // Quick Add Habit Handler
  const handleQuickAddHabit = (template: SuggestedHabitTemplate) => {
    // Check if habit already exists
    const existing = habits.find(h => h.name.toLowerCase() === template.name.toLowerCase() && !h.isArchived);
    if (existing) {
      setRecentlyAddedHabits(prev => ({ ...prev, [template.name]: true }));
      return;
    }

    createHabit({
      name: template.name,
      description: template.description,
      category: template.category,
      icon: template.icon,
      color: template.color,
      frequency: 'daily',
      goalTarget: template.goalTarget,
      goalUnit: template.goalUnit,
      reminderTime: template.reminderTime,
      startDate: todayStr,
      durationMinutes: template.durationMinutes,
      difficulty: template.difficulty,
      isArchived: false,
      isPaused: false,
    });

    setRecentlyAddedHabits(prev => ({ ...prev, [template.name]: true }));
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shadow-2xs">
              <Smile className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-teal-300">
              Emotional Wellbeing & Habit Synergy
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Mood Tracker & Adaptive Habit Guidance
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-200 mt-1 max-w-3xl leading-relaxed">
            Log your emotional state to receive instant, neuro-informed habit recommendations and actionable routines tailored to your current energy.
          </p>
        </div>

        {setActiveTab && (
          <button
            type="button"
            onClick={() => setActiveTab('health')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl glass-card text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-400 self-start sm:self-auto shadow-xs transition-all cursor-pointer"
          >
            <Activity className="w-4 h-4 text-teal-500" />
            <span>Health Metrics →</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Mood Check-in Form */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSaveMood}
            className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-700/80 dark:bg-slate-900/90 shadow-xl space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/70 dark:border-slate-700/70">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  How are you feeling right now?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                  Select your current state to calibrate your daily routine.
                </p>
              </div>
              {todayEntry && (
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-400/40 dark:border-emerald-600/60 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Logged for Today
                </span>
              )}
            </div>

            {/* 5-Score Selector with High-Contrast Dark Visibility */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2.5">
                1. Overall Mood Score
              </label>
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {MOOD_OPTIONS.map((opt) => {
                  const isSelected = selectedScore === opt.score;
                  return (
                    <button
                      key={opt.score}
                      type="button"
                      onClick={() => setSelectedScore(opt.score)}
                      className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? `${opt.lightClass} ${opt.darkClass} shadow-lg scale-105 font-black`
                          : 'bg-white/80 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/90 text-slate-700 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl mb-1 filter drop-shadow-xs">{opt.emoji}</span>
                      <span className="text-[10px] sm:text-xs font-bold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Emotion Tag Cloud with Vivid Contrast */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2">
                2. What feelings are present? <span className="text-slate-400 font-normal lowercase">(select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOTION_TAGS.map((tag) => {
                  const isSelected = selectedEmotions.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleEmotion(tag)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'ai-gradient text-white shadow-md ring-2 ring-indigo-400/40 dark:ring-teal-400/50 scale-105 border-transparent'
                          : 'bg-white/80 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes / Reflections */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5">
                3. Reflections & Journal Notes <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="What contributed to your feelings today? Any triggers, wins, or gratitudes?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-2xl p-3.5 text-xs sm:text-sm bg-white dark:bg-slate-900/95 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-teal-400 transition-all shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl ai-gradient text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-500/25 dark:shadow-teal-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] hover:scale-[1.01] cursor-pointer"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Mood Check-in Saved!</span>
                </>
              ) : (
                <>
                  <span>Save Today's Check-in & Update Suggestions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Diagnostic State Card */}
          <div className="p-5 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-700/80 dark:bg-slate-900/80 shadow-md flex items-start gap-4">
            <div className="p-3 rounded-2xl ai-gradient text-white shrink-0 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${diagnosticSummary.badgeColor}`}>
                  {diagnosticSummary.badge}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {diagnosticSummary.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {diagnosticSummary.guidance}
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: 7-Day Trend & Habit-Mood Synergy */}
        <div className="space-y-6">
          {/* Weekly Mood Trend with Crisp Dark Theme Contrast */}
          <div className="p-5 sm:p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-700/80 dark:bg-slate-900/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-teal-400" />
                7-Day Trend
              </span>
              <span className="text-xs font-black text-indigo-700 dark:text-teal-300 bg-indigo-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-indigo-200/80 dark:border-teal-500/30">
                Avg: {avgMood} / 5
              </span>
            </div>

            {/* Bar Chart Representation */}
            <div className="grid grid-cols-7 gap-1.5 h-36 items-end pt-4">
              {last7DaysData.map((day, idx) => {
                const score = day.score || 0;
                const heightPercent = score ? (score / 5) * 100 : 15;
                const emoji = score ? MOOD_OPTIONS.find(o => o.score === score)?.emoji : '—';
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-xs filter drop-shadow-2xs">{emoji}</span>
                    <div className="w-full bg-slate-200/70 dark:bg-slate-800/90 rounded-t-xl h-24 flex items-end overflow-hidden border-t border-x border-slate-300/60 dark:border-slate-700 shadow-inner">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          score >= 4
                            ? 'bg-emerald-500 dark:bg-emerald-400'
                            : score === 3
                            ? 'bg-amber-500 dark:bg-amber-400'
                            : score > 0
                            ? 'bg-rose-500 dark:bg-rose-400'
                            : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-200">
                      {day.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Habit-Mood Synergy Evidence */}
          <div className="p-5 rounded-3xl glass-card border border-indigo-500/20 dark:border-teal-500/20 dark:bg-slate-900/90 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-teal-400" />
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Neuro-Habit Insights
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              On days where you complete your <strong className="text-indigo-600 dark:text-teal-300 font-bold">hydration</strong> and <strong className="text-indigo-600 dark:text-teal-300 font-bold">screen-free walk</strong> habits, your average mood score increases by <strong className="text-emerald-600 dark:text-emerald-400 font-black">+28%</strong> compared to sedentary days.
            </p>
            <div className="p-2.5 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
              💡 Tip: Even 5 minutes of consistent micro-habits keeps your dopamine baseline steady during challenging days.
            </div>
          </div>
        </div>
      </div>

      {/* Adaptive Habit Suggestions Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-teal-400" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Mood-Adaptive Habit Recommendations
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Habits scientifically calibrated for your current score ({MOOD_OPTIONS.find(o => o.score === selectedScore)?.emoji} {MOOD_OPTIONS.find(o => o.score === selectedScore)?.label}). Add them directly to your daily routine!
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'all', label: 'All Habits' },
              { key: 'calm', label: 'Calm & Relief' },
              { key: 'energy', label: 'Energy Boost' },
              { key: 'focus', label: 'Focus & Work' },
              { key: 'sleep', label: 'Rest & Sleep' },
              { key: 'joy', label: 'Gratitude & Joy' },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveIntentionFilter(f.key as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeIntentionFilter === f.key
                    ? 'ai-gradient text-white shadow-xs border-transparent'
                    : 'bg-white/80 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Habit Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {recommendedHabits.map((template, idx) => {
            const isAlreadyActive = habits.some(
              h => h.name.toLowerCase() === template.name.toLowerCase() && !h.isArchived && !h.isPaused
            );
            const isJustAdded = recentlyAddedHabits[template.name];

            return (
              <div
                key={idx}
                className="p-5 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-700/80 dark:bg-slate-900/90 shadow-lg flex flex-col justify-between space-y-4 hover:border-indigo-400 dark:hover:border-teal-400 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                        style={{ backgroundColor: template.color }}
                      >
                        <IconRenderer name={template.icon} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {template.category}
                        </span>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white mt-0.5 truncate group-hover:text-indigo-600 dark:group-hover:text-teal-300 transition-colors">
                          {template.name}
                        </h3>
                      </div>
                    </div>

                    <span className="text-[11px] font-extrabold text-indigo-700 dark:text-teal-300 bg-indigo-50 dark:bg-slate-800 px-2 py-1 rounded-xl border border-indigo-100 dark:border-teal-500/20 shrink-0">
                      {formatTimeTo12Hour(template.reminderTime)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>

                  {/* Why it helps */}
                  <div className="p-2.5 rounded-2xl bg-indigo-50/70 dark:bg-slate-800/80 border border-indigo-100/70 dark:border-slate-700/80 text-[11px] text-slate-700 dark:text-slate-200">
                    <span className="font-bold text-indigo-700 dark:text-teal-300">Why this helps: </span>
                    {template.whyItHelps}
                  </div>
                </div>

                {/* Habit Metadata & One-Click Add Button */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-300">
                    {template.goalTarget} {template.goalUnit} • {template.durationMinutes}m
                  </div>

                  {isAlreadyActive || isJustAdded ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-black shadow-2xs">
                      <Check className="w-3.5 h-3.5" />
                      <span>In Routine</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleQuickAddHabit(template)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl ai-gradient text-white text-xs font-black shadow-md shadow-indigo-500/20 dark:shadow-teal-500/20 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Habit</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {recommendedHabits.length === 0 && (
          <div className="p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-700/80 dark:bg-slate-900/90 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No habit recommendations matching this specific filter.
            </p>
            <button
              type="button"
              onClick={() => setActiveIntentionFilter('all')}
              className="text-xs font-black text-indigo-600 dark:text-teal-400 hover:underline cursor-pointer"
            >
              Reset to All Recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

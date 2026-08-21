import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Dumbbell, 
  Moon, 
  Apple, 
  Brain, 
  Target, 
  BookOpen, 
  Heart, 
  Users, 
  Coins, 
  TrendingUp,
  Clock,
  Sun,
  Bed,
  CheckCircle2
} from 'lucide-react';
import { HabitCategory } from '../types';
import { useAuth } from '../context/AuthContext';

const CATEGORIES: Array<{ name: HabitCategory; icon: React.FC<any>; desc: string }> = [
  { name: 'Fitness', icon: Dumbbell, desc: 'Movement & physical strength' },
  { name: 'Sleep', icon: Moon, desc: 'Deep recovery & sleep hygiene' },
  { name: 'Nutrition', icon: Apple, desc: 'Healthy diet & hydration' },
  { name: 'Mental wellness', icon: Brain, desc: 'Meditation & emotional balance' },
  { name: 'Productivity', icon: Target, desc: 'Deep focus & time management' },
  { name: 'Learning', icon: BookOpen, desc: 'Reading & skill acquisition' },
  { name: 'Self-care', icon: Heart, desc: 'Rest & personal recharging' },
  { name: 'Relationships', icon: Users, desc: 'Connection & quality time' },
  { name: 'Finances', icon: Coins, desc: 'Budgeting & intentional spending' },
  { name: 'Personal growth', icon: TrendingUp, desc: 'Mindset & daily reflection' },
];

const GOAL_OPTIONS = [
  'Build consistency',
  'Improve health',
  'Reduce stress',
  'Sleep better',
  'Become more productive',
  'Build discipline',
  'Improve mood',
  'Create a balanced lifestyle',
];

export const OnboardingModal: React.FC = () => {
  const { user, completeOnboarding } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [selectedCategories, setSelectedCategories] = useState<HabitCategory[]>([
    'Fitness',
    'Sleep',
    'Nutrition',
    'Mental wellness',
    'Productivity',
  ]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Build consistency',
    'Improve health',
    'Reduce stress',
  ]);
  const [reminderTime, setReminderTime] = useState<string>('08:00');
  const [wakeTime, setWakeTime] = useState<string>('07:00');
  const [sleepTime, setSleepTime] = useState<string>('23:00');

  if (user && user.isOnboarded) return null;

  const toggleCategory = (cat: HabitCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter(g => g !== goal));
      }
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleFinish = () => {
    completeOnboarding({
      selectedCategories,
      goals: selectedGoals,
      reminderTimePreference: reminderTime,
      wakeTime,
      sleepTime,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 shadow-2xl my-auto">
        {/* Progress Bar & Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl ai-gradient flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-500/20">
              ✓
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Step {step} of 3
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 ai-gradient'
                    : s < step
                    ? 'w-4 bg-indigo-400/50'
                    : 'w-4 bg-white/30 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Visual Icon Grid representation */}
            <div className="w-full max-w-xs mx-auto p-4 rounded-2xl glass-subcard border-indigo-500/20">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { check: false, color: 'bg-indigo-400/50' },
                  { check: true, color: 'ai-gradient' },
                  { check: true, color: 'ai-gradient' },
                  { check: true, color: 'bg-indigo-500/80' },
                  { check: false, color: 'bg-teal-400/40' },
                  { check: false, color: 'bg-indigo-500/50' },
                  { check: false, color: 'bg-violet-400/40' },
                  { check: false, color: 'bg-indigo-300/40' },
                  { check: true, color: 'ai-gradient' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`aspect-square rounded-xl ${item.color} flex items-center justify-center text-white shadow-xs transition-transform hover:scale-105`}
                  >
                    {item.check && <Check className="w-5 h-5 stroke-[3]" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-subcard text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Intelligent Wellness System</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Build better days, one habit at a time.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                To-Do-Habits harmonizes your daily habits, mood reflections, and health metrics into an AI-powered coach designed for long-term consistency.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => handleFinish()}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                Skip setup with smart defaults
              </button>

              <button
                onClick={() => setStep(2)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl ai-gradient text-white font-medium shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] cursor-pointer hover:scale-[1.02]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PERSONALIZATION */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                What areas would you like to improve?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select one or more categories to tailor your personalized habits and AI recommendations.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.name);
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => toggleCategory(cat.name)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-indigo-100 shadow-xs'
                        : 'glass-subcard border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isSelected
                          ? 'ai-gradient text-white shadow-xs'
                          : 'bg-white/40 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold truncate">{cat.name}</p>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 ml-1" />}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {cat.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Back
              </button>

              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl ai-gradient text-white font-medium shadow-lg shadow-indigo-500/25 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: GOALS & SCHEDULES */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                What would you like to achieve?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose your primary objectives and daily routine boundaries.
              </p>
            </div>

            {/* Goals Chips */}
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((g) => {
                const isSelected = selectedGoals.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGoal(g)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'ai-gradient text-white shadow-xs'
                        : 'glass-subcard hover:border-indigo-400 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            {/* Daily Routine Setup */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl glass-subcard">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Wake Time</span>
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-1.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl glass-subcard">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Daily Reminder</span>
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-1.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl glass-subcard">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Bed className="w-3.5 h-3.5 text-violet-500" />
                  <span>Sleep Time</span>
                </label>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-1.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Back
              </button>

              <button
                onClick={handleFinish}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl ai-gradient hover:scale-[1.02] active:scale-[0.98] text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Enter To-Do-Habits Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
  CheckCircle2,
  User,
  Flame,
  Compass
} from 'lucide-react';
import { HabitCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

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

const MOTIVATION_THEMES = [
  { label: 'Build Unshakable Consistency', icon: Flame, desc: 'Show up every day and never break the chain' },
  { label: 'Holistic Health & Energy', icon: Heart, desc: 'Balanced nutrition, movement, and vital sleep' },
  { label: 'Deep Focus & Productivity', icon: Target, desc: 'Eliminate distractions and hit core milestones' },
  { label: 'Mindfulness & Inner Peace', icon: Brain, desc: 'Daily grounding, reflection, and stress relief' },
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
  
  // Onboarding detailed states
  const [name, setName] = useState<string>(user?.name || '');
  const [selectedMotivation, setSelectedMotivation] = useState<string>(MOTIVATION_THEMES[0].label);
  const [selectedCategories, setSelectedCategories] = useState<HabitCategory[]>([
    'Fitness',
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

  // Only render if user is logged in but has NOT completed onboarding
  if (!user || user.isOnboarded) return null;

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
      name: name.trim() || user.name || 'Friend',
      selectedCategories,
      goals: selectedGoals,
      reminderTimePreference: reminderTime,
      wakeTime,
      sleepTime,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="relative w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 shadow-2xl my-auto border border-white/40 dark:border-white/10 animate-fadeIn">
        {/* Progress Bar & Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20 dark:border-white/5">
          <div className="flex items-center gap-3">
            <Logo size={28} showText={false} />
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Setup Step {step} of 3
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {step === 1 && 'Personalize Your Journey'}
                {step === 2 && 'Choose Focus Areas'}
                {step === 3 && 'Schedule & Core Goals'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 ai-gradient'
                    : s < step
                    ? 'w-5 bg-indigo-400/70 dark:bg-indigo-600'
                    : 'w-4 bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: WELCOME & IDENTITY */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-subcard text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Welcome to To-Do-Habits</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Let's set up your daily routine.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Personalize your name and primary wellness intention so your AI coach can provide tailored guidance.
              </p>
            </div>

            {/* Name Input */}
            <div className="p-4 rounded-2xl glass-subcard border border-white/30 dark:border-white/10 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                What should we call you?
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Core Motivation Theme */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                What is your primary focus right now?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MOTIVATION_THEMES.map((theme) => {
                  const isSelected = selectedMotivation === theme.label;
                  const Icon = theme.icon;
                  return (
                    <button
                      key={theme.label}
                      type="button"
                      onClick={() => setSelectedMotivation(theme.label)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-500 shadow-xs'
                          : 'glass-subcard border-white/30 dark:border-white/10 hover:border-indigo-400'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'ai-gradient text-white shadow-xs' : 'bg-white/40 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{theme.label}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{theme.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleFinish}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                Skip setup with default preferences
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl ai-gradient text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Continue to Focus Areas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: FOCUS CATEGORIES */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Select Habit Categories ({selectedCategories.length} selected)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose the areas you want to track. You can add or modify habits in any category anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.name);
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => toggleCategory(cat.name)}
                    className={`flex items-start gap-3 p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-500 text-indigo-950 dark:text-indigo-100 shadow-xs'
                        : 'glass-subcard border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isSelected
                          ? 'ai-gradient text-white shadow-xs'
                          : 'bg-white/40 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold truncate">{cat.name}</p>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-1" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {cat.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl ai-gradient text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Continue to Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: GOALS & SCHEDULES */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Daily Schedule & Core Goals
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define your ideal day structure to optimize daily reminders and streak tracking.
              </p>
            </div>

            {/* Goals Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Primary Aspirations
              </label>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((g) => {
                  const isSelected = selectedGoals.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGoal(g)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
            </div>

            {/* Daily Routine Setup */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl glass-subcard border border-white/20 dark:border-white/5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Wake Time</span>
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl glass-subcard border border-white/20 dark:border-white/5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Daily Reminder</span>
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl glass-subcard border border-white/20 dark:border-white/5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <Bed className="w-3.5 h-3.5 text-violet-500" />
                  <span>Sleep Time</span>
                </label>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Launch Dashboard Button */}
            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl ai-gradient hover:scale-[1.02] active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Complete Setup & Launch Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

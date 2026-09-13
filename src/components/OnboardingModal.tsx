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
  Bell, 
  Plus, 
  Trash2,
  Smile,
  ShieldCheck
} from 'lucide-react';
import { Habit, HabitCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { TimePicker12 } from './TimePicker12';
import { NotificationService } from '../services/notifications';
import { getTodayDateString } from '../services/storage';

interface OnboardingModalProps {
  onComplete?: () => void;
  onBackToSplash?: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

const CATEGORIES: Array<{ name: HabitCategory; icon: React.FC<any>; desc: string; defaultHabit: { name: string; icon: string; color: string; goalTarget: number; goalUnit: string } }> = [
  { 
    name: 'Fitness', 
    icon: Dumbbell, 
    desc: 'Movement & physical health', 
    defaultHabit: { name: 'Morning 20-Min Movement', icon: 'Dumbbell', color: 'emerald', goalTarget: 20, goalUnit: 'mins' } 
  },
  { 
    name: 'Sleep', 
    icon: Moon, 
    desc: 'Deep recovery & sleep rhythm', 
    defaultHabit: { name: 'Wind Down & Sleep on Schedule', icon: 'Moon', color: 'purple', goalTarget: 1, goalUnit: 'session' } 
  },
  { 
    name: 'Nutrition', 
    icon: Apple, 
    desc: 'Hydration & clean nourishment', 
    defaultHabit: { name: 'Drink 2L Fresh Water', icon: 'Droplets', color: 'cyan', goalTarget: 2000, goalUnit: 'ml' } 
  },
  { 
    name: 'Mental wellness', 
    icon: Brain, 
    desc: 'Meditation & emotional balance', 
    defaultHabit: { name: '10-Min Morning Mindfulness', icon: 'Brain', color: 'indigo', goalTarget: 10, goalUnit: 'mins' } 
  },
  { 
    name: 'Productivity', 
    icon: Target, 
    desc: 'Deep focus & priority execution', 
    defaultHabit: { name: 'Deep Focus Work Block', icon: 'Target', color: 'amber', goalTarget: 45, goalUnit: 'mins' } 
  },
  { 
    name: 'Learning', 
    icon: BookOpen, 
    desc: 'Reading & intellectual growth', 
    defaultHabit: { name: 'Read 15 Pages of a Book', icon: 'BookOpen', color: 'rose', goalTarget: 15, goalUnit: 'pages' } 
  },
  { 
    name: 'Self-care', 
    icon: Heart, 
    desc: 'Relaxation & evening decompression', 
    defaultHabit: { name: 'Evening Stretch & Unwind', icon: 'Heart', color: 'emerald', goalTarget: 15, goalUnit: 'mins' } 
  },
  { 
    name: 'Personal growth', 
    icon: TrendingUp, 
    desc: 'Daily reflection & wins journal', 
    defaultHabit: { name: 'Daily Reflection & Wins', icon: 'Sparkles', color: 'amber', goalTarget: 1, goalUnit: 'entry' } 
  },
];

const MOTIVATION_THEMES = [
  { label: 'Unshakable Daily Consistency', desc: 'Build steady habits that last a lifetime' },
  { label: 'Energy, Vitality & Health', desc: 'Hydrate, move, and sleep deeply' },
  { label: 'Deep Focus & Productivity', desc: 'Crush your core priorities without burnout' },
  { label: 'Mindful Peace & Stress Relief', desc: 'Daily grounding and emotional clarity' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, onBackToSplash }) => {
  const { user, completeOnboarding } = useAuth();
  const [step, setStep] = useState<number>(1);

  // Step 1: Profile Creation
  const [name, setName] = useState<string>(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_OPTIONS[0]);
  const [bio, setBio] = useState<string>('Committed to building positive daily routines.');
  const [selectedMotivation, setSelectedMotivation] = useState<string>(MOTIVATION_THEMES[0].label);

  // Step 2: Habit Categories & Starter Habits
  const [selectedCategories, setSelectedCategories] = useState<HabitCategory[]>([
    'Fitness',
    'Nutrition',
    'Mental wellness',
    'Productivity',
  ]);

  const [activeStarters, setActiveStarters] = useState<Array<{ name: string; category: HabitCategory; icon: string; color: string; goalTarget: number; goalUnit: string; reminderTime: string }>>([
    { name: 'Drink 2L Fresh Water', category: 'Nutrition', icon: 'Droplets', color: 'cyan', goalTarget: 2000, goalUnit: 'ml', reminderTime: '08:00' },
    { name: 'Morning 20-Min Movement', category: 'Fitness', icon: 'Dumbbell', color: 'emerald', goalTarget: 20, goalUnit: 'mins', reminderTime: '07:30' },
    { name: '10-Min Mindfulness Meditation', category: 'Mental wellness', icon: 'Brain', color: 'indigo', goalTarget: 10, goalUnit: 'mins', reminderTime: '08:30' },
    { name: 'Deep Focus Work Block', category: 'Productivity', icon: 'Target', color: 'amber', goalTarget: 45, goalUnit: 'mins', reminderTime: '10:00' },
  ]);

  const [customHabitName, setCustomHabitName] = useState('');

  // Step 3: Schedule & Notification Settings
  const [wakeTime, setWakeTime] = useState<string>('07:00');
  const [reminderTime, setReminderTime] = useState<string>('08:00');
  const [sleepTime, setSleepTime] = useState<string>('23:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [browserPermissionGranted, setBrowserPermissionGranted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle Category & sync starter habits
  const toggleCategory = (cat: HabitCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
      const catConfig = CATEGORIES.find(c => c.name === cat);
      if (catConfig && !activeStarters.some(s => s.category === cat)) {
        setActiveStarters([
          ...activeStarters,
          {
            name: catConfig.defaultHabit.name,
            category: cat,
            icon: catConfig.defaultHabit.icon,
            color: catConfig.defaultHabit.color,
            goalTarget: catConfig.defaultHabit.goalTarget,
            goalUnit: catConfig.defaultHabit.goalUnit,
            reminderTime: '09:00',
          },
        ]);
      }
    }
  };

  const toggleStarter = (index: number) => {
    if (activeStarters.length <= 1) return;
    setActiveStarters(activeStarters.filter((_, idx) => idx !== index));
  };

  const handleAddCustomStarter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHabitName.trim()) return;
    setActiveStarters([
      ...activeStarters,
      {
        name: customHabitName.trim(),
        category: selectedCategories[0] || 'Fitness',
        icon: 'Sparkles',
        color: 'indigo',
        goalTarget: 1,
        goalUnit: 'session',
        reminderTime: reminderTime,
      },
    ]);
    setCustomHabitName('');
  };

  const handleToggleNotifications = async () => {
    const nextState = !notificationsEnabled;
    setNotificationsEnabled(nextState);
    if (nextState) {
      const perm = await NotificationService.requestPermission();
      setBrowserPermissionGranted(perm === 'granted');
      NotificationService.playChime('reminder');
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const formattedHabits: Habit[] = activeStarters.map((starter, idx) => ({
        id: `habit-init-${idx}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        userId: user?.id || 'temp-user',
        name: starter.name,
        category: starter.category,
        icon: starter.icon,
        color: starter.color,
        frequency: 'daily',
        goalTarget: starter.goalTarget,
        goalUnit: starter.goalUnit,
        reminderTime: starter.reminderTime || reminderTime,
        startDate: getTodayDateString(),
        difficulty: 'medium',
        isArchived: false,
        isPaused: false,
        streak: 0,
        bestStreak: 0,
        totalCompletions: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      await completeOnboarding({
        name: name.trim() || 'Habit Builder',
        avatarUrl: selectedAvatar,
        bio: bio.trim(),
        motivation: selectedMotivation,
        selectedCategories,
        goals: [selectedMotivation, 'Build consistency', 'Improve daily rhythm'],
        reminderTimePreference: reminderTime,
        wakeTime,
        sleepTime,
        customStarters: formattedHabits,
      });

      NotificationService.playChime('streak');
      if (onComplete) onComplete();
    } catch (e) {
      console.error('Error completing onboarding:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 dark:border-white/10 animate-fadeIn relative overflow-hidden">
      {/* Background Decorative Ambient Spheres */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-teal-400/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header & Step Indicator */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Logo size={32} showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Step {step} of 4
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-600">•</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {step === 1 && 'Onboarding 1 • Welcome & Purpose'}
                {step === 2 && 'Onboarding 2 • Focus Areas & Habits'}
                {step === 3 && 'Onboarding 3 • Daily Rhythm & Schedule'}
                {step === 4 && 'Create Profile • Launch App'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {step === 1 && '100% offline-first atomic routines tailored to your goals'}
              {step === 2 && 'Choose your focus domains and starter habits'}
              {step === 3 && 'Set wake, sleep, and 12-hour AM/PM reminder alerts'}
              {step === 4 && 'Personalize your profile and start tracking immediately'}
            </p>
          </div>
        </div>

        {/* Step Progress Pills (1 to 4) */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-7 ai-gradient'
                  : s < step
                  ? 'w-4 bg-emerald-500'
                  : 'w-3 bg-slate-300 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ================= STEP 1: ONBOARDING 1 - WELCOME & PURPOSE ================= */}
      {step === 1 && (
        <div className="space-y-5 animate-fadeIn">
          {/* Welcome Vision Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-teal-50/30 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-800/40 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl ai-gradient text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Welcome to To-Do-Habits
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              A private, persistent habit operating system engineered to turn aspirations into daily instincts. Everything stays securely on your device with offline-first local persistence.
            </p>

            {/* 3 Core Architecture Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">100% Offline</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Stored directly in your browser's IndexedDB. No logins or cloud delays required.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                  <Flame className="w-4 h-4 shrink-0 fill-amber-500 text-amber-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Accurate Streaks</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Missed days are cleanly recorded without deleting your lifetime progress.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                  <Smile className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Multi-Profile</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Add separate profiles for work, personal, or family on the same device.
                </p>
              </div>
            </div>
          </div>

          {/* Primary Motivation Intention */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Select Your Primary Intention
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MOTIVATION_THEMES.map((theme) => {
                const isSelected = selectedMotivation === theme.label;
                return (
                  <button
                    key={theme.label}
                    type="button"
                    onClick={() => setSelectedMotivation(theme.label)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-400/30 shadow-xs'
                        : 'bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:border-indigo-400 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'ai-gradient text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{theme.label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{theme.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation to Onboarding 2 */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              Next: Focus Areas & Starter Habits
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl ai-gradient text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Next: Choose Focus Areas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: ONBOARDING 2 - CATEGORIES & HABIT SELECTION ================= */}
      {step === 2 && (
        <div className="space-y-5 animate-fadeIn">
          {/* Category Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Select Habit Focus Categories ({selectedCategories.length} selected)
              </label>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Tap to toggle</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.name);
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => toggleCategory(cat.name)}
                    className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-400/30 text-indigo-950 dark:text-indigo-100 shadow-xs'
                        : 'bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'ai-gradient text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <span className="text-xs font-bold truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Starter Habits to Track */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Starter Habits Ready to Monitor ({activeStarters.length})
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Active from day 1</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto p-1">
              {activeStarters.map((starter, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{starter.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {starter.category} • Target: {starter.goalTarget} {starter.goalUnit}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleStarter(idx)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Remove starter habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Habit In-Line */}
            <form onSubmit={handleAddCustomStarter} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add custom habit (e.g. 15-min Evening Walk)"
                value={customHabitName}
                onChange={(e) => setCustomHabitName(e.target.value)}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl ai-gradient text-white text-xs font-bold shadow-xs inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Navigation Bar */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl ai-gradient text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Next: Set Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: ONBOARDING 3 - SCHEDULE & NOTIFICATIONS ================= */}
      {step === 3 && (
        <div className="space-y-5 animate-fadeIn">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Daily Rhythm & Habit Reminder Timing (12-Hour AM/PM)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Anchor your daily habits around wake, reminder, and sleep windows.
            </p>
          </div>

          {/* 12-Hour Time Pickers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TimePicker12
              label="Wake Up Time"
              value={wakeTime}
              onChange={setWakeTime}
            />

            <TimePicker12
              label="Daily Habit Reminder"
              value={reminderTime}
              onChange={setReminderTime}
            />

            <TimePicker12
              label="Sleep / Wind-Down"
              value={sleepTime}
              onChange={setSleepTime}
            />
          </div>

          {/* Notification Alert Toggle */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Real-Time Habit Notifications
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Receive gentle chimes and browser alerts on schedule so you never miss a routine.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 left-0.5 ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Rhythm Summary */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 flex items-center gap-3 text-indigo-900 dark:text-indigo-200 text-xs">
            <Clock className="w-5 h-5 shrink-0 text-indigo-500" />
            <span>
              Your daily routine will trigger reminders at <strong>{reminderTime}</strong> with sleep wind-down at <strong>{sleepTime}</strong>.
            </span>
          </div>

          {/* Navigation Bar */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={() => setStep(4)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl ai-gradient text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Next: Create Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: CREATE PROFILE -> START APP ================= */}
      {step === 4 && (
        <div className="space-y-5 animate-fadeIn">
          {/* Avatar Picker & Live Profile Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 space-y-4">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Choose Profile Avatar
            </label>
            
            <div className="flex items-center gap-4">
              {/* Selected Avatar Preview */}
              <div className="relative">
                <img
                  src={selectedAvatar}
                  alt="Profile Avatar"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              {/* Avatar Choices Grid */}
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-10 h-10 rounded-xl overflow-hidden transition-all cursor-pointer ${
                      selectedAvatar === avatar
                        ? 'ring-2 ring-indigo-600 scale-105 shadow-sm'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar option ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Full Name & Bio Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Your Profile Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Daily Focus / Bio
              </label>
              <input
                type="text"
                placeholder="e.g. Health, morning rhythm & focus"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Setup Summary Card */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-500" />
            <span>
              Profile ready for <strong>{name.trim() || 'Habit Builder'}</strong> with <strong>{activeStarters.length} starter habits</strong> saved permanently to local storage.
            </span>
          </div>

          {/* Navigation Bar */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              ← Back
            </button>

            {/* The Start App Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinish}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl ai-gradient text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Initializing...' : 'Start App'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

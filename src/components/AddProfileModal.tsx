import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  Dumbbell, 
  Moon, 
  Apple, 
  Brain, 
  Target, 
  BookOpen, 
  Heart, 
  TrendingUp, 
  X,
  User,
  Flame,
  Clock,
  Plus,
  Trash2,
  BellRing
} from 'lucide-react';
import { HabitCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { TimePicker12 } from './TimePicker12';
import { NotificationService } from '../services/notifications';

interface AddProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated?: (profileName: string) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

const STARTER_HABITS_PRESETS: Array<{
  name: string;
  category: HabitCategory;
  icon: string;
  color: string;
  goalTarget: number;
  goalUnit: string;
  reminderTime: string;
}> = [
  { name: 'Drink 2L Fresh Water', category: 'Nutrition', icon: 'droplet', color: '#06b6d4', goalTarget: 2000, goalUnit: 'ml', reminderTime: '08:00' },
  { name: 'Morning 20-Min Workout', category: 'Fitness', icon: 'dumbbell', color: '#10b981', goalTarget: 20, goalUnit: 'mins', reminderTime: '07:30' },
  { name: '10-Min Mindful Meditation', category: 'Mental wellness', icon: 'brain', color: '#8b5cf6', goalTarget: 10, goalUnit: 'mins', reminderTime: '08:30' },
  { name: 'Deep Focus Work Block', category: 'Productivity', icon: 'target', color: '#f59e0b', goalTarget: 45, goalUnit: 'mins', reminderTime: '10:00' },
  { name: 'Read 15 Pages of a Book', category: 'Learning', icon: 'book', color: '#ec4899', goalTarget: 15, goalUnit: 'pages', reminderTime: '21:00' },
  { name: 'Wind Down & Sleep On Time', category: 'Sleep', icon: 'moon', color: '#6366f1', goalTarget: 1, goalUnit: 'session', reminderTime: '22:30' },
];

export const AddProfileModal: React.FC<AddProfileModalProps> = ({ isOpen, onClose, onProfileCreated }) => {
  const { createProfile } = useAuth();
  const [step, setStep] = useState<number>(1);
  
  // Step 1: Profile Info
  const [name, setName] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_PRESETS[0]);
  const [bio, setBio] = useState<string>('Starting daily habits tracking fresh from day 1.');
  const [motivation, setMotivation] = useState<string>('Daily consistency & personal growth');

  // Step 2: Selected Starter Habits (all start with 0 streak & 0 completions)
  const [selectedHabits, setSelectedHabits] = useState(STARTER_HABITS_PRESETS.slice(0, 3));
  const [customHabitName, setCustomHabitName] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<HabitCategory>('Fitness');

  // Step 3: Timings & Reminders
  const [wakeTime, setWakeTime] = useState<string>('07:00');
  const [reminderTime, setReminderTime] = useState<string>('08:00');
  const [sleepTime, setSleepTime] = useState<string>('23:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleToggleHabit = (preset: typeof STARTER_HABITS_PRESETS[0]) => {
    const exists = selectedHabits.some(h => h.name === preset.name);
    if (exists) {
      if (selectedHabits.length > 1) {
        setSelectedHabits(selectedHabits.filter(h => h.name !== preset.name));
      }
    } else {
      setSelectedHabits([...selectedHabits, preset]);
    }
  };

  const handleAddCustomHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHabitName.trim()) return;
    const newHabit = {
      name: customHabitName.trim(),
      category: customCategory,
      icon: 'star',
      color: '#6366f1',
      goalTarget: 1,
      goalUnit: 'times',
      reminderTime: '08:00',
    };
    setSelectedHabits([...selectedHabits, newHabit]);
    setCustomHabitName('');
  };

  const handleRemoveSelectedHabit = (index: number) => {
    if (selectedHabits.length <= 1) return;
    setSelectedHabits(selectedHabits.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await createProfile({
        name: name.trim(),
        avatarUrl: selectedAvatar,
        bio: bio.trim(),
        motivation,
        wakeTime,
        sleepTime,
        reminderTimePreference: reminderTime,
        starterHabits: selectedHabits,
      });

      NotificationService.triggerNotification(
        `Welcome ${name.trim()}!`,
        `Your daily tracking has started fresh from 0. On-time routine notifications are active!`
      );

      if (onProfileCreated) onProfileCreated(name.trim());
      onClose();
      // Reset form
      setName('');
      setStep(1);
    } catch (err) {
      console.error('Error creating profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50 dark:border-white/10 max-h-[90vh] flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/40 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl ai-gradient flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Profile</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Step {step} of 3 — Starts Fresh From 0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-200/60 dark:bg-slate-700/60 h-1.5 rounded-full my-4 overflow-hidden">
          <div 
            className="h-full ai-gradient transition-all duration-300 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step 1: Personal Details & Avatar */}
        {step === 1 && (
          <div className="space-y-4 py-2 flex-1 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Profile Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Deep, Sarah, Alex..."
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Choose Profile Avatar
              </label>
              <div className="flex items-center gap-3 overflow-x-auto py-1">
                {AVATAR_PRESETS.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`relative w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedAvatar === avatar
                        ? 'border-indigo-500 ring-2 ring-indigo-400/40 scale-105 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                    {selectedAvatar === avatar && (
                      <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Personal Intention / Bio
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Focused on daily wellness and fitness..."
                className="w-full px-4 py-2.5 rounded-xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/30 flex items-start gap-2.5 text-xs text-indigo-800 dark:text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Independent Profile:</span> This profile will have its own daily tracking starting from 0, separate habits, streaks, and timed notifications.
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Choose Starter Habits (Starts from 0) */}
        {step === 2 && (
          <div className="space-y-4 py-2 flex-1 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Choose Anchor Habits</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">All routines start fresh with 0 streak</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                0 Streak Starter
              </span>
            </div>

            {/* Starter Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {STARTER_HABITS_PRESETS.map((preset) => {
                const isSelected = selectedHabits.some(h => h.name === preset.name);
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleToggleHabit(preset)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-100 font-semibold shadow-xs'
                        : 'border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span className="truncate pr-2">{preset.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Add Custom Habit quick row */}
            <form onSubmit={handleAddCustomHabit} className="flex gap-2 pt-2">
              <input
                type="text"
                value={customHabitName}
                onChange={(e) => setCustomHabitName(e.target.value)}
                placeholder="Or add custom habit..."
                className="flex-1 px-3 py-2 rounded-xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl ai-gradient text-white text-xs font-semibold flex items-center gap-1 shadow-xs hover:scale-105 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* Selected List Summary */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Selected for this profile ({selectedHabits.length}):
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-24 overflow-y-auto">
                {selectedHabits.map((habit, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 border border-white/60 dark:border-white/10 shadow-2xs"
                  >
                    <span>{habit.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedHabit(index)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Timings & 12-Hour AM/PM Schedule */}
        {step === 3 && (
          <div className="space-y-4 py-2 flex-1 animate-fadeIn">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Schedule & Reminders</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Set anchor times with AM / PM formatting</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl glass-subcard border border-white/50 dark:border-white/10">
                <TimePicker12
                  value24={wakeTime}
                  onChange24={setWakeTime}
                  label="Morning Wake-Up Time"
                />
              </div>

              <div className="p-3 rounded-2xl glass-subcard border border-white/50 dark:border-white/10">
                <TimePicker12
                  value24={reminderTime}
                  onChange24={setReminderTime}
                  label="Primary Habit Reminder Time"
                />
              </div>

              <div className="p-3 rounded-2xl glass-subcard border border-white/50 dark:border-white/10">
                <TimePicker12
                  value24={sleepTime}
                  onChange24={setSleepTime}
                  label="Evening Wind-Down & Bedtime"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/30 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200">
              <BellRing className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold">Ready to start:</span> Tracking starts immediately at 0 for {name || 'this profile'}.
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="pt-4 border-t border-white/40 dark:border-white/10 flex items-center justify-between gap-3 mt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              disabled={step === 1 && !name.trim()}
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl ai-gradient text-white text-xs font-bold shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer"
            >
              Next Step
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || !name.trim()}
              onClick={handleCreate}
              className="px-6 py-2.5 rounded-xl ai-gradient text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create & Start Tracking (0)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

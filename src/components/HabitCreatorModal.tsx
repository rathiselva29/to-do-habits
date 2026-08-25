import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Check, 
  Clock, 
  Calendar, 
  Target, 
  Layers, 
  Palette,
  Lightbulb,
  ArrowRight,
  Flame,
  Droplets,
  Footprints,
  Moon,
  Brain,
  Heart,
  Sun,
  Smile,
  Activity,
  Dumbbell,
  BookOpen
} from 'lucide-react';
import { Habit, HabitCategory, HabitDifficulty, HabitFrequency } from '../types';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';
import { IconRenderer } from './IconRenderer';
import { TimePicker12 } from './TimePicker12';

interface HabitCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHabit?: Habit | null;
}

const CATEGORIES: HabitCategory[] = [
  'Fitness',
  'Nutrition',
  'Mental wellness',
  'Sleep',
  'Productivity',
  'Learning',
  'Self-care',
  'Relationships',
  'Finances',
  'Personal growth',
  'Other',
];

const AVAILABLE_ICONS = [
  'Droplets',
  'Footprints',
  'Moon',
  'Brain',
  'Heart',
  'Target',
  'Flame',
  'Sun',
  'Smile',
  'Sparkles',
  'Coffee',
  'Activity',
  'Apple',
  'Dumbbell',
  'BookOpen',
  'Zap',
];

const COLOR_OPTIONS = [
  { name: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-500' },
  { name: 'blue', bg: 'bg-blue-500', text: 'text-blue-500' },
  { name: 'purple', bg: 'bg-purple-500', text: 'text-purple-500' },
  { name: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-500' },
  { name: 'rose', bg: 'bg-rose-500', text: 'text-rose-500' },
  { name: 'amber', bg: 'bg-amber-500', text: 'text-amber-500' },
  { name: 'cyan', bg: 'bg-cyan-500', text: 'text-cyan-500' },
];

export const HabitCreatorModal: React.FC<HabitCreatorModalProps> = ({
  isOpen,
  onClose,
  initialHabit,
}) => {
  const { createHabit, updateHabit } = useApp();

  const [name, setName] = useState(initialHabit?.name || '');
  const [description, setDescription] = useState(initialHabit?.description || '');
  const [category, setCategory] = useState<HabitCategory>(initialHabit?.category || 'Mental wellness');
  const [icon, setIcon] = useState(initialHabit?.icon || 'Brain');
  const [color, setColor] = useState(initialHabit?.color || 'emerald');
  const [frequency, setFrequency] = useState<HabitFrequency>(initialHabit?.frequency || 'daily');
  const [goalTarget, setGoalTarget] = useState<number>(initialHabit?.goalTarget || 1);
  const [goalUnit, setGoalUnit] = useState(initialHabit?.goalUnit || 'session');
  const [reminderTime, setReminderTime] = useState(initialHabit?.reminderTime || '08:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(initialHabit?.durationMinutes || 10);
  const [difficulty, setDifficulty] = useState<HabitDifficulty>(initialHabit?.difficulty || 'easy');

  // AI Suggestions
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleGenerateAiSuggestions = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await ApiService.getHabitSuggestions(category, `Enhance ${category} habits with scientifically proven consistency.`);
      if (res.suggestions && res.suggestions.length > 0) {
        setAiSuggestions(res.suggestions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const applySuggestion = (sug: any) => {
    setName(sug.name);
    setDescription(sug.description);
    if (sug.category) setCategory(sug.category);
    if (sug.icon) setIcon(sug.icon);
    if (sug.color) setColor(sug.color);
    if (sug.goalTarget) setGoalTarget(sug.goalTarget);
    if (sug.goalUnit) setGoalUnit(sug.goalUnit);
    if (sug.difficulty) setDifficulty(sug.difficulty);
    setAiSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (initialHabit) {
      updateHabit(initialHabit.id, {
        name: name.trim(),
        description: description.trim(),
        category,
        icon,
        color,
        frequency,
        goalTarget,
        goalUnit,
        reminderTime,
        durationMinutes,
        difficulty,
      });
    } else {
      createHabit({
        name: name.trim(),
        description: description.trim(),
        category,
        icon,
        color,
        frequency,
        goalTarget,
        goalUnit,
        reminderTime,
        startDate: new Date().toISOString().split('T')[0],
        durationMinutes,
        difficulty,
        isArchived: false,
        isPaused: false,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl glass-card rounded-3xl p-6 sm:p-8 shadow-2xl my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 glass-subcard transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl ai-gradient text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {initialHabit ? 'Edit Habit' : 'Create New Habit'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define your anchor routine, cadence, and AI personalization preferences.
          </p>
        </div>

        {/* AI Suggestions Trigger */}
        {!initialHabit && (
          <div className="mb-5 p-3.5 rounded-2xl glass-subcard border-indigo-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  Need inspiration for {category}?
                </span>
              </div>
              <button
                type="button"
                onClick={handleGenerateAiSuggestions}
                disabled={isGeneratingAi}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl ai-gradient text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isGeneratingAi ? 'Thinking...' : 'AI Suggestions'}</span>
              </button>
            </div>

            {aiSuggestions.length > 0 && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto animate-fadeIn">
                {aiSuggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    onClick={() => applySuggestion(sug)}
                    className="p-2.5 rounded-xl glass-subcard hover:border-indigo-400 cursor-pointer flex items-center justify-between gap-2 transition-all hover:scale-[1.01]"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{sug.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{sug.description}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 shrink-0 flex items-center gap-0.5">
                      Apply <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 10-Minute Morning Sunlight Walk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Why It Matters
            </label>
            <input
              type="text"
              placeholder="e.g. Sets circadian clock, boosts dopamine and morning alertness"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HabitCategory)}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="daily" className="bg-slate-900 text-white">Every Day</option>
                <option value="weekdays" className="bg-slate-900 text-white">Weekdays Only (Mon-Fri)</option>
                <option value="weekly" className="bg-slate-900 text-white">Weekly Target</option>
              </select>
            </div>
          </div>

          {/* Goal Target & Reminder Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Amount
                </label>
                <input
                  type="number"
                  min="1"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(Number(e.target.value))}
                  className="w-full glass-input rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  placeholder="mins, glasses"
                  value={goalUnit}
                  onChange={(e) => setGoalUnit(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <TimePicker12
                label="Daily Reminder (12-Hour AM/PM)"
                value={reminderTime}
                onChange={setReminderTime}
              />
            </div>
          </div>

          {/* Icon & Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Visual Icon & Accent
            </label>
            
            {/* Color Swatches */}
            <div className="flex items-center gap-2 mb-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  className={`w-6 h-6 rounded-full ${c.bg} flex items-center justify-center text-white transition-transform cursor-pointer ${
                    color === c.name ? 'ring-2 ring-offset-2 ring-indigo-600 dark:ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {color === c.name && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              ))}
            </div>

            {/* Icon Grid */}
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1.5 glass-subcard rounded-xl">
              {AVAILABLE_ICONS.map((icName) => {
                const isSelected = icon === icName;
                return (
                  <button
                    key={icName}
                    type="button"
                    onClick={() => setIcon(icName)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'ai-gradient text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-700'
                    }`}
                  >
                    <IconRenderer name={icName} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/50 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl ai-gradient hover:scale-[1.02] active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              {initialHabit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

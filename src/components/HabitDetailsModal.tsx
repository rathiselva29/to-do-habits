import React from 'react';
import { 
  X, 
  Flame, 
  Sparkles, 
  Calendar, 
  Clock, 
  Check, 
  TrendingUp, 
  Award, 
  Target, 
  BarChart2, 
  Edit3, 
  PauseCircle, 
  Archive, 
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Habit, HabitCompletion } from '../types';
import { useApp } from '../context/AppContext';
import { IconRenderer } from './IconRenderer';
import { getPastDateString, getTodayDateString } from '../services/storage';
import { formatTimeTo12Hour } from '../utils/timeFormat';

interface HabitDetailsModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (habit: Habit) => void;
}

export const HabitDetailsModal: React.FC<HabitDetailsModalProps> = ({
  habit,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { completions, deleteHabit, toggleHabitPause, toggleHabitArchive } = useApp();

  if (!isOpen || !habit) return null;

  const todayStr = getTodayDateString();
  const habitCompletions = completions.filter(c => c.habitId === habit.id);
  const completionDates = new Set(habitCompletions.map(c => c.date));

  // Generate 70 days grid (10 weeks of 7 days)
  const heatmapDays: Array<{ date: string; isCompleted: boolean; isToday: boolean }> = [];
  for (let i = 69; i >= 0; i--) {
    const dStr = getPastDateString(i);
    heatmapDays.push({
      date: dStr,
      isCompleted: completionDates.has(dStr),
      isToday: dStr === todayStr,
    });
  }

  // Calculate stats
  const totalDaysTracked = Math.max(1, 30);
  const completionsLast30Days = heatmapDays.slice(-30).filter(d => d.isCompleted).length;
  const completionRate30 = Math.round((completionsLast30Days / 30) * 100);

  // Weekly breakdown (last 7 days)
  const last7Days = heatmapDays.slice(-7);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 shadow-2xl my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 glass-subcard transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Habit Icon & Title */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3.5 rounded-2xl ai-gradient text-white shadow-lg shrink-0">
            <IconRenderer name={habit.icon} className="w-6 h-6" />
          </div>
          <div className="min-w-0 pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                {habit.name}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full glass-subcard text-slate-600 dark:text-slate-300">
                {habit.category}
              </span>
            </div>
            {habit.description && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {habit.description}
              </p>
            )}
          </div>
        </div>

        {/* Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl glass-subcard">
            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold mb-1">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>Current Streak</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {habit.streak} <span className="text-xs font-medium text-slate-400">days</span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl glass-subcard">
            <div className="flex items-center gap-1.5 text-xs text-indigo-500 dark:text-indigo-400 font-semibold mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Best Streak</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {habit.bestStreak} <span className="text-xs font-medium text-slate-400">days</span>
            </p>
          </div>

          <div className="p-3.5 rounded-2xl glass-subcard">
            <div className="flex items-center gap-1.5 text-xs text-teal-500 font-semibold mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>30-Day Rate</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {completionRate30}%
            </p>
          </div>

          <div className="p-3.5 rounded-2xl glass-subcard">
            <div className="flex items-center gap-1.5 text-xs text-violet-500 font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Total Done</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {habit.totalCompletions}
            </p>
          </div>
        </div>

        {/* Contribution Heatmap */}
        <div className="p-4 rounded-2xl glass-subcard mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Consistency Heatmap (Last 70 Days)
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-white/40 dark:bg-slate-700" />
                <span>Missed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm ai-gradient" />
                <span>Completed</span>
              </div>
            </div>
          </div>

          {/* Grid of rounded contribution tiles */}
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-1">
            {heatmapDays.map((d, idx) => (
              <div
                key={idx}
                title={`${d.date}: ${d.isCompleted ? 'Completed' : 'Not completed'}`}
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center text-[10px] transition-transform hover:scale-125 cursor-pointer ${
                  d.isCompleted
                    ? 'ai-gradient text-white shadow-xs'
                    : 'bg-white/40 dark:bg-slate-800'
                } ${d.isToday ? 'ring-2 ring-indigo-400 ring-offset-1 dark:ring-offset-slate-900' : ''}`}
              >
                {d.isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Day-by-Day Strip */}
        <div className="p-4 rounded-2xl glass-subcard mb-6">
          <span className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Last 7 Days
          </span>
          <div className="grid grid-cols-7 gap-2">
            {last7Days.map((item, idx) => {
              const dayName = daysOfWeek[new Date(item.date).getDay()];
              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-center border transition-all ${
                    item.isCompleted
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500/40 text-indigo-900 dark:text-indigo-200 font-bold'
                      : 'glass-subcard border-white/40 dark:border-white/10 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] uppercase font-semibold mb-1">{dayName}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      item.isCompleted
                        ? 'ai-gradient text-white shadow-xs'
                        : 'bg-white/30 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {item.isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="text-[9px]">•</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Habit Insight */}
        <div className="p-4 rounded-2xl glass-subcard border-indigo-500/30 mb-6">
          <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-900 dark:text-white">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>AI Habit Optimization</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {habit.streak >= 5
              ? `You have locked in strong neurological momentum for "${habit.name}". Consider scaling the target slightly or pairing an adjacent micro-habit right afterwards!`
              : `To strengthen consistency for "${habit.name}", place an obvious visual cue near where you spend your time around ${formatTimeTo12Hour(habit.reminderTime || '08:00')}.`}
          </p>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between pt-2 border-t border-white/50 dark:border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toggleHabitPause(habit.id);
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl glass-subcard hover:border-indigo-400 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>{habit.isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={() => {
                toggleHabitArchive(habit.id);
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl glass-subcard hover:border-indigo-400 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{habit.isArchived ? 'Unarchive' : 'Archive'}</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${habit.name}"?`)) {
                  deleteHabit(habit.id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-xl glass-subcard hover:border-rose-400 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <button
            onClick={() => {
              onEdit(habit);
            }}
            className="px-4 py-2 rounded-xl ai-gradient hover:scale-[1.02] active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Habit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

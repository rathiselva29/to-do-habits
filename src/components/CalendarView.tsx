import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Smile, 
  Moon, 
  Droplets, 
  Activity, 
  Flame,
  Check,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  CheckSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayDateString } from '../services/storage';
import { Habit } from '../types';

interface CalendarViewProps {
  setActiveTab?: (tab: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ setActiveTab }) => {
  const { habits, completions, moodEntries, healthMetrics, toggleHabitCompletion } = useApp();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayDateString());
  const [habitFilter, setHabitFilter] = useState<'all' | 'completed' | 'uncompleted'>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month & total days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayStr = getTodayDateString();

  // Helper to determine if a habit was scheduled/due on a given date
  const isHabitDueOnDate = (h: Habit, dateStr: string): boolean => {
    if (h.isArchived) return false;
    if (h.createdAt && dateStr < h.createdAt.slice(0, 10)) {
      return false;
    }
    if (!h.frequency || h.frequency === 'daily') return true;
    const dayOfWeek = new Date(dateStr + 'T12:00:00').getDay();
    if (h.frequency === 'weekdays') {
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
    if (h.frequency === 'custom' && Array.isArray(h.customDays) && h.customDays.length > 0) {
      return h.customDays.includes(dayOfWeek);
    }
    return true;
  };

  // Completions set for quick lookup
  const completionsByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    completions.forEach((c) => {
      const list = map.get(c.date) || [];
      if (!list.includes(c.habitId)) {
        list.push(c.habitId);
      }
      map.set(c.date, list);
    });
    return map;
  }, [completions]);

  // Selected date details
  const selectedCompletions = useMemo(() => {
    return completionsByDate.get(selectedDateStr) || [];
  }, [completionsByDate, selectedDateStr]);

  const selectedMood = useMemo(() => {
    return moodEntries.find(m => m.date === selectedDateStr);
  }, [moodEntries, selectedDateStr]);

  const selectedHealth = useMemo(() => {
    return healthMetrics.find(m => m.date === selectedDateStr);
  }, [healthMetrics, selectedDateStr]);

  // Habits relevant to the selected date (due on that date OR completed on that date)
  const habitsForSelectedDate = useMemo(() => {
    return habits.filter(h => {
      if (h.isArchived) {
        return selectedCompletions.includes(h.id);
      }
      return isHabitDueOnDate(h, selectedDateStr) || selectedCompletions.includes(h.id);
    });
  }, [habits, selectedDateStr, selectedCompletions]);

  const completedHabitsCount = habitsForSelectedDate.filter(h => selectedCompletions.includes(h.id)).length;
  const totalHabitsCount = habitsForSelectedDate.length;
  const missedOrPendingCount = Math.max(0, totalHabitsCount - completedHabitsCount);
  const completionPercentage = totalHabitsCount > 0 ? Math.round((completedHabitsCount / totalHabitsCount) * 100) : 0;

  const isPastDate = selectedDateStr < todayStr;
  const isSelectedToday = selectedDateStr === todayStr;
  const isFutureDate = selectedDateStr > todayStr;

  // Filtered habits according to tab filter
  const displayedHabits = useMemo(() => {
    return habitsForSelectedDate.filter(h => {
      const isDone = selectedCompletions.includes(h.id);
      if (habitFilter === 'completed') return isDone;
      if (habitFilter === 'uncompleted') return !isDone;
      return true;
    });
  }, [habitsForSelectedDate, selectedCompletions, habitFilter]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-xs">
            <CalendarIcon className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Chronological Archive
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Calendar & Daily History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Review your daily habit history, completed vs missed routines, and recorded mood entries for any date.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Calendar Grid */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-700/80 dark:bg-slate-900/90 shadow-xl space-y-6">
          {/* Month Header & Controls */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {monthName}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Select any date to inspect habit status and mood records
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous Month"
                className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-teal-400 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentDate(new Date());
                  setSelectedDateStr(todayStr);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-indigo-400 dark:hover:border-teal-400 cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next Month"
                className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-teal-400 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-xs font-extrabold text-slate-600 dark:text-slate-300 py-1 uppercase tracking-wider">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`blank-${idx}`} className="aspect-square rounded-2xl opacity-10" />
            ))}

            {/* Actual Days */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDateStr === dateStr;
              const isToday = todayStr === dateStr;
              const isPast = dateStr < todayStr;

              const dayCompletions = completionsByDate.get(dateStr) || [];
              const dayMood = moodEntries.find(m => m.date === dateStr);
              
              // Habits due on this specific calendar day
              const dayDueHabits = habits.filter(h => isHabitDueOnDate(h, dateStr) || dayCompletions.includes(h.id));
              const dayDueCount = dayDueHabits.length;
              const dayDoneCount = dayCompletions.length;
              const isFullyDone = dayDueCount > 0 && dayDoneCount >= dayDueCount;
              const isPartiallyDone = dayDoneCount > 0 && dayDoneCount < dayDueCount;
              const isMissedDay = isPast && dayDueCount > 0 && dayDoneCount === 0;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`aspect-square p-1.5 sm:p-2 rounded-2xl border flex flex-col justify-between items-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 ring-2 ring-indigo-500/50 shadow-md'
                      : isToday
                      ? 'border-indigo-400 bg-indigo-50/60 dark:bg-slate-800'
                      : isFullyDone
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : isMissedDay
                      ? 'border-rose-200/80 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10'
                      : 'border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/80 hover:border-indigo-400 dark:hover:border-teal-400'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-black ${
                        isSelected
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : isToday
                          ? 'text-indigo-600 dark:text-indigo-400 underline decoration-2 underline-offset-2'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayMood && (
                      <span className="text-[11px] leading-none filter drop-shadow-2xs" title={`Mood: ${dayMood.score}/5`}>
                        {dayMood.score === 5 ? '😄' : dayMood.score === 4 ? '🙂' : dayMood.score === 3 ? '😐' : '😔'}
                      </span>
                    )}
                  </div>

                  {/* Habit completion indicator dots / badge */}
                  <div className="w-full flex items-center justify-center gap-0.5 mt-1">
                    {dayDueCount > 0 ? (
                      <div className="flex items-center gap-1 w-full justify-center">
                        {isFullyDone ? (
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[9px] flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>{dayDoneCount}/{dayDueCount}</span>
                          </span>
                        ) : isPartiallyDone ? (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[9px]">
                            {dayDoneCount}/{dayDueCount}
                          </span>
                        ) : isMissedDay ? (
                          <span className="px-1.5 py-0.2 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[9px]">
                            0/{dayDueCount}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-750 text-slate-500 dark:text-slate-400 font-medium text-[9px]">
                            {dayDueCount} due
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Partial / In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>Missed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>😄 Mood Logged</span>
            </div>
          </div>
        </div>

        {/* Right Col: Selected Date Inspector */}
        <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-700/80 dark:bg-slate-900/90 shadow-xl space-y-5">
          {/* Header of Inspector */}
          <div className="flex items-center justify-between pb-3 border-b border-white/50 dark:border-white/10">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400">
                Selected Date
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
            </div>
            {isSelectedToday ? (
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                Today
              </span>
            ) : isPastDate ? (
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full">
                Past Record
              </span>
            ) : (
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 border border-teal-500/20 px-2.5 py-1 rounded-full">
                Upcoming
              </span>
            )}
          </div>

          {/* Daily Completion Summary Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Daily Completion Count
              </span>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                {completedHabitsCount}/{totalHabitsCount} completed ({completionPercentage}%)
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  completionPercentage === 100 
                    ? 'bg-emerald-500' 
                    : completionPercentage > 0 
                    ? 'bg-indigo-600' 
                    : 'bg-transparent'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {completedHabitsCount} Completed
              </span>
              <span className="flex items-center gap-1 font-semibold text-rose-500 dark:text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
                {missedOrPendingCount} {isPastDate ? 'Missed' : isSelectedToday ? 'Pending' : 'Scheduled'}
              </span>
            </div>
          </div>

          {/* Daily Habits Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Habits for this Day ({totalHabitsCount})
              </span>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setHabitFilter('all')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    habitFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  All ({totalHabitsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setHabitFilter('completed')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    habitFilter === 'completed'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Done ({completedHabitsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setHabitFilter('uncompleted')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    habitFilter === 'uncompleted'
                      ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isPastDate ? 'Missed' : 'Pending'} ({missedOrPendingCount})
                </button>
              </div>
            </div>

            {habitsForSelectedDate.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No habits were scheduled for this date.
                </p>
              </div>
            ) : displayedHabits.length === 0 ? (
              <div className="p-3 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No habits matching the selected filter.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {displayedHabits.map((habit) => {
                  const isDone = selectedCompletions.includes(habit.id);

                  return (
                    <div
                      key={habit.id}
                      className={`p-3 rounded-2xl flex items-center justify-between text-xs border transition-all ${
                        isDone
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100'
                          : isPastDate
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-slate-700 dark:text-slate-300'
                          : 'bg-white/70 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleHabitCompletion(habit.id, selectedDateStr)}
                          title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        
                        <div className="min-w-0 flex-1">
                          <p className={`font-bold truncate text-xs ${isDone ? 'text-emerald-950 dark:text-emerald-200 line-through opacity-85' : 'text-slate-900 dark:text-white'}`}>
                            {habit.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 flex-wrap">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{habit.category}</span>
                            {habit.reminderTime && (
                              <span>• {habit.reminderTime}</span>
                            )}
                            {habit.goalTarget && habit.goalTarget > 1 && (
                              <span>• Target: {habit.goalTarget} {habit.goalUnit || 'times'}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0 ml-2">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            Completed
                          </span>
                        ) : isPastDate ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-900">
                            <XCircle className="w-2.5 h-2.5" />
                            Missed
                          </span>
                        ) : isSelectedToday ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-900">
                            <Clock className="w-2.5 h-2.5" />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            Scheduled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mood Record (Synchronized with Mood Tracker) */}
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/85 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
              <span className="flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Mood Record</span>
              </span>

              {selectedMood ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {selectedMood.score === 5 ? '😄 Great' : selectedMood.score === 4 ? '🙂 Good' : selectedMood.score === 3 ? '😐 Neutral' : selectedMood.score === 2 ? '😔 Low' : '😣 Bad'} ({selectedMood.score}/5)
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">
                  Not recorded
                </span>
              )}
            </div>

            {selectedMood ? (
              <div className="space-y-2 pt-1">
                {selectedMood.notes ? (
                  <p className="text-xs text-slate-700 dark:text-slate-200 italic bg-slate-50 dark:bg-slate-750/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    "{selectedMood.notes}"
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">No written reflection recorded for this entry.</p>
                )}

                {selectedMood.emotions && selectedMood.emotions.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedMood.emotions.map((emotion, idx) => (
                      <span 
                        key={idx} 
                        className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md font-bold border border-indigo-200 dark:border-indigo-800"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-1 flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No mood entry recorded for this day.
                </p>
                {setActiveTab && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('mood')}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Open Mood Tracker →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Health Summary if available */}
          {selectedHealth && (
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-800/85 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white">
                <Activity className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                <span>Health Snapshot</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                <span>🌙 Sleep: {selectedHealth.sleepHours} hrs</span>
                <span>💧 Water: {selectedHealth.waterMl} ml</span>
                {selectedHealth.steps ? <span>👟 Steps: {selectedHealth.steps.toLocaleString()}</span> : null}
                {selectedHealth.activeMinutes ? <span>⚡ Active: {selectedHealth.activeMinutes} mins</span> : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

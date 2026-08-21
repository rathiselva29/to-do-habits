import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayDateString } from '../services/storage';

export const CalendarView: React.FC = () => {
  const { habits, completions, moodEntries, healthMetrics } = useApp();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayDateString());

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

  // Completions set for quick lookup
  const completionsByDate = new Map<string, string[]>();
  completions.forEach((c) => {
    const list = completionsByDate.get(c.date) || [];
    list.push(c.habitId);
    completionsByDate.set(c.date, list);
  });

  // Selected date details
  const selectedCompletions = completionsByDate.get(selectedDateStr) || [];
  const selectedMood = moodEntries.find(m => m.date === selectedDateStr);
  const selectedHealth = healthMetrics.find(m => m.date === selectedDateStr);
  const activeHabits = habits.filter(h => !h.isArchived && !h.isPaused);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-lg ai-gradient text-white shadow-xs">
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
          Review your historic check-ins, mood logs, and biometric entries across any calendar date.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Calendar Grid */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl glass-card shadow-lg space-y-6">
          {/* Month Header & Controls */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {monthName}
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl glass-subcard hover:border-indigo-400 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-xl glass-subcard text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-400 cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl glass-subcard hover:border-indigo-400 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-xs font-bold text-slate-400 py-1 uppercase tracking-wider">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`blank-${idx}`} className="aspect-square rounded-2xl opacity-20" />
            ))}

            {/* Actual Days */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDateStr === dateStr;
              const isToday = todayStr === dateStr;

              const dayCompletions = completionsByDate.get(dateStr) || [];
              const dayMood = moodEntries.find(m => m.date === dateStr);
              const completionPercent = activeHabits.length > 0 ? (dayCompletions.length / activeHabits.length) : 0;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`aspect-square p-1.5 sm:p-2 rounded-2xl border flex flex-col justify-between items-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/15 ring-2 ring-indigo-500/30 backdrop-blur-xs'
                      : isToday
                      ? 'border-indigo-500/60 bg-indigo-50/50 dark:bg-indigo-950/30 backdrop-blur-xs'
                      : 'border-white/40 dark:border-white/10 glass-subcard hover:border-indigo-300 dark:hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : isSelected
                          ? 'text-indigo-700 dark:text-indigo-300 font-extrabold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayMood && (
                      <span className="text-[10px]">
                        {dayMood.score === 5 ? '😄' : dayMood.score === 4 ? '🙂' : dayMood.score === 3 ? '😐' : '😔'}
                      </span>
                    )}
                  </div>

                  {/* Habit completion indicator dots / progress */}
                  <div className="w-full flex items-center justify-center gap-0.5 mt-1">
                    {dayCompletions.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            completionPercent >= 1
                              ? 'w-6 bg-emerald-500 shadow-xs'
                              : completionPercent >= 0.5
                              ? 'w-4 bg-indigo-400'
                              : 'w-2.5 bg-amber-400'
                          }`}
                        />
                      </div>
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Selected Date Inspector */}
        <div className="p-6 rounded-3xl glass-card shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/50 dark:border-white/10">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Date Inspector
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {new Date(selectedDateStr).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
            </div>
            {selectedDateStr === todayStr && (
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/80 border border-indigo-500/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                Today
              </span>
            )}
          </div>

          {/* Habits Completed that Day */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              Habits Completed ({selectedCompletions.length}/{activeHabits.length})
            </span>

            {activeHabits.length === 0 ? (
              <p className="text-xs text-slate-400">No active habits.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {activeHabits.map((h) => {
                  const isDone = selectedCompletions.includes(h.id);
                  return (
                    <div
                      key={h.id}
                      className={`p-2.5 rounded-2xl flex items-center justify-between text-xs border ${
                        isDone
                          ? 'glass-subcard border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                          : 'glass-subcard border-white/30 dark:border-white/5 text-slate-500 line-through opacity-70'
                      }`}
                    >
                      <span className="font-semibold truncate">{h.name}</span>
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                      ) : (
                        <span className="text-[10px] text-slate-400">Missed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mood Record */}
          <div className="p-3.5 rounded-2xl glass-subcard space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span className="flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-indigo-500" />
                Mood Entry
              </span>
              <span>
                {selectedMood ? `${selectedMood.score}/5` : 'Not recorded'}
              </span>
            </div>
            {selectedMood?.notes && (
              <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                "{selectedMood.notes}"
              </p>
            )}
            {selectedMood?.emotions && (
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedMood.emotions.map((e, idx) => (
                  <span key={idx} className="text-[10px] bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md font-medium border border-indigo-500/20">
                    {e}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Health Summary */}
          {selectedHealth && (
            <div className="p-3.5 rounded-2xl glass-subcard space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Activity className="w-3.5 h-3.5 text-teal-500" />
                <span>Health Snapshot</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                <span>🌙 Sleep: {selectedHealth.sleepHours} hrs</span>
                <span>💧 Water: {selectedHealth.waterMl} ml</span>
                <span>👟 Steps: {selectedHealth.steps?.toLocaleString()}</span>
                <span>⚡ Active: {selectedHealth.activeMinutes} mins</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

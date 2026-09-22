import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  Smile, 
  Activity, 
  Clock, 
  Calendar as CalendarIcon,
  Bot,
  ChevronRight,
  TrendingUp,
  BellRing,
  Bell,
  ShieldCheck,
  X,
  Check,
  Award,
  Sun,
  Moon,
  Filter,
  BookOpen
} from 'lucide-react';
import { Habit } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { IconRenderer } from './IconRenderer';
import { getTodayDateString } from '../services/storage';
import { formatTimeTo12Hour } from '../utils/timeFormat';
import { NotificationService } from '../services/notifications';
import { User, Users } from 'lucide-react';

interface DashboardViewProps {
  onOpenNewHabit: () => void;
  onOpenHabitDetails: (habit: Habit) => void;
  setActiveTab: (tab: string) => void;
  onOpenAddProfile?: () => void;
  onOpenProfileSwitcher?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewHabit,
  onOpenHabitDetails,
  setActiveTab,
  onOpenAddProfile,
  onOpenProfileSwitcher,
}) => {
  const { user, profiles } = useAuth();
  const { 
    habits, 
    completions, 
    moodEntries, 
    wellnessScore, 
    aiInsight, 
    activeReminderNotification,
    dismissReminder,
    toggleHabitCompletion,
    notificationSettings,
    requestNotificationPermission,
    sendTestNotification
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'am' | 'pm' | 'pending' | 'completed'>('all');
  const [notificationFeedback, setNotificationFeedback] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const todayStr = getTodayDateString();
  const activeHabits = habits.filter(h => !h.isArchived && !h.isPaused);
  const completedTodayHabitIds = new Set(
    completions.filter(c => c.date === todayStr).map(c => c.habitId)
  );

  const completedCount = activeHabits.filter(h => completedTodayHabitIds.has(h.id)).length;
  const totalCount = activeHabits.length;
  const pendingCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered habits list
  const filteredHabits = activeHabits.filter((h) => {
    const isCompleted = completedTodayHabitIds.has(h.id);
    const hour = parseInt(h.reminderTime?.split(':')[0] || '12', 10);
    const isAM = hour < 12;

    if (activeFilter === 'pending') return !isCompleted;
    if (activeFilter === 'completed') return isCompleted;
    if (activeFilter === 'am') return isAM;
    if (activeFilter === 'pm') return !isAM;
    return true;
  });

  // Best active streak
  const currentStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  // Past 7 Days Tracking Momentum
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const count = completions.filter(c => c.date === dateStr).length;
    const isToday = dateStr === todayStr;
    return { dateStr, dayLabel, count, isToday };
  });

  // Today's mood
  const todayMood = moodEntries.find(m => m.date === todayStr);
  const moodLabels = ['', '😞 Difficult', '😔 Low', '😐 Okay', '🙂 Good', '😄 Excellent'];

  // Dynamic greeting based on hour
  const currentHour = new Date().getHours();
  let greetingTime = 'Good morning';
  let dynamicSubtitle = 'Ready to build steady momentum today?';
  if (currentHour >= 12 && currentHour < 17) {
    greetingTime = 'Good afternoon';
    dynamicSubtitle = 'Keep up your steady momentum through the afternoon.';
  } else if (currentHour >= 17) {
    greetingTime = 'Good evening';
    dynamicSubtitle = 'Wind down and celebrate today’s achievements.';
  }

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* On-Time Habit Reminder Notification Alert Banner */}
      {activeReminderNotification && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 text-white shadow-xl shadow-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-xs uppercase font-extrabold tracking-wider text-indigo-100">
                Scheduled Routine Reminder
              </p>
              <h4 className="text-sm sm:text-base font-black">
                {activeReminderNotification.title}
              </h4>
              <p className="text-xs text-white/90">
                {activeReminderNotification.body}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {activeReminderNotification.habitId && (
              <button
                type="button"
                onClick={() => {
                  if (activeReminderNotification.habitId) {
                    toggleHabitCompletion(activeReminderNotification.habitId);
                  }
                  dismissReminder();
                }}
                className="px-4 py-2 rounded-xl bg-white text-indigo-900 font-bold text-xs shadow-md hover:bg-white/90 transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Mark Done</span>
              </button>
            )}
            <button
              type="button"
              onClick={dismissReminder}
              className="p-2 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header & New Habit CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{todayFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {greetingTime}, {user?.name ? user.name.split(' ')[0] : 'Friend'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {dynamicSubtitle}
          </p>
        </div>

        <button
          onClick={onOpenNewHabit}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl ai-gradient text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Daily Morning Notification & Reading Track Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-teal-500/10 border border-amber-500/20 dark:border-amber-400/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Daily Morning Notification
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                Scheduled at {formatTimeTo12Hour(notificationSettings?.reminderTime || '08:00')}
              </span>
              {NotificationService.getPermissionStatus() === 'granted' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Device Active
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  Permission Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Monitors daily track reading & habits. Automatically alerts you every morning for any unfinished tasks.
            </p>
            {notificationFeedback && (
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 animate-fadeIn">
                {notificationFeedback}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {NotificationService.getPermissionStatus() !== 'granted' ? (
            <button
              type="button"
              onClick={async () => {
                const res = await requestNotificationPermission();
                if (res === 'granted') {
                  setNotificationFeedback('✅ Morning notifications enabled!');
                  setTimeout(() => setNotificationFeedback(null), 4000);
                }
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Device Notifications</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isSendingTest}
              onClick={async () => {
                setIsSendingTest(true);
                const res = await sendTestNotification();
                setNotificationFeedback(res.message);
                setIsSendingTest(false);
                setTimeout(() => setNotificationFeedback(null), 4500);
              }}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <BellRing className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isSendingTest ? 'Sending...' : 'Test Morning Alert'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= PERSONAL HABIT MONITOR PER PERSON ================= */}
      <div className="p-5 sm:p-6 rounded-3xl glass-card border border-white/60 dark:border-white/10 shadow-lg relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          {/* User Persona Profile */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl ai-gradient text-white font-black text-xl flex items-center justify-center shadow-sm">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                  {user?.name || 'Habit Builder'}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase">
                  <Award className="w-3 h-3" />
                  <span>Tracking Active (0+)</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {user?.bio || 'Building everyday consistency, health, and focus.'}
              </p>

              {/* Multi-Profile Quick Switching Row */}
              <div className="flex items-center gap-2 mt-2 pt-1">
                {onOpenProfileSwitcher && (
                  <button
                    type="button"
                    onClick={onOpenProfileSwitcher}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/70 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-white/60 dark:border-white/10 hover:bg-white dark:hover:bg-slate-750 transition-all shadow-2xs cursor-pointer"
                  >
                    <Users className="w-3 h-3 text-indigo-500" />
                    <span>Profiles ({profiles.length})</span>
                  </button>
                )}
                {onOpenAddProfile && (
                  <button
                    type="button"
                    onClick={onOpenAddProfile}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[11px] font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/50 dark:border-indigo-800/30 transition-all shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 7-Day Habit Tracker Momentum Dots */}
          <div className="flex items-center gap-2 sm:gap-3 bg-white/50 dark:bg-slate-855/50 p-2 sm:p-3 rounded-2xl border border-white/50 dark:border-white/10 self-stretch md:self-auto justify-between sm:justify-start">
            <div className="text-right pr-2 border-r border-slate-200 dark:border-slate-700">
              <p className="text-[10px] uppercase font-bold text-slate-400">7-Day</p>
              <p className="text-xs font-black text-slate-800 dark:text-slate-200">Track</p>
            </div>

            {last7Days.map((day) => (
              <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400">{day.dayLabel}</span>
                <div
                  title={`${day.dateStr}: ${day.count} habits completed`}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-extrabold transition-transform ${
                    day.count > 0
                      ? 'bg-emerald-500 text-white shadow-xs scale-105'
                      : day.isToday
                      ? 'border-2 border-dashed border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {day.count > 0 ? day.count : '-'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Completed Today */}
        <div className="p-4 rounded-3xl glass-card hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2">
            <span>Daily Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {completedCount} <span className="text-sm font-medium text-slate-400">/ {totalCount}</span>
          </p>
          <div className="w-full h-1.5 bg-slate-200/60 dark:bg-slate-700/60 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full ai-gradient rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Current Streak */}
        <div className="p-4 rounded-3xl glass-card hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2">
            <span>Best Active Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {currentStreak} <span className="text-sm font-medium text-slate-400">days</span>
          </p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-2 flex items-center gap-1 truncate">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Highest active momentum</span>
          </p>
        </div>

        {/* Metric 3: Today's Mood */}
        <div 
          onClick={() => setActiveTab('mood')}
          className="p-4 rounded-3xl glass-card hover:border-blue-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2">
            <span>Today's Mood</span>
            <Smile className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
            {todayMood ? moodLabels[todayMood.score] : 'Check in now'}
          </p>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-2 flex items-center gap-1">
            <span>{todayMood ? `${todayMood.emotions.length} emotions tagged` : 'Log reflection →'}</span>
          </p>
        </div>

        {/* Metric 4: Wellness Score */}
        <div 
          onClick={() => setActiveTab('analytics')}
          className="p-4 rounded-3xl glass-card hover:border-indigo-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2">
            <span>Wellness Score</span>
            <Activity className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {wellnessScore.totalScore}
            </p>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
            Rhythm & sleep balanced
          </p>
        </div>
      </div>

      {/* Main Section: Daily Habits Tracker & Progress Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Habits List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Section Header & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Everyday Habits
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/60 dark:bg-slate-800/60 border border-white/50 dark:border-white/10 text-slate-700 dark:text-slate-300">
                {completedCount} of {totalCount} Done
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-2xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                All ({activeHabits.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('am')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeFilter === 'am'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Morning AM</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('pm')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeFilter === 'pm'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Moon className="w-3 h-3 text-indigo-400" />
                <span>PM</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('pending')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'pending'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Pending ({pendingCount})
              </button>
            </div>
          </div>

          {filteredHabits.length === 0 ? (
            <div className="p-8 rounded-3xl glass-card border-dashed text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeFilter === 'pending'
                  ? '🎉 All filtered habits completed for today!'
                  : 'No habits in this category yet'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Create new anchor routines or toggle filters to view other scheduled habits.
              </p>
              <button
                onClick={onOpenNewHabit}
                className="px-4 py-2 rounded-xl ai-gradient text-white text-xs font-semibold shadow-md inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Habit</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredHabits.map((habit) => {
                const isCompleted = completedTodayHabitIds.has(habit.id);
                const time12 = habit.reminderTime ? formatTimeTo12Hour(habit.reminderTime) : '';

                return (
                  <div
                    key={habit.id}
                    className={`group p-3.5 sm:p-4 rounded-3xl transition-all duration-200 flex items-center justify-between gap-3 ${
                      isCompleted
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-400/40 backdrop-blur-md shadow-xs'
                        : 'glass-card hover:border-indigo-400/50 hover:shadow-md'
                    }`}
                  >
                    {/* Habit Info & Icon */}
                    <div 
                      onClick={() => onOpenHabitDetails(habit)}
                      className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                    >
                      <div
                        className={`p-2.5 rounded-2xl shrink-0 transition-transform group-hover:scale-105 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-white/60 dark:border-white/10'
                        }`}
                      >
                        <IconRenderer name={habit.icon} className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`text-sm sm:text-base font-bold truncate transition-colors ${
                              isCompleted
                                ? 'text-slate-500 dark:text-slate-400 line-through'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {habit.name}
                          </h3>
                          {habit.streak > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full bg-amber-50/80 dark:bg-amber-950/60 shrink-0">
                              <Flame className="w-2.5 h-2.5 fill-amber-500" />
                              {habit.streak}d streak
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{habit.category}</span>
                          {time12 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-medium">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {time12}
                              </span>
                            </>
                          )}
                          {habit.goalTarget > 1 && (
                            <>
                              <span>•</span>
                              <span>Target: {habit.goalTarget} {habit.goalUnit}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Completion Check Button */}
                    <button
                      type="button"
                      onClick={() => toggleHabitCompletion(habit.id)}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                          : 'border-2 border-slate-300/80 dark:border-slate-700 text-transparent hover:border-emerald-500 hover:text-emerald-500/40 bg-white/40 dark:bg-slate-850'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Daily Progress Ring & Prominent AI Coach Card */}
        <div className="space-y-4">
          {/* Circular Progress Ring Card */}
          <div className="p-6 rounded-3xl glass-card flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Daily Target Completion
            </h3>

            {/* SVG Circular Progress Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90 progress-ring" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="text-slate-200/60 dark:text-slate-800/80 stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Stroke */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="text-indigo-600 dark:text-indigo-400 stroke-current transition-all duration-700 ease-out"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {progressPercent}%
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Done
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {progressPercent === 100
                ? '🌟 Perfection! All daily routines completed.'
                : progressPercent >= 50
                ? '💪 Great rhythm, you are more than halfway there!'
                : '🚀 Check off your anchors to build momentum.'}
            </p>
          </div>

          {/* AI Coach Spotlight Card */}
          <div className="p-5 rounded-3xl glass-card space-y-3 relative overflow-hidden">
            {/* Frosted glow backdrop */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl ai-gradient text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Your AI Coach
                </span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                Live Insights
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium relative z-10">
              "{aiInsight?.recommendation || 'You are building steady habits. Complete your hydration and movement routines to keep your streak intact.'}"
            </p>

            <div className="flex items-center gap-2 pt-1 relative z-10">
              <button
                onClick={() => setActiveTab('coach')}
                className="flex-1 py-2 px-3 rounded-xl ai-gradient text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Chat with Coach</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

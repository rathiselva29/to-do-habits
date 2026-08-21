import React from 'react';
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
  TrendingUp
} from 'lucide-react';
import { Habit } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { IconRenderer } from './IconRenderer';
import { getTodayDateString } from '../services/storage';

interface DashboardViewProps {
  onOpenNewHabit: () => void;
  onOpenHabitDetails: (habit: Habit) => void;
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewHabit,
  onOpenHabitDetails,
  setActiveTab,
}) => {
  const { user } = useAuth();
  const { 
    habits, 
    completions, 
    moodEntries, 
    wellnessScore, 
    aiInsight, 
    toggleHabitCompletion 
  } = useApp();

  const todayStr = getTodayDateString();
  const activeHabits = habits.filter(h => !h.isArchived && !h.isPaused);
  const completedTodayHabitIds = new Set(
    completions.filter(c => c.date === todayStr).map(c => c.habitId)
  );

  const completedCount = activeHabits.filter(h => completedTodayHabitIds.has(h.id)).length;
  const totalCount = activeHabits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Best active streak
  const currentStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  // Today's mood
  const todayMood = moodEntries.find(m => m.date === todayStr);
  const moodLabels = ['', '😞 Difficult', '😔 Low', '😐 Okay', '🙂 Good', '😄 Excellent'];

  // Dynamic greeting based on hour
  const currentHour = new Date().getHours();
  let greetingTime = 'Good morning';
  let dynamicSubtitle = 'Ready to make today count with mindful consistency?';
  if (currentHour >= 12 && currentHour < 17) {
    greetingTime = 'Good afternoon';
    dynamicSubtitle = 'Keep up your steady momentum through the afternoon.';
  } else if (currentHour >= 17) {
    greetingTime = 'Good evening';
    dynamicSubtitle = 'Time to wind down and celebrate today’s achievements.';
  }

  // Today's formatted date string
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Top Greeting Section */}
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

      {/* Metrics Overview Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Completed Today */}
        <div className="p-4 rounded-3xl glass-card hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2">
            <span>Completed</span>
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
            <span>Current Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {currentStreak} <span className="text-sm font-medium text-slate-400">days</span>
          </p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-2 flex items-center gap-1 truncate">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Highest active streak</span>
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
            Habits & sleep weighted
          </p>
        </div>
      </div>

      {/* Main Section: Daily Habits & Progress Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Habits List */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Today's Habits
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/60 dark:bg-slate-800/60 border border-white/50 dark:border-white/10 text-slate-700 dark:text-slate-300 backdrop-blur-md">
                {completedCount} of {totalCount} done
              </span>
            </div>
            <button
              onClick={() => setActiveTab('habits')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Manage all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeHabits.length === 0 ? (
            <div className="p-8 rounded-3xl glass-card border-dashed text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No active habits scheduled today
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Create your first anchor habit to begin your personalized daily wellness routine.
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
              {activeHabits.map((habit) => {
                const isCompleted = completedTodayHabitIds.has(habit.id);
                return (
                  <div
                    key={habit.id}
                    className={`group p-3.5 sm:p-4 rounded-3xl transition-all duration-200 flex items-center justify-between gap-3 ${
                      isCompleted
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/25 border border-emerald-400/40 backdrop-blur-md'
                        : 'glass-card hover:border-indigo-400/40'
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
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full bg-amber-50/80 dark:bg-amber-950/60 shrink-0">
                              <Flame className="w-2.5 h-2.5 fill-amber-500" />
                              {habit.streak}d
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-medium">{habit.category}</span>
                          {habit.reminderTime && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {habit.reminderTime}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Completion Check Button */}
                    <button
                      type="button"
                      onClick={() => toggleHabitCompletion(habit.id)}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer ${
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
              Daily Progress
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
                  Target
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
              "{aiInsight?.recommendation || 'You are building strong morning consistency. Focus on completing your hydration and mindfulness routines before lunch.'}"
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

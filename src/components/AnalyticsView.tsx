import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Flame, 
  Award, 
  CheckCircle2, 
  Calendar, 
  Activity, 
  Smile, 
  Moon, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPastDateString } from '../services/storage';

export const AnalyticsView: React.FC = () => {
  const { habits, completions, wellnessScore } = useApp();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

  // Calculate day-by-day completions
  const completionMap = new Map<string, number>();
  completions.forEach((c) => {
    completionMap.set(c.date, (completionMap.get(c.date) || 0) + 1);
  });

  const activeHabitsCount = habits.filter(h => !h.isArchived && !h.isPaused).length || 1;
  const historyData: Array<{ date: string; label: string; count: number; rate: number }> = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = daysCount - 1; i >= 0; i--) {
    const dStr = getPastDateString(i);
    const count = completionMap.get(dStr) || 0;
    const rate = Math.min(100, Math.round((count / activeHabitsCount) * 100));
    const dObj = new Date(dStr);
    const label = `${dObj.getMonth() + 1}/${dObj.getDate()}`;
    historyData.push({ date: dStr, label, count, rate });
  }

  // Day of week analysis (0=Sun, 1=Mon, ..., 6=Sat)
  const dayOfWeekStats = [0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
    let totalCompletions = 0;
    let occurrences = 0;
    historyData.forEach((item) => {
      if (new Date(item.date).getDay() === dayIdx) {
        totalCompletions += item.count;
        occurrences++;
      }
    });
    const avgRate = occurrences > 0 ? Math.min(100, Math.round((totalCompletions / (occurrences * activeHabitsCount)) * 100)) : 0;
    return {
      dayName: daysOfWeek[dayIdx],
      avgRate,
    };
  });

  // Overall totals
  const totalCompletedAllTime = completions.length;
  const highestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const bestStreakEver = habits.reduce((max, h) => Math.max(max, h.bestStreak), 0);
  
  // Most consistent & most challenging habits
  const sortedByCompletions = [...habits].sort((a, b) => b.totalCompletions - a.totalCompletions);
  const mostConsistent = sortedByCompletions[0];
  const mostChallenging = sortedByCompletions[sortedByCompletions.length - 1];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg ai-gradient text-white shadow-xs">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Performance & Trends
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Wellness Analytics & Progress
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize your consistency trends, day-of-week rhythms, and holistic score components.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-card self-start sm:self-auto">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                timeRange === range
                  ? 'ai-gradient text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Top Stat Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl glass-card shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2">
            <span>Total Check-ins</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalCompletedAllTime}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
            Lifetime completions
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-card shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2">
            <span>Highest Active Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {highestStreak} <span className="text-xs font-medium text-slate-400">days</span>
          </p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-2">
            Record: {bestStreakEver} days
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-card shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2">
            <span>Consistency Rate</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {wellnessScore.habitConsistency}%
          </p>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-2">
            Weighted 30-day average
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-card shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2">
            <span>Composite Score</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {wellnessScore.totalScore}
          </p>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-2">
            4 wellness pillars
          </p>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Daily Completion Bar Chart */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl glass-card shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Completion Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Percentage of active habits completed per day
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full glass-subcard">
              {timeRange} window
            </span>
          </div>

          {/* Bar Visualizer */}
          <div className="h-44 flex items-end gap-1 sm:gap-1.5 pt-6 pb-2 overflow-x-auto">
            {historyData.map((d, idx) => (
              <div
                key={idx}
                title={`${d.date}: ${d.rate}% completed (${d.count} habits)`}
                className="flex-1 min-w-[8px] sm:min-w-[12px] h-full flex flex-col items-center justify-end group cursor-pointer"
              >
                <div
                  className={`w-full rounded-t-md transition-all duration-300 group-hover:opacity-80 ${
                    d.rate >= 80
                      ? 'bg-emerald-500 shadow-xs'
                      : d.rate >= 50
                      ? 'bg-indigo-400'
                      : d.rate > 0
                      ? 'bg-amber-400'
                      : 'bg-white/40 dark:bg-slate-800'
                  }`}
                  style={{ height: `${Math.max(8, d.rate)}%` }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/50 dark:border-white/10">
            <span>{historyData[0]?.date}</span>
            <span>{historyData[historyData.length - 1]?.date}</span>
          </div>
        </div>

        {/* Right Col: Wellness Score Breakdown */}
        <div className="p-6 rounded-3xl glass-card shadow-lg space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Score Pillar Composition
          </h3>

          <div className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Habit Consistency (40%)
                </span>
                <span>{wellnessScore.habitConsistency}%</span>
              </div>
              <div className="w-full h-2 bg-white/40 dark:bg-slate-800/80 rounded-full overflow-hidden border border-white/40 dark:border-white/10">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${wellnessScore.habitConsistency}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  Sleep & Recovery (25%)
                </span>
                <span>{wellnessScore.sleepScore}%</span>
              </div>
              <div className="w-full h-2 bg-white/40 dark:bg-slate-800/80 rounded-full overflow-hidden border border-white/40 dark:border-white/10">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${wellnessScore.sleepScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-blue-500" />
                  Mood & Emotional (20%)
                </span>
                <span>{wellnessScore.moodScore}%</span>
              </div>
              <div className="w-full h-2 bg-white/40 dark:bg-slate-800/80 rounded-full overflow-hidden border border-white/40 dark:border-white/10">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${wellnessScore.moodScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-500" />
                  Physical Activity (15%)
                </span>
                <span>{wellnessScore.activityScore}%</span>
              </div>
              <div className="w-full h-2 bg-white/40 dark:bg-slate-800/80 rounded-full overflow-hidden border border-white/40 dark:border-white/10">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${wellnessScore.activityScore}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day of Week Consistency Heatmap & Habit Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Day of week breakdown */}
        <div className="p-6 rounded-3xl glass-card shadow-lg space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Day-of-Week Rhythm
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Identify which days you thrive on and which days need friction reduction
          </p>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {dayOfWeekStats.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center p-2.5 rounded-2xl glass-subcard"
              >
                <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase">
                  {item.dayName}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                  {item.avgRate}%
                </span>
                <div className="w-full h-1 bg-white/40 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${item.avgRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most consistent & challenging habit */}
        <div className="p-6 rounded-3xl glass-card shadow-lg space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Habit Anchor Diagnostics
          </h3>

          <div className="space-y-3">
            {mostConsistent && (
              <div className="p-3.5 rounded-2xl glass-subcard border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span>Most Consistent Anchor</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {mostConsistent.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {mostConsistent.totalCompletions} completions • {mostConsistent.streak}d streak
                  </p>
                </div>
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/80 border border-emerald-500/20 px-2.5 py-1 rounded-xl shadow-xs shrink-0">
                  Strongest
                </span>
              </div>
            )}

            {mostChallenging && (
              <div className="p-3.5 rounded-2xl glass-subcard border-amber-500/30 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Highest Growth Opportunity</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {mostChallenging.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {mostChallenging.totalCompletions} completions • Try lowering friction
                  </p>
                </div>
                <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/80 border border-amber-500/20 px-2.5 py-1 rounded-xl shadow-xs shrink-0">
                  Refine
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

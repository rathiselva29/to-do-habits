import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Flame, 
  CheckCircle2, 
  Clock, 
  MoreVertical, 
  Archive, 
  PauseCircle, 
  PlayCircle, 
  Trash2, 
  Edit3,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Habit, HabitCategory } from '../types';
import { useApp } from '../context/AppContext';
import { IconRenderer } from './IconRenderer';
import { getTodayDateString } from '../services/storage';
import { formatTimeTo12Hour } from '../utils/timeFormat';

interface HabitsViewProps {
  onOpenNewHabit: () => void;
  onOpenHabitDetails: (habit: Habit) => void;
  onEditHabit: (habit: Habit) => void;
}

const CATEGORY_TABS: Array<'All' | HabitCategory> = [
  'All',
  'Fitness',
  'Nutrition',
  'Mental wellness',
  'Sleep',
  'Productivity',
  'Learning',
  'Self-care',
];

export const HabitsView: React.FC<HabitsViewProps> = ({
  onOpenNewHabit,
  onOpenHabitDetails,
  onEditHabit,
}) => {
  const { 
    habits, 
    completions, 
    toggleHabitCompletion, 
    toggleHabitPause, 
    toggleHabitArchive, 
    deleteHabit 
  } = useApp();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'today' | 'completed' | 'archived'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'All' | HabitCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'streak' | 'name' | 'completions'>('streak');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const todayStr = getTodayDateString();
  const completedTodaySet = new Set(completions.filter(c => c.date === todayStr).map(c => c.habitId));

  // Filtering
  const filteredHabits = habits.filter((h) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = h.name.toLowerCase().includes(q) || h.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category filter
    if (selectedCategory !== 'All' && h.category !== selectedCategory) {
      return false;
    }

    // Tab filter
    if (activeTabFilter === 'archived') {
      return h.isArchived;
    } else {
      if (h.isArchived) return false;
    }

    if (activeTabFilter === 'completed') {
      return completedTodaySet.has(h.id);
    }

    return true;
  });

  // Sorting
  const sortedHabits = [...filteredHabits].sort((a, b) => {
    if (sortBy === 'streak') return b.streak - a.streak;
    if (sortBy === 'completions') return b.totalCompletions - a.totalCompletions;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & New Habit Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Habit Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize, customize, and maintain your personalized daily routines.
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

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-card">
            {[
              { id: 'all', label: 'All Active' },
              { id: 'today', label: 'Today' },
              { id: 'completed', label: 'Done Today' },
              { id: 'archived', label: 'Archived' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTabFilter === tab.id
                    ? 'ai-gradient text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="glass-input rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="streak">Highest Streak</option>
              <option value="completions">Most Completed</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search habits or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'ai-gradient text-white shadow-xs'
                  : 'glass-subcard text-slate-600 dark:text-slate-400 hover:border-indigo-400/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Habit Cards Grid */}
      {sortedHabits.length === 0 ? (
        <div className="p-12 rounded-3xl glass-card border-dashed text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No habits match your filters
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or create a brand new habit.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {sortedHabits.map((habit) => {
            const isCompletedToday = completedTodaySet.has(habit.id);
            const isMenuOpen = menuOpenId === habit.id;

            return (
              <div
                key={habit.id}
                className={`group relative p-4 sm:p-5 rounded-3xl transition-all duration-200 ${
                  habit.isPaused
                    ? 'glass-card opacity-70 border-dashed'
                    : isCompletedToday
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/25 border border-emerald-400/40 backdrop-blur-md'
                    : 'glass-card hover:border-indigo-400/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Habit Left Info */}
                  <div
                    onClick={() => onOpenHabitDetails(habit)}
                    className="flex items-start gap-3.5 min-w-0 cursor-pointer flex-1"
                  >
                    <div
                      className={`p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-105 ${
                        isCompletedToday
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-white/60 dark:border-white/10'
                      }`}
                    >
                      <IconRenderer name={habit.icon} className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {habit.name}
                        </h3>
                        {habit.isPaused && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-amber-100/80 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                            Paused
                          </span>
                        )}
                        {habit.isArchived && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Archived
                          </span>
                        )}
                      </div>

                      {habit.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {habit.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex-wrap">
                        <span className="font-medium px-2 py-0.5 rounded-full bg-white/70 dark:bg-slate-800/80 border border-white/50 dark:border-white/10 text-slate-600 dark:text-slate-300">
                          {habit.category}
                        </span>

                        <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                          <Flame className="w-3.5 h-3.5 fill-amber-500" />
                          {habit.streak}d streak
                        </span>

                        {habit.reminderTime && (
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {formatTimeTo12Hour(habit.reminderTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleHabitCompletion(habit.id)}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                        isCompletedToday
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                          : 'border-2 border-slate-300/80 dark:border-slate-700 text-transparent hover:border-emerald-500 hover:text-emerald-500/40 bg-white/40 dark:bg-slate-850'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    {/* Context Menu trigger */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMenuOpenId(isMenuOpen ? null : habit.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-40 glass-card rounded-2xl p-1.5 shadow-xl z-30 animate-fadeIn text-xs">
                          <button
                            onClick={() => {
                              onEditHabit(habit);
                              setMenuOpenId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/60 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => {
                              toggleHabitPause(habit.id);
                              setMenuOpenId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/60 flex items-center gap-2 cursor-pointer"
                          >
                            {habit.isPaused ? (
                              <>
                                <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Resume</span>
                              </>
                            ) : (
                              <>
                                <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                                <span>Pause</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              toggleHabitArchive(habit.id);
                              setMenuOpenId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/60 flex items-center gap-2 cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5 text-purple-500" />
                            <span>{habit.isArchived ? 'Unarchive' : 'Archive'}</span>
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete habit "${habit.name}"?`)) {
                                deleteHabit(habit.id);
                                setMenuOpenId(null);
                              }
                            }}
                            className="w-full text-left px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

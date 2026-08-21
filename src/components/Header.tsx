import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  Moon, 
  Sun, 
  Bell, 
  User, 
  LogOut, 
  ShieldCheck,
  CheckCircle,
  Clock,
  Menu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenNewHabit: () => void;
  onToggleSidebar?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenNewHabit,
  onToggleSidebar,
  activeTab,
  setActiveTab,
}) => {
  const { theme, setTheme, wellnessScore, habits, notificationSettings } = useApp();
  const { user, isAuthenticated, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Highest active streak
  const highestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/50 dark:border-white/10 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Mobile Menu button & Brand */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800/60"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center cursor-pointer select-none group"
          >
            <Logo size={36} showText={true} />
          </div>
        </div>

        {/* Right Tools & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Streak Badge */}
          <div 
            onClick={() => setActiveTab('habits')}
            title="Current Best Habit Streak"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-800/60 border border-white/60 dark:border-white/10 text-amber-700 dark:text-amber-300 text-xs font-semibold cursor-pointer hover:scale-105 transition-all shadow-xs backdrop-blur-md"
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{highestStreak}d streak</span>
          </div>

          {/* Wellness Score Badge */}
          <div 
            onClick={() => setActiveTab('analytics')}
            title="Calculated Wellness Score"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-800/60 border border-white/60 dark:border-white/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold cursor-pointer hover:scale-105 transition-all shadow-xs backdrop-blur-md"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Score {wellnessScore.totalScore}%</span>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/60 transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/60 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {notificationSettings.habitsEnabled && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 glass-card rounded-2xl p-4 shadow-xl z-50 animate-fadeIn text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/40 dark:border-white/10">
                  <span className="font-bold text-slate-900 dark:text-white">Smart Reminders</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full font-medium">
                    Active
                  </span>
                </div>
                <div className="py-2 space-y-2 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Morning Anchor Reminder: 08:00 AM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                    <span>Hydration alerts scheduled every 2 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-purple-500" />
                    <span>Quiet hours: 22:30 – 07:00</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Account / Auth Dropdown */}
          <div className="relative">
            {isAuthenticated ? (
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-slate-750 transition-all shadow-xs"
              >
                <div className="w-7 h-7 rounded-xl ai-gradient flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden md:block max-w-[90px] truncate">
                  {user?.name || 'Account'}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-1.5 rounded-full ai-gradient text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
              >
                Sign In
              </button>
            )}

            {showProfileMenu && isAuthenticated && (
              <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl p-2 shadow-xl z-50 animate-fadeIn text-xs">
                <div className="px-3 py-2 border-b border-white/40 dark:border-white/10">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/60 flex items-center gap-2 transition-colors mt-1"
                >
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Profile & Preferences</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

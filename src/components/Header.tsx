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
  Menu,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenNewHabit: () => void;
  onOpenAddProfile?: () => void;
  onOpenProfileSwitcher?: () => void;
  onToggleSidebar?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenNewHabit,
  onOpenAddProfile,
  onOpenProfileSwitcher,
  onToggleSidebar,
  activeTab,
  setActiveTab,
}) => {
  const { theme, setTheme, wellnessScore, habits, notificationSettings } = useApp();
  const { user, profiles, switchProfile, isAuthenticated, logout } = useAuth();
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

          {/* User Account / Multi-Profile Dropdown */}
          <div className="relative">
            {isAuthenticated ? (
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-slate-750 transition-all shadow-xs"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-xl object-cover border border-white/60 dark:border-white/20 shadow-xs"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-xl ai-gradient flex items-center justify-center text-white text-xs font-bold shadow-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div className="text-left hidden md:block max-w-[100px]">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {user?.name || 'Account'}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Tracking 0+
                  </p>
                </div>
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
              <div className="absolute right-0 mt-2 w-64 glass-card rounded-2xl p-2.5 shadow-2xl z-50 animate-fadeIn text-xs border border-white/50 dark:border-white/10">
                <div className="px-3 py-2 border-b border-white/40 dark:border-white/10 flex items-center gap-2.5">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl ai-gradient flex items-center justify-center text-white font-bold shrink-0">
                      {user?.name?.[0] || 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Tracking
                    </span>
                  </div>
                </div>

                {/* Switch Profiles List (if multiple profiles exist) */}
                <div className="py-2 border-b border-white/40 dark:border-white/10">
                  <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>Profiles ({profiles.length})</span>
                    {onOpenProfileSwitcher && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenProfileSwitcher();
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Manage
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {profiles.map((p) => {
                      const isCurrent = p.id === user?.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            if (!isCurrent) switchProfile(p.id);
                            setShowProfileMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between transition-colors ${
                            isCurrent
                              ? 'bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-100 font-medium'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {p.avatarUrl ? (
                              <img src={p.avatarUrl} alt="" className="w-5 h-5 rounded-lg object-cover" />
                            ) : (
                              <div className="w-5 h-5 rounded-lg ai-gradient text-white text-[10px] flex items-center justify-center font-bold">
                                {p.name[0]}
                              </div>
                            )}
                            <span className="truncate">{p.name}</span>
                          </div>
                          {isCurrent && <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Active</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add New Profile CTA Button */}
                  {onOpenAddProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenAddProfile();
                      }}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Profile (Start Fresh 0)</span>
                    </button>
                  )}
                </div>

                <div className="pt-1.5 space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/60 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Profile & 12H Schedule</span>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

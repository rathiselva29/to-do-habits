import React, { useState } from 'react';
import { 
  User, 
  Moon, 
  Sun, 
  Bell, 
  Download, 
  Trash2, 
  LogOut, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Volume2, 
  Smartphone,
  Flame,
  FileText,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { StorageService } from '../services/storage';

interface ProfileViewProps {
  onOpenAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenAuth }) => {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { 
    theme, 
    setTheme, 
    notificationSettings, 
    updateNotificationSettings, 
    habits, 
    completions, 
    moodEntries, 
    healthMetrics 
  } = useApp();

  const [name, setName] = useState(user?.name || 'Alex Rivera');
  const [email, setEmail] = useState(user?.email || 'alex.rivera@example.com');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // JSON Data Export
  const handleExportJSON = () => {
    const data = {
      profile: user,
      habits,
      completions,
      moodEntries,
      healthMetrics,
      exportedAt: new Date().toISOString(),
      app: 'To-Do-Habits',
      version: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-habits-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV Data Export
  const handleExportCSV = () => {
    let csv = 'Type,ID/Date,Name/Score,Category/Emotions,Streak/Target,Timestamp\n';
    habits.forEach(h => {
      csv += `Habit,"${h.id}","${h.name}","${h.category}","${h.streak} days","${h.createdAt}"\n`;
    });
    completions.forEach(c => {
      csv += `Completion,"${c.date}","${c.habitId}","","","${c.completedAt}"\n`;
    });
    moodEntries.forEach(m => {
      csv += `Mood,"${m.date}","Score ${m.score}","${m.emotions.join(';')}","","${m.timestamp}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-habits-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to clear your local cache? All your synced cloud data remains safe in Supabase.')) {
      StorageService.resetAllData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-lg ai-gradient text-white shadow-xs">
            <User className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Account & System
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your notifications, data exports, aesthetic theme, and account credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Profile Form & Preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Details Card */}
          <form
            onSubmit={handleSaveProfile}
            className="p-6 sm:p-8 rounded-3xl glass-card shadow-lg space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/50 dark:border-white/10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Personal Information
              </h3>
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Sign in to link account →
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Member since {new Date(user?.createdAt || '2025-01-01').toLocaleDateString()}
              </span>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl ai-gradient text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                <span>{isSaved ? 'Changes Saved' : 'Save Profile'}</span>
              </button>
            </div>
          </form>

          {/* Notifications Preferences */}
          <div className="p-6 sm:p-8 rounded-3xl glass-card shadow-lg space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-white/50 dark:border-white/10">
              Notification & Reminder Settings
            </h3>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-2 rounded-2xl glass-subcard">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Habit Reminders</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Receive alerts at scheduled habit times</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.habitsEnabled}
                  onChange={(e) => updateNotificationSettings({ habitsEnabled: e.target.checked })}
                  className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-2xl glass-subcard">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Morning Wellness Briefing</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Daily 08:00 AM summary of your active goals</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.dailyBriefing}
                  onChange={(e) => updateNotificationSettings({ dailyBriefing: e.target.checked })}
                  className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-2xl glass-subcard">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Evening Reflection Prompt</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Nightly 21:00 PM mood and gratitude check-in</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.eveningReflection}
                  onChange={(e) => updateNotificationSettings({ eveningReflection: e.target.checked })}
                  className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-2xl glass-subcard">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Celebratory Audio Effects</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Play pleasant haptic chime upon habit completion</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.soundEnabled}
                  onChange={(e) => updateNotificationSettings({ soundEnabled: e.target.checked })}
                  className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Theme & Display Options */}
          <div className="p-6 sm:p-8 rounded-3xl glass-card shadow-lg space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-white/50 dark:border-white/10">
              Appearance & Aesthetics
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Color Mode</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Switch between frosted light and deep aurora dark</p>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-2xl glass-subcard">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'ai-gradient text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'ai-gradient text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Data Export, Account Reset & About */}
        <div className="space-y-6">
          {/* Data Portability Card */}
          <div className="p-6 rounded-3xl glass-card shadow-lg space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Portability
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You own 100% of your wellness history. Export your logs anytime in standard machine-readable formats.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleExportJSON}
                className="w-full py-2.5 px-3.5 rounded-xl glass-subcard hover:border-indigo-400 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Export JSON (Full Backup)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={handleExportCSV}
                className="w-full py-2.5 px-3.5 rounded-xl glass-subcard hover:border-indigo-400 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-teal-500" />
                  <span>Export CSV (Spreadsheet)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Account Actions & Danger Zone */}
          <div className="p-6 rounded-3xl glass-card shadow-lg space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Account Management
            </h3>

            {isAuthenticated ? (
              <button
                onClick={logout}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="w-full py-2.5 px-4 rounded-xl ai-gradient text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-[1.01]"
              >
                Sign In or Register
              </button>
            )}

            <button
              onClick={handleResetData}
              className="w-full py-2.5 px-4 rounded-xl glass-subcard hover:border-rose-400 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Local Storage Demo</span>
            </button>
          </div>

          {/* About To-Do-Habits */}
          <div className="p-6 rounded-3xl glass-card border border-indigo-500/30 shadow-lg space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                To-Do-Habits v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Designed for intentional daily growth. Built with frosted glass aesthetics, offline-first sync, real Supabase authentication, and intelligent Gemini server-side coaching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  AlertTriangle,
  Check,
  Plus,
  Users,
  Upload,
  BellRing
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { StorageService } from '../services/storage';
import { TimePicker12, formatTimeTo12Hour } from './TimePicker12';
import { NotificationService } from '../services/notifications';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { Habit } from '../types';

interface ProfileViewProps {
  onOpenAuth: () => void;
  onOpenAddProfile?: () => void;
  onOpenProfileSwitcher?: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  onOpenAuth,
  onOpenAddProfile,
  onOpenProfileSwitcher,
}) => {
  const { user, profiles, switchProfile, isAuthenticated, logout, updateProfile } = useAuth();
  const { 
    theme, 
    setTheme, 
    notificationSettings, 
    updateNotificationSettings, 
    requestNotificationPermission,
    sendTestNotification,
    habits, 
    completions, 
    moodEntries, 
    healthMetrics,
    exportBackupJSON,
    importBackupJSON,
  } = useApp();

  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notificationFeedback, setNotificationFeedback] = useState<string | null>(null);
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || 'Alex Rivera');
  const [email, setEmail] = useState(user?.email || 'alex.rivera@example.com');
  const [bio, setBio] = useState(user?.bio || 'Building daily consistency and physical wellness.');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || AVATAR_OPTIONS[0]);
  const [wakeTime, setWakeTime] = useState(user?.wakeTime || '07:00');
  const [reminderTime, setReminderTime] = useState(user?.reminderTimePreference || '08:00');
  const [sleepTime, setSleepTime] = useState(user?.sleepTime || '23:00');
  const [heightCm, setHeightCm] = useState(user?.heightCm || 175);
  const [weightKg, setWeightKg] = useState(user?.weightKg || 70);
  const [age, setAge] = useState(user?.age || 28);
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say'>(user?.gender || 'male');
  const [bpSystolic, setBpSystolic] = useState(user?.bpSystolic || 120);
  const [bpDiastolic, setBpDiastolic] = useState(user?.bpDiastolic || 80);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ 
      name, 
      email, 
      bio, 
      avatarUrl, 
      wakeTime, 
      reminderTimePreference: reminderTime, 
      sleepTime,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      age: Number(age),
      gender,
      bpSystolic: Number(bpSystolic),
      bpDiastolic: Number(bpDiastolic),
    });
    // Align morning notification alert time with this user's daily reminder/wake schedule
    await updateNotificationSettings({
      reminderTime: reminderTime || wakeTime || '07:00'
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Download Habit History Data File (CSV)
  const handleDownloadHabitHistoryCSV = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      let csv = 'Record Type,Date,Habit Name,Category,Daily Target,Current Streak,Best Streak,Lifetime Check-ins,Logged Timestamp\n';
      
      // Habit definitions
      habits.forEach(h => {
        csv += `Habit Definition,"${today}","${h.name.replace(/"/g, '""')}","${h.category}","${h.goalTarget} ${h.goalUnit}","${h.streak} days","${h.bestStreak} days","${h.totalCompletions}","${h.createdAt}"\n`;
      });

      // Daily completion records
      const habitMap = new Map<string, Habit>(habits.map(h => [h.id, h]));
      const sortedCompletions = [...completions].sort((a, b) => b.date.localeCompare(a.date));
      sortedCompletions.forEach(c => {
        const habit = habitMap.get(c.habitId);
        const habitName = habit ? habit.name : (c.habitId || 'Custom Habit');
        const habitCat = habit ? habit.category : 'General';
        const habitTarget = habit ? `${habit.goalTarget} ${habit.goalUnit}` : '1 check-in';
        csv += `Daily Completion,"${c.date}","${habitName.replace(/"/g, '""')}","${habitCat}","${habitTarget}","—","—","1","${c.completedAt}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habit-history-${today}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupMessage({ type: 'success', text: `Habit history CSV downloaded successfully (${sortedCompletions.length} completion records)!` });
      setTimeout(() => setBackupMessage(null), 3500);
    } catch (err: any) {
      setBackupMessage({ type: 'error', text: 'Failed to download habit history: ' + (err?.message || 'Error') });
      setTimeout(() => setBackupMessage(null), 3500);
    }
  };

  // Download Habit History Data File (JSON)
  const handleDownloadHabitHistoryJSON = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const historyData = {
        app: 'To-Do-Habits',
        exportType: 'Habit History & Records',
        downloadedAt: new Date().toISOString(),
        user: {
          name: user?.name || 'User',
          email: user?.email || '',
        },
        habits: habits.map(h => ({
          id: h.id,
          name: h.name,
          category: h.category,
          target: `${h.goalTarget} ${h.goalUnit}`,
          frequency: h.frequency,
          streak: h.streak,
          bestStreak: h.bestStreak,
          totalCompletions: h.totalCompletions,
          isArchived: h.isArchived || false,
        })),
        historyCompletions: completions.map(c => ({
          id: c.id,
          date: c.date,
          habitId: c.habitId,
          completedAt: c.completedAt,
        })),
        totalCompletionsRecorded: completions.length,
      };

      const blob = new Blob([JSON.stringify(historyData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habit-history-${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupMessage({ type: 'success', text: `Habit history JSON data file downloaded successfully!` });
      setTimeout(() => setBackupMessage(null), 3500);
    } catch (err: any) {
      setBackupMessage({ type: 'error', text: 'Failed to download habit history: ' + (err?.message || 'Error') });
      setTimeout(() => setBackupMessage(null), 3500);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to clear your local cache? All your synced cloud data remains safe.')) {
      StorageService.resetAllData();
      window.location.reload();
    }
  };

  const handleTestChime = () => {
    NotificationService.playChime('completion');
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
          Manage your profile details, 12-hour schedule timings, sound notifications, and exports.
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
                Personal Profile & Avatar
              </h3>
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Sign in to link cloud account →
                </button>
              )}
            </div>

            {/* Avatar Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Profile Avatar
              </label>
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-xs"
                />
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(av)}
                      className={`w-9 h-9 rounded-xl overflow-hidden cursor-pointer transition-transform ${
                        avatarUrl === av ? 'ring-2 ring-indigo-600 scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="Option" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
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

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Daily Focus / Intention
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Build consistent morning routine & improve physical wellness"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Daily Schedule Timings in 12-Hour AM/PM */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Personal Schedule & Anchor Times (12-Hour AM/PM)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <TimePicker12
                  label="Wake Up Time"
                  value={wakeTime}
                  onChange={setWakeTime}
                />
                <TimePicker12
                  label="Daily Reminder"
                  value={reminderTime}
                  onChange={setReminderTime}
                />
                <TimePicker12
                  label="Sleep / Bedtime"
                  value={sleepTime}
                  onChange={setSleepTime}
                />
              </div>
            </div>

            {/* Baseline Biometrics & Health Profile */}
            <div className="pt-2 border-t border-slate-200/50 dark:border-white/10">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Baseline Health & Biometric Markers
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full glass-input rounded-xl px-2 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="male" className="bg-slate-900 text-white">Male</option>
                    <option value="female" className="bg-slate-900 text-white">Female</option>
                    <option value="non-binary" className="bg-slate-900 text-white">Non-binary</option>
                    <option value="other" className="bg-slate-900 text-white">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    BP Systolic
                  </label>
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    BP Diastolic
                  </label>
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-xs text-slate-400">
                {user?.id ? `User ID: ${user.id.substring(0, 14)}...` : 'Local profile active'}
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl ai-gradient text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                <span>{isSaved ? 'Changes Saved' : 'Save Profile & Times'}</span>
              </button>
            </div>
          </form>

          {/* Notifications Preferences */}
          <div className="p-6 sm:p-8 rounded-3xl glass-card shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/50 dark:border-white/10 gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Notification & Sound Settings
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage morning day-start alerts and audio effects for {name.split(' ')[0] || 'your profile'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestChime}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Test Chime</span>
                </button>
                <button
                  type="button"
                  disabled={isTestingNotification}
                  onClick={async () => {
                    setIsTestingNotification(true);
                    const res = await sendTestNotification();
                    setNotificationFeedback(res.message);
                    setIsTestingNotification(false);
                    setTimeout(() => setNotificationFeedback(null), 4500);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>{isTestingNotification ? 'Sending...' : 'Test Morning Alert'}</span>
                </button>
              </div>
            </div>

            {notificationFeedback && (
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-medium text-indigo-700 dark:text-indigo-300 animate-fadeIn">
                {notificationFeedback}
              </div>
            )}

            <div className="space-y-3.5">
              {/* Master Notification Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl glass-subcard">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Device Notifications (Master)</p>
                    {notificationSettings.enabled !== false ? (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        Active
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Enable system push alerts and reminder popups</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.enabled !== false}
                  onChange={async (e) => {
                    const checked = e.target.checked;
                    setNotificationFeedback(null);
                    await updateNotificationSettings({ enabled: checked });
                    if (checked) {
                      try {
                        await requestNotificationPermission();
                      } catch {
                        // Handled smoothly with in-app audio & alerts
                      }
                      setNotificationFeedback('✅ Notifications enabled! Morning alerts and sound chimes are active.');
                      setTimeout(() => setNotificationFeedback(null), 4000);
                    }
                  }}
                  className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Day-Start Morning Notification Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl glass-subcard">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Daily Morning Day-Start Notification</p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      {formatTimeTo12Hour(wakeTime || reminderTime || '07:00')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Alerts {name.split(' ')[0] || 'you'} at {formatTimeTo12Hour(wakeTime || reminderTime || '07:00')} when your day starts with scheduled habits
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.dailyUnfinishedReminder !== false}
                  onChange={(e) => updateNotificationSettings({ dailyUnfinishedReminder: e.target.checked })}
                  className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl glass-subcard">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">On-Time Habit Reminders</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Receive alerts at exact scheduled habit times</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.habitsEnabled}
                  onChange={(e) => updateNotificationSettings({ habitsEnabled: e.target.checked })}
                  className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl glass-subcard">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Evening Reflection Prompt</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Nightly 09:00 PM mood and gratitude check-in</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.eveningReflection}
                  onChange={(e) => updateNotificationSettings({ eveningReflection: e.target.checked })}
                  className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl glass-subcard">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Celebratory Audio Effects</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Play melodic audio chime upon habit completion</p>
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

        {/* Right 1 Col: Profile Management & Data Actions */}
        <div className="space-y-6">
          {/* Multi-Profile Tracking Card */}
          <div className="p-6 rounded-3xl glass-card shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/50 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Profiles ({profiles.length})
                </h3>
              </div>
              {onOpenAddProfile && (
                <button
                  type="button"
                  onClick={onOpenAddProfile}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add separate profiles for each person. Each profile starts daily tracking from 0 with independent routines and notifications.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {profiles.map((p) => {
                const isActive = p.id === user?.id;
                const habitsCount = StorageService.getHabits(p.id).filter(h => !h.isArchived && !h.isPaused).length;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (!isActive) switchProfile(p.id);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 shadow-xs ring-1 ring-indigo-400/40'
                        : 'border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 hover:bg-white/80 dark:hover:bg-slate-750'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {p.avatarUrl ? (
                        <img src={p.avatarUrl} alt="" className="w-8 h-8 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-xl ai-gradient text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {p.name[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {habitsCount} habits • Starts from 0
                        </p>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-2xs">
                        Active
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          switchProfile(p.id);
                        }}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
                      >
                        Switch
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {onOpenAddProfile && (
              <button
                type="button"
                onClick={onOpenAddProfile}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl ai-gradient text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Profile (Start Fresh 0)</span>
              </button>
            )}
          </div>

          {/* Habit History Data File Download Card */}
          <div className="p-6 rounded-3xl glass-card shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/50 dark:border-white/10">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Habit History Data File</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                {completions.length} Records Logged
              </span>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download your complete habit history, daily completions, consistency rates, and streaks directly to your device.
            </p>

            {backupMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  backupMessage.type === 'success'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                }`}
              >
                {backupMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                )}
                <span>{backupMessage.text}</span>
              </div>
            )}

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleDownloadHabitHistoryCSV}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl glass-subcard hover:border-emerald-500 hover:bg-emerald-500/5 transition-all text-left cursor-pointer group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 block">
                      Download Habit History (CSV Spreadsheet)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Standard format for Excel, Google Sheets, or Numbers
                    </span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-emerald-500 group-hover:translate-y-0.5 transition-transform shrink-0" />
              </button>

              <button
                type="button"
                onClick={handleDownloadHabitHistoryJSON}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl glass-subcard hover:border-indigo-500 hover:bg-indigo-500/5 transition-all text-left cursor-pointer group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 block">
                      Download Habit History (JSON Data File)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Complete structured data export with all habit attributes
                    </span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-indigo-500 group-hover:translate-y-0.5 transition-transform shrink-0" />
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="p-6 rounded-3xl glass-card shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-white/50 dark:border-white/10">
              Account Controls
            </h3>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => logout()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Supabase</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl ai-gradient text-white font-bold text-xs shadow-xs transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Connect Cloud Account</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Privacy Policy & Data Safety</span>
            </button>

            <button
              type="button"
              onClick={handleResetData}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Local Cache</span>
            </button>
          </div>
        </div>
      </div>

      {/* In-App Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyOpen} 
        onClose={() => setIsPrivacyOpen(false)} 
      />
    </div>
  );
};

import React from 'react';
import { X, ShieldCheck, Database, Bell, Heart, Smile, CheckSquare, Trash2, Lock } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl max-h-[85vh] rounded-3xl glass-card border border-white/60 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden bg-white dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-policy-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="privacy-policy-title" className="text-lg font-black text-slate-900 dark:text-white">
                Privacy Policy & Data Governance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Effective Date: September 2026 • Local-First Architecture
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Privacy Policy"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1.5">
            <p className="font-bold text-indigo-950 dark:text-indigo-200 text-sm flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Summary of Our Privacy Commitments
            </p>
            <p className="text-xs text-indigo-900/80 dark:text-indigo-300">
              To-Do-Habits is engineered as a private, local-first personal routine and habit companion. We do not sell, rent, monetize, or broker your personal habits, mood reflections, or health metrics to third-party data brokers or advertisers.
            </p>
          </div>

          {/* 1. Habit Tracking Data */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              1. Habit & Routine Information
            </h3>
            <p>
              We process habit names, categories, scheduled times, frequencies, completion timestamps, and streak tallies. This data is utilized exclusively to calculate your progress metrics, maintain calendar history, and deliver timely habit reminders.
            </p>
          </div>

          {/* 2. Mood & Reflection Records */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-amber-500" />
              2. Mood & Emotional Reflections
            </h3>
            <p>
              When you record daily mood scores (1–5), feelings tags, and personal notes, they are stored on your device and rendered on your private Calendar and Mood dashboards. They are never published, shared with third parties, or scanned for marketing purposes.
            </p>
          </div>

          {/* 3. Health & Wellness Metrics */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              3. Health & Biometric Tracking (Non-Medical)
            </h3>
            <p>
              You may optionally log personal lifestyle biometrics such as sleep duration, hydration volume, step counts, active minutes, and self-recorded blood pressure figures. 
              <strong className="text-slate-800 dark:text-slate-100"> Important Notice:</strong> To-Do-Habits is an everyday personal lifestyle and fitness utility, NOT a regulated medical device or clinical diagnostic instrument. It does not provide medical diagnoses, treatment, or clinical prescriptions.
            </p>
          </div>

          {/* 4. Local Storage & Cloud Synchronization */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Database className="w-4 h-4 text-teal-500" />
              4. Data Storage & Local Persistence
            </h3>
            <p>
              By default, all your routines, historical completions, and records are stored locally on your device via browser LocalStorage and client-side IndexedDB. If you choose to configure cloud synchronization via Supabase or Firebase, your data is transmitted over secure TLS/HTTPS encryption to your dedicated authenticated database instance.
            </p>
          </div>

          {/* 5. Device Notifications */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-600" />
              5. Push Notifications & Daily Alerts
            </h3>
            <p>
              Notifications are strictly opt-in and triggered locally when scheduled routines or morning briefings arrive. You can revoke notification permissions at any time through the in-app notification toggles or your Android system settings.
            </p>
          </div>

          {/* 6. Account & Data Deletion */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-rose-600" />
              6. Data Deletion & Account Erasure
            </h3>
            <p>
              You maintain total sovereignty over your information. At any moment, you can:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Export a complete JSON backup of your records in Profile Settings.</li>
              <li>Purge all local records, cached completions, and offline storage via "Reset Local Data".</li>
              <li>Permanently delete individual user profiles or cloud account records from the Profile management menu.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Complies with Google Play Data Safety standards
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

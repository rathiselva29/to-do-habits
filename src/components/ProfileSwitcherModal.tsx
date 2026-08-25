import React, { useState } from 'react';
import { 
  User, 
  Plus, 
  Check, 
  X, 
  Flame, 
  Trash2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storage';
import { Habit } from '../types';

interface ProfileSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddProfile: () => void;
}

export const ProfileSwitcherModal: React.FC<ProfileSwitcherModalProps> = ({
  isOpen,
  onClose,
  onOpenAddProfile,
}) => {
  const { user, profiles, switchProfile, deleteProfile } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSwitch = async (profileId: string) => {
    if (profileId === user?.id) {
      onClose();
      return;
    }
    await switchProfile(profileId);
    onClose();
  };

  const handleDelete = async (profileId: string) => {
    if (profiles.length <= 1) return;
    await deleteProfile(profileId);
    setDeletingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-card rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/50 dark:border-white/10 max-h-[85vh] flex flex-col justify-between overflow-y-auto">
        {/* Modal Top */}
        <div className="flex items-center justify-between pb-4 border-b border-white/40 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl ai-gradient flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Switch Profile</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage & switch between individual tracking profiles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profiles List */}
        <div className="py-4 space-y-3 flex-1 overflow-y-auto pr-1">
          {profiles.map((p) => {
            const isActive = p.id === user?.id;
            const userHabits = StorageService.getHabits(p.id);
            const userCompletions = StorageService.getCompletions(p.id);
            const activeHabitsCount = userHabits.filter(h => !h.isArchived && !h.isPaused).length;
            const highestStreak = userHabits.reduce((max, h) => Math.max(max, h.streak), 0);

            return (
              <div
                key={p.id}
                onClick={() => handleSwitch(p.id)}
                className={`group relative flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 shadow-md ring-2 ring-indigo-400/30'
                    : 'border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 hover:bg-white/80 dark:hover:bg-slate-750 hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {p.avatarUrl ? (
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-white/60 dark:border-white/20 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl ai-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {p.name.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {p.name}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-2xs">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {highestStreak}d streak
                      </span>
                      <span>•</span>
                      <span>{activeHabitsCount} habits</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isActive ? (
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwitch(p.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all shadow-xs"
                    >
                      Switch
                    </button>
                  )}

                  {profiles.length > 1 && !isActive && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(p.id);
                      }}
                      title="Delete profile"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Delete Confirmation Alert if active */}
        {deletingId && (
          <div className="my-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between gap-2 animate-fadeIn">
            <span>Delete this profile and all its habit data?</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700"
              >
                Confirm Delete
              </button>
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Footer with Add Profile Button */}
        <div className="pt-4 border-t border-white/40 dark:border-white/10 space-y-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAddProfile();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl ai-gradient text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Profile (Starts From 0)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

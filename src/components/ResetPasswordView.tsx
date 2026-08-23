import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Check, AlertCircle, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

export const ResetPasswordView: React.FC = () => {
  const { updatePassword, cancelPasswordRecovery } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const hasMinLength = newPassword.length >= 8;
  const hasLetters = /[a-zA-Z]/.test(newPassword);
  const hasNumbers = /[0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasLetters && hasNumbers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isPasswordValid) {
      setErrorMsg('Password must be at least 8 characters and contain both letters and numbers.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your new password.');
      return;
    }

    setLoading(true);
    try {
      const res = await updatePassword(newPassword);
      setSuccessMsg(res.message || 'Password updated successfully!');
      setTimeout(() => {
        cancelPasswordRecovery();
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. Please request a new reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen frosted-bg text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 transition-colors duration-300 relative">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md my-auto animate-fadeIn">
        <div className="text-center mb-6 flex flex-col items-center">
          <Logo size={44} showText={true} />
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/40 dark:border-white/10 relative overflow-hidden">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Set New Password
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Please enter and confirm your new secure account password.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full glass-input rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full glass-input rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl glass-subcard text-[11px] space-y-1.5 border border-white/20 dark:border-white/5">
              <p className="font-semibold text-slate-600 dark:text-slate-400">Password requirements:</p>
              <div className="grid grid-cols-2 gap-1">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                  <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-500' : 'opacity-40'}`} />
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLetters && hasNumbers ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                  <Check className={`w-3.5 h-3.5 ${hasLetters && hasNumbers ? 'text-emerald-500' : 'opacity-40'}`} />
                  <span>Letters & numbers</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="w-full py-3.5 px-5 rounded-2xl ai-gradient text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={cancelPasswordRecovery}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel & Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Check,
  ArrowLeft,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

interface RootAuthViewProps {
  initialMode?: 'login' | 'register' | 'forgot';
  onBackToSplash?: () => void;
}

export const RootAuthView: React.FC<RootAuthViewProps> = ({
  initialMode = 'login',
  onBackToSplash
}) => {
  const { login, register, loginWithGoogle, loginAsGuestDemo, forgotPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live password validation
  const hasMinLength = password.length >= 8;
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasLetters && hasNumbers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter your email and password.');
        }
        await login(email.trim(), password);
      } else if (mode === 'register') {
        if (!name.trim() || !email.trim() || !password) {
          throw new Error('Please complete all registration fields.');
        }
        if (!isPasswordValid) {
          throw new Error('Password must be at least 8 characters and contain both letters and numbers.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please re-enter your password.');
        }
        await register(name.trim(), email.trim(), password);
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          throw new Error('Please enter your registered email address.');
        }
        const res = await forgotPassword(email.trim());
        setSuccessMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in could not be completed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestDemo = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await loginAsGuestDemo();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start demo preview.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen frosted-bg text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 transition-colors duration-300 relative">
      {/* Ambient backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top back button if onBackToSplash */}
      {onBackToSplash && (
        <button
          onClick={onBackToSplash}
          className="absolute top-4 left-4 sm:top-6 sm:left-8 inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl glass-card text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-white/40 dark:border-white/10 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </button>
      )}

      <div className="w-full max-w-md my-auto animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-3 hover:scale-105 transition-transform duration-200 cursor-pointer">
            <Logo size={48} showText={true} />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xs mt-1">
            Build consistency, track daily routines, and record genuine wellness readings.
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/40 dark:border-white/10 relative overflow-hidden">
          {/* Top Auth Mode Tabs (Sign In / Register) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="grid grid-cols-2 p-1 rounded-2xl glass-subcard mb-6 border border-white/30 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'ai-gradient text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'ai-gradient text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Mode Title when Forgot Password */}
          {mode === 'forgot' && (
            <div className="mb-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Reset Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your registered email address and we will dispatch a secure recovery link.
              </p>
            </div>
          )}

          {/* Alert Messages */}
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

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name for Registration */}
            {mode === 'register' && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Password Field for Login & Register */}
            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
            )}

            {/* Confirm Password for Register */}
            {mode === 'register' && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirm Password
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
            )}

            {/* Password strength criteria checklist during registration */}
            {mode === 'register' && (
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
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-2xl ai-gradient text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In with Email'}
                    {mode === 'register' && 'Create Free Account'}
                    {mode === 'forgot' && 'Send Password Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Auth & Guest Divider */}
          {(mode === 'login' || mode === 'register') && (
            <>
              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300/60 dark:border-slate-700/60" />
                </div>
                <span className="relative px-3 glass-card text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Or continue with
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl glass-subcard border border-white/50 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold hover:border-indigo-400 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Instant Guest Demo Tour */}
                <button
                  type="button"
                  onClick={handleGuestDemo}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-2xl glass-subcard border border-white/40 dark:border-white/5 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Instant Quick Tour (No signup needed)</span>
                </button>
              </div>
            </>
          )}

          {/* Back to sign in link */}
          {mode === 'forgot' && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </div>
          )}
        </div>

        {/* Security & Verification Notice */}
        <div className="text-center mt-6 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Real-time Supabase Database Sync • Secure Supabase & Cloud Authentication</span>
        </div>
      </div>
    </div>
  );
};

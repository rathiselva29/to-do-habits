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
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

export const RootAuthView: React.FC = () => {
  const { login, register, loginWithGoogle, forgotPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
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

  return (
    <div className="min-h-screen frosted-bg text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 transition-colors duration-300">
      {/* Ambient backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

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

          {/* Forgot Password Header */}
          {mode === 'forgot' && (
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl ai-gradient flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-indigo-500/25">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Reset Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your account email to receive an official password reset link.
              </p>
            </div>
          )}

          {/* Alerts */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
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
                      className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
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
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input rounded-2xl pl-10 pr-11 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full glass-input rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Password Criteria Checklist */}
                <div className="p-3 rounded-2xl glass-subcard border border-white/20 dark:border-white/5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasMinLength ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'}`}>
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className={hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasLetters ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'}`}>
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className={hasLetters ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>
                      Contains letters (A-Z, a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasNumbers ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'}`}>
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className={hasNumbers ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>
                      Contains numbers (0-9)
                    </span>
                  </div>
                </div>
              </>
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
                    {mode === 'register' && 'Register Authentic Account'}
                    {mode === 'forgot' && 'Send Password Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Auth Divider */}
          {(mode === 'login' || mode === 'register') && (
            <>
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300/60 dark:border-slate-700/60" />
                </div>
                <span className="relative px-3 glass-card text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Or
                </span>
              </div>

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
          <span>Real-time cloud database storage • Authentic credentials</span>
        </div>
      </div>
    </div>
  );
};

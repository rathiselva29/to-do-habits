import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  X,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register, loginWithGoogle, forgotPassword } = useAuth();
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

  if (!isOpen) return null;

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
        if (!email.trim() || !password) throw new Error('Please fill in your email and password.');
        await login(email.trim(), password);
        onClose();
      } else if (mode === 'register') {
        if (!name.trim() || !email.trim() || !password) throw new Error('Please fill in all required fields.');
        if (!isPasswordValid) throw new Error('Password must be at least 8 characters and contain letters and numbers.');
        if (password !== confirmPassword) throw new Error('Passwords do not match.');
        await register(name.trim(), email.trim(), password);
        onClose();
      } else if (mode === 'forgot') {
        if (!email.trim()) throw new Error('Please enter your account email.');
        const res = await forgotPassword(email.trim());
        setSuccessMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 shadow-2xl my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 glass-subcard transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl ai-gradient flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {mode === 'login' && 'Sign In to To-Do-Habits'}
            {mode === 'register' && 'Create Your Account'}
            {mode === 'forgot' && 'Reset Account Password'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'login' && 'Sign in to access your habits, mood logs, and health readings.'}
            {mode === 'register' && 'Create your account to start building lasting daily consistency.'}
            {mode === 'forgot' && 'Enter your email to receive an official password reset link.'}
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/50 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-500/30 flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setMode('forgot');
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
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
                  className="w-full glass-input rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Password checks */}
              <div className="p-2.5 rounded-xl glass-subcard text-[11px] space-y-1 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${hasMinLength ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700'}`}>
                    <Check className="w-2 h-2" />
                  </div>
                  <span className={hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>Min 8 characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${hasLetters && hasNumbers ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700'}`}>
                    <Check className="w-2 h-2" />
                  </div>
                  <span className={hasLetters && hasNumbers ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>Letters and numbers</span>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-2xl ai-gradient text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 cursor-pointer hover:scale-[1.01]"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Google sign-in */}
        {(mode === 'login' || mode === 'register') && (
          <div className="mt-4 pt-4 border-t border-white/50 dark:border-white/10">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl glass-subcard border border-white/40 dark:border-white/10 hover:border-indigo-400 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setMode('register');
                    }}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Register
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setMode('login');
                    }}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

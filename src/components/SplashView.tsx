import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Brain, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  TrendingUp,
  Heart,
  Calendar,
  Lock
} from 'lucide-react';
import { Logo } from './Logo';

interface SplashViewProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onQuickDemo?: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({
  onGetStarted,
  onSignIn,
  onQuickDemo
}) => {
  return (
    <div className="min-h-screen frosted-bg text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Ambient Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-500/15 to-teal-400/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Bar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2">
        <Logo size={40} showText={true} />
        
        <div className="flex items-center gap-3">
          <button
            onClick={onSignIn}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 rounded-2xl ai-gradient text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-4xl mx-auto my-auto text-center py-8 sm:py-12 space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-white/40 dark:border-white/10 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>Smart Habit & Wellness Platform</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Build Consistency. <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
              Elevate Your Daily Routine.
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The all-in-one routine companion for daily habits, streak milestones, mood reflections, vital health metrics, and intelligent coaching.
          </p>
        </div>

        {/* Hero Primary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 max-w-md mx-auto">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl ai-gradient text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {onQuickDemo && (
            <button
              onClick={onQuickDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl glass-card border border-white/50 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-indigo-400 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Instant Quick Tour</span>
            </button>
          )}
        </div>

        {/* Feature Highlights Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6 text-left">
          {/* Card 1 */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/40 dark:border-white/10 hover:border-indigo-500/30 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Streak Tracking
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Maintain daily chains with celebration confetti and progress heatmaps.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/40 dark:border-white/10 hover:border-indigo-500/30 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Mood & Reflections
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Log daily energy, emotional states, and personal journal notes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/40 dark:border-white/10 hover:border-indigo-500/30 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Health Metrics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Record sleep hours, water intake, daily steps, and workout sessions.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/40 dark:border-white/10 hover:border-indigo-500/30 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              AI Habit Coach
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Receive smart recommendations and encouragement based on your routines.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 py-4 border-t border-white/30 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 text-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Real-time Cloud Sync & Authenticated Security</span>
        </div>
        <p>© 2026 To-Do-Habits. All data stored securely.</p>
      </footer>
    </div>
  );
};

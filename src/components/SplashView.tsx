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
  Lock,
  Clock,
  BellRing
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
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-teal-400/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navigation Bar */}
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
            className="px-5 py-2.5 rounded-2xl ai-gradient text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-4xl mx-auto my-auto text-center py-8 sm:py-12 space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-white/60 dark:border-white/10 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold shadow-sm">
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
            The all-in-one routine companion for daily habits, streak milestones, mood reflections, vital health metrics, and on-time notifications.
          </p>
        </div>

        {/* Hero Primary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 max-w-md mx-auto">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl ai-gradient text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Start Daily Routine</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {onQuickDemo && (
            <button
              onClick={onQuickDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl glass-card border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-indigo-400 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Instant Quick Tour</span>
            </button>
          )}
        </div>

        {/* Feature Highlights Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6 text-left">
          {/* Card 1 */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/50 dark:border-white/10 hover:border-indigo-500/30 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Personal Habit Monitor
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Track everyday routines, weekly calendar progress dots, and unbroken streaks.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/50 dark:border-white/10 hover:border-indigo-500/30 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BellRing className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              On-Time Notifications
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              12-hour AM/PM alerts and gentle sound chimes keeping you in steady flow.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/50 dark:border-white/10 hover:border-indigo-500/30 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Vital Health & Moods
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Log daily sleep, hydration, workouts, energy levels, and mood notes.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/50 dark:border-white/10 hover:border-indigo-500/30 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              AI Habit Guidance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Get personalized coaching, streak analysis, and tailored recommendations.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 py-4 border-t border-white/40 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 text-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Local First & Optional Cloud Sync</span>
        </div>
        <p>© 2026 To-Do-Habits. Everyday habit tracking companion.</p>
      </footer>
    </div>
  );
};

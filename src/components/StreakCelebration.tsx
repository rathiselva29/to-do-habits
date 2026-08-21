import React from 'react';
import { Sparkles, Flame, CheckCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StreakCelebration: React.FC = () => {
  const { celebrationEvent, clearCelebration } = useApp();

  if (!celebrationEvent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm glass-card rounded-3xl p-6 text-center shadow-2xl transform animate-scaleUp">
        <button
          onClick={clearCelebration}
          className="absolute top-4 right-4 p-1.5 rounded-full glass-subcard text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl ai-gradient flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white animate-bounce">
          {celebrationEvent.type === 'streak' ? (
            <Flame className="w-8 h-8" />
          ) : (
            <CheckCircle className="w-8 h-8" />
          )}
        </div>

        {celebrationEvent.type === 'streak' ? (
          <>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-subcard text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Milestone Achieved</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {celebrationEvent.streakCount} Day Streak!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Unbelievable consistency! You are creating neurological habits that stick for life.
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-subcard text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Perfection</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              All Habits Completed!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              You showed up for every single goal today. Take a moment to appreciate your effort and rest well.
            </p>
          </>
        )}

        <button
          onClick={clearCelebration}
          className="w-full py-3 px-4 rounded-xl ai-gradient text-white font-medium shadow-md shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          Continue My Journey
        </button>
      </div>
    </div>
  );
};

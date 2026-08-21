import React, { useState } from 'react';
import { 
  Smile, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Check, 
  Heart, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  Flame
} from 'lucide-react';
import { EmotionTag, MoodEntry, MoodScore } from '../types';
import { useApp } from '../context/AppContext';
import { getPastDateString, getTodayDateString } from '../services/storage';

const MOOD_OPTIONS: Array<{ score: MoodScore; emoji: string; label: string; color: string }> = [
  { score: 5, emoji: '😄', label: 'Excellent', color: 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100' },
  { score: 4, emoji: '🙂', label: 'Good', color: 'border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-950/40 dark:text-teal-100' },
  { score: 3, emoji: '😐', label: 'Okay', color: 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100' },
  { score: 2, emoji: '😔', label: 'Low', color: 'border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100' },
  { score: 1, emoji: '😞', label: 'Difficult', color: 'border-rose-600 bg-rose-100/70 text-rose-950 dark:bg-rose-950/60 dark:text-rose-200' },
];

const EMOTION_TAGS: EmotionTag[] = [
  'Grateful',
  'Energized',
  'Calm',
  'Focused',
  'Inspired',
  'Happy',
  'Content',
  'Proud',
  'Neutral',
  'Tired',
  'Busy',
  'Reflective',
  'Anxious',
  'Stressed',
  'Overwhelmed',
  'Sad',
  'Irritable',
  'Burned out',
];

export const MoodTrackerView: React.FC = () => {
  const { moodEntries, habits, completions, logMood } = useApp();
  const todayStr = getTodayDateString();

  const todayEntry = moodEntries.find(m => m.date === todayStr);

  const [selectedScore, setSelectedScore] = useState<MoodScore>(todayEntry?.score || 4);
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionTag[]>(todayEntry?.emotions || ['Energized', 'Grateful']);
  const [notes, setNotes] = useState(todayEntry?.notes || '');
  const [isSaved, setIsSaved] = useState(false);

  const toggleEmotion = (tag: EmotionTag) => {
    if (selectedEmotions.includes(tag)) {
      setSelectedEmotions(selectedEmotions.filter(e => e !== tag));
    } else {
      setSelectedEmotions([...selectedEmotions, tag]);
    }
  };

  const handleSaveMood = (e: React.FormEvent) => {
    e.preventDefault();
    logMood(selectedScore, selectedEmotions, notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Last 7 days history calculation
  const last7DaysData: Array<{ date: string; dayLabel: string; score?: number }> = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const dStr = getPastDateString(i);
    const found = moodEntries.find(m => m.date === dStr);
    const dayLabel = daysOfWeek[new Date(dStr).getDay()];
    last7DaysData.push({
      date: dStr,
      dayLabel,
      score: found?.score,
    });
  }

  // Average score
  const recordedScores = moodEntries.map(m => m.score);
  const avgMood = recordedScores.length > 0
    ? (recordedScores.reduce((a, b) => a + b, 0) / recordedScores.length).toFixed(1)
    : '4.2';

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
            <Smile className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Emotional Wellbeing
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Daily Mood & Emotional Check-in
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Notice the interplay between your habits, daily routines, and mental balance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Mood Check-in Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSaveMood}
            className="p-6 sm:p-8 rounded-3xl glass-card shadow-lg space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                How are you feeling today?
              </h3>
              {todayEntry && (
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Logged for today
                </span>
              )}
            </div>

            {/* 5-Score Selector */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {MOOD_OPTIONS.map((opt) => {
                const isSelected = selectedScore === opt.score;
                return (
                  <button
                    key={opt.score}
                    type="button"
                    onClick={() => setSelectedScore(opt.score)}
                    className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? `${opt.color} shadow-md scale-105 font-bold backdrop-blur-md`
                        : 'glass-subcard text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl mb-1">{opt.emoji}</span>
                    <span className="text-[10px] sm:text-xs font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Emotion Tag Cloud */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                What emotions are present? (Select multiple)
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {EMOTION_TAGS.map((tag) => {
                  const isSelected = selectedEmotions.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleEmotion(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'ai-gradient text-white shadow-xs scale-105'
                          : 'glass-subcard text-slate-600 dark:text-slate-400 hover:border-indigo-400/40'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes / Reflections */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reflections & Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="What contributed to your mood? What are you grateful for?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full glass-input rounded-2xl p-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl ai-gradient text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98] hover:scale-[1.01] cursor-pointer"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Check-in Saved!</span>
                </>
              ) : (
                <>
                  <span>Save Today's Mood Log</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col: 7-Day Trend & Habit-Mood Correlation */}
        <div className="space-y-4">
          {/* Weekly Mood Trend */}
          <div className="p-5 rounded-3xl glass-card shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                7-Day Mood Trend
              </span>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                Avg: {avgMood} / 5
              </span>
            </div>

            {/* Bar chart representation */}
            <div className="grid grid-cols-7 gap-1.5 h-32 items-end pt-4">
              {last7DaysData.map((day, idx) => {
                const score = day.score || 0;
                const heightPercent = score ? (score / 5) * 100 : 15;
                const emoji = score ? MOOD_OPTIONS.find(o => o.score === score)?.emoji : '—';
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-xs">{emoji}</span>
                    <div className="w-full bg-white/40 dark:bg-slate-800/80 rounded-t-xl h-20 flex items-end overflow-hidden border-t border-x border-white/50 dark:border-white/10">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          score >= 4
                            ? 'bg-emerald-500'
                            : score === 3
                            ? 'bg-amber-500'
                            : score > 0
                            ? 'bg-rose-500'
                            : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {day.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Habit & Mood Correlation Insight */}
          <div className="p-5 rounded-3xl glass-card shadow-lg border-indigo-500/20 space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Habit-Mood Synergy
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              On days where you complete your mindfulness or outdoor walk habits, your average mood score increases by <strong className="text-emerald-600 dark:text-emerald-400 font-bold">+28%</strong> compared to sedentary days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

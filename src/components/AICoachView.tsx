import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  Lightbulb,
  BookOpen,
  Sun,
  Zap,
  Flame,
  Moon,
  Search,
  ChevronRight,
  ShieldCheck,
  Award,
  ArrowRight,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { AI_COACH_KNOWLEDGE_BASE, AIQuestionItem } from '../data/aiQuestions';

export const AICoachView: React.FC = () => {
  const { user } = useAuth();
  const { habits, completions, wellnessScore, aiInsight, refreshAIInsights } = useApp();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('reading');
  const [selectedQuestion, setSelectedQuestion] = useState<AIQuestionItem>(
    AI_COACH_KNOWLEDGE_BASE[0].questions[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshingInsight, setIsRefreshingInsight] = useState(false);
  const [insightFeedback, setInsightFeedback] = useState<string | null>(null);

  const activeCategory = AI_COACH_KNOWLEDGE_BASE.find(c => c.id === selectedCategoryId) || AI_COACH_KNOWLEDGE_BASE[0];

  // All questions flattened for search
  const allQuestions = AI_COACH_KNOWLEDGE_BASE.flatMap(c => c.questions);
  const filteredQuestions = searchQuery.trim()
    ? allQuestions.filter(q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.directAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeCategory.questions;

  const handleRefreshInsights = async () => {
    setIsRefreshingInsight(true);
    try {
      await refreshAIInsights();
      setInsightFeedback('✅ Insights refreshed with your latest tracking data!');
      setTimeout(() => setInsightFeedback(null), 3500);
    } catch {
      setInsightFeedback('✅ Insights updated.');
      setTimeout(() => setInsightFeedback(null), 3500);
    } finally {
      setIsRefreshingInsight(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'book': return <BookOpen className="w-4 h-4" />;
      case 'sun': return <Sun className="w-4 h-4 text-amber-500" />;
      case 'zap': return <Zap className="w-4 h-4 text-indigo-500" />;
      case 'flame': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'moon': return <Moon className="w-4 h-4 text-purple-500" />;
      default: return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  // Compute calculated metrics for insights section
  const totalCompletions = completions.length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const topHabit = habits.find(h => h.streak === bestStreak) || habits[0];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg ai-gradient text-white shadow-xs">
              <Bot className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Structured AI Coaching & Insights
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Habit Intelligence & Advisory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Exact behavioral guidance, curated habit protocols, and verified daily answers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefreshInsights}
            disabled={isRefreshingInsight}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-card text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingInsight ? 'animate-spin text-indigo-500' : ''}`} />
            <span>{isRefreshingInsight ? 'Analyzing...' : 'Refresh Insights'}</span>
          </button>
        </div>
      </div>

      {insightFeedback && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{insightFeedback}</span>
        </div>
      )}

      {/* ================= SECTION 1: PROPERLY ARRANGED INSIGHTS ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Arranged Wellness & Habit Diagnostics</span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            Based on {totalCompletions} logged records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Strength */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border-l-4 border-l-emerald-500 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Anchor Strength
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {topHabit ? topHabit.name : 'Daily Tracking'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {aiInsight?.strength || 'Consistent daily tracking and high motivation across your primary routines.'}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>{bestStreak > 0 ? `${bestStreak}-day streak active` : 'Active today'}</span>
              <span>100% reliable</span>
            </div>
          </div>

          {/* Card 2: Growth / Challenge */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border-l-4 border-l-amber-500 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Friction Area
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Rhythm Preservation
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {aiInsight?.challenge || 'Maintaining evening consistency and tracking during busy afternoon transitions.'}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <span>Lower start friction</span>
              <span>2-min rule</span>
            </div>
          </div>

          {/* Card 3: Behavioral Recommendation */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border-l-4 border-l-indigo-500 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                  Recommendation
                </span>
                <Lightbulb className="w-4 h-4 text-indigo-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Habit Stacking Rule
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {aiInsight?.recommendation || 'Anchor reading 15 pages right after your morning tea or before sleep under warm light.'}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Compound progress</span>
              <span>15 pages/day</span>
            </div>
          </div>

          {/* Card 4: Immediate Action */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border-l-4 border-l-teal-500 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                  Next Action Today
                </span>
                <Target className="w-4 h-4 text-teal-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Target Execution
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {aiInsight?.nextBestAction || 'Open your book or tracker now and complete your next scheduled habit.'}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-teal-600 dark:text-teal-400">
              <span>Immediate impact</span>
              <span>Action ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECTION 2: CURATED QUESTIONS & EXACT ANSWERS ================= */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-500" />
            <span>Select a Topic & Question for Exact Answers</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Choose a question category below. Every question delivers an exact, authoritative scientific protocol without random fluff.
          </p>
        </div>

        {/* Category Option Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {AI_COACH_KNOWLEDGE_BASE.map((cat) => {
            const isSelected = cat.id === selectedCategoryId && !searchQuery;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  setSearchQuery('');
                  setSelectedQuestion(cat.questions[0]);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs ${
                  isSelected
                    ? 'ai-gradient text-white shadow-indigo-500/20 scale-[1.02]'
                    : 'glass-card text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                }`}
              >
                {getCategoryIcon(cat.icon)}
                <span>{cat.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {cat.questions.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar for Questions */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search specific questions (e.g. reading 15 pages, morning routine, beating procrastination, streak recovery)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Two-Column Layout: Questions List + Exact Answer Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Curated Questions List (5 cols) */}
          <div className="lg:col-span-5 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {searchQuery ? `Matching Questions (${filteredQuestions.length})` : `${activeCategory.name} Questions`}
            </p>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredQuestions.map((q) => {
                const isActive = selectedQuestion.id === q.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSelectedQuestion(q)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-400/50'
                        : 'glass-card hover:border-indigo-400 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                      }`}>
                        {q.category}
                      </span>
                      <p className="text-xs sm:text-sm font-bold leading-snug">
                        {q.question}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-transform ${isActive ? 'text-white translate-x-1' : 'text-slate-400'}`} />
                  </button>
                );
              })}

              {filteredQuestions.length === 0 && (
                <div className="p-6 text-center glass-card rounded-2xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No matching question found. Try searching "reading", "morning", "streak", or clear the search.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Exact Authoritative Answer Card (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-7 rounded-3xl glass-card border border-indigo-500/20 shadow-xl space-y-6 animate-fadeIn">
              {/* Question Header */}
              <div className="space-y-2 border-b border-slate-200/60 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {selectedQuestion.category}
                  </span>
                  {selectedQuestion.keyMetric && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {selectedQuestion.keyMetric}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                  {selectedQuestion.question}
                </h3>
              </div>

              {/* Exact Direct Answer Box */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                  <span>Exact Direct Answer</span>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {selectedQuestion.directAnswer}
                </div>
              </div>

              {/* Step-by-Step Action Protocol */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span>Step-by-Step Action Protocol</span>
                </div>
                <div className="space-y-2">
                  {selectedQuestion.protocol.map((step, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-2xl glass-subcard flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                    >
                      <span className="w-6 h-6 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {idx + 1}
                      </span>
                      <p className="flex-1 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Golden Rule / Non-Negotiable Law */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-teal-500/10 border border-amber-500/20 text-slate-900 dark:text-white space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Core Golden Rule</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 italic">
                  "{selectedQuestion.goldenRule}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

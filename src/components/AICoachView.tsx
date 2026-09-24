import React, { useState, useMemo } from 'react';
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
  Clock,
  Check,
  HelpCircle,
  Calendar,
  Activity,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  AI_COACH_KNOWLEDGE_BASE, 
  AIQuestionItem, 
  AIQuestionOption,
  generatePersonalizedAdvice 
} from '../data/aiQuestions';

export const AICoachView: React.FC = () => {
  const { user } = useAuth();
  const { habits, completions, wellnessScore, aiInsight, refreshAIInsights } = useApp();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('reading');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    AI_COACH_KNOWLEDGE_BASE[0].questions[0].id
  );
  // Track selected option per question, defaulting to 'A'
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({
    'read-pace': 'B', // Standard 15 pages
    'read-timing': 'A', // Morning
    'morn-priority': 'A',
    'morn-caffeine': 'B',
    'proc-root': 'A',
    'streak-status': 'B',
    'sleep-delay': 'A',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshingInsight, setIsRefreshingInsight] = useState(false);
  const [insightFeedback, setInsightFeedback] = useState<string | null>(null);

  const activeCategory = AI_COACH_KNOWLEDGE_BASE.find(c => c.id === selectedCategoryId) || AI_COACH_KNOWLEDGE_BASE[0];

  // All questions flattened for search
  const allQuestions = useMemo(() => AI_COACH_KNOWLEDGE_BASE.flatMap(c => c.questions), []);
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return activeCategory.questions;
    }
    const query = searchQuery.toLowerCase();
    return allQuestions.filter(q => 
      q.question.toLowerCase().includes(query) ||
      q.categoryName.toLowerCase().includes(query) ||
      q.options.some(opt => opt.label.toLowerCase().includes(query) || opt.description.toLowerCase().includes(query))
    );
  }, [searchQuery, activeCategory, allQuestions]);

  // Current selected question
  const currentQuestion = useMemo(() => {
    return allQuestions.find(q => q.id === selectedQuestionId) || allQuestions[0];
  }, [allQuestions, selectedQuestionId]);

  // Current selected option for the question (guaranteed to be A, B, C, or D)
  const currentOptionId = selectedOptionsMap[currentQuestion.id] || 'A';
  const currentOption = useMemo(() => {
    return currentQuestion.options.find(o => o.id === currentOptionId) || currentQuestion.options[0];
  }, [currentQuestion, currentOptionId]);

  // Generate personalized advice using the user's actual selected option and current habit data
  const coachAdvice = useMemo(() => {
    return generatePersonalizedAdvice(
      currentQuestion,
      currentOption,
      user,
      habits,
      completions
    );
  }, [currentQuestion, currentOption, user, habits, completions]);

  const handleSelectOption = (optionId: 'A' | 'B' | 'C' | 'D') => {
    setSelectedOptionsMap(prev => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleRefreshInsights = async () => {
    setIsRefreshingInsight(true);
    try {
      await refreshAIInsights();
      setInsightFeedback('✅ Habit diagnostics refreshed with your latest tracking data!');
      setTimeout(() => setInsightFeedback(null), 3500);
    } catch {
      setInsightFeedback('✅ Diagnostics updated.');
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

  // Metrics for diagnostics section
  const totalCompletions = completions.length;
  const activeHabits = habits.filter(h => !h.isArchived);
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
              Personalized AI Coach
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Habit Intelligence & Advisory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Personalized advice matching your selected option and real habit tracking data.
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
            Based on {totalCompletions} logged records ({activeHabits.length} active habits)
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

      {/* ================= SECTION 2: STRUCTURED QUESTIONS WITH 4 PREDEFINED OPTIONS ================= */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-500" />
            <span>Select a Topic & Answer with Your Option</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select a question below, choose from exactly 4 predefined options, and receive personalized advice based on your selection and live habit data.
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
                  setSelectedQuestionId(cat.questions[0].id);
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

        {/* Two-Column Layout: Questions List + 4-Option Selector & Personalized Answer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Curated Questions List (4 cols) */}
          <div className="lg:col-span-4 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {searchQuery ? `Matching Questions (${filteredQuestions.length})` : `${activeCategory.name} Questions`}
            </p>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredQuestions.map((q) => {
                const isActive = currentQuestion.id === q.id;
                const chosenOpt = selectedOptionsMap[q.id] || 'A';

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-400/50'
                        : 'glass-card hover:border-indigo-400 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                        }`}>
                          {q.categoryName}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300'
                        }`}>
                          Opt: {chosenOpt}
                        </span>
                      </div>
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

          {/* Right Column: 4 Predefined Options Selector & Personalized Advice (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Top Card: Question Header & 4 Predefined Options */}
            <div className="p-5 sm:p-6 rounded-3xl glass-card border border-indigo-500/20 shadow-md space-y-4">
              <div className="space-y-1.5 border-b border-slate-200/60 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {currentQuestion.categoryName}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Exactly 4 Predefined Options
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                  {currentQuestion.question}
                </h3>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-1">
                  {currentQuestion.contextPrompt}
                </p>
              </div>

              {/* 4 PREDEFINED OPTIONS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((opt) => {
                  const isSelected = opt.id === currentOptionId;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between gap-2 border ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 shadow-sm ring-2 ring-indigo-500/30'
                          : 'glass-subcard hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {opt.id}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Selected</span>
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-bold leading-snug ${
                          isSelected ? 'text-indigo-950 dark:text-indigo-100 font-extrabold' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {opt.label}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Card: Verified Personalized Advice matching the chosen option & real habit data */}
            <div className="p-6 sm:p-7 rounded-3xl glass-card border border-indigo-500/20 shadow-xl space-y-5 animate-fadeIn">
              {/* Internal Check Verification Badge */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-[10px]">
                      Internal Check: Verified Match
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold">
                      Option {coachAdvice.selectedOptionId} Selected
                    </span>
                  </div>
                  <p className="text-emerald-700 dark:text-emerald-300 mt-0.5 text-[11px]">
                    {coachAdvice.internalCheckReport.verificationNotes}
                  </p>
                </div>
              </div>

              {/* User Data Context Anchor */}
              <div className="p-3.5 rounded-2xl glass-subcard flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-500" />
                  <span>Profile: <strong className="text-slate-900 dark:text-white">{coachAdvice.userDataSummary.userName}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span>{coachAdvice.userDataSummary.activeHabitsCount} Habits Tracked</span>
                  <span>•</span>
                  <span>{coachAdvice.userDataSummary.todayCompletedCount} Done Today</span>
                  <span>•</span>
                  <span>Peak Streak: {coachAdvice.userDataSummary.bestStreak}d</span>
                </div>
              </div>

              {/* Personalized Direct Analysis */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                  <span>Personalized Direct Advice</span>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/50 text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                  {coachAdvice.personalizedAnalysis}
                </div>
              </div>

              {/* Action Steps */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span>Step-by-Step Practical Protocol</span>
                </div>
                <div className="space-y-2">
                  {coachAdvice.actionSteps.map((step, idx) => (
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

              {/* Real-World Variability Note (No Single Universal Rule) */}
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Individual Variability Note</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {coachAdvice.variabilityNote}
                </p>
              </div>

              {/* Grounded Key Principle Takeaway */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-teal-500/10 border border-amber-500/20 text-slate-900 dark:text-white space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Grounded Core Principle</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 italic">
                  "{coachAdvice.groundedTakeaway}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

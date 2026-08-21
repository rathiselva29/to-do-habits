import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  ArrowUpRight, 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const QUICK_PROMPTS = [
  'How can I improve my sleep routine?',
  'Suggest a 5-minute focus booster',
  'Analyze my habit momentum this week',
  'Help me bounce back from a missed day without guilt',
  'Tips for drinking more water consistently',
];

export const AICoachView: React.FC = () => {
  const { user } = useAuth();
  const { 
    aiMessages, 
    aiInsight, 
    sendAIChatMessage, 
    refreshAIInsights, 
    clearAIConversation 
  } = useApp();

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshingInsight, setIsRefreshingInsight] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isSending]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isSending) return;

    setInput('');
    setIsSending(true);
    try {
      await sendAIChatMessage(query);
    } finally {
      setIsSending(false);
    }
  };

  const handleRefreshInsights = async () => {
    setIsRefreshingInsight(true);
    try {
      await refreshAIInsights();
    } finally {
      setIsRefreshingInsight(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg ai-gradient text-white shadow-xs">
              <Bot className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Personal Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Aura AI Wellness Coach
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Compassionate, evidence-based habit recommendations tailored to your daily rhythms.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefreshInsights}
            disabled={isRefreshingInsight}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-card text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingInsight ? 'animate-spin text-indigo-500' : ''}`} />
            <span>Refresh Analysis</span>
          </button>
          
          {aiMessages.length > 0 && (
            <button
              onClick={clearAIConversation}
              className="p-2 rounded-xl glass-card text-slate-400 hover:text-rose-500 shadow-xs transition-colors cursor-pointer"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Structured AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Strength */}
        <div className="p-4 rounded-3xl glass-card hover:border-emerald-400/40 transition-all space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Current Strength</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {aiInsight.strength}
          </p>
        </div>

        {/* Challenge */}
        <div className="p-4 rounded-3xl glass-card hover:border-amber-400/40 transition-all space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Growth Area</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {aiInsight.challenge}
          </p>
        </div>

        {/* Recommendation */}
        <div className="p-4 rounded-3xl glass-card hover:border-indigo-400/40 transition-all space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <Lightbulb className="w-4 h-4 text-indigo-500" />
            <span>Recommendation</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {aiInsight.recommendation}
          </p>
        </div>

        {/* Next Best Action */}
        <div className="p-4 rounded-3xl glass-card hover:border-teal-400/40 transition-all space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300">
            <Target className="w-4 h-4 text-teal-500" />
            <span>Next Best Action</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {aiInsight.nextBestAction}
          </p>
        </div>
      </div>

      {/* Interactive Coach Chat Section */}
      <div className="rounded-3xl glass-card shadow-lg flex flex-col h-[520px] overflow-hidden">
        {/* Chat Messages Log */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {aiMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl ai-gradient text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                How can I support your wellness today?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ask about optimizing habits, overcoming slumps, sleep science, or habit stacking. Tap one of the starter prompts below:
              </p>
            </div>
          ) : (
            <>
              {aiMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl ai-gradient text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-md p-3.5 sm:p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'ai-gradient text-white rounded-tr-none shadow-md shadow-indigo-500/20'
                          : 'glass-subcard text-slate-800 dark:text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-white/40 dark:border-white/10 space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Suggested follow-ups:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.suggestions.map((sug, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => handleSend(sug)}
                                className="px-2.5 py-1 rounded-xl glass-subcard text-slate-700 dark:text-slate-300 text-[11px] font-medium hover:border-indigo-500 transition-colors cursor-pointer"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-start gap-3 animate-fadeIn">
                  <div className="w-8 h-8 rounded-xl ai-gradient text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3.5 rounded-3xl rounded-tl-none glass-subcard flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 glass-panel border-t border-white/40 dark:border-white/10 overflow-x-auto flex items-center gap-2 no-scrollbar">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 rounded-full glass-subcard text-[11px] font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 glass-panel border-t border-white/40 dark:border-white/10 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask your coach anything about habits, rest, or discipline..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 glass-input rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-2.5 sm:px-4 rounded-2xl ai-gradient text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="hidden sm:inline">Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

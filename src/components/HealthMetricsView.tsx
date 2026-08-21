import React, { useState } from 'react';
import { 
  Activity, 
  Moon, 
  Droplets, 
  Footprints, 
  Dumbbell, 
  Brain, 
  Zap, 
  Plus, 
  CheckCircle2, 
  Heart,
  Flame,
  ArrowRight
} from 'lucide-react';
import { HealthMetric } from '../types';
import { useApp } from '../context/AppContext';
import { getTodayDateString } from '../services/storage';

export const HealthMetricsView: React.FC = () => {
  const { healthMetrics, logHealthMetric } = useApp();
  const todayStr = getTodayDateString();
  const todayMetric = healthMetrics.find(m => m.date === todayStr);

  const [sleepHours, setSleepHours] = useState<number>(todayMetric?.sleepHours || 7.5);
  const [sleepQuality, setSleepQuality] = useState<number>(todayMetric?.sleepQuality || 85);
  const [waterMl, setWaterMl] = useState<number>(todayMetric?.waterMl || 2000);
  const [steps, setSteps] = useState<number>(todayMetric?.steps || 8000);
  const [activeMinutes, setActiveMinutes] = useState<number>(todayMetric?.activeMinutes || 30);
  const [meditationMinutes, setMeditationMinutes] = useState<number>(todayMetric?.meditationMinutes || 10);
  const [energyLevel, setEnergyLevel] = useState<number>(todayMetric?.energyLevel || 4);

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    logHealthMetric({
      sleepHours,
      sleepQuality,
      waterMl,
      steps,
      activeMinutes,
      meditationMinutes,
      energyLevel: energyLevel as any,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleQuickAddWater = (amount: number) => {
    const newAmount = Math.max(0, waterMl + amount);
    setWaterMl(newAmount);
    logHealthMetric({ waterMl: newAmount });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-lg ai-gradient text-white shadow-xs">
            <Activity className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Biometric & Physical Rhythms
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Holistic Health & Vital Metrics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Track sleep quality, hydration, physical exertion, and daily recovery indicators.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sleep Card */}
        <div className="p-5 rounded-3xl glass-card shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Sleep & Recovery</span>
            <div className="p-2 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Moon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{sleepHours}</span>
            <span className="text-xs text-slate-400 font-medium">hours</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Sleep Quality</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{sleepQuality}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/40 dark:bg-slate-800/80 rounded-full overflow-hidden border border-white/40 dark:border-white/10">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${sleepQuality}%` }} />
          </div>
        </div>

        {/* Hydration Card */}
        <div className="p-5 rounded-3xl glass-card shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Hydration</span>
            <div className="p-2 rounded-xl bg-cyan-50/80 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{waterMl}</span>
            <span className="text-xs text-slate-400 font-medium">/ 2,500 ml</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleQuickAddWater(250)}
              className="flex-1 py-1 rounded-xl glass-subcard text-cyan-700 dark:text-cyan-300 text-[11px] font-bold hover:border-cyan-400 transition-colors cursor-pointer"
            >
              +250ml
            </button>
            <button
              onClick={() => handleQuickAddWater(500)}
              className="flex-1 py-1 rounded-xl glass-subcard text-cyan-700 dark:text-cyan-300 text-[11px] font-bold hover:border-cyan-400 transition-colors cursor-pointer"
            >
              +500ml
            </button>
          </div>
          <div className="w-full h-1.5 bg-white/40 dark:bg-slate-800/80 rounded-full overflow-hidden border border-white/40 dark:border-white/10">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, (waterMl / 2500) * 100)}%` }} />
          </div>
        </div>

        {/* Steps Card */}
        <div className="p-5 rounded-3xl glass-card shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Daily Steps</span>
            <div className="p-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Footprints className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{steps.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-medium">/ 10k goal</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Target Progress</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{Math.round((steps / 10000) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/40 dark:bg-slate-800/80 rounded-full overflow-hidden border border-white/40 dark:border-white/10">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (steps / 10000) * 100)}%` }} />
          </div>
        </div>

        {/* Active Minutes Card */}
        <div className="p-5 rounded-3xl glass-card shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Active Movement</span>
            <div className="p-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{activeMinutes}</span>
            <span className="text-xs text-slate-400 font-medium">mins active</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Meditation</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">{meditationMinutes} mins</span>
          </div>
          <div className="w-full h-1.5 bg-white/40 dark:bg-slate-800/80 rounded-full overflow-hidden border border-white/40 dark:border-white/10">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (activeMinutes / 45) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Full Health Metric Logger Form */}
      <form
        onSubmit={handleSave}
        className="p-6 sm:p-8 rounded-3xl glass-card shadow-lg space-y-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Update Today's Biomarker Records
          </h3>
          {todayMetric && (
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Synced
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sleep Duration (Hours)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="24"
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sleep Quality (0 - 100%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={sleepQuality}
              onChange={(e) => setSleepQuality(Number(e.target.value))}
              className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Water Consumed (ml)
            </label>
            <input
              type="number"
              step="50"
              value={waterMl}
              onChange={(e) => setWaterMl(Number(e.target.value))}
              className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Step Count
            </label>
            <input
              type="number"
              step="100"
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Active Exercise (Minutes)
            </label>
            <input
              type="number"
              value={activeMinutes}
              onChange={(e) => setActiveMinutes(Number(e.target.value))}
              className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Meditation / Mindfulness (Mins)
            </label>
            <input
              type="number"
              value={meditationMinutes}
              onChange={(e) => setMeditationMinutes(Number(e.target.value))}
              className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-2xl ai-gradient text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98] hover:scale-[1.01] cursor-pointer"
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Metrics Updated Successfully</span>
            </>
          ) : (
            <>
              <span>Save Health Records</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

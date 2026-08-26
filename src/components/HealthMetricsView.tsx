import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Sun,
  Scale,
  Stethoscope,
  Clock,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Check,
  TrendingUp,
  Info,
  User,
  Sliders,
  Calendar,
  Smile
} from 'lucide-react';
import { HealthMetric, HealthHabitRoutineAdvice } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getTodayDateString } from '../services/storage';
import { ApiService } from '../services/api';
import { 
  calculateBMI, 
  classifyBloodPressure, 
  calculateSleepRhythm, 
  calculateBMRAndHydration, 
  generateHolisticHabitAdvice 
} from '../utils/healthCalculations';
import { IconRenderer } from './IconRenderer';

export const HealthMetricsView: React.FC = () => {
  const { user } = useAuth();
  const { 
    healthMetrics, 
    logHealthMetric, 
    moodEntries, 
    habits, 
    addHabit 
  } = useApp();

  const todayStr = getTodayDateString();
  const todayMetric = healthMetrics.find(m => m.date === todayStr);

  // Core Biometrics State
  const [heightCm, setHeightCm] = useState<number>(
    todayMetric?.heightCm || user?.heightCm || 175
  );
  const [weightKg, setWeightKg] = useState<number>(
    todayMetric?.weightKg || user?.weightKg || 70
  );
  const [age, setAge] = useState<number>(
    todayMetric?.age || user?.age || 28
  );
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say'>(
    todayMetric?.gender || user?.gender || 'male'
  );

  // Blood Pressure State (mmHg)
  const [bpSystolic, setBpSystolic] = useState<number>(
    todayMetric?.bpSystolic || user?.bpSystolic || 120
  );
  const [bpDiastolic, setBpDiastolic] = useState<number>(
    todayMetric?.bpDiastolic || user?.bpDiastolic || 80
  );

  // Sleep & Circadian State
  const [sleepingTime, setSleepingTime] = useState<string>(
    todayMetric?.sleepingTime || user?.sleepTime || '23:00'
  );
  const [wakeUpTime, setWakeUpTime] = useState<string>(
    todayMetric?.wakeUpTime || user?.wakeTime || '07:00'
  );
  const [sleepHours, setSleepHours] = useState<number>(
    todayMetric?.sleepHours || 7.5
  );
  const [sleepQuality, setSleepQuality] = useState<number>(
    todayMetric?.sleepQuality || 85
  );

  // Lifestyle & Daily Vital Indicators
  const [waterMl, setWaterMl] = useState<number>(todayMetric?.waterMl || 2000);
  const [steps, setSteps] = useState<number>(todayMetric?.steps || 8000);
  const [activeMinutes, setActiveMinutes] = useState<number>(todayMetric?.activeMinutes || 30);
  const [meditationMinutes, setMeditationMinutes] = useState<number>(todayMetric?.meditationMinutes || 10);
  const [restingHeartRate, setRestingHeartRate] = useState<number>(todayMetric?.restingHeartRate || 68);
  const [energyLevel, setEnergyLevel] = useState<number>(todayMetric?.energyLevel || 4);
  const [healthNotes, setHealthNotes] = useState<string>(todayMetric?.notes || '');

  // UI States
  const [unitMode, setUnitMode] = useState<'metric' | 'imperial'>('metric');
  const [isSaved, setIsSaved] = useState(false);
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [addedHabitNames, setAddedHabitNames] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<'biometrics' | 'advice' | 'history'>('biometrics');

  // Advice State
  const [routineAdvice, setRoutineAdvice] = useState<HealthHabitRoutineAdvice>(() => {
    return generateHolisticHabitAdvice(
      {
        heightCm,
        weightKg,
        age,
        gender,
        bpSystolic,
        bpDiastolic,
        sleepingTime,
        wakeUpTime,
        sleepHours,
      },
      moodEntries,
      habits,
      user || undefined
    );
  });

  // Re-generate local advice when key biometrics or mood entries change
  useEffect(() => {
    const freshAdvice = generateHolisticHabitAdvice(
      {
        heightCm,
        weightKg,
        age,
        gender,
        bpSystolic,
        bpDiastolic,
        sleepingTime,
        wakeUpTime,
        sleepHours,
      },
      moodEntries,
      habits,
      user || undefined
    );
    setRoutineAdvice(freshAdvice);
  }, [
    heightCm,
    weightKg,
    age,
    gender,
    bpSystolic,
    bpDiastolic,
    sleepingTime,
    wakeUpTime,
    sleepHours,
    moodEntries,
  ]);

  // Derived Calculations
  const bmiData = calculateBMI(weightKg, heightCm);
  const bpData = classifyBloodPressure(bpSystolic, bpDiastolic);
  const sleepData = calculateSleepRhythm(sleepingTime, wakeUpTime, sleepHours, age);
  const bmrData = calculateBMRAndHydration(weightKg, heightCm, age, gender);

  // Auto calculate sleep duration when times change
  const handleSleepTimeChange = (newSleep: string) => {
    setSleepingTime(newSleep);
    const [bH, bM] = newSleep.split(':').map(Number);
    const [wH, wM] = wakeUpTime.split(':').map(Number);
    let bedMins = bH * 60 + (bM || 0);
    let wakeMins = wH * 60 + (wM || 0);
    if (wakeMins < bedMins) wakeMins += 24 * 60;
    const diff = Math.round(((wakeMins - bedMins) / 60) * 10) / 10;
    setSleepHours(diff);
  };

  const handleWakeTimeChange = (newWake: string) => {
    setWakeUpTime(newWake);
    const [bH, bM] = sleepingTime.split(':').map(Number);
    const [wH, wM] = newWake.split(':').map(Number);
    let bedMins = bH * 60 + (bM || 0);
    let wakeMins = wH * 60 + (wM || 0);
    if (wakeMins < bedMins) wakeMins += 24 * 60;
    const diff = Math.round(((wakeMins - bedMins) / 60) * 10) / 10;
    setSleepHours(diff);
  };

  // Save All Health Records
  const handleSaveMetrics = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    logHealthMetric({
      heightCm,
      weightKg,
      age,
      gender,
      bpSystolic,
      bpDiastolic,
      sleepingTime,
      wakeUpTime,
      sleepHours,
      sleepQuality,
      waterMl,
      steps,
      activeMinutes,
      meditationMinutes,
      restingHeartRate,
      energyLevel: energyLevel as any,
      notes: healthNotes,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Quick Water Increment
  const handleQuickWater = (amount: number) => {
    const next = Math.max(0, waterMl + amount);
    setWaterMl(next);
    logHealthMetric({ waterMl: next });
  };

  // Request Deep-Dive AI Gemini Routine Advice
  const handleFetchAiAdvice = async () => {
    setIsGeneratingAdvice(true);
    try {
      const response = await ApiService.getHealthHabitAdvice({
        healthMetric: {
          heightCm,
          weightKg,
          age,
          gender,
          bpSystolic,
          bpDiastolic,
          sleepingTime,
          wakeUpTime,
          sleepHours,
          sleepQuality,
          waterMl,
          steps,
        },
        userProfile: user || undefined,
        moodEntries,
        habits,
      });

      if (response && !response.fallback && response.prescribedHabits) {
        setRoutineAdvice(response);
      } else {
        // Fallback to our robust clinical algorithm
        const clientAdvice = generateHolisticHabitAdvice(
          {
            heightCm,
            weightKg,
            age,
            gender,
            bpSystolic,
            bpDiastolic,
            sleepingTime,
            wakeUpTime,
            sleepHours,
          },
          moodEntries,
          habits,
          user || undefined
        );
        setRoutineAdvice(clientAdvice);
      }
    } catch (err) {
      console.warn('Advice generation fallback:', err);
    } finally {
      setIsGeneratingAdvice(false);
      setActiveSection('advice');
    }
  };

  // Add Prescribed Habit to Daily Routine
  const handleAddPrescribedHabit = (habitItem: HealthHabitRoutineAdvice['prescribedHabits'][0]) => {
    // Check if habit with same name already exists
    const existing = habits.find(h => h.name.toLowerCase() === habitItem.name.toLowerCase());
    if (existing) {
      setAddedHabitNames(prev => new Set(prev).add(habitItem.name));
      return;
    }

    addHabit({
      name: habitItem.name,
      description: habitItem.description,
      category: habitItem.category,
      icon: habitItem.icon || 'Sparkles',
      color: habitItem.color || '#10b981',
      frequency: 'daily',
      targetDays: [0, 1, 2, 3, 4, 5, 6],
      goalTarget: habitItem.goalTarget || 1,
      goalUnit: habitItem.goalUnit || 'session',
      reminderTime: habitItem.reminderTime || '08:00',
      durationMinutes: habitItem.durationMinutes || 10,
      difficulty: habitItem.difficulty || 'easy',
      isArchived: false,
      isPaused: false,
    });

    setAddedHabitNames(prev => new Set(prev).add(habitItem.name));
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-14">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg ai-gradient text-white shadow-xs">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Biometrics & Clinical Rhythms
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Health Metrics & Daily Routine Advice
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            Track height, weight, sleep schedule, blood pressure, age, and gender — seamlessly synthesized with your mood tracker to prescribe optimal daily habits.
          </p>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-subcard self-start sm:self-auto border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setActiveSection('biometrics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'biometrics'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            Biometrics & Vitals
          </button>
          <button
            onClick={() => setActiveSection('advice')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSection === 'advice'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Daily Routine Advice</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: BIOMETRICS & VITALS */}
      {activeSection === 'biometrics' && (
        <div className="space-y-6">
          {/* Key Clinical Biomarker Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* BMI & Weight Card */}
            <div className="p-5 rounded-3xl glass-card shadow-lg space-y-3 relative overflow-hidden border border-slate-200/60 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-indigo-500" />
                  BMI & Body Profile
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${bmiData?.badgeClass || 'bg-slate-100 dark:bg-slate-800 text-slate-700'}`}>
                  {bmiData?.category || 'Normal'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {bmiData?.bmi || 22.9}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  BMI score
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>Height: {heightCm} cm</span>
                  <span>Weight: {weightKg} kg</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                  Ideal weight: <span className="font-bold text-indigo-600 dark:text-indigo-400">{bmiData?.healthyMinWeightKg} - {bmiData?.healthyMaxWeightKg} kg</span>
                </p>
              </div>
            </div>

            {/* Blood Pressure Card */}
            <div className="p-5 rounded-3xl glass-card shadow-lg space-y-3 relative overflow-hidden border border-slate-200/60 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Blood Pressure (BP)
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${bpData?.badgeClass || 'bg-emerald-100 text-emerald-800'}`}>
                  {bpData?.category || 'Normal'}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {bpSystolic}/{bpDiastolic}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  mmHg
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>Pulse Pressure: {bpData?.pulsePressure || 40} mmHg</span>
                <span>Resting HR: {restingHeartRate} bpm</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                {bpData?.advice || 'Optimal cardiovascular range.'}
              </p>
            </div>

            {/* Sleep Rhythm & Bedtime Card */}
            <div className="p-5 rounded-3xl glass-card shadow-lg space-y-3 relative overflow-hidden border border-slate-200/60 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  Sleep & Bedtime
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${sleepData.badgeClass}`}>
                  {sleepData.status}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {sleepHours}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  hours ({sleepQuality}% qual)
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>Bedtime: {sleepingTime}</span>
                <span>Wake: {wakeUpTime}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all" 
                  style={{ width: `${Math.min(100, (sleepHours / 8) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Daily Water & Hydration Card */}
            <div className="p-5 rounded-3xl glass-card shadow-lg space-y-3 relative overflow-hidden border border-slate-200/60 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-500" />
                  Hydration Target
                </span>
                <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-100/80 dark:bg-cyan-950/80 px-2 py-0.5 rounded-full">
                  Rec: {bmrData.dailyWaterMl} ml
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {waterMl}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  / {bmrData.dailyWaterMl} ml
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickWater(250)}
                  className="flex-1 py-1 rounded-xl glass-subcard text-cyan-700 dark:text-cyan-300 text-[11px] font-bold hover:border-cyan-400 transition-colors cursor-pointer"
                >
                  +250ml
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickWater(500)}
                  className="flex-1 py-1 rounded-xl glass-subcard text-cyan-700 dark:text-cyan-300 text-[11px] font-bold hover:border-cyan-400 transition-colors cursor-pointer"
                >
                  +500ml
                </button>
              </div>
              <div className="w-full h-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all" 
                  style={{ width: `${Math.min(100, (waterMl / bmrData.dailyWaterMl) * 100)}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Core Biometrics Logger & Comprehensive Form */}
          <form
            onSubmit={handleSaveMetrics}
            className="p-6 sm:p-8 rounded-3xl glass-card shadow-xl space-y-6 border border-slate-200/80 dark:border-white/10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-500" />
                  Comprehensive Biometric & Health Record Form
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update your height, weight, sleep schedule, blood pressure, age, and gender.
                </p>
              </div>
              {todayMetric && (
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto backdrop-blur-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Today's Records Synced
                </span>
              )}
            </div>

            {/* Section A: Physical Biometrics (Height, Weight, Age, Gender) */}
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-3">
                1. Body & Demographic Profile
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Height */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="80"
                    max="260"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 175"
                    required
                  />
                  <span className="text-[10px] text-slate-400">
                    ≈ {Math.floor(heightCm / 30.48)} ft {Math.round((heightCm % 30.48) / 2.54)} in
                  </span>
                </div>

                {/* Weight */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="25"
                    max="300"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 70"
                    required
                  />
                  <span className="text-[10px] text-slate-400">
                    ≈ {Math.round(weightKg * 2.20462)} lbs
                  </span>
                </div>

                {/* Age */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 28"
                    required
                  />
                  <span className="text-[10px] text-slate-400">
                    Used for BMR & sleep needs
                  </span>
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="male" className="bg-slate-900 text-white">Male</option>
                    <option value="female" className="bg-slate-900 text-white">Female</option>
                    <option value="non-binary" className="bg-slate-900 text-white">Non-binary</option>
                    <option value="other" className="bg-slate-900 text-white">Other</option>
                    <option value="prefer-not-to-say" className="bg-slate-900 text-white">Prefer not to say</option>
                  </select>
                  <span className="text-[10px] text-slate-400">
                    Calibrates metabolic baselines
                  </span>
                </div>
              </div>
            </div>

            {/* Section B: Cardiovascular (Blood Pressure Systolic / Diastolic & Heart Rate) */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  2. Blood Pressure (BP) & Cardiovascular Markers
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${bpData?.badgeClass || 'bg-emerald-100 text-emerald-800'}`}>
                  {bpData?.category || 'Normal'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Systolic */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Systolic Pressure (Top #, mmHg)
                  </label>
                  <input
                    type="number"
                    min="60"
                    max="260"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                    placeholder="e.g. 120"
                    required
                  />
                  <span className="text-[10px] text-slate-400">
                    Normal: &lt;120 mmHg
                  </span>
                </div>

                {/* Diastolic */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Diastolic Pressure (Bottom #, mmHg)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="180"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                    placeholder="e.g. 80"
                    required
                  />
                  <span className="text-[10px] text-slate-400">
                    Normal: &lt;80 mmHg
                  </span>
                </div>

                {/* Resting Heart Rate */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Resting Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="180"
                    value={restingHeartRate}
                    onChange={(e) => setRestingHeartRate(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                    placeholder="e.g. 68"
                  />
                  <span className="text-[10px] text-slate-400">
                    Optimal: 60 - 80 BPM
                  </span>
                </div>
              </div>
            </div>

            {/* Section C: Sleep & Circadian Schedule */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  3. Sleep Schedule & Circadian Rhythm
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${sleepData.badgeClass}`}>
                  {sleepData.status} ({sleepHours}h)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Bedtime */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Sleeping Time (Bedtime)
                  </label>
                  <input
                    type="time"
                    value={sleepingTime}
                    onChange={(e) => handleSleepTimeChange(e.target.value)}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400">
                    Target sleep initiation
                  </span>
                </div>

                {/* Wakeup Time */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Wake-up Time
                  </label>
                  <input
                    type="time"
                    value={wakeUpTime}
                    onChange={(e) => handleWakeTimeChange(e.target.value)}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400">
                    Morning circadian anchor
                  </span>
                </div>

                {/* Sleep Duration */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="24"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400">
                    Age recommendation: 7 - 9h
                  </span>
                </div>

                {/* Sleep Quality */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Sleep Quality ({sleepQuality}%)
                  </label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sleepQuality}
                      onChange={(e) => setSleepQuality(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Subjective restfulness rating
                  </span>
                </div>
              </div>
            </div>

            {/* Section D: Daily Vitals (Water, Steps, Active Mins, Energy) */}
            <div className="pt-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-3">
                4. Daily Activity & Energy Markers
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Water */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Water Consumed (ml)
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    max="10000"
                    value={waterMl}
                    onChange={(e) => setWaterMl(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Steps */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Daily Steps
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    max="100000"
                    value={steps}
                    onChange={(e) => setSteps(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Active Minutes */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Active Movement (Mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="600"
                    value={activeMinutes}
                    onChange={(e) => setActiveMinutes(Number(e.target.value))}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Energy Level (1-10) */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Energy Level ({energyLevel}/10)
                  </label>
                  <div className="flex items-center gap-1 pt-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setEnergyLevel(lvl)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          energyLevel === lvl
                            ? 'bg-amber-500 text-white shadow-xs scale-105'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section E: Daily Notes */}
            <div className="space-y-1 pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Health Notes & Physical Symptoms (Optional)
              </label>
              <textarea
                rows={2}
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
                placeholder="e.g. Felt well rested, slight muscle soreness after evening jog, took BP before breakfast."
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                className="w-full sm:flex-1 py-3.5 rounded-2xl ai-gradient text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98] hover:scale-[1.01] cursor-pointer"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>All Health Records Saved & Synced</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Save Today's Health Records</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleFetchAiAdvice}
                disabled={isGeneratingAdvice}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                {isGeneratingAdvice ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Synthesizing Health & Mood...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Daily Routine Advice</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 2: FINAL DAILY ROUTINE & HABIT ADVICE (Synthesizes Health Metrics + Mood Tracker) */}
      {activeSection === 'advice' && (
        <div className="space-y-6 sm:space-y-8 animate-fadeIn">
          {/* Top Holistic Diagnostic Banner */}
          <div className="p-6 sm:p-8 rounded-3xl glass-card shadow-xl border border-indigo-500/20 relative overflow-hidden bg-gradient-to-br from-indigo-900/10 via-slate-900/40 to-teal-900/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Holistic Health & Mood Habit Prescription
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    routineAdvice.biometricSummary.overallHealthRisk === 'high'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : routineAdvice.biometricSummary.overallHealthRisk === 'moderate'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {routineAdvice.biometricSummary.overallHealthRisk.toUpperCase()} VITAL RISK
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Personalized Daily Routine Blueprint
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                  {routineAdvice.moodSynergy.emotionalStateSummary}
                </p>
              </div>

              {/* Regenerate Action */}
              <button
                type="button"
                onClick={handleFetchAiAdvice}
                disabled={isGeneratingAdvice}
                className="px-5 py-3 rounded-2xl ai-gradient text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all self-start lg:self-auto cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isGeneratingAdvice ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAdvice ? 'Analyzing...' : 'Refresh Prescription'}</span>
              </button>
            </div>

            {/* Key Correlation Bullet Points */}
            <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3">
              {routineAdvice.moodSynergy.correlationInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl glass-subcard border border-indigo-500/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Schedule Blueprint (Morning, Afternoon, Evening) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  Optimized Daily Routine Protocol
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calibrated to your {wakeUpTime} wake time, {sleepingTime} bedtime, and {bpSystolic}/{bpDiastolic} BP profile.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* 1. Morning Routine */}
              <div className="p-6 rounded-3xl glass-card shadow-lg border border-amber-500/20 space-y-4 bg-gradient-to-b from-amber-500/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Sun className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 px-2.5 py-1 rounded-full">
                    {routineAdvice.dailyRoutineBlueprint.morning.timeSlot}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {routineAdvice.dailyRoutineBlueprint.morning.title}
                  </h4>
                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                    Focus: {routineAdvice.dailyRoutineBlueprint.morning.focus}
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {routineAdvice.dailyRoutineBlueprint.morning.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. Afternoon Routine */}
              <div className="p-6 rounded-3xl glass-card shadow-lg border border-cyan-500/20 space-y-4 bg-gradient-to-b from-cyan-500/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-100/80 dark:bg-cyan-950/80 px-2.5 py-1 rounded-full">
                    {routineAdvice.dailyRoutineBlueprint.afternoon.timeSlot}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {routineAdvice.dailyRoutineBlueprint.afternoon.title}
                  </h4>
                  <p className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 mt-0.5">
                    Focus: {routineAdvice.dailyRoutineBlueprint.afternoon.focus}
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {routineAdvice.dailyRoutineBlueprint.afternoon.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Evening Routine */}
              <div className="p-6 rounded-3xl glass-card shadow-lg border border-indigo-500/20 space-y-4 bg-gradient-to-b from-indigo-500/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    <Moon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-950/80 px-2.5 py-1 rounded-full">
                    {routineAdvice.dailyRoutineBlueprint.evening.timeSlot}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {routineAdvice.dailyRoutineBlueprint.evening.title}
                  </h4>
                  <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    Focus: {routineAdvice.dailyRoutineBlueprint.evening.focus}
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {routineAdvice.dailyRoutineBlueprint.evening.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Prescribed Habits Section (With 1-Click Addition to Active Habits) */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Recommended Habit Prescriptions for Your Routine
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Targeted micro-habits tailored to your BP, BMI, sleep duration, and current mood state. Tap to add directly to your daily habits.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routineAdvice.prescribedHabits.map((habitItem, idx) => {
                const isAlreadyInHabits = habits.some(
                  h => h.name.toLowerCase() === habitItem.name.toLowerCase()
                ) || addedHabitNames.has(habitItem.name);

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl glass-card shadow-lg border border-slate-200/80 dark:border-white/10 flex flex-col justify-between gap-4 transition-all hover:border-indigo-500/40"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                            style={{ backgroundColor: habitItem.color }}
                          >
                            <IconRenderer name={habitItem.icon} className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {habitItem.name}
                            </h4>
                            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                              {habitItem.category} • {habitItem.durationMinutes} mins • {habitItem.reminderTime}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {habitItem.difficulty}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {habitItem.description}
                      </p>

                      <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700 text-[11px] space-y-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">
                          🎯 Target Biometric: <span className="font-normal text-slate-600 dark:text-slate-400">{habitItem.targetBiometric}</span>
                        </span>
                        <p className="text-slate-500 dark:text-slate-400 italic">
                          "{habitItem.rationale}"
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isAlreadyInHabits}
                      onClick={() => handleAddPrescribedHabit(habitItem)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isAlreadyInHabits
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 cursor-default'
                          : 'ai-gradient text-white shadow-xs hover:scale-[1.01] active:scale-[0.98]'
                      }`}
                    >
                      {isAlreadyInHabits ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Active in Your Daily Routine</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add to Daily Routine</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

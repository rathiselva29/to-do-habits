import { HealthMetric, MoodEntry, Habit, UserProfile, HealthHabitRoutineAdvice, HabitCategory } from '../types';

export interface BMICalculation {
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obesity Class I' | 'Obesity Class II+';
  healthyMinWeightKg: number;
  healthyMaxWeightKg: number;
  colorClass: string;
  badgeClass: string;
  advice: string;
}

export interface BPCalculation {
  systolic: number;
  diastolic: number;
  category: 'Normal' | 'Elevated' | 'Hypertension Stage 1' | 'Hypertension Stage 2' | 'Hypertensive Crisis' | 'Hypotension';
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  colorClass: string;
  badgeClass: string;
  advice: string;
  meanArterialPressure: number;
  pulsePressure: number;
}

export interface SleepCalculation {
  bedTime: string;
  wakeTime: string;
  actualDurationHours: number;
  recommendedMinHours: number;
  recommendedMaxHours: number;
  status: 'Optimal' | 'Mild Deficit' | 'Severe Deficit' | 'Excessive';
  sleepDebtHours: number;
  badgeClass: string;
  advice: string;
}

/**
 * Calculates BMI and ideal healthy weight range
 */
export function calculateBMI(weightKg?: number, heightCm?: number): BMICalculation | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmiRaw = weightKg / (heightM * heightM);
  const bmi = Math.round(bmiRaw * 10) / 10;

  const healthyMinWeightKg = Math.round(18.5 * heightM * heightM * 10) / 10;
  const healthyMaxWeightKg = Math.round(24.9 * heightM * heightM * 10) / 10;

  let category: BMICalculation['category'] = 'Normal weight';
  let colorClass = 'text-emerald-600 dark:text-emerald-400';
  let badgeClass = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
  let advice = 'Your BMI is within the healthy reference range. Maintain balanced nutrition and daily movement.';

  if (bmi < 18.5) {
    category = 'Underweight';
    colorClass = 'text-amber-600 dark:text-amber-400';
    badgeClass = 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700';
    advice = 'Focus on nutrient-dense whole foods, progressive strength training, and adequate caloric surplus.';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
    colorClass = 'text-amber-600 dark:text-amber-400';
    badgeClass = 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700';
    advice = 'A slight caloric deficit paired with 30 minutes of daily aerobic movement will support gradual metabolic optimization.';
  } else if (bmi >= 30 && bmi < 35) {
    category = 'Obesity Class I';
    colorClass = 'text-rose-600 dark:text-rose-400';
    badgeClass = 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700';
    advice = 'Prioritize consistent low-impact movement (daily 20-30 min brisk walks) and whole-food hydration to reduce systemic stress.';
  } else if (bmi >= 35) {
    category = 'Obesity Class II+';
    colorClass = 'text-rose-700 dark:text-rose-400';
    badgeClass = 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700';
    advice = 'Focus on gentle, joint-friendly movement (swimming/walking) and regular sleep rhythm to support metabolic recovery.';
  }

  return {
    bmi,
    category,
    healthyMinWeightKg,
    healthyMaxWeightKg,
    colorClass,
    badgeClass,
    advice,
  };
}

/**
 * Classifies Blood Pressure (AHA/ACC Clinical Guidelines)
 */
export function classifyBloodPressure(systolic?: number, diastolic?: number): BPCalculation | null {
  if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) {
    return null;
  }

  const pulsePressure = Math.round(systolic - diastolic);
  const meanArterialPressure = Math.round(diastolic + (1 / 3) * pulsePressure);

  if (systolic > 180 || diastolic > 120) {
    return {
      systolic,
      diastolic,
      category: 'Hypertensive Crisis',
      riskLevel: 'critical',
      colorClass: 'text-rose-700 dark:text-rose-300',
      badgeClass: 'bg-rose-200 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border-rose-500',
      advice: 'Extremely elevated reading. Rest quietly and seek medical evaluation if persistent or symptomatic.',
      meanArterialPressure,
      pulsePressure,
    };
  }

  if (systolic < 90 || diastolic < 60) {
    return {
      systolic,
      diastolic,
      category: 'Hypotension',
      riskLevel: 'moderate',
      colorClass: 'text-sky-600 dark:text-sky-400',
      badgeClass: 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700',
      advice: 'Low blood pressure. Ensure consistent electrolyte hydration and rise slowly from seated or lying positions.',
      meanArterialPressure,
      pulsePressure,
    };
  }

  if (systolic >= 140 || diastolic >= 90) {
    return {
      systolic,
      diastolic,
      category: 'Hypertension Stage 2',
      riskLevel: 'high',
      colorClass: 'text-rose-600 dark:text-rose-400',
      badgeClass: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700',
      advice: 'Significantly elevated BP. Emphasize low-sodium foods, daily diaphragmatic breathing, and regular cardiovascular activity.',
      meanArterialPressure,
      pulsePressure,
    };
  }

  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      systolic,
      diastolic,
      category: 'Hypertension Stage 1',
      riskLevel: 'moderate',
      colorClass: 'text-amber-600 dark:text-amber-400',
      badgeClass: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
      advice: 'Mildly elevated BP. Daily stress management, limiting excess caffeine/alcohol, and consistent hydration will support healthy vascular tone.',
      meanArterialPressure,
      pulsePressure,
    };
  }

  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      systolic,
      diastolic,
      category: 'Elevated',
      riskLevel: 'moderate',
      colorClass: 'text-amber-600 dark:text-amber-400',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      advice: 'Slightly above optimal. Incorporate 10 minutes of evening wind-down breathwork and daily walking.',
      meanArterialPressure,
      pulsePressure,
    };
  }

  return {
    systolic,
    diastolic,
    category: 'Normal',
    riskLevel: 'low',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    advice: 'Optimal blood pressure! Your cardiovascular workload is balanced and healthy.',
    meanArterialPressure,
    pulsePressure,
  };
}

/**
 * Calculates sleep metrics and circadian alignment based on age and times
 */
export function calculateSleepRhythm(
  bedTime: string = '23:00',
  wakeTime: string = '07:00',
  reportedHours?: number,
  age: number = 30
): SleepCalculation {
  // Age-based recommendation (National Sleep Foundation)
  let recommendedMin = 7;
  let recommendedMax = 9;
  if (age < 18) {
    recommendedMin = 8;
    recommendedMax = 10;
  } else if (age >= 65) {
    recommendedMin = 7;
    recommendedMax = 8;
  }

  // Calculate duration between bedTime and wakeTime if reportedHours is not explicit
  let duration = reportedHours;
  if (duration === undefined || duration <= 0) {
    const [bH, bM] = bedTime.split(':').map(Number);
    const [wH, wM] = wakeTime.split(':').map(Number);
    let bedMins = bH * 60 + (bM || 0);
    let wakeMins = wH * 60 + (wM || 0);
    if (wakeMins < bedMins) {
      wakeMins += 24 * 60;
    }
    duration = Math.round(((wakeMins - bedMins) / 60) * 10) / 10;
  }

  let status: SleepCalculation['status'] = 'Optimal';
  let badgeClass = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
  let advice = 'Your sleep duration meets age-appropriate circadian recommendations.';
  const sleepDebtHours = Math.max(0, Math.round((recommendedMin - duration) * 10) / 10);

  if (duration < 5.5) {
    status = 'Severe Deficit';
    badgeClass = 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700';
    advice = 'Critical sleep deficit. Cortisol, blood pressure, and cravings rise with chronic under-sleeping. Aim for an earlier bedtime.';
  } else if (duration < recommendedMin) {
    status = 'Mild Deficit';
    badgeClass = 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700';
    advice = `You have a ~${sleepDebtHours}h sleep deficit. Shifting bedtime 30 minutes earlier will significantly boost daytime cognitive focus.`;
  } else if (duration > recommendedMax + 1.5) {
    status = 'Excessive';
    badgeClass = 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700';
    advice = 'Prolonged sleep duration. Ensure morning natural light exposure to reset circadian alertness.';
  }

  return {
    bedTime,
    wakeTime,
    actualDurationHours: duration,
    recommendedMinHours: recommendedMin,
    recommendedMaxHours: recommendedMax,
    status,
    sleepDebtHours,
    badgeClass,
    advice,
  };
}

/**
 * Calculates BMR (Basal Metabolic Rate) via Mifflin-St Jeor & Hydration requirements
 */
export function calculateBMRAndHydration(
  weightKg: number = 70,
  heightCm: number = 175,
  age: number = 30,
  gender: string = 'male'
): { bmr: number; maintenanceCalories: number; dailyWaterMl: number } {
  // Mifflin-St Jeor:
  // Male: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Female: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr += 5;
  }
  bmr = Math.max(1000, Math.round(bmr));

  // Moderate activity multiplier (1.375)
  const maintenanceCalories = Math.round(bmr * 1.375);

  // Recommended hydration: ~35ml per kg body weight
  const dailyWaterMl = Math.max(1800, Math.round(weightKg * 35));

  return {
    bmr,
    maintenanceCalories,
    dailyWaterMl,
  };
}

/**
 * Generates rich, personalized daily routine advice and habit prescriptions
 * by combining:
 * 1. Biometrics (Height, Weight, BMI, Blood Pressure, Sleep Duration/Bedtime, Age, Gender)
 * 2. Mood Tracker Records (Recent scores, emotions, journal notes)
 * 3. Habit consistency
 */
export function generateHolisticHabitAdvice(
  metrics: Partial<HealthMetric>,
  moods: MoodEntry[] = [],
  habits: Habit[] = [],
  profile?: Partial<UserProfile>
): HealthHabitRoutineAdvice {
  const heightCm = metrics.heightCm || profile?.heightCm || 175;
  const weightKg = metrics.weightKg || profile?.weightKg || 70;
  const age = metrics.age || profile?.age || 28;
  const gender = metrics.gender || profile?.gender || 'male';
  const bpSys = metrics.bpSystolic || 120;
  const bpDia = metrics.bpDiastolic || 80;
  const bedTime = metrics.sleepingTime || profile?.sleepTime || '23:00';
  const wakeTime = metrics.wakeUpTime || profile?.wakeTime || '07:00';
  const sleepHours = metrics.sleepHours || 7.5;

  const bmiCalc = calculateBMI(weightKg, heightCm) || {
    bmi: 22.9,
    category: 'Normal weight' as const,
    healthyMinWeightKg: 57,
    healthyMaxWeightKg: 76,
    colorClass: 'text-emerald-600',
    badgeClass: 'bg-emerald-100 text-emerald-800',
    advice: 'Balanced BMI baseline.',
  };

  const bpCalc = classifyBloodPressure(bpSys, bpDia) || {
    category: 'Normal' as const,
    riskLevel: 'low' as const,
    advice: 'Normal blood pressure.',
  };

  const sleepCalc = calculateSleepRhythm(bedTime, wakeTime, sleepHours, age);

  // Mood synthesis
  const recentMoods = moods.slice(-7);
  const avgMoodScore = recentMoods.length > 0
    ? recentMoods.reduce((sum, m) => sum + m.score, 0) / recentMoods.length
    : 4.0;

  const allEmotions = recentMoods.flatMap(m => m.emotions);
  const isStressedOrAnxious = allEmotions.some(e => ['Stressed', 'Anxious', 'Overwhelmed', 'Burned out'].includes(e));
  const isTiredOrLow = avgMoodScore <= 2.5 || allEmotions.some(e => ['Tired', 'Sad', 'Irritable'].includes(e));
  const isHighEnergy = avgMoodScore >= 4.2 && allEmotions.some(e => ['Energized', 'Inspired', 'Happy'].includes(e));

  // Determine overall health risk
  let overallRisk: 'low' | 'moderate' | 'high' = 'low';
  if (bpCalc.riskLevel === 'high' || bpCalc.riskLevel === 'critical' || bmiCalc.category.includes('Obesity') || sleepCalc.status === 'Severe Deficit') {
    overallRisk = 'high';
  } else if (bpCalc.riskLevel === 'moderate' || bmiCalc.category === 'Overweight' || sleepCalc.status === 'Mild Deficit' || isStressedOrAnxious) {
    overallRisk = 'moderate';
  }

  // Key observations
  const observations: string[] = [];
  observations.push(`BMI is ${bmiCalc.bmi} (${bmiCalc.category}) for ${heightCm}cm / ${weightKg}kg.`);
  observations.push(`Blood Pressure is ${bpSys}/${bpDia} mmHg (${bpCalc.category}).`);
  observations.push(`Sleep Rhythm: ${sleepHours} hrs (${bedTime} to ${wakeTime}, ${sleepCalc.status}).`);
  if (age) observations.push(`Age: ${age} years • Metabolic baseline customized.`);

  // Correlation insights
  const correlationInsights: string[] = [];
  if (bpCalc.category !== 'Normal' && isStressedOrAnxious) {
    correlationInsights.push('Elevated stress emotions directly correlate with elevated vascular tension. Parasympathetic breathing will lower both BP and mental anxiety.');
  } else if (sleepCalc.sleepDebtHours > 0 && isTiredOrLow) {
    correlationInsights.push(`Your ${sleepCalc.sleepDebtHours}h sleep deficit is magnifying low energy and mood dips. Protecting evening wind-down will quickly restore emotional resilience.`);
  } else if (isHighEnergy && bpCalc.category === 'Normal') {
    correlationInsights.push('Strong cardiovascular balance and positive mood synergy! Great foundation for progressive fitness habits and deep cognitive focus.');
  } else {
    correlationInsights.push('Maintaining steady hydration and regular meal timing creates a predictable glucose baseline, smoothing out mood swings.');
  }

  // Generate Daily Routine Blueprint
  const morningRoutine = {
    timeSlot: `${wakeTime} - 08:30`,
    title: 'Circadian Activation & Vascular Awakening',
    focus: bpCalc.category !== 'Normal' ? 'Gentle hydration & BP regulation' : 'High-energy daylight exposure & movement',
    steps: [
      `Drink 500ml water immediately upon waking at ${wakeTime} to counteract overnight dehydration.`,
      bpCalc.category !== 'Normal'
        ? '5 minutes of slow diaphragmatic nasal breathing to regulate morning cortisol and vascular tone.'
        : '10 minutes of direct outdoor natural light exposure to reset circadian suprachiasmatic clock.',
      bmiCalc.bmi > 25
        ? '15-20 minute brisk fasted morning walk for gentle metabolic activation.'
        : 'Dynamic mobility stretching or light bodyweight activation.',
      'Balanced protein-rich breakfast before diving into high-stimulation work.',
    ],
  };

  const afternoonRoutine = {
    timeSlot: '12:30 - 16:30',
    title: 'Sustained Cognitive Energy & Ergonomic Balance',
    focus: isStressedOrAnxious ? 'Active stress buffering & micro-breaks' : 'Deep work sprints & steady hydration',
    steps: [
      'Nutrient-dense lunch with leafy greens, healthy fats, and low glycemic load.',
      'Midday hydration checkpoint: reach at least 1,500ml total water intake.',
      'Take a 5-minute movement break every 50 minutes to relieve postural compression and improve venous return.',
      'Cut off high-caffeine beverages by 14:00 to prevent sleep architecture disruption.',
    ],
  };

  const eveningRoutine = {
    timeSlot: '20:30 - ' + bedTime,
    title: 'Parasympathetic Downshift & Restorative Sleep Protocol',
    focus: `Melatonin release & target sleep by ${bedTime}`,
    steps: [
      'Transition away from heavy digestion: finish meals at least 2.5 hours before bedtime.',
      'Dim ambient home lighting and engage blue-light filters 60 minutes before bed.',
      bpCalc.category !== 'Normal' || isStressedOrAnxious
        ? '10-minute 4-7-8 relaxation breathwork or warm chamomile tea to induce GABAergic calm.'
        : '15 minutes of relaxing reading or gratitude journaling to close the mental loop on the day.',
      `Lights out at ${bedTime} in a cool (18-20°C / 65-68°F), dark room for maximum REM & deep sleep restoration.`,
    ],
  };

  // Prescribed Custom Habits
  const prescribedHabits: HealthHabitRoutineAdvice['prescribedHabits'] = [];

  // 1. BP / Cardiovascular Habit
  if (bpCalc.category !== 'Normal') {
    prescribedHabits.push({
      name: 'Vascular Reset 4-7-8 Breathwork',
      description: 'Inhale 4s, hold 7s, exhale 8s for 4 cycles to stimulate the vagus nerve and reduce blood pressure.',
      category: 'Mental wellness',
      icon: 'Brain',
      color: '#0d9488',
      goalTarget: 1,
      goalUnit: 'session',
      reminderTime: '19:30',
      durationMinutes: 5,
      difficulty: 'easy',
      rationale: `Calibrated for your ${bpSys}/${bpDia} mmHg reading to stimulate nitric oxide release and lower arterial tension.`,
      targetBiometric: `BP: ${bpSys}/${bpDia} mmHg (${bpCalc.category})`,
    });
  } else {
    prescribedHabits.push({
      name: 'Morning Circadian Sunlight Walk',
      description: 'Step outside within 45 minutes of waking to anchor your 24-hour biological rhythm.',
      category: 'Self-care',
      icon: 'Sun',
      color: '#f59e0b',
      goalTarget: 15,
      goalUnit: 'mins',
      reminderTime: '07:15',
      durationMinutes: 15,
      difficulty: 'easy',
      rationale: 'Solidifies nighttime melatonin timing and maintains healthy cardiovascular stamina.',
      targetBiometric: 'Circadian rhythm & Vitality',
    });
  }

  // 2. BMI / Metabolic Habit
  if (bmiCalc.bmi >= 25) {
    prescribedHabits.push({
      name: 'Post-Meal 15-Min Brisk Walk',
      description: 'Take a gentle walk immediately following lunch or dinner to flatten postprandial glucose spikes.',
      category: 'Fitness',
      icon: 'Footprints',
      color: '#10b981',
      goalTarget: 15,
      goalUnit: 'mins',
      reminderTime: '13:00',
      durationMinutes: 15,
      difficulty: 'easy',
      rationale: `Helps safely shift your BMI (${bmiCalc.bmi}) toward the ideal range (${bmiCalc.healthyMinWeightKg}-${bmiCalc.healthyMaxWeightKg} kg) without joint strain.`,
      targetBiometric: `BMI: ${bmiCalc.bmi} (${bmiCalc.category})`,
    });
  } else {
    prescribedHabits.push({
      name: '30-Min Core & Strength Flow',
      description: 'Bodyweight or progressive resistance movements to preserve lean muscle mass and bone density.',
      category: 'Fitness',
      icon: 'Dumbbell',
      color: '#6366f1',
      goalTarget: 30,
      goalUnit: 'mins',
      reminderTime: '17:30',
      durationMinutes: 30,
      difficulty: 'medium',
      rationale: `Maintains optimal body composition for ${weightKg}kg / ${heightCm}cm frame.`,
      targetBiometric: 'Metabolic & Musculoskeletal Tone',
    });
  }

  // 3. Sleep & Recovery Habit
  prescribedHabits.push({
    name: 'Screen-Free Wind-Down Ritual',
    description: `Shut down phones and laptops at least 45 minutes before your ${bedTime} target bedtime.`,
    category: 'Sleep',
    icon: 'Moon',
    color: '#8b5cf6',
    goalTarget: 1,
    goalUnit: 'routine',
    reminderTime: '22:15',
    durationMinutes: 30,
    difficulty: 'easy',
    rationale: `Protects your ${sleepHours}h sleep duration and eliminates sleep debt for age ${age}.`,
    targetBiometric: `Sleep target: ${bedTime} bedtime`,
  });

  // 4. Hydration & Mood Synergy Habit
  const targetWater = calculateBMRAndHydration(weightKg, heightCm, age, gender).dailyWaterMl;
  prescribedHabits.push({
    name: `Daily Hydration (${targetWater}ml)`,
    description: `Drink water in 4 steady increments throughout the day to meet your body weight hydration requirement.`,
    category: 'Nutrition',
    icon: 'Droplets',
    color: '#0ea5e9',
    goalTarget: targetWater,
    goalUnit: 'ml',
    reminderTime: '08:00',
    durationMinutes: 2,
    difficulty: 'easy',
    rationale: `Customized based on your ${weightKg}kg weight to support kidney filtration and brain alertness.`,
    targetBiometric: `Hydration target: ${targetWater}ml/day`,
  });

  // 5. Mood / Emotional Resilience Habit
  if (isStressedOrAnxious || avgMoodScore <= 3) {
    prescribedHabits.push({
      name: 'Evening Gratitude & Decompression Log',
      description: 'Write down 3 specific things that went smoothly today before closing your day.',
      category: 'Mental wellness',
      icon: 'Heart',
      color: '#ec4899',
      goalTarget: 1,
      goalUnit: 'entry',
      reminderTime: '21:30',
      durationMinutes: 5,
      difficulty: 'easy',
      rationale: 'Directly buffers stress hormone production and elevates your daily emotional wellness score.',
      targetBiometric: `Mood score: ${avgMoodScore.toFixed(1)}/5`,
    });
  }

  return {
    biometricSummary: {
      bmi: bmiCalc.bmi,
      bmiCategory: bmiCalc.category,
      bpCategory: bpCalc.category,
      sleepStatus: sleepCalc.status,
      overallHealthRisk: overallRisk,
      keyObservations: observations,
    },
    moodSynergy: {
      moodTrend: avgMoodScore >= 4 ? 'Positive & Thriving' : avgMoodScore >= 3 ? 'Balanced & Steady' : 'Low / Recovery Needed',
      emotionalStateSummary: isStressedOrAnxious
        ? 'Heightened nervous system activation detected. Prioritize autonomic down-regulation.'
        : isHighEnergy
        ? 'High physical and emotional vitality. Prime window for habit expansion.'
        : 'Stable emotional baseline. Focus on regular daily anchor habits.',
      correlationInsights,
    },
    dailyRoutineBlueprint: {
      morning: morningRoutine,
      afternoon: afternoonRoutine,
      evening: eveningRoutine,
    },
    prescribedHabits,
    generatedAt: new Date().toISOString(),
  };
}

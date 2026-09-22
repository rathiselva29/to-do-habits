export interface AIQuestionItem {
  id: string;
  category: string;
  question: string;
  directAnswer: string;
  protocol: string[];
  goldenRule: string;
  keyMetric?: string;
}

export interface AICoachCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  questions: AIQuestionItem[];
}

export const AI_COACH_KNOWLEDGE_BASE: AICoachCategory[] = [
  {
    id: 'reading',
    name: 'Daily Track Reading',
    icon: 'book',
    description: 'Build sustained 15-page daily reading momentum, comprehension, and intellect.',
    questions: [
      {
        id: 'read-1',
        category: 'Daily Track Reading',
        question: 'How do I maintain consistency in reading 15 pages every single day?',
        directAnswer: 'Anchor your reading to a fixed daily time and physical trigger (such as right after your morning coffee or 30 minutes before sleep). At a normal pace of 1.5 minutes per page, 15 pages takes only 22 minutes. Over a year, this compounds into 5,475 pages — equivalent to 18 to 22 full books without ever feeling overwhelmed.',
        protocol: [
          'Place your physical book or e-reader in plain sight on your workspace or pillow with the bookmark set.',
          'Put your smartphone in another room or turn on Do Not Disturb for 20 uninterrupted minutes.',
          'Stop at exactly 15 pages during the first 14 days so your mind builds a positive association of easy completion rather than fatigue.',
        ],
        goldenRule: 'Consistency beats intensity. Read 15 pages every day rather than 100 pages once a week.',
        keyMetric: '15 pages/day = 18–22 books per year',
      },
      {
        id: 'read-2',
        category: 'Daily Track Reading',
        question: 'What is the best time of day for reading retention and comprehension?',
        directAnswer: 'Morning (between 7:00 AM and 9:30 AM) is optimal for dense non-fiction and analytical learning because your prefrontal cortex is refreshed and free of cognitive fatigue. Evening (30–45 minutes before sleep) is best for fiction, literature, and reflection because it lowers cortisol and facilitates sleep onset.',
        protocol: [
          'Read educational and professional books in the morning before opening social media or email.',
          'Read philosophy, biographies, or narrative fiction during your evening wind-down.',
          'Keep a pocket pen or highlighter: underline 1 powerful sentence per session to anchor memory.',
        ],
        goldenRule: 'Read for sharp intellect in the morning; read for tranquility and perspective at night.',
        keyMetric: 'Peak retention: morning 7:00–9:30 AM',
      },
      {
        id: 'read-3',
        category: 'Daily Track Reading',
        question: 'How do I recover reading momentum if I skipped a day?',
        directAnswer: 'Never double your target to 30 pages the next day. Compensatory targets create friction and psychological dread. Apply James Clear’s "Never Miss Twice" law: read just 5 pages immediately to re-establish your unbroken identity.',
        protocol: [
          'Do not feel guilty or attempt an exhausting makeup session.',
          'Pick up the book and read just 5 pages right now to break mental resistance.',
          'Mark your habit on your daily tracker to reactivate your streak.',
        ],
        goldenRule: 'Missing once is an accident. Missing twice is the start of a new habit. Read 5 pages now.',
        keyMetric: 'Emergency minimum: 5 pages to save momentum',
      },
    ],
  },
  {
    id: 'morning',
    name: 'Morning Rhythms & Energy',
    icon: 'sun',
    description: 'Master your first 60 minutes for sustained physical alertness and focus.',
    questions: [
      {
        id: 'morn-1',
        category: 'Morning Rhythms & Energy',
        question: 'What should I do during the first 30 minutes after waking up?',
        directAnswer: 'The human body loses up to 1 liter of moisture overnight, and sleep inertia leaves residual adenosine. The ideal first 30 minutes consists of 500ml hydration, 5–10 minutes of direct daylight into your eyes to set your circadian timer, and zero screen time.',
        protocol: [
          'Drink 500ml of water immediately upon leaving bed (add a pinch of mineral salt or lemon).',
          'Get natural sunlight into your eyes for 5–10 minutes without looking directly at the sun.',
          'Delay opening notifications or social feeds for at least 30 minutes to protect dopamine levels.',
        ],
        goldenRule: 'Own your morning first 30 minutes, or external notifications will dictate your entire day.',
        keyMetric: '500ml water + 10 mins daylight = +35% alertness',
      },
      {
        id: 'morn-2',
        category: 'Morning Rhythms & Energy',
        question: 'How do I stop hitting an energy crash before midday?',
        directAnswer: 'Midday crashes are primarily driven by two biological factors: early caffeine spiking adenosine before it clears naturally, and high-glycemic breakfast foods causing rapid insulin spikes followed by reactive hypoglycemia.',
        protocol: [
          'Wait 60 to 90 minutes after waking before your first cup of coffee or caffeinated tea.',
          'Ensure your morning meal contains 20–30 grams of protein and healthy fats instead of sugary carbs.',
          'Take a 2-minute walking or stretching break every 50 minutes of continuous seated work.',
        ],
        goldenRule: 'Delay your morning caffeine by 60 minutes to eliminate the 11:00 AM crash completely.',
        keyMetric: '60–90 min caffeine delay',
      },
    ],
  },
  {
    id: 'procrastination',
    name: 'Beating Procrastination',
    icon: 'zap',
    description: 'Break task resistance and overcome friction using behavioral science.',
    questions: [
      {
        id: 'proc-1',
        category: 'Beating Procrastination',
        question: 'How do I start a habit when I feel zero motivation?',
        directAnswer: 'Motivation is an emotional state that follows action, not precedes it. Utilize the 2-Minute Rule: downscale your habit until the starting step takes less than 120 seconds. Once the physical threshold of inertia is crossed, neurochemical momentum takes over.',
        protocol: [
          'Shrink the habit to its simplest starting gateway (e.g. put on running shoes; open page 1; drink 1 glass).',
          'Tell yourself you are only required to do it for 2 minutes and have permission to stop.',
          'In over 80% of attempts, the momentum of starting will naturally carry you through completion.',
        ],
        goldenRule: 'Action produces motivation. Make the starting threshold too small to fail.',
        keyMetric: '2-Minute Rule activates 80%+ completion',
      },
      {
        id: 'proc-2',
        category: 'Beating Procrastination',
        question: 'What is habit stacking and why does it work so effectively?',
        directAnswer: 'Habit stacking ties an unfamiliar desired behavior to an already automatic, established routine using the formula: "After [Current Routine], I will [New Habit]". Because the existing habit already has a dedicated neural pathway, you do not rely on conscious memory or motivation.',
        protocol: [
          'Identify an anchor you do without fail every single day (e.g. brewing morning coffee, brushing teeth).',
          'Schedule your new habit to begin within 10 seconds of concluding that anchor.',
          'Repeat the sequence for 21 consecutive days until the pairing feels involuntary.',
        ],
        goldenRule: 'Tie the new habit to an existing anchor so you never have to remember to do it.',
        keyMetric: 'Formula: After [Current Anchor] → I will [New Habit]',
      },
    ],
  },
  {
    id: 'streaks',
    name: 'Streak Protection & Resilience',
    icon: 'flame',
    description: 'Sustain uninterrupted streaks and bounce back gracefully from disruptions.',
    questions: [
      {
        id: 'strk-1',
        category: 'Streak Protection & Resilience',
        question: 'Is it better to do a 1-minute version of a habit than skip it completely?',
        directAnswer: 'Yes, absolutely. A 1-minute version reinforces your subconscious identity as someone who shows up every single day. The primary benefit of a daily habit is not the volume of work completed on an off-day, but the preservation of your habit identity.',
        protocol: [
          'Establish an "Emergency Minimum" for your top habits (e.g. 5 pages read, 5 pushups, 2 minutes meditation).',
          'When life becomes chaotic or energy is depleted, execute only the emergency minimum.',
          'Check the habit off with pride: you kept the streak alive and defended your standard.',
        ],
        goldenRule: 'A 1-minute habit done on a bad day is worth 10 times more than a 1-hour habit done on a good day.',
        keyMetric: 'Emergency Minimum preserves 100% of habit identity',
      },
      {
        id: 'strk-2',
        category: 'Streak Protection & Resilience',
        question: 'How do I handle travel, illness, or major routine disruptions?',
        directAnswer: 'When your physical environment changes, habits that rely on specific rooms or gym equipment collapse. Switch into "Travel & Recovery Protocol": reduce your habit list to 3 location-independent essentials: hydration, 15 pages of reading, and mindful breathing.',
        protocol: [
          'Temporarily pause specialized habits in the app so your streak metrics reflect reality.',
          'Focus exclusively on your portable anchor habits that require no gear or specialized space.',
          'Reactivate paused habits on the exact day you return to your primary routine.',
        ],
        goldenRule: 'Adapt the format, never abandon the core rhythm.',
        keyMetric: 'Portable core: Reading + Hydration + Breathing',
      },
    ],
  },
  {
    id: 'rest',
    name: 'Sleep, Stress & Night Wind-down',
    icon: 'moon',
    description: 'Optimize restorative sleep, lower evening cortisol, and wake up refreshed.',
    questions: [
      {
        id: 'rest-1',
        category: 'Sleep, Stress & Night Wind-down',
        question: 'What is the optimal evening routine to guarantee deep restorative sleep?',
        directAnswer: 'Deep sleep is dictated by body temperature drops and melatonin synthesis. Blue light from phones or tablets suppresses melatonin by up to 50%. The ideal protocol is dimming lights 60 minutes before bed, reading a physical book for 15–20 minutes, and keeping the bedroom cool (18–20°C / 65–68°F).',
        protocol: [
          'Turn off harsh ceiling fixtures 1 hour before sleep; use low, warm floor or table lamps.',
          'Dock your phone across the room or outside the bedroom 45 minutes before sleep.',
          'Read 15 pages of your book in bed to naturally induce cognitive fatigue and relaxation.',
        ],
        goldenRule: 'Tomorrow morning’s energy is decided by tonight’s wind-down routine.',
        keyMetric: 'Cool bedroom (18–20°C) + 45 min no screens',
      },
      {
        id: 'rest-2',
        category: 'Sleep, Stress & Night Wind-down',
        question: 'What quick breathing exercise stops racing thoughts at bedtime?',
        directAnswer: 'The physiological sigh (two quick inhales through the nose followed by a long, slow exhale through the mouth) or 4-7-8 breathing triggers the parasympathetic nervous system, lowering heart rate and stopping cortisol production in under 2 minutes.',
        protocol: [
          'Inhale through your nose for 4 seconds.',
          'Hold your breath comfortably for 7 seconds.',
          'Exhale smoothly through your mouth for 8 seconds.',
          'Repeat for 4 consecutive cycles while lying flat in bed with eyes closed.',
        ],
        goldenRule: 'Extended exhales stimulate the vagus nerve and downshift your nervous system into deep rest.',
        keyMetric: '4-7-8 Breathing lowers heart rate in 120 seconds',
      },
    ],
  },
];

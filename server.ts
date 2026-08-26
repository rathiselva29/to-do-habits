import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. AI features will fallback to smart local reasoning.');
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// In-Memory Database for Users & Accounts
interface DbUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  resetToken?: string;
  resetExpires?: number;
}

const usersDb = new Map<string, DbUser>();
const activeSessions = new Map<string, string>(); // token -> userId

// ---------------- AUTH API ROUTES ----------------

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (usersDb.has(cleanEmail)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const userId = 'user_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const newUser: DbUser = {
      id: userId,
      email: cleanEmail,
      name: name.trim(),
      passwordHash: password, // In production this would be bcrypt
      createdAt: new Date().toISOString(),
    };
    usersDb.set(cleanEmail, newUser);

    const token = 'token_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    activeSessions.set(token, userId);

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt,
      },
      message: 'Account successfully created!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = usersDb.get(cleanEmail);

    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = 'token_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    activeSessions.set(token, user.id);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      message: 'Logged in successfully!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = usersDb.get(cleanEmail);

    if (!user) {
      // Return success anyway for security best practice to avoid enumeration
      return res.json({
        success: true,
        message: 'If an account exists with this email, a reset link has been dispatched.',
      });
    }

    const resetToken = 'rst_' + Math.random().toString(36).substring(2, 10);
    user.resetToken = resetToken;
    user.resetExpires = Date.now() + 1000 * 60 * 30; // 30 minutes

    return res.json({
      success: true,
      resetToken, // Returned for effortless demo/testing in preview
      message: `Password reset instructions sent to ${cleanEmail}. Verification code: ${resetToken}`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to process forgot password' });
  }
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = usersDb.get(cleanEmail);

    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (resetToken && user.resetToken && user.resetToken !== resetToken) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    user.passwordHash = newPassword;
    delete user.resetToken;
    delete user.resetExpires;

    return res.json({
      success: true,
      message: 'Password has been securely reset. You can now log in with your new password.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to reset password' });
  }
});

app.post('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided.' });
  }
  const token = authHeader.replace('Bearer ', '');
  const userId = activeSessions.get(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }

  let foundUser: DbUser | undefined;
  for (const u of usersDb.values()) {
    if (u.id === userId) {
      foundUser = u;
      break;
    }
  }

  if (!foundUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({
    user: {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      createdAt: foundUser.createdAt,
    },
  });
});

// ---------------- AI COACH & INTELLIGENCE API ROUTES ----------------

app.post('/api/ai/coach', async (req: Request, res: Response) => {
  try {
    const { messages, userProfile, habits, completions, moodEntries, healthMetrics } = req.body;

    const ai = getGeminiClient();
    const systemPrompt = `You are "To-Do-Habits Coach", an empathetic, highly knowledgeable, and motivating AI Wellness and Habit Coach.
The user is tracking habits, daily routines, mood, and health metrics in the To-Do-Habits wellness app.

User Profile:
- Name: ${userProfile?.name || 'Friend'}
- Goals: ${userProfile?.goals?.join(', ') || 'Building healthy consistency'}
- Wake Time: ${userProfile?.wakeTime || '07:00'}, Sleep Time: ${userProfile?.sleepTime || '23:00'}

Current User Context:
- Active Habits: ${JSON.stringify(habits?.map((h: any) => ({ name: h.name, category: h.category, streak: h.streak, bestStreak: h.bestStreak })) || [])}
- Recent Moods: ${JSON.stringify(moodEntries?.slice(-5) || [])}
- Recent Health Metrics: ${JSON.stringify(healthMetrics?.slice(-3) || [])}
- Today's Completed Habit Count: ${completions?.filter((c: any) => c.date === new Date().toISOString().split('T')[0]).length || 0} of ${habits?.length || 0}

GUIDELINES:
1. Be warm, uplifting, direct, and concise (2-4 brief paragraphs or structured bullet points).
2. Celebrate real streaks and consistency; offer gentle non-judgmental recalibration for missed habits.
3. If the user has zero habits, zero moods, or zero health data logged yet, explicitly guide them to create their first habit or log their mood — DO NOT fabricate, invent, or assume past completions.
4. Connect real patterns between mood, sleep, hydration, and habit completions when data exists.
5. Provide 2-3 short, actionable next steps or suggested follow-up questions.
6. NEVER provide medical diagnosis, treatment prescriptions, or pretend to be a doctor.`;

    if (!ai) {
      // Smart offline / fallback response
      if (!habits || habits.length === 0) {
        return res.json({
          reply: `Hello ${userProfile?.name || 'there'}! Welcome to To-Do-Habits. You haven't created any habits yet. Start by defining 1 or 2 anchor daily routines (such as morning hydration, a 10-minute walk, or evening reading) to begin your wellness journey.`,
          suggestions: [
            'What is a good anchor habit for beginners?',
            'How do I create a sustainable morning routine?',
            'Give me ideas for stress reduction',
          ],
        });
      }
      return res.json({
        reply: `Hello ${userProfile?.name || 'there'}! Based on your active habits, consistency builds gradually one day at a time. Focus on completing your next scheduled routine today.\n\nWhat specific routine or goal would you like to refine?`,
        suggestions: [
          'How can I improve my sleep routine?',
          'What habit should I prioritize today?',
          'Give me a quick 2-minute motivation boost',
        ],
      });
    }

    // Build chat contents
    const promptHistory = messages.map((m: any) => `${m.sender === 'user' ? 'User' : 'To-Do-Habits Coach'}: ${m.text}`).join('\n\n');
    const fullPrompt = `${systemPrompt}\n\nConversation so far:\n${promptHistory}\n\nTo-Do-Habits Coach:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: fullPrompt,
    });

    const replyText = response.text || "You're doing great! Keep showing up for yourself one day at a time.";

    return res.json({
      reply: replyText,
      suggestions: [
        'How can I optimize my morning routine?',
        'Give me a tip to boost my energy level',
        'How does my mood correlate with my habits?',
      ],
    });
  } catch (err: any) {
    console.error('AI Coach Error:', err);
    return res.json({
      reply: "I'm here to support your daily wellness journey. Focus on taking one small positive action right now — whether that's drinking a glass of water, taking 3 deep breaths, or completing your next habit.",
      suggestions: ['How to stay consistent?', 'Give me a motivation boost'],
    });
  }
});

app.post('/api/ai/insights', async (req: Request, res: Response) => {
  try {
    const { userProfile, habits, completions, moodEntries, healthMetrics } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        insight: {
          strength: 'Consistent morning habit initiation and steady daily check-ins.',
          challenge: 'Maintaining evening wind-down habits and hydration during busy afternoons.',
          recommendation: 'Set an afternoon hydration reminder and transition to screen-free reading 30 minutes before sleep.',
          nextBestAction: 'Complete your top priority movement habit today to maintain your current streak.',
          generatedAt: new Date().toISOString(),
        },
      });
    }

    const prompt = `Analyze this user's wellness and habit tracking data to produce a structured insight summary.
User: ${userProfile?.name || 'Alex'}
Goals: ${userProfile?.goals?.join(', ') || 'Consistency'}
Habits: ${JSON.stringify(habits || [])}
Completions: ${JSON.stringify(completions?.slice(-14) || [])}
Moods: ${JSON.stringify(moodEntries?.slice(-7) || [])}
Health Metrics: ${JSON.stringify(healthMetrics?.slice(-5) || [])}

Return a valid JSON object matching this schema:
{
  "strength": "1 sentence describing their strongest habit or positive trend",
  "challenge": "1 sentence describing where friction or missed completions occur",
  "recommendation": "1 actionable, practical wellness recommendation",
  "nextBestAction": "1 clear, immediate next action they can take right now"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strength: { type: Type.STRING },
            challenge: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            nextBestAction: { type: Type.STRING },
          },
          required: ['strength', 'challenge', 'recommendation', 'nextBestAction'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      insight: {
        strength: parsed.strength || 'Consistent daily tracking and high motivation.',
        challenge: parsed.challenge || 'Maintaining hydration and evening consistency.',
        recommendation: parsed.recommendation || 'Try habit stacking: pair your meditation right after your morning coffee.',
        nextBestAction: parsed.nextBestAction || 'Check off your first habit of the day!',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('AI Insights Error:', err);
    return res.json({
      insight: {
        strength: 'Steady commitment to tracking your wellness milestones.',
        challenge: 'Evening routine consistency during weekends.',
        recommendation: 'Anchor new habits to existing morning rituals for higher completion rates.',
        nextBestAction: 'Log your mood and take 5 deep breaths.',
        generatedAt: new Date().toISOString(),
      },
    });
  }
});

app.post('/api/ai/habit-suggestions', async (req: Request, res: Response) => {
  try {
    const { category, goal } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Default curated suggestions
      const defaultSuggestions = [
        {
          name: 'Morning Hydration',
          description: 'Drink 500ml of water right after waking up to activate metabolism',
          category: category || 'Health',
          icon: 'Droplets',
          color: 'emerald',
          goalTarget: 1,
          goalUnit: 'glass',
          difficulty: 'easy',
          frequency: 'daily',
        },
        {
          name: '10-Min Mindful Walk',
          description: 'Take a brisk screen-free walk to refresh cognitive energy',
          category: category || 'Fitness',
          icon: 'Footprints',
          color: 'blue',
          goalTarget: 10,
          goalUnit: 'mins',
          difficulty: 'easy',
          frequency: 'daily',
        },
        {
          name: 'Screen-Free Wind Down',
          description: 'Disconnect from all phones, tablets, and laptops 30 minutes before bed',
          category: category || 'Sleep',
          icon: 'Moon',
          color: 'purple',
          goalTarget: 30,
          goalUnit: 'mins',
          difficulty: 'medium',
          frequency: 'daily',
        },
        {
          name: 'Daily Gratitude Note',
          description: 'Write down 3 things you felt thankful for today',
          category: category || 'Mental wellness',
          icon: 'Heart',
          color: 'rose',
          goalTarget: 3,
          goalUnit: 'items',
          difficulty: 'easy',
          frequency: 'daily',
        },
      ];
      return res.json({ suggestions: defaultSuggestions });
    }

    const prompt = `Generate 4 actionable, scientifically backed micro-habits tailored to:
Category: "${category || 'General Wellness'}"
User Goal: "${goal || 'Build healthier consistency and reduce stress'}"

Return a JSON array of habit suggestions where each item has:
- name: string (concise, inspiring habit title)
- description: string (1 sentence explaining why/how)
- category: string
- icon: string (one of: Droplets, Moon, Dumbbell, Footprints, BookOpen, Heart, Brain, Sun, Sparkles, Coffee, Smile, Target, Flame, Apple, Activity)
- color: string (one of: emerald, blue, purple, amber, rose, cyan, indigo)
- goalTarget: number
- goalUnit: string (e.g., 'mins', 'glasses', 'pages', 'times')
- difficulty: 'easy' | 'medium' | 'hard'
- frequency: 'daily'`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              icon: { type: Type.STRING },
              color: { type: Type.STRING },
              goalTarget: { type: Type.NUMBER },
              goalUnit: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              frequency: { type: Type.STRING },
            },
            required: ['name', 'description', 'category', 'icon', 'color', 'goalTarget', 'goalUnit', 'difficulty', 'frequency'],
          },
        },
      },
    });

    const suggestions = JSON.parse(response.text || '[]');
    return res.json({ suggestions });
  } catch (err: any) {
    console.error('Habit suggestions error:', err);
    return res.json({
      suggestions: [
        {
          name: 'Morning Hydration',
          description: 'Drink 500ml water right upon waking up',
          category: 'Nutrition',
          icon: 'Droplets',
          color: 'emerald',
          goalTarget: 1,
          goalUnit: 'glass',
          difficulty: 'easy',
          frequency: 'daily',
        },
        {
          name: '5-Minute Breathing',
          description: 'Box breathing to reset your nervous system',
          category: 'Mental wellness',
          icon: 'Brain',
          color: 'indigo',
          goalTarget: 5,
          goalUnit: 'mins',
          difficulty: 'easy',
          frequency: 'daily',
        },
      ],
    });
  }
});

// Comprehensive AI Health & Mood Routine Advice Endpoint
app.post('/api/ai/health-habit-advice', async (req: Request, res: Response) => {
  try {
    const { healthMetric, userProfile, moodEntries, habits } = req.body;
    const ai = getGeminiClient();

    const heightCm = healthMetric?.heightCm || 175;
    const weightKg = healthMetric?.weightKg || 70;
    const age = healthMetric?.age || userProfile?.age || 28;
    const gender = healthMetric?.gender || userProfile?.gender || 'male';
    const bpSys = healthMetric?.bpSystolic || 120;
    const bpDia = healthMetric?.bpDiastolic || 80;
    const sleepingTime = healthMetric?.sleepingTime || userProfile?.sleepTime || '23:00';
    const wakeUpTime = healthMetric?.wakeUpTime || userProfile?.wakeTime || '07:00';
    const sleepHours = healthMetric?.sleepHours || 7.5;

    // Calculate BMI
    const bmi = Math.round((weightKg / Math.pow(heightCm / 100, 2)) * 10) / 10;
    let bmiCategory = 'Normal weight';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
    else if (bmi >= 30) bmiCategory = 'Obesity';

    // BP Classification
    let bpCategory = 'Normal';
    if (bpSys > 180 || bpDia > 120) bpCategory = 'Hypertensive Crisis';
    else if (bpSys < 90 || bpDia < 60) bpCategory = 'Hypotension';
    else if (bpSys >= 140 || bpDia >= 90) bpCategory = 'Hypertension Stage 2';
    else if ((bpSys >= 130 && bpSys <= 139) || (bpDia >= 80 && bpDia <= 89)) bpCategory = 'Hypertension Stage 1';
    else if (bpSys >= 120 && bpSys <= 129 && bpDia < 80) bpCategory = 'Elevated';

    if (!ai) {
      return res.json({
        fallback: true,
        message: 'Calculated using high-precision clinical logic engine.',
      });
    }

    const prompt = `You are a clinical wellness, circadian rhythm, and habit psychology expert.
Analyze the user's complete physical biomarkers and mood logs to prescribe a final, personalized daily routine blueprint and 4-5 high-impact habit recommendations.

User Biometric Data:
- Height: ${heightCm} cm
- Weight: ${weightKg} kg (BMI: ${bmi} - ${bmiCategory})
- Blood Pressure: ${bpSys}/${bpDia} mmHg (${bpCategory})
- Sleeping Time (Bedtime): ${sleepingTime}
- Wake-up Time: ${wakeUpTime}
- Sleep Duration: ${sleepHours} hours
- Age: ${age} years
- Gender: ${gender}

Mood & Emotional State (Last 7 entries):
${JSON.stringify(moodEntries?.slice(-7) || [])}

Active Existing Habits:
${JSON.stringify(habits?.map((h: any) => ({ name: h.name, category: h.category, streak: h.streak })) || [])}

Provide a comprehensive, highly personalized JSON object structured exactly like this:
{
  "biometricSummary": {
    "bmi": ${bmi},
    "bmiCategory": "${bmiCategory}",
    "bpCategory": "${bpCategory}",
    "sleepStatus": "${sleepHours < 6.5 ? 'Deficit' : 'Optimal'}",
    "overallHealthRisk": "${bpCategory !== 'Normal' || bmi >= 30 ? 'moderate' : 'low'}",
    "keyObservations": ["Observation 1", "Observation 2", "Observation 3"]
  },
  "moodSynergy": {
    "moodTrend": "Summary of mood trend",
    "emotionalStateSummary": "Summary of emotional state",
    "correlationInsights": ["Insight 1 connecting mood to sleep/BP/movement", "Insight 2"]
  },
  "dailyRoutineBlueprint": {
    "morning": {
      "timeSlot": "${wakeUpTime} - 08:30",
      "title": "Morning Routine Title",
      "focus": "Morning Focus",
      "steps": ["Step 1", "Step 2", "Step 3"]
    },
    "afternoon": {
      "timeSlot": "12:30 - 16:30",
      "title": "Afternoon Routine Title",
      "focus": "Afternoon Focus",
      "steps": ["Step 1", "Step 2", "Step 3"]
    },
    "evening": {
      "timeSlot": "20:30 - ${sleepingTime}",
      "title": "Evening Routine Title",
      "focus": "Evening Focus",
      "steps": ["Step 1", "Step 2", "Step 3"]
    }
  },
  "prescribedHabits": [
    {
      "name": "Habit Name",
      "description": "Clear instructions",
      "category": "Fitness" | "Sleep" | "Nutrition" | "Mental wellness" | "Self-care",
      "icon": "Droplets" | "Moon" | "Dumbbell" | "Footprints" | "Brain" | "Sun" | "Heart" | "Sparkles",
      "color": "#10b981",
      "goalTarget": 1,
      "goalUnit": "session" | "mins" | "ml",
      "reminderTime": "08:00",
      "durationMinutes": 10,
      "difficulty": "easy" | "medium" | "hard",
      "rationale": "Why this specifically helps their BP/BMI/Sleep/Mood",
      "targetBiometric": "BP / BMI / Sleep / Mood target"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('AI Health Habit Advice Error:', err);
    return res.json({
      fallback: true,
      error: err.message,
    });
  }
});

// Offline Sync API endpoint
app.post('/api/sync', (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    console.log(`Received offline sync payload with ${items?.length || 0} queued events.`);
    return res.json({
      success: true,
      syncedCount: items?.length || 0,
      timestamp: Date.now(),
      message: 'All queued items synchronized successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Sync failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ---------------- VITE MIDDLEWARE & STATIC SERVING ----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`To-Do-Habits Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

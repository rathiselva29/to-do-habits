import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, HabitCategory, Habit } from '../types';
import { StorageService, DEFAULT_PROFILE, INITIAL_NOTIFICATIONS, generateStarterHabitsForUser, getTodayDateString } from '../services/storage';
import { 
  getSupabase, 
  isSupabaseConfigured, 
  validatePassword, 
  validateEmail, 
  formatSupabaseAuthError 
} from '../services/supabase';
import { SupabaseDataService } from '../services/supabaseData';
import { FirestoreDataService, sanitizeForFirestore } from '../services/firestoreData';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateFirebaseProfile,
  db,
  doc,
  getDoc,
  setDoc,
  FirebaseUser,
} from '../services/firebase';

interface AuthContextType {
  user: UserProfile | null;
  profiles: UserProfile[];
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPasswordRecoveryMode: boolean;
  authProviderType: 'supabase' | 'firebase' | 'demo';
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuestDemo: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  updatePassword: (newPassword: string) => Promise<{ message: string }>;
  cancelPasswordRecovery: () => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  switchProfile: (profileId: string) => Promise<void>;
  createProfile: (profileData: {
    name: string;
    avatarUrl?: string;
    bio?: string;
    motivation?: string;
    selectedCategories?: HabitCategory[];
    goals?: string[];
    reminderTimePreference?: string;
    wakeTime?: string;
    sleepTime?: string;
    starterHabits?: Array<{
      name: string;
      category: HabitCategory;
      icon: string;
      color: string;
      goalTarget: number;
      goalUnit: string;
      reminderTime: string;
    }>;
  }) => Promise<UserProfile>;
  deleteProfile: (profileId: string) => Promise<void>;
  completeOnboarding: (onboardingData: {
    name?: string;
    avatarUrl?: string;
    bio?: string;
    motivation?: string;
    selectedCategories: HabitCategory[];
    goals: string[];
    reminderTimePreference: string;
    wakeTime: string;
    sleepTime: string;
    customStarters?: Habit[];
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => StorageService.getProfile());
  const [profiles, setProfiles] = useState<UserProfile[]>(() => StorageService.getProfiles());
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPasswordRecoveryMode, setIsPasswordRecoveryMode] = useState<boolean>(false);
  const [authProviderType, setAuthProviderType] = useState<'supabase' | 'firebase' | 'demo'>('firebase');

  // Helper to sync or initialize Supabase profile
  const syncSupabaseProfile = async (sbUser: any, fallbackName?: string): Promise<UserProfile> => {
    try {
      const existing = await SupabaseDataService.fetchProfile(sbUser.id);
      if (existing) {
        StorageService.saveProfile(existing);
        return existing;
      }

      // Create new profile record in Supabase
      const newProfile: UserProfile = {
        ...DEFAULT_PROFILE,
        id: sbUser.id,
        email: sbUser.email || '',
        name: sbUser.user_metadata?.name || fallbackName || (sbUser.email ? sbUser.email.split('@')[0] : 'User'),
        avatarUrl: sbUser.user_metadata?.avatar_url || '',
        isOnboarded: false,
        createdAt: new Date().toISOString(),
      };

      await SupabaseDataService.upsertProfile(newProfile);
      StorageService.saveProfile(newProfile);
      return newProfile;
    } catch (err) {
      console.warn('Supabase profile sync warning:', err);
      const fallback: UserProfile = {
        ...DEFAULT_PROFILE,
        id: sbUser.id,
        email: sbUser.email || '',
        name: sbUser.user_metadata?.name || fallbackName || (sbUser.email ? sbUser.email.split('@')[0] : 'User'),
        avatarUrl: sbUser.user_metadata?.avatar_url || '',
        isOnboarded: false,
        createdAt: new Date().toISOString(),
      };
      StorageService.saveProfile(fallback);
      return fallback;
    }
  };

  // Helper to sync or initialize Firebase profile (secondary fallback)
  const syncFirebaseProfile = async (fbUser: FirebaseUser, fallbackName?: string): Promise<UserProfile> => {
    try {
      const userDocRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        const fullProfile: UserProfile = {
          ...DEFAULT_PROFILE,
          ...data,
          id: fbUser.uid,
          email: fbUser.email || data.email || '',
          name: data.name || fbUser.displayName || fallbackName || (fbUser.email ? fbUser.email.split('@')[0] : 'User'),
          avatarUrl: fbUser.photoURL || data.avatarUrl || '',
        };
        StorageService.saveProfile(fullProfile);
        return fullProfile;
      } else {
        const newProfile: UserProfile = {
          ...DEFAULT_PROFILE,
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || fallbackName || (fbUser.email ? fbUser.email.split('@')[0] : 'User'),
          avatarUrl: fbUser.photoURL || '',
          isOnboarded: false,
          createdAt: new Date().toISOString(),
        };
        const sanitized = sanitizeForFirestore(newProfile);
        await setDoc(userDocRef, sanitized);
        StorageService.saveProfile(newProfile);
        return newProfile;
      }
    } catch (err) {
      console.warn('Firebase profile sync fallback:', err);
      const fallback: UserProfile = {
        ...DEFAULT_PROFILE,
        id: fbUser.uid,
        email: fbUser.email || '',
        name: fbUser.displayName || fallbackName || (fbUser.email ? fbUser.email.split('@')[0] : 'User'),
        avatarUrl: fbUser.photoURL || '',
        isOnboarded: false,
        createdAt: new Date().toISOString(),
      };
      StorageService.saveProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    // Check URL parameters for OAuth recovery / reset tokens
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    if (
      hash.includes('type=recovery') || 
      search.includes('type=recovery') || 
      hash.includes('type=invite') ||
      search.includes('reset=true')
    ) {
      setIsPasswordRecoveryMode(true);
    }

    const initAuth = async () => {
      try {
        // Sync local cache with IndexedDB
        await StorageService.syncFromIndexedDB();
        const activeProfile = StorageService.getProfile();
        const allProfiles = StorageService.getProfiles();
        setProfiles(allProfiles);

        if (activeProfile && activeProfile.isOnboarded) {
          setUser(activeProfile);
        }
      } catch (e) {
        console.warn('Initial storage hydration note:', e);
      }

      const supabase = getSupabase();

      // 1. SUPABASE AUTH FLOW (If configured)
      if (supabase && isSupabaseConfigured) {
        setAuthProviderType('supabase');

        supabase.auth.getSession().then(async ({ data: { session }, error }) => {
          try {
            if (error) {
              console.warn('Error fetching Supabase session:', error.message);
            }
            if (session?.user) {
              const profile = await syncSupabaseProfile(session.user);
              setUser(profile);
            } else {
              // Retain existing local/onboarded profile
              const local = StorageService.getProfile();
              if (local && local.isOnboarded) {
                setUser(local);
                setAuthProviderType('demo');
              }
            }
          } catch (e) {
            console.warn('Supabase session init note:', e);
          } finally {
            setIsLoading(false);
          }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
              setIsPasswordRecoveryMode(true);
            }

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
              if (session?.user) {
                const profile = await syncSupabaseProfile(session.user);
                setUser(profile);
              }
            } else if (event === 'SIGNED_OUT') {
              // Don't wipe persistent local profile
              setIsPasswordRecoveryMode(false);
            }
            setIsLoading(false);
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      }

      // 2. FIREBASE AUTH FLOW (Fallback when Supabase not configured)
      setAuthProviderType('firebase');
      const localProfile = StorageService.getProfile();
      if (localProfile && localProfile.isOnboarded) {
        setUser(localProfile);
        setAuthProviderType('demo');
        setIsLoading(false);
        return;
      }

      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        try {
          if (fbUser) {
            setFirebaseUser(fbUser);
            const profile = await syncFirebaseProfile(fbUser);
            setUser(profile);
          } else {
            setFirebaseUser(null);
            const currentLocal = StorageService.getProfile();
            if (currentLocal && currentLocal.isOnboarded) {
              setUser(currentLocal);
            }
          }
        } catch (err) {
          console.warn('Firebase auth state note:', err);
        } finally {
          setIsLoading(false);
        }
      });

      return () => {
        unsubscribe();
      };
    };

    initAuth();
  }, []);

  // 1. Email + Password Sign In
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim();
    if (!validateEmail(cleanEmail)) {
      setIsLoading(false);
      throw new Error('Please enter a valid email address (e.g. name@example.com).');
    }
    if (!password) {
      setIsLoading(false);
      throw new Error('Please enter your password.');
    }

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          throw new Error(formatSupabaseAuthError(error));
        }

        if (data.user) {
          const profile = await syncSupabaseProfile(data.user);
          setUser(profile);
          setAuthProviderType('supabase');
        }
      } catch (err: any) {
        throw new Error(err.message || 'Failed to sign in. Please verify your credentials.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Firebase fallback
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const profile = await syncFirebaseProfile(cred.user);
      setUser(profile);
      setFirebaseUser(cred.user);
      setAuthProviderType('firebase');
    } catch (err: any) {
      let message = 'Failed to sign in. Please verify your email and password.';
      const code = err?.code || '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
        message = 'Incorrect password or email. Please check your credentials or click "Forgot Password".';
      } else if (code === 'auth/user-not-found') {
        message = 'No account found with this email. Click "Create Account" above to register a new account.';
      } else if (code === 'auth/invalid-email') {
        message = 'The email address format is invalid. Please enter a valid email.';
      } else if (code === 'auth/user-disabled') {
        message = 'This user account has been disabled. Please contact support.';
      } else if (code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to multiple failed login attempts. Please reset your password or try again later.';
      } else if (err.message) {
        message = err.message;
      }
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Email + Password Registration
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setIsLoading(false);
      throw new Error('Please enter your full name.');
    }
    if (!validateEmail(cleanEmail)) {
      setIsLoading(false);
      throw new Error('Please enter a valid email address.');
    }
    const pwdCheck = validatePassword(password);
    if (!pwdCheck.isValid) {
      setIsLoading(false);
      throw new Error(pwdCheck.message);
    }

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: cleanName,
            },
          },
        });

        if (error) {
          throw new Error(formatSupabaseAuthError(error));
        }

        if (data.user) {
          const profile = await syncSupabaseProfile(data.user, cleanName);
          setUser(profile);
          setAuthProviderType('supabase');
        }
      } catch (err: any) {
        throw new Error(err.message || 'Failed to register account.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Firebase fallback
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      if (auth.currentUser && cleanName) {
        try {
          await updateFirebaseProfile(auth.currentUser, { displayName: cleanName });
        } catch (e) {
          console.warn('Profile display name update note:', e);
        }
      }
      const profile = await syncFirebaseProfile(cred.user, cleanName);
      setUser(profile);
      setFirebaseUser(cred.user);
      setAuthProviderType('firebase');
    } catch (err: any) {
      let message = 'Failed to register account.';
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        message = 'An account already exists with this email address. Please switch to "Sign In" to access your account.';
      } else if (code === 'auth/invalid-email') {
        message = 'Please provide a valid email address.';
      } else if (code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 8 characters with letters and numbers.';
      } else if (err.message) {
        message = err.message;
      }
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Continue with Google OAuth
  const loginWithGoogle = async () => {
    setIsLoading(true);
    const supabase = getSupabase();

    if (supabase && isSupabaseConfigured) {
      try {
        const redirectUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (error) {
          throw new Error(formatSupabaseAuthError(error));
        }
      } catch (err: any) {
        setIsLoading(false);
        throw new Error(err.message || 'Failed to initiate Google sign-in.');
      }
      return;
    }

    // Firebase Google Sign In fallback
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await syncFirebaseProfile(result.user);
      setUser(profile);
      setFirebaseUser(result.user);
      setAuthProviderType('firebase');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        throw new Error('Google Sign-In was cancelled because the popup window was closed.');
      } else if (code === 'auth/popup-blocked') {
        throw new Error('Pop-up was blocked by your browser. Please allow popups or sign in with Email & Password.');
      } else if (code === 'auth/cancelled-popup-request') {
        throw new Error('Google Sign-In request was cancelled.');
      }
      throw new Error(err.message || 'Google Sign-In could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Instant Quick Tour (Demo Explorer)
  const loginAsGuestDemo = async () => {
    setIsLoading(true);
    try {
      const guestId = 'demo-guest-' + Math.random().toString(36).substring(2, 9);
      const guestProfile: UserProfile = {
        ...DEFAULT_PROFILE,
        id: guestId,
        name: 'Demo Explorer',
        email: 'demo@todohabits.local',
        isOnboarded: true,
        selectedCategories: ['Fitness', 'Nutrition', 'Mental wellness', 'Productivity'],
        goals: ['Build consistency', 'Improve health', 'Reduce stress'],
        createdAt: new Date().toISOString(),
      };
      const starterHabits = generateStarterHabitsForUser(guestProfile.selectedCategories, guestId);
      StorageService.saveProfile(guestProfile);
      StorageService.saveHabits(starterHabits);
      setUser(guestProfile);
      setAuthProviderType('demo');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Real Forgot Password
  const forgotPassword = async (email: string) => {
    const cleanEmail = email.trim();
    if (!validateEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      try {
        const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/#type=recovery` : '';
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectUrl,
        });

        if (error) {
          throw new Error(formatSupabaseAuthError(error));
        }

        return {
          message: `A password reset link has been dispatched to ${cleanEmail}. Please check your inbox to update your password.`,
        };
      } catch (err: any) {
        throw new Error(err.message || 'Failed to send password reset email.');
      }
    }

    // Firebase fallback
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return {
        message: `A password reset link has been dispatched to ${cleanEmail}. Please check your inbox and follow the instructions.`,
      };
    } catch (err: any) {
      let message = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        message = 'No registered account found with this email address.';
      } else if (err.message) {
        message = err.message;
      }
      throw new Error(message);
    }
  };

  // 6. Real Password Update (when arriving from reset email)
  const updatePassword = async (newPassword: string) => {
    const pwdCheck = validatePassword(newPassword);
    if (!pwdCheck.isValid) {
      throw new Error(pwdCheck.message);
    }

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          throw new Error(formatSupabaseAuthError(error));
        }
        setIsPasswordRecoveryMode(false);
        // Clear hash from URL
        if (typeof window !== 'undefined' && window.history) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        return { message: 'Password updated successfully! You can now use your new password.' };
      } catch (err: any) {
        throw new Error(err.message || 'Failed to update password.');
      }
    }

    setIsPasswordRecoveryMode(false);
    return { message: 'Password updated successfully.' };
  };

  const cancelPasswordRecovery = () => {
    setIsPasswordRecoveryMode(false);
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // 7. Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      const supabase = getSupabase();
      if (supabase && isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      if (firebaseUser) {
        await signOut(auth);
      }
      setUser(null);
      setFirebaseUser(null);
      setIsPasswordRecoveryMode(false);
      StorageService.resetAllData();
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Update Profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    StorageService.saveProfile(updated);
    setProfiles(StorageService.getProfiles());

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      await SupabaseDataService.upsertProfile(updated);
      return;
    }

    if (firebaseUser) {
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const clean = sanitizeForFirestore(updated);
        await setDoc(userDocRef, clean, { merge: true });
      } catch (err) {
        console.error('Error saving profile to Firestore:', err);
      }
    }
  };

  // 9. Switch Profile
  const switchProfile = async (profileId: string) => {
    StorageService.setActiveProfileId(profileId);
    const active = StorageService.getProfile();
    if (active) {
      setUser(active);
      setProfiles(StorageService.getProfiles());
    }
  };

  // 10. Create New Profile (Starts fresh tracking from 0!)
  const createProfile = async (profileData: {
    name: string;
    avatarUrl?: string;
    bio?: string;
    motivation?: string;
    selectedCategories?: HabitCategory[];
    goals?: string[];
    reminderTimePreference?: string;
    wakeTime?: string;
    sleepTime?: string;
    starterHabits?: Array<{
      name: string;
      category: HabitCategory;
      icon: string;
      color: string;
      goalTarget: number;
      goalUnit: string;
      reminderTime: string;
    }>;
  }): Promise<UserProfile> => {
    const newId = 'profile-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const newProfile: UserProfile = {
      ...DEFAULT_PROFILE,
      id: newId,
      name: profileData.name || 'Habit Builder',
      email: `${(profileData.name || 'user').toLowerCase().replace(/\s+/g, '')}@todohabits.app`,
      avatarUrl: profileData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: profileData.bio || 'Tracking daily habits and staying consistent.',
      motivation: profileData.motivation || 'Build daily consistency from day 1',
      selectedCategories: profileData.selectedCategories || ['Fitness', 'Nutrition', 'Mental wellness', 'Productivity'],
      goals: profileData.goals || ['Build consistency', 'Track everyday routines'],
      reminderTimePreference: profileData.reminderTimePreference || '08:00',
      wakeTime: profileData.wakeTime || '07:00',
      sleepTime: profileData.sleepTime || '23:00',
      isOnboarded: true,
      theme: 'light',
      units: 'metric',
      createdAt: new Date().toISOString(),
    };

    // Generate fresh starter habits with 0 completions, 0 streak, 0 tracking!
    let habitsToSave: Habit[] = [];
    if (profileData.starterHabits && profileData.starterHabits.length > 0) {
      habitsToSave = profileData.starterHabits.map((h, idx) => ({
        id: `habit-${newId}-${idx}-${Date.now().toString(36)}`,
        userId: newId,
        name: h.name,
        category: h.category,
        icon: h.icon,
        color: h.color,
        frequency: 'daily',
        goalTarget: h.goalTarget,
        goalUnit: h.goalUnit,
        reminderTime: h.reminderTime || '08:00',
        difficulty: 'medium',
        startDate: getTodayDateString(),
        streak: 0,
        bestStreak: 0,
        totalCompletions: 0,
        isArchived: false,
        isPaused: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    } else {
      habitsToSave = generateStarterHabitsForUser(newProfile.selectedCategories, newId);
    }

    // Save profile, habits, and empty tracking data (completions, moods, metrics starting fresh at 0)
    StorageService.saveHabitsForUser(newId, habitsToSave);
    StorageService.saveCompletionsForUser(newId, []);
    StorageService.saveMoodsForUser(newId, []);
    StorageService.saveHealthMetricsForUser(newId, []);
    StorageService.saveNotificationSettings({
      ...INITIAL_NOTIFICATIONS,
      reminderTime: profileData.reminderTimePreference || profileData.wakeTime || '07:00',
    }, newId);
    StorageService.saveProfile(newProfile);

    // Sync to Supabase if configured
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      await SupabaseDataService.upsertProfile(newProfile);
      for (const h of habitsToSave) {
        await SupabaseDataService.saveHabit(h);
      }
    }

    setUser(newProfile);
    setProfiles(StorageService.getProfiles());
    return newProfile;
  };

  // 11. Delete Profile
  const deleteProfile = async (profileId: string) => {
    const next = StorageService.deleteProfile(profileId);
    setUser(next);
    setProfiles(StorageService.getProfiles());
  };

  // 12. Complete Onboarding
  const completeOnboarding = async (onboardingData: {
    name?: string;
    avatarUrl?: string;
    bio?: string;
    motivation?: string;
    selectedCategories: HabitCategory[];
    goals: string[];
    reminderTimePreference: string;
    wakeTime: string;
    sleepTime: string;
    customStarters?: Habit[];
  }) => {
    const existingUser = user || StorageService.getProfile();
    const userId = existingUser?.id || ('user-' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36));
    
    const updated: UserProfile = {
      ...(existingUser || DEFAULT_PROFILE),
      id: userId,
      name: onboardingData.name || existingUser?.name || 'Habit Builder',
      email: existingUser?.email || 'local@todohabits.app',
      avatarUrl: onboardingData.avatarUrl || existingUser?.avatarUrl || '',
      bio: onboardingData.bio || existingUser?.bio || '',
      motivation: onboardingData.motivation || existingUser?.motivation || 'Build daily consistency',
      selectedCategories: onboardingData.selectedCategories,
      goals: onboardingData.goals,
      reminderTimePreference: onboardingData.reminderTimePreference,
      wakeTime: onboardingData.wakeTime,
      sleepTime: onboardingData.sleepTime,
      isOnboarded: true,
      createdAt: existingUser?.createdAt || new Date().toISOString(),
    };

    setUser(updated);
    StorageService.saveProfile(updated);
    setProfiles(StorageService.getProfiles());

    // Save or generate initial focus habits with 0 completions & 0 streaks
    const currentHabits = StorageService.getHabits(userId);
    if (onboardingData.customStarters && onboardingData.customStarters.length > 0) {
      const formattedStarters = onboardingData.customStarters.map(h => ({
        ...h,
        userId,
        streak: 0,
        bestStreak: 0,
        totalCompletions: 0,
      }));
      StorageService.saveHabitsForUser(userId, formattedStarters);
      const supabase = getSupabase();
      if (supabase && isSupabaseConfigured) {
        for (const h of formattedStarters) {
          await SupabaseDataService.saveHabit(h);
        }
      } else if (firebaseUser) {
        for (const h of formattedStarters) {
          await FirestoreDataService.saveHabit(h);
        }
      }
    } else if (currentHabits.length === 0) {
      const starters = generateStarterHabitsForUser(onboardingData.selectedCategories, userId);
      StorageService.saveHabitsForUser(userId, starters);

      const supabase = getSupabase();
      if (supabase && isSupabaseConfigured) {
        for (const h of starters) {
          await SupabaseDataService.saveHabit(h);
        }
      } else if (firebaseUser) {
        for (const h of starters) {
          await FirestoreDataService.saveHabit(h);
        }
      }
    }

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured) {
      await SupabaseDataService.upsertProfile(updated);
    } else if (firebaseUser) {
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const clean = sanitizeForFirestore(updated);
        await setDoc(userDocRef, clean, { merge: true });
      } catch (err) {
        console.error('Error completing onboarding in Firestore:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profiles,
        firebaseUser,
        isAuthenticated: !!user,
        isLoading,
        isPasswordRecoveryMode,
        authProviderType,
        login,
        register,
        loginWithGoogle,
        loginAsGuestDemo,
        forgotPassword,
        updatePassword,
        cancelPasswordRecovery,
        logout,
        updateProfile,
        switchProfile,
        createProfile,
        deleteProfile,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

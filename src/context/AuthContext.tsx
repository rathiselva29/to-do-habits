import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, HabitCategory } from '../types';
import { StorageService, DEFAULT_PROFILE, generateStarterHabitsForUser } from '../services/storage';
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
  FirebaseUser
} from '../services/firebase';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuestDemo: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (onboardingData: {
    name?: string;
    selectedCategories: HabitCategory[];
    goals: string[];
    reminderTimePreference: string;
    wakeTime: string;
    sleepTime: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync user document from Firestore or initialize
  const syncUserDoc = async (fbUser: FirebaseUser, fallbackName?: string): Promise<UserProfile> => {
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
        // Create initial profile in Firestore
        const newProfile: UserProfile = {
          ...DEFAULT_PROFILE,
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || fallbackName || (fbUser.email ? fbUser.email.split('@')[0] : 'User'),
          avatarUrl: fbUser.photoURL || '',
          isOnboarded: false, // Must complete onboarding
          createdAt: new Date().toISOString(),
        };
        const sanitized = sanitizeForFirestore(newProfile);
        await setDoc(userDocRef, sanitized);
        StorageService.saveProfile(newProfile);
        return newProfile;
      }
    } catch (err) {
      console.warn('Firestore sync note, using local profile fallback:', err);
      const local = StorageService.getProfile();
      if (local && local.id === fbUser.uid) {
        return local;
      }
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
    // Check if local guest session was active
    const localProfile = StorageService.getProfile();
    if (localProfile && localProfile.id.startsWith('demo-guest-')) {
      setUser(localProfile);
      setIsLoading(false);
      return;
    }

    // Listen to genuine Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          setFirebaseUser(fbUser);
          const profile = await syncUserDoc(fbUser);
          setUser(profile);
        } else {
          setFirebaseUser(null);
          // Only reset user if not guest
          const currentLocal = StorageService.getProfile();
          if (!currentLocal?.id.startsWith('demo-guest-')) {
            setUser(null);
            StorageService.resetAllData();
          }
        }
      } catch (err) {
        console.warn('Auth state sync note:', err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profile = await syncUserDoc(cred.user);
      setUser(profile);
      setFirebaseUser(cred.user);
    } catch (err: any) {
      let message = 'Failed to sign in. Please verify your email and password.';
      const code = err?.code || '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
        message = 'Incorrect password or email. Please check your credentials or click "Forgot Password".';
      } else if (code === 'auth/user-not-found') {
        message = 'No account found with this email. Click "Create Account" above to register a new account.';
      } else if (code === 'auth/invalid-email') {
        message = 'The email address format is invalid. Please enter a valid email (e.g. name@example.com).';
      } else if (code === 'auth/user-disabled') {
        message = 'This user account has been disabled. Please contact support.';
      } else if (code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to multiple failed login attempts. Please reset your password or try again in a few minutes.';
      } else if (code === 'auth/network-request-failed') {
        message = 'Network connection failed. Please check your internet connection and try again.';
      } else if (err.message) {
        message = err.message;
      }
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (auth.currentUser && name.trim()) {
        try {
          await updateFirebaseProfile(auth.currentUser, { displayName: name.trim() });
        } catch (e) {
          console.warn('Profile name update note:', e);
        }
      }
      const profile = await syncUserDoc(cred.user, name.trim());
      setUser(profile);
      setFirebaseUser(cred.user);
    } catch (err: any) {
      let message = 'Failed to register account.';
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        message = 'An account already exists with this email address. Please switch to "Sign In" to access your account.';
      } else if (code === 'auth/invalid-email') {
        message = 'Please provide a valid email address (e.g. name@example.com).';
      } else if (code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 8 characters including both letters and numbers.';
      } else if (code === 'auth/operation-not-allowed') {
        message = 'Email & Password registration is currently restricted in project settings.';
      } else if (code === 'auth/network-request-failed') {
        message = 'Network connection failed. Please check your connection and try again.';
      } else if (err.message) {
        message = err.message;
      }
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await syncUserDoc(result.user);
      setUser(profile);
      setFirebaseUser(result.user);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        throw new Error('Google Sign-In was cancelled because the popup window was closed.');
      } else if (code === 'auth/popup-blocked') {
        throw new Error('Pop-up window was blocked by your browser. Please allow popups for this site, or sign in using Email & Password / Instant Quick Tour.');
      } else if (code === 'auth/cancelled-popup-request') {
        throw new Error('Google Sign-In request was cancelled.');
      } else if (code === 'auth/unauthorized-domain') {
        throw new Error('This preview domain is not in the Firebase authorized domain list. You can sign in using Email & Password or Instant Quick Tour.');
      } else if (code === 'auth/operation-not-allowed') {
        throw new Error('Google sign-in provider is not enabled in Firebase Console. Please sign in with Email & Password or Instant Quick Tour.');
      } else if (code === 'auth/network-request-failed') {
        throw new Error('Network error during Google Sign-In. Please check your internet connection.');
      }
      throw new Error(err.message || 'Google Sign-In could not be completed. You can also sign in with Email & Password.');
    } finally {
      setIsLoading(false);
    }
  };

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
      // Generate sample habits for immediate testing
      const starterHabits = generateStarterHabitsForUser(guestProfile.selectedCategories, guestId);
      StorageService.saveProfile(guestProfile);
      StorageService.saveHabits(starterHabits);
      setUser(guestProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { message: `A password reset link has been dispatched to ${email.trim()}. Please check your inbox and follow the instructions.` };
    } catch (err: any) {
      let message = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        message = 'No registered account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.message) {
        message = err.message;
      }
      throw new Error(message);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (firebaseUser) {
        await signOut(auth);
      }
      setUser(null);
      setFirebaseUser(null);
      StorageService.resetAllData();
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    StorageService.saveProfile(updated);

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

  const completeOnboarding = async (onboardingData: {
    name?: string;
    selectedCategories: HabitCategory[];
    goals: string[];
    reminderTimePreference: string;
    wakeTime: string;
    sleepTime: string;
  }) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      ...onboardingData,
      name: onboardingData.name || user.name || (user.email ? user.email.split('@')[0] : 'User'),
      isOnboarded: true,
    };
    setUser(updated);
    StorageService.saveProfile(updated);

    // If user has no habits yet, initialize starter habits matching their selected focus areas
    const currentHabits = StorageService.getHabits();
    if (currentHabits.length === 0) {
      const starters = generateStarterHabitsForUser(onboardingData.selectedCategories, user.id);
      StorageService.saveHabits(starters);

      if (firebaseUser) {
        for (const h of starters) {
          try {
            await FirestoreDataService.saveHabit(h);
          } catch (e) {
            console.warn('Starter habit save note:', e);
          }
        }
      }
    }

    if (firebaseUser) {
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
        firebaseUser,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        loginAsGuestDemo,
        forgotPassword,
        logout,
        updateProfile,
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

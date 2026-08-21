import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, HabitCategory } from '../types';
import { StorageService, DEFAULT_PROFILE } from '../services/storage';
import { ApiService } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; resetToken?: string }>;
  resetPassword: (email: string, token: string, newPass: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: (onboardingData: {
    selectedCategories: HabitCategory[];
    goals: string[];
    reminderTimePreference: string;
    wakeTime: string;
    sleepTime: string;
  }) => void;
  fillDemoAccount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved local profile
    try {
      const saved = StorageService.getProfile();
      if (saved && saved.email) {
        setUser(saved);
      }
    } catch (e) {
      console.error('Error loading profile', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await ApiService.login(email, password);
      // Fetch or init user profile
      const current = StorageService.getProfile();
      const updatedUser: UserProfile = {
        ...current,
        id: res.user.id,
        email: res.user.email,
        name: res.user.name || current.name,
      };
      StorageService.saveProfile(updatedUser);
      setUser(updatedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await ApiService.register(name, email, password);
      const newUser: UserProfile = {
        ...DEFAULT_PROFILE,
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        isOnboarded: false, // Trigger onboarding for fresh registered user!
        createdAt: new Date().toISOString(),
      };
      StorageService.saveProfile(newUser);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    return await ApiService.forgotPassword(email);
  };

  const resetPassword = async (email: string, token: string, newPass: string) => {
    await ApiService.resetPassword(email, token, newPass);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aura_auth_token');
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    StorageService.saveProfile(updated);
    setUser(updated);
  };

  const completeOnboarding = (onboardingData: {
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
      isOnboarded: true,
    };
    StorageService.saveProfile(updated);
    setUser(updated);
  };

  const fillDemoAccount = () => {
    StorageService.saveProfile(DEFAULT_PROFILE);
    setUser(DEFAULT_PROFILE);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        updateProfile,
        completeOnboarding,
        fillDemoAccount,
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

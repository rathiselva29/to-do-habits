import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      supabaseInstance = null;
    }
  }
  return supabaseInstance;
}

// Password Strength Validator
export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return { isValid: false, message: 'Password must contain both letters and numbers or special symbols.' };
  }
  return { isValid: true, message: '' };
}

// Email Validator
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Translates Supabase Auth error codes & messages into user-friendly explanations
 */
export function formatSupabaseAuthError(err: any): string {
  if (!err) return 'Authentication error occurred. Please try again.';
  const msg = (err.message || '').toLowerCase();
  const status = err.status;

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials') || msg.includes('invalid email or password')) {
    return 'Incorrect email or password. Please verify your credentials or click "Forgot Password".';
  }
  if (msg.includes('user already registered') || msg.includes('already exists') || msg.includes('email address is already in use')) {
    return 'An account already exists with this email address. Please sign in instead.';
  }
  if (msg.includes('password should be at least') || msg.includes('weak password')) {
    return 'Password is too weak. Please use at least 8 characters with letters and numbers.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please verify your email address. A confirmation email was sent to your inbox.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests') || status === 429) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }
  if (msg.includes('network') || msg.includes('failed to fetch')) {
    return 'Network connection failed. Please check your internet connection.';
  }
  return err.message || 'An error occurred during authentication.';
}

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/database';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User, BillingAddress } from '@/types';

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  occupation?: string;
  mobileNumber?: string;
  billingAddress?: BillingAddress;
  avatar?: File;
}

interface AuthContextType {
  user: User | null;
  userId: string;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (data: SignUpData) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Convert Supabase user to our custom User type
function toAppUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
    occupation: supabaseUser.user_metadata?.occupation,
    mobile_number: supabaseUser.user_metadata?.mobile_number,
    google_id: supabaseUser.user_metadata?.sub || supabaseUser.user_metadata?.provider_id,
    subscription_tier: 'free',
    subscription_status: 'active',
    preferences: {
      theme: 'dark',
      haptics_enabled: true,
      notifications_enabled: true,
    },
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_USER_KEY = 'omnidev-guest-user-id';

function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function getGuestUserId(): string {
  if (typeof window === 'undefined') return generateGuestId();

  let guestId = localStorage.getItem(GUEST_USER_KEY);
  if (!guestId) {
    guestId = generateGuestId();
    localStorage.setItem(GUEST_USER_KEY, guestId);
  }
  return guestId;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guestId] = useState<string>(getGuestUserId());

  useEffect(() => {
    // Only try to initialize Supabase auth if it's configured
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(toAppUser(session?.user ?? null));
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAppUser(session?.user ?? null));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Cannot sign in.');
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const signInWithApple = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Cannot sign in.');
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Error signing in with Apple:', error);
    }
  };

  const signInWithMicrosoft = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Cannot sign in.');
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'openid profile email',
      },
    });

    if (error) {
      console.error('Error signing in with Microsoft:', error);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured()) {
      return { error: 'Authentication is not configured' };
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  const signUpWithEmail = async (data: SignUpData): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured()) {
      return { error: 'Authentication is not configured' };
    }

    const supabase = createClient();

    // Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          occupation: data.occupation,
          mobile_number: data.mobileNumber,
        },
      },
    });

    if (signUpError) {
      return { error: signUpError.message };
    }

    if (authData.user) {
      // Upload avatar if provided
      let avatarUrl: string | null = null;
      if (data.avatar) {
        const fileExt = data.avatar.name.split('.').pop();
        const fileName = `${authData.user.id}/avatar.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, data.avatar, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
          avatarUrl = urlData.publicUrl;
        }
      }

      // Create profile - use type assertion for extended schema
      await (supabase.from('profiles') as any).insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.fullName,
        avatar_url: avatarUrl,
        occupation: data.occupation || null,
        mobile_number: data.mobileNumber || null,
        billing_address: data.billingAddress || null,
        subscription_tier: 'free',
        subscription_status: 'active',
        preferences: {
          theme: 'dark',
          haptics_enabled: true,
          notifications_enabled: true,
        },
      });
    }

    return { error: null };
  };

  const refreshProfile = async () => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Fetch full profile from database - use type assertion for extended schema
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      const profile = result.data as any;

      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name || '',
          avatar_url: profile.avatar_url || undefined,
          occupation: profile.occupation || undefined,
          mobile_number: profile.mobile_number || undefined,
          billing_address: profile.billing_address as BillingAddress | undefined,
          subscription_tier: (profile.subscription_tier as User['subscription_tier']) || 'free',
          subscription_status: (profile.subscription_status as User['subscription_status']) || 'active',
          google_id: profile.google_id || undefined,
          preferences: profile.preferences as User['preferences'],
        });
      } else {
        setUser(toAppUser(session.user));
      }
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    userId: user?.id || guestId,
    isAuthenticated: !!user,
    isGuest: !user,
    isLoading,
    signInWithGoogle,
    signInWithApple,
    signInWithMicrosoft,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/database';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  userId: string;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Convert Supabase user to our custom User type
function toAppUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
    preferences: {
      theme: 'dark',
      haptics_enabled: true,
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
      console.error('Error signing in:', error);
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    userId: user?.id || guestId,
    isAuthenticated: !!user,
    isGuest: !user,
    isLoading,
    signInWithGoogle,
    signOut,
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

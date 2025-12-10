'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Cached client instance
let supabaseClient: SupabaseClient<Database> | null = null;
let configurationChecked = false;

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check for actual values (not placeholders)
  const hasUrl =
    !!url &&
    url !== 'your_supabase_project_url' &&
    url !== 'https://placeholder.supabase.co' &&
    url.includes('.supabase.co');

  const hasKey =
    !!key && key !== 'your_supabase_anon_key' && key !== 'placeholder-key' && key.length > 20;

  return hasUrl && hasKey;
}

/**
 * Create a Supabase browser client
 * Returns null if Supabase is not configured (graceful degradation)
 */
export function createClient(): SupabaseClient<Database> | null {
  // Return cached client if available
  if (supabaseClient) {
    return supabaseClient;
  }

  // Check configuration once
  if (!configurationChecked) {
    configurationChecked = true;

    if (!isSupabaseConfigured()) {
      // Log once in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[Supabase] Not configured. Database features disabled.\n' +
            'To enable, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local'
        );
      }
      return null;
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseKey);
    return supabaseClient;
  } catch (error) {
    console.error('[Supabase] Failed to create client:', error);
    return null;
  }
}

/**
 * Get Supabase client, throwing if not configured
 * Use this only when Supabase is required (not optional)
 */
export function requireClient(): SupabaseClient<Database> {
  const client = createClient();
  if (!client) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
  }
  return client;
}

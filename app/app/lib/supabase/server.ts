import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

/**
 * Check if Supabase is properly configured (server-side)
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
 * Create a Supabase server client
 * Returns null if Supabase is not configured (graceful degradation)
 */
export async function createClient(): Promise<SupabaseClient<Database> | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    return createServerClient<Database>(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server component can't set cookies - this is expected
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Server component can't remove cookies - this is expected
          }
        },
      },
    });
  } catch (error) {
    console.error('[Supabase Server] Failed to create client:', error);
    return null;
  }
}

/**
 * Get Supabase server client, throwing if not configured
 * Use this only when Supabase is required (not optional)
 */
export async function requireClient(): Promise<SupabaseClient<Database>> {
  const client = await createClient();
  if (!client) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
  }
  return client;
}

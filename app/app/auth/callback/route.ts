import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`);
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if profile exists, if not create one with Google data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        // Create profile with Google data
        const googleMetadata = data.user.user_metadata;
        // Use type assertion for the insert since database types are dynamically extended
        await (supabase.from('profiles') as any).insert({
          id: data.user.id,
          email: data.user.email,
          full_name: googleMetadata?.full_name || googleMetadata?.name || null,
          avatar_url: googleMetadata?.avatar_url || googleMetadata?.picture || null,
          google_id: googleMetadata?.sub || googleMetadata?.provider_id || null,
          subscription_tier: 'free',
          subscription_status: 'active',
          preferences: {
            theme: 'dark',
            haptics_enabled: true,
            notifications_enabled: true,
          },
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}

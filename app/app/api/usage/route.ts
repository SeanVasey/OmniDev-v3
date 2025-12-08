import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { UsageLog, UsageSummary, SubscriptionTier } from '@/types';
import { TIER_LIMITS, MODEL_PRICING } from '@/types';

// Use Node.js runtime for server-side auth (not edge)
export const runtime = 'nodejs';

// Admin user IDs - in production, this would be fetched from database
const ADMIN_USER_IDS = new Set<string>([
  // Add admin user IDs here or check a role in the profiles table
]);

// Helper to create authenticated Supabase client
async function createAuthenticatedClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

// Helper to get authenticated user
async function getAuthenticatedUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user;
}

// Helper to check if user is admin
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  // Check hardcoded admin list
  if (ADMIN_USER_IDS.has(userId)) {
    return true;
  }

  // Check profiles table for admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return profile?.role === 'admin';
}

// In-memory storage for demo purposes (would be database in production)
// This simulates user-specific usage data
const usageData = new Map<string, UsageLog[]>();

function getOrCreateUserLogs(userId: string): UsageLog[] {
  if (!usageData.has(userId)) {
    usageData.set(userId, []);
  }
  return usageData.get(userId)!;
}

function calculateSummary(
  logs: UsageLog[],
  period: 'day' | 'week' | 'month' | 'all',
  tier: SubscriptionTier = 'free'
): UsageSummary {
  const now = new Date();
  const limits = TIER_LIMITS[tier];

  // Filter logs by period
  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.created_at);
    switch (period) {
      case 'day':
        return logDate.toDateString() === now.toDateString();
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return logDate >= weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return logDate >= monthAgo;
      }
      default:
        return true;
    }
  });

  // Calculate totals
  let tokensUsed = 0;
  let totalCost = 0;
  let totalLatency = 0;
  let imagesGenerated = 0;
  let videosGenerated = 0;
  const modelStats = new Map<string, { count: number; tokens: number }>();
  const dailyStats = new Map<string, { tokens: number; cost: number }>();

  for (const log of filteredLogs) {
    const tokens = log.tokens_input + log.tokens_output;
    tokensUsed += tokens;
    totalCost += log.cost;
    totalLatency += log.latency_ms;

    if (log.type === 'image') imagesGenerated++;
    if (log.type === 'video') videosGenerated++;

    // Model stats
    const existing = modelStats.get(log.model_id) || { count: 0, tokens: 0 };
    modelStats.set(log.model_id, {
      count: existing.count + 1,
      tokens: existing.tokens + tokens,
    });

    // Daily stats
    const dateKey = new Date(log.created_at).toISOString().split('T')[0];
    const dailyExisting = dailyStats.get(dateKey) || { tokens: 0, cost: 0 };
    dailyStats.set(dateKey, {
      tokens: dailyExisting.tokens + tokens,
      cost: dailyExisting.cost + log.cost,
    });
  }

  const requestCount = filteredLogs.length;
  const tokensLimit = limits.tokensPerMonth;

  return {
    period,
    tokensUsed,
    tokensLimit,
    tokensRemaining: Math.max(0, tokensLimit - tokensUsed),
    percentUsed: tokensLimit > 0 ? (tokensUsed / tokensLimit) * 100 : 0,
    imagesGenerated,
    imagesLimit: limits.imagesPerMonth,
    videosGenerated,
    videosLimit: limits.videosPerMonth,
    totalCost,
    requestCount,
    averageLatency: requestCount > 0 ? totalLatency / requestCount : 0,
    topModels: Array.from(modelStats.entries())
      .map(([modelId, stats]) => ({ modelId, ...stats }))
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 5),
    dailyUsage: Array.from(dailyStats.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30),
  };
}

// GET - Fetch usage summary (authenticated)
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createAuthenticatedClient();
    const user = await getAuthenticatedUser(supabase);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') || 'month') as 'day' | 'week' | 'month' | 'all';

    // Get tier from user profile, fallback to free
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const tier = (profile?.subscription_tier || 'free') as SubscriptionTier;

    // Use authenticated user's ID - never from client input
    const logs = getOrCreateUserLogs(user.id);
    const summary = calculateSummary(logs, period, tier);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        recentLogs: logs.slice(0, 20),
        userId: user.id, // Return for client reference
      },
    });
  } catch (error) {
    console.error('Usage API GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}

// POST - Log new usage (authenticated)
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createAuthenticatedClient();
    const user = await getAuthenticatedUser(supabase);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      modelId,
      provider,
      type = 'chat',
      tokensInput = 0,
      tokensOutput = 0,
      latencyMs = 0,
      contextMode,
    } = body;

    // Validate required fields
    if (!modelId) {
      return NextResponse.json(
        { success: false, error: 'modelId is required' },
        { status: 400 }
      );
    }

    // Calculate cost
    const pricing = MODEL_PRICING[modelId];
    let cost = 0;
    if (pricing) {
      if (type === 'image' && pricing.imagePerGeneration) {
        cost = pricing.imagePerGeneration;
      } else if (type === 'video' && pricing.videoPerSecond) {
        cost = pricing.videoPerSecond * (body.durationSeconds || 1);
      } else {
        cost =
          (tokensInput / 1000) * pricing.inputPer1kTokens +
          (tokensOutput / 1000) * pricing.outputPer1kTokens;
      }
    }

    const log: UsageLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id, // Always use authenticated user's ID
      model_id: modelId,
      provider: provider || 'unknown',
      type,
      tokens_input: tokensInput,
      tokens_output: tokensOutput,
      cost,
      latency_ms: latencyMs,
      context_mode: contextMode,
      created_at: new Date().toISOString(),
    };

    const logs = getOrCreateUserLogs(user.id);
    logs.unshift(log);

    // Keep only last 1000 logs per user
    if (logs.length > 1000) {
      logs.splice(1000);
    }

    return NextResponse.json({
      success: true,
      data: { log },
    });
  } catch (error) {
    console.error('Usage API POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log usage' },
      { status: 500 }
    );
  }
}

// DELETE - Reset usage (admin only with confirmation)
export async function DELETE(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createAuthenticatedClient();
    const user = await getAuthenticatedUser(supabase);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');
    const confirmDelete = searchParams.get('confirm') === 'true';

    // Check if user is admin for bulk operations
    const userIsAdmin = await isAdmin(supabase, user.id);

    // Users can only delete their own data
    // Admins can delete any user's data or all data
    if (targetUserId && targetUserId !== user.id && !userIsAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Cannot delete other users\' data' },
        { status: 403 }
      );
    }

    // Bulk delete (all users) requires admin and confirmation
    if (!targetUserId) {
      if (!userIsAdmin) {
        return NextResponse.json(
          { success: false, error: 'Forbidden - Admin access required for bulk deletion' },
          { status: 403 }
        );
      }

      if (!confirmDelete) {
        return NextResponse.json(
          {
            success: false,
            error: 'Confirmation required - Add ?confirm=true to delete all usage data',
            requiresConfirmation: true
          },
          { status: 400 }
        );
      }

      usageData.clear();
      return NextResponse.json({
        success: true,
        message: 'All usage data cleared (admin action)',
      });
    }

    // Delete specific user's data
    const userIdToDelete = targetUserId || user.id;
    usageData.delete(userIdToDelete);

    return NextResponse.json({
      success: true,
      message: `Usage data cleared for user ${userIdToDelete === user.id ? '(self)' : userIdToDelete}`,
    });
  } catch (error) {
    console.error('Usage API DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear usage data' },
      { status: 500 }
    );
  }
}

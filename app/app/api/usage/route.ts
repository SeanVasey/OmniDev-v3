import { NextRequest, NextResponse } from 'next/server';
import type { UsageLog, UsageSummary, SubscriptionTier } from '@/types';
import { TIER_LIMITS, MODEL_PRICING } from '@/types';

export const runtime = 'edge';

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

// GET - Fetch usage summary
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const period = (searchParams.get('period') || 'month') as 'day' | 'week' | 'month' | 'all';
    const tier = (searchParams.get('tier') || 'free') as SubscriptionTier;

    const logs = getOrCreateUserLogs(userId);
    const summary = calculateSummary(logs, period, tier);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        recentLogs: logs.slice(0, 20),
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

// POST - Log new usage
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId = 'anonymous',
      modelId,
      provider,
      type = 'chat',
      tokensInput = 0,
      tokensOutput = 0,
      latencyMs = 0,
      contextMode,
    } = body;

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
      user_id: userId,
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

    const logs = getOrCreateUserLogs(userId);
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

// DELETE - Reset usage (for testing/admin)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (userId) {
      usageData.delete(userId);
    } else {
      usageData.clear();
    }

    return NextResponse.json({
      success: true,
      message: userId ? `Usage data cleared for ${userId}` : 'All usage data cleared',
    });
  } catch (error) {
    console.error('Usage API DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear usage data' },
      { status: 500 }
    );
  }
}

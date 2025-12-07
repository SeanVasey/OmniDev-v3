'use client';

import { useCallback } from 'react';
import { useUsageStore } from '@/stores/usageStore';
import { MODEL_PRICING } from '@/types';
import type { UsageLog, ContextMode } from '@/types';

// Simple token estimation (rough approximation)
// In production, you'd use a proper tokenizer like tiktoken
function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token on average
  return Math.ceil(text.length / 4);
}

interface TrackUsageParams {
  modelId: string;
  provider: string;
  type: 'chat' | 'image' | 'video' | 'embedding';
  inputText: string;
  outputText: string;
  latencyMs: number;
  contextMode?: ContextMode;
  userId?: string;
}

export function useUsageTracking() {
  const { addUsageLog, calculateCost, checkQuota, currentUsage, tierLimits } = useUsageStore();

  const trackUsage = useCallback(
    async ({
      modelId,
      provider,
      type,
      inputText,
      outputText,
      latencyMs,
      contextMode,
      userId = 'anonymous',
    }: TrackUsageParams) => {
      const tokensInput = estimateTokens(inputText);
      const tokensOutput = estimateTokens(outputText);
      const cost = calculateCost(modelId, tokensInput, tokensOutput);

      const log: UsageLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        model_id: modelId,
        provider,
        type,
        tokens_input: tokensInput,
        tokens_output: tokensOutput,
        cost,
        latency_ms: latencyMs,
        context_mode: contextMode,
        created_at: new Date().toISOString(),
      };

      // Update local store
      addUsageLog(log);

      // Optionally sync to backend API (fire and forget)
      try {
        fetch('/api/usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            modelId,
            provider,
            type,
            tokensInput,
            tokensOutput,
            latencyMs,
            contextMode,
          }),
        }).catch(() => {
          // Ignore API errors - local tracking is primary
        });
      } catch {
        // Ignore
      }

      return log;
    },
    [addUsageLog, calculateCost]
  );

  const trackImageGeneration = useCallback(
    async ({
      modelId,
      provider,
      latencyMs,
      userId = 'anonymous',
    }: {
      modelId: string;
      provider: string;
      latencyMs: number;
      userId?: string;
    }) => {
      const pricing = MODEL_PRICING[modelId];
      const cost = pricing?.imagePerGeneration || 0;

      const log: UsageLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        model_id: modelId,
        provider,
        type: 'image',
        tokens_input: 0,
        tokens_output: 0,
        cost,
        latency_ms: latencyMs,
        created_at: new Date().toISOString(),
      };

      addUsageLog(log);
      return log;
    },
    [addUsageLog]
  );

  const trackVideoGeneration = useCallback(
    async ({
      modelId,
      provider,
      durationSeconds,
      latencyMs,
      userId = 'anonymous',
    }: {
      modelId: string;
      provider: string;
      durationSeconds: number;
      latencyMs: number;
      userId?: string;
    }) => {
      const pricing = MODEL_PRICING[modelId];
      const cost = (pricing?.videoPerSecond || 0) * durationSeconds;

      const log: UsageLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        model_id: modelId,
        provider,
        type: 'video',
        tokens_input: 0,
        tokens_output: 0,
        cost,
        latency_ms: latencyMs,
        created_at: new Date().toISOString(),
      };

      addUsageLog(log);
      return log;
    },
    [addUsageLog]
  );

  const canUseFeature = useCallback(
    (type: 'tokens' | 'images' | 'videos', amount?: number) => {
      return checkQuota(type, amount);
    },
    [checkQuota]
  );

  const getUsageSummary = useCallback(() => {
    return {
      tokens: {
        used: currentUsage?.tokensUsed || 0,
        limit: tierLimits.tokensPerMonth,
        percent: currentUsage?.percentUsed || 0,
      },
      images: {
        used: currentUsage?.imagesGenerated || 0,
        limit: tierLimits.imagesPerMonth,
        percent: tierLimits.imagesPerMonth > 0
          ? ((currentUsage?.imagesGenerated || 0) / tierLimits.imagesPerMonth) * 100
          : 0,
      },
      videos: {
        used: currentUsage?.videosGenerated || 0,
        limit: tierLimits.videosPerMonth,
        percent: tierLimits.videosPerMonth > 0
          ? ((currentUsage?.videosGenerated || 0) / tierLimits.videosPerMonth) * 100
          : 0,
      },
      totalCost: currentUsage?.totalCost || 0,
      requestCount: currentUsage?.requestCount || 0,
    };
  }, [currentUsage, tierLimits]);

  return {
    trackUsage,
    trackImageGeneration,
    trackVideoGeneration,
    canUseFeature,
    getUsageSummary,
    estimateTokens,
  };
}

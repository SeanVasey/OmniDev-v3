import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UsageSummary, UsageLog, SubscriptionTier, TierLimits } from '@/types';
import { TIER_LIMITS, MODEL_PRICING } from '@/types';

interface UsageState {
  // Current usage data
  currentUsage: UsageSummary | null;
  usageLogs: UsageLog[];
  isLoading: boolean;
  lastFetched: string | null;

  // UI preferences
  showUsageMonitor: boolean;
  monitorPosition: 'header' | 'sidebar' | 'floating';

  // Tier info
  currentTier: SubscriptionTier;
  tierLimits: TierLimits;

  // Actions
  setCurrentUsage: (usage: UsageSummary) => void;
  addUsageLog: (log: UsageLog) => void;
  setLoading: (loading: boolean) => void;
  toggleUsageMonitor: () => void;
  setMonitorPosition: (position: 'header' | 'sidebar' | 'floating') => void;
  setTier: (tier: SubscriptionTier) => void;
  calculateCost: (modelId: string, inputTokens: number, outputTokens: number) => number;
  checkQuota: (type: 'tokens' | 'images' | 'videos', amount?: number) => { allowed: boolean; remaining: number; limit: number };
  resetUsage: () => void;
}

const getDefaultUsage = (): UsageSummary => ({
  period: 'month',
  tokensUsed: 0,
  tokensLimit: TIER_LIMITS.free.tokensPerMonth,
  tokensRemaining: TIER_LIMITS.free.tokensPerMonth,
  percentUsed: 0,
  imagesGenerated: 0,
  imagesLimit: TIER_LIMITS.free.imagesPerMonth,
  videosGenerated: 0,
  videosLimit: TIER_LIMITS.free.videosPerMonth,
  totalCost: 0,
  requestCount: 0,
  averageLatency: 0,
  topModels: [],
  dailyUsage: [],
});

export const useUsageStore = create<UsageState>()(
  persist(
    (set, get) => ({
      currentUsage: null,
      usageLogs: [],
      isLoading: false,
      lastFetched: null,
      showUsageMonitor: true,
      monitorPosition: 'header',
      currentTier: 'free',
      tierLimits: TIER_LIMITS.free,

      setCurrentUsage: (usage) =>
        set({
          currentUsage: usage,
          lastFetched: new Date().toISOString(),
        }),

      addUsageLog: (log) =>
        set((state) => {
          const newLogs = [log, ...state.usageLogs].slice(0, 100); // Keep last 100 logs
          const currentUsage = state.currentUsage || getDefaultUsage();

          // Update current usage summary
          const newTokensUsed = currentUsage.tokensUsed + log.tokens_input + log.tokens_output;
          const newCost = currentUsage.totalCost + log.cost;
          const newRequestCount = currentUsage.requestCount + 1;

          // Update images/videos count
          let newImagesGenerated = currentUsage.imagesGenerated;
          let newVideosGenerated = currentUsage.videosGenerated;
          if (log.type === 'image') newImagesGenerated++;
          if (log.type === 'video') newVideosGenerated++;

          // Update top models
          const topModels = [...currentUsage.topModels];
          const existingModel = topModels.find((m) => m.modelId === log.model_id);
          if (existingModel) {
            existingModel.count++;
            existingModel.tokens += log.tokens_input + log.tokens_output;
          } else {
            topModels.push({
              modelId: log.model_id,
              count: 1,
              tokens: log.tokens_input + log.tokens_output,
            });
          }
          topModels.sort((a, b) => b.tokens - a.tokens);

          // Update daily usage
          const today = new Date().toISOString().split('T')[0];
          const dailyUsage = [...currentUsage.dailyUsage];
          const todayEntry = dailyUsage.find((d) => d.date === today);
          if (todayEntry) {
            todayEntry.tokens += log.tokens_input + log.tokens_output;
            todayEntry.cost += log.cost;
          } else {
            dailyUsage.push({
              date: today,
              tokens: log.tokens_input + log.tokens_output,
              cost: log.cost,
            });
          }

          // Calculate averages
          const totalLatency = currentUsage.averageLatency * currentUsage.requestCount + log.latency_ms;
          const newAverageLatency = totalLatency / newRequestCount;

          return {
            usageLogs: newLogs,
            currentUsage: {
              ...currentUsage,
              tokensUsed: newTokensUsed,
              tokensRemaining: currentUsage.tokensLimit - newTokensUsed,
              percentUsed: (newTokensUsed / currentUsage.tokensLimit) * 100,
              imagesGenerated: newImagesGenerated,
              videosGenerated: newVideosGenerated,
              totalCost: newCost,
              requestCount: newRequestCount,
              averageLatency: newAverageLatency,
              topModels: topModels.slice(0, 5),
              dailyUsage: dailyUsage.slice(-30), // Keep last 30 days
            },
          };
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      toggleUsageMonitor: () =>
        set((state) => ({ showUsageMonitor: !state.showUsageMonitor })),

      setMonitorPosition: (position) => set({ monitorPosition: position }),

      setTier: (tier) =>
        set((state) => {
          const limits = TIER_LIMITS[tier];
          const currentUsage = state.currentUsage || getDefaultUsage();

          return {
            currentTier: tier,
            tierLimits: limits,
            currentUsage: {
              ...currentUsage,
              tokensLimit: limits.tokensPerMonth,
              tokensRemaining: limits.tokensPerMonth - currentUsage.tokensUsed,
              percentUsed: (currentUsage.tokensUsed / limits.tokensPerMonth) * 100,
              imagesLimit: limits.imagesPerMonth,
              videosLimit: limits.videosPerMonth,
            },
          };
        }),

      calculateCost: (modelId, inputTokens, outputTokens) => {
        const pricing = MODEL_PRICING[modelId];
        if (!pricing) return 0;

        const inputCost = (inputTokens / 1000) * pricing.inputPer1kTokens;
        const outputCost = (outputTokens / 1000) * pricing.outputPer1kTokens;
        return inputCost + outputCost;
      },

      checkQuota: (type, amount = 1) => {
        const state = get();
        const usage = state.currentUsage || getDefaultUsage();
        const limits = state.tierLimits;

        switch (type) {
          case 'tokens':
            return {
              allowed: usage.tokensUsed + amount <= limits.tokensPerMonth,
              remaining: limits.tokensPerMonth - usage.tokensUsed,
              limit: limits.tokensPerMonth,
            };
          case 'images':
            return {
              allowed: usage.imagesGenerated + amount <= limits.imagesPerMonth,
              remaining: limits.imagesPerMonth - usage.imagesGenerated,
              limit: limits.imagesPerMonth,
            };
          case 'videos':
            return {
              allowed: usage.videosGenerated + amount <= limits.videosPerMonth,
              remaining: limits.videosPerMonth - usage.videosGenerated,
              limit: limits.videosPerMonth,
            };
          default:
            return { allowed: true, remaining: 0, limit: 0 };
        }
      },

      resetUsage: () =>
        set((state) => ({
          currentUsage: {
            ...getDefaultUsage(),
            tokensLimit: state.tierLimits.tokensPerMonth,
            tokensRemaining: state.tierLimits.tokensPerMonth,
            imagesLimit: state.tierLimits.imagesPerMonth,
            videosLimit: state.tierLimits.videosPerMonth,
          },
          usageLogs: [],
        })),
    }),
    {
      name: 'omnidev-usage-storage',
      partialize: (state) => ({
        currentUsage: state.currentUsage,
        usageLogs: state.usageLogs.slice(0, 50), // Only persist last 50 logs
        showUsageMonitor: state.showUsageMonitor,
        monitorPosition: state.monitorPosition,
        currentTier: state.currentTier,
        lastFetched: state.lastFetched,
      }),
    }
  )
);

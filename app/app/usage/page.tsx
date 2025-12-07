'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Zap,
  TrendingUp,
  Image as ImageIcon,
  Video,
  Clock,
  Calendar,
  Crown,
  Settings,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useUsageStore } from '@/stores/usageStore';
import { cn } from '@/lib/utils';

type TimePeriod = 'day' | 'week' | 'month' | 'all';

export default function UsagePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    currentUsage,
    usageLogs,
    currentTier,
    tierLimits,
    showUsageMonitor,
    toggleUsageMonitor,
    setMonitorPosition,
    monitorPosition,
  } = useUsageStore();

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const usage = currentUsage || {
    tokensUsed: 0,
    tokensLimit: tierLimits.tokensPerMonth,
    tokensRemaining: tierLimits.tokensPerMonth,
    percentUsed: 0,
    imagesGenerated: 0,
    imagesLimit: tierLimits.imagesPerMonth,
    videosGenerated: 0,
    videosLimit: tierLimits.videosPerMonth,
    totalCost: 0,
    requestCount: 0,
    averageLatency: 0,
    topModels: [],
    dailyUsage: [],
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  const formatCost = (cost: number) => {
    return cost < 0.01 ? '<$0.01' : `$${cost.toFixed(2)}`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh - in production, this would fetch from API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    subValue,
    color = 'primary',
  }: {
    icon: any;
    label: string;
    value: string | number;
    subValue?: string;
    color?: 'primary' | 'warning' | 'error' | 'success';
  }) => {
    const colorClasses = {
      primary: 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10',
      warning: 'text-[var(--color-warning)] bg-[var(--color-warning)]/10',
      error: 'text-[var(--color-error)] bg-[var(--color-error)]/10',
      success: 'text-[var(--color-success)] bg-[var(--color-success)]/10',
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colorClasses[color])}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm text-[var(--text-muted)]">{label}</span>
        </div>
        <div className="text-2xl font-bold text-[var(--text-primary)]">{value}</div>
        {subValue && (
          <div className="text-xs text-[var(--text-muted)] mt-1">{subValue}</div>
        )}
      </motion.div>
    );
  };

  const isNearLimit = usage.percentUsed >= 80;
  const isOverLimit = usage.percentUsed >= 100;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-[var(--glass-bg)] border-b border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Usage & Analytics</h1>
                <p className="text-xs text-[var(--text-muted)]">Monitor your API usage and costs</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn('w-5 h-5 text-[var(--text-muted)]', isRefreshing && 'animate-spin')} />
              </button>
              <button className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors">
                <Download className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 mt-4">
            {(['day', 'week', 'month', 'all'] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize',
                  selectedPeriod === period
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                )}
              >
                {period === 'all' ? 'All Time' : `This ${period}`}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Plan Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'p-4 rounded-2xl border flex items-center justify-between',
            currentTier === 'enterprise'
              ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20'
              : currentTier === 'pro'
              ? 'bg-gradient-to-r from-[var(--purple-900)]/50 to-[var(--purple-800)]/50 border-[var(--purple-700)]/30'
              : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)]'
          )}
        >
          <div className="flex items-center gap-3">
            <Crown className={cn(
              'w-6 h-6',
              currentTier === 'enterprise' ? 'text-yellow-500' :
              currentTier === 'pro' ? 'text-[var(--accent-primary)]' :
              'text-[var(--text-muted)]'
            )} />
            <div>
              <p className="font-semibold text-[var(--text-primary)] capitalize">{currentTier} Plan</p>
              <p className="text-xs text-[var(--text-muted)]">
                {formatTokens(tierLimits.tokensPerMonth)} tokens/month
              </p>
            </div>
          </div>
          {currentTier === 'free' && (
            <button className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Upgrade to Pro
            </button>
          )}
        </motion.div>

        {/* Main Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Token Usage</h2>
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-medium',
              isOverLimit
                ? 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
                : isNearLimit
                ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
            )}>
              {Math.round(usage.percentUsed)}% used
            </span>
          </div>

          <div className="h-4 rounded-full bg-[var(--bg-muted)] overflow-hidden mb-3">
            <motion.div
              className={cn(
                'h-full rounded-full',
                isOverLimit
                  ? 'bg-[var(--color-error)]'
                  : isNearLimit
                  ? 'bg-[var(--color-warning)]'
                  : 'bg-[var(--accent-primary)]'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(usage.percentUsed, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">
              {formatTokens(usage.tokensUsed)} of {formatTokens(usage.tokensLimit)} tokens
            </span>
            <span className="text-[var(--text-primary)] font-medium">
              {formatTokens(usage.tokensRemaining)} remaining
            </span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Zap}
            label="Total Tokens"
            value={formatTokens(usage.tokensUsed)}
            subValue={`${formatTokens(usage.tokensRemaining)} remaining`}
            color={isNearLimit ? (isOverLimit ? 'error' : 'warning') : 'primary'}
          />
          <StatCard
            icon={TrendingUp}
            label="Estimated Cost"
            value={formatCost(usage.totalCost)}
            subValue={`${usage.requestCount} requests`}
          />
          <StatCard
            icon={ImageIcon}
            label="Images"
            value={usage.imagesGenerated}
            subValue={`of ${usage.imagesLimit} this month`}
          />
          <StatCard
            icon={Video}
            label="Videos"
            value={usage.videosGenerated}
            subValue={`of ${usage.videosLimit} this month`}
          />
        </div>

        {/* Top Models */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[var(--accent-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Top Models</h2>
          </div>

          {usage.topModels.length > 0 ? (
            <div className="space-y-3">
              {usage.topModels.map((model, index) => {
                const percentage = (model.tokens / usage.tokensUsed) * 100 || 0;
                return (
                  <div key={model.modelId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-primary)] font-medium">{model.modelId}</span>
                      <span className="text-[var(--text-muted)]">
                        {formatTokens(model.tokens)} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--accent-primary)]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">
              No usage data yet. Start chatting to see your model usage.
            </p>
          )}
        </motion.div>

        {/* Monitor Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-[var(--accent-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Usage Monitor Settings</h2>
          </div>

          <div className="space-y-4">
            {/* Show Monitor Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Show Usage Monitor</p>
                <p className="text-xs text-[var(--text-muted)]">Display usage indicator in the app</p>
              </div>
              <button
                onClick={toggleUsageMonitor}
                className={cn(
                  'w-12 h-7 rounded-full transition-colors',
                  showUsageMonitor ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-muted)]'
                )}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-white shadow-md"
                  animate={{ x: showUsageMonitor ? 26 : 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Position Selector */}
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Monitor Position</p>
              <div className="flex gap-2">
                {(['header', 'sidebar', 'floating'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setMonitorPosition(pos)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize',
                      monitorPosition === pos
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
                    )}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[var(--accent-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activity</h2>
          </div>

          {usageLogs.length > 0 ? (
            <div className="space-y-2">
              {usageLogs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-muted)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center">
                      {log.type === 'image' ? (
                        <ImageIcon className="w-4 h-4 text-[var(--accent-primary)]" />
                      ) : log.type === 'video' ? (
                        <Video className="w-4 h-4 text-[var(--accent-primary)]" />
                      ) : (
                        <Zap className="w-4 h-4 text-[var(--accent-primary)]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{log.model_id}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatTokens(log.tokens_input + log.tokens_output)} tokens
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[var(--text-primary)]">{formatCost(log.cost)}</p>
                    <p className="text-xs text-[var(--text-muted)]">{log.latency_ms}ms</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">
              No activity yet. Your usage will appear here.
            </p>
          )}
        </motion.div>
      </main>
    </div>
  );
}

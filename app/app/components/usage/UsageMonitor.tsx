'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Zap,
  Image as ImageIcon,
  Video,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Settings,
  X,
  Crown,
  AlertTriangle,
} from 'lucide-react';
import { useUsageStore } from '@/stores/usageStore';
import { cn } from '@/lib/utils';

interface UsageMonitorProps {
  variant?: 'compact' | 'expanded' | 'minimal';
  className?: string;
}

export function UsageMonitor({ variant = 'compact', className }: UsageMonitorProps) {
  const {
    currentUsage,
    showUsageMonitor,
    currentTier,
    tierLimits,
    toggleUsageMonitor,
  } = useUsageStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!showUsageMonitor) return null;

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
  };

  const isNearLimit = usage.percentUsed >= 80;
  const isOverLimit = usage.percentUsed >= 100;

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  const formatCost = (cost: number) => {
    return cost < 0.01 ? '<$0.01' : `$${cost.toFixed(2)}`;
  };

  // Minimal variant - just a small indicator
  if (variant === 'minimal') {
    return (
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'relative flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors',
          isOverLimit
            ? 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
            : isNearLimit
            ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
            : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]',
          className
        )}
      >
        <Activity className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">{Math.round(usage.percentUsed)}%</span>
      </button>
    );
  }

  // Compact variant - shows in header/sidebar
  if (variant === 'compact') {
    return (
      <div className={cn('relative', className)}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl transition-all w-full',
            'bg-[var(--bg-elevated)] border border-[var(--border-subtle)]',
            'hover:border-[var(--accent-primary)]/30',
            isExpanded && 'border-[var(--accent-primary)]/50'
          )}
        >
          {/* Progress Circle */}
          <div className="relative w-8 h-8 flex-shrink-0">
            <svg className="w-8 h-8 -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="14"
                strokeWidth="3"
                fill="none"
                className="stroke-[var(--bg-muted)]"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={88}
                strokeDashoffset={88 - (88 * Math.min(usage.percentUsed, 100)) / 100}
                className={cn(
                  isOverLimit
                    ? 'stroke-[var(--color-error)]'
                    : isNearLimit
                    ? 'stroke-[var(--color-warning)]'
                    : 'stroke-[var(--accent-primary)]'
                )}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className={cn(
                'w-3.5 h-3.5',
                isOverLimit
                  ? 'text-[var(--color-error)]'
                  : isNearLimit
                  ? 'text-[var(--color-warning)]'
                  : 'text-[var(--accent-primary)]'
              )} />
            </div>
          </div>

          {/* Usage Info */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-[var(--text-primary)]">
                {formatTokens(usage.tokensUsed)}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                / {formatTokens(usage.tokensLimit)}
              </span>
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">
              tokens this month
            </div>
          </div>

          {/* Expand Icon */}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </button>

        {/* Expanded Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="absolute top-full left-0 right-0 mt-2 z-50"
            >
              <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-xl">
                {/* Warning Banner */}
                {isNearLimit && (
                  <div className={cn(
                    'flex items-center gap-2 p-2.5 rounded-lg mb-3',
                    isOverLimit
                      ? 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
                      : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                  )}>
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      {isOverLimit ? 'Usage limit exceeded!' : 'Approaching usage limit'}
                    </span>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Tokens */}
                  <div className="p-3 rounded-lg bg-[var(--bg-muted)]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Zap className="w-4 h-4 text-[var(--accent-primary)]" />
                      <span className="text-xs text-[var(--text-muted)]">Tokens</span>
                    </div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {formatTokens(usage.tokensUsed)}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      {formatTokens(usage.tokensRemaining)} remaining
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="p-3 rounded-lg bg-[var(--bg-muted)]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
                      <span className="text-xs text-[var(--text-muted)]">Cost</span>
                    </div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {formatCost(usage.totalCost)}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      {usage.requestCount} requests
                    </div>
                  </div>

                  {/* Images */}
                  <div className="p-3 rounded-lg bg-[var(--bg-muted)]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <ImageIcon className="w-4 h-4 text-[var(--accent-primary)]" />
                      <span className="text-xs text-[var(--text-muted)]">Images</span>
                    </div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {usage.imagesGenerated}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      of {usage.imagesLimit} this month
                    </div>
                  </div>

                  {/* Videos */}
                  <div className="p-3 rounded-lg bg-[var(--bg-muted)]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Video className="w-4 h-4 text-[var(--accent-primary)]" />
                      <span className="text-xs text-[var(--text-muted)]">Videos</span>
                    </div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {usage.videosGenerated}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      of {usage.videosLimit} this month
                    </div>
                  </div>
                </div>

                {/* Tier Badge */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <Crown className={cn(
                      'w-4 h-4',
                      currentTier === 'enterprise' ? 'text-yellow-500' :
                      currentTier === 'pro' ? 'text-[var(--accent-primary)]' :
                      'text-[var(--text-muted)]'
                    )} />
                    <span className="text-xs font-medium text-[var(--text-primary)] capitalize">
                      {currentTier} Plan
                    </span>
                  </div>
                  {currentTier === 'free' && (
                    <button className="text-xs font-medium text-[var(--accent-primary)] hover:underline">
                      Upgrade
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Expanded variant - full dashboard widget
  return (
    <div className={cn('p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Usage Monitor</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {}}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)] transition-colors"
          >
            <Settings className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
          <button
            onClick={toggleUsageMonitor}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-muted)] transition-colors"
          >
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--text-muted)]">Token Usage</span>
          <span className="text-xs font-medium text-[var(--text-primary)]">
            {Math.round(usage.percentUsed)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-[var(--bg-muted)] overflow-hidden">
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
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-[var(--text-muted)]">
            {formatTokens(usage.tokensUsed)} used
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {formatTokens(usage.tokensRemaining)} left
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-[var(--bg-muted)]">
          <div className="text-lg font-bold text-[var(--text-primary)]">
            {formatCost(usage.totalCost)}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">Est. Cost</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-[var(--bg-muted)]">
          <div className="text-lg font-bold text-[var(--text-primary)]">
            {usage.imagesGenerated}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">Images</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-[var(--bg-muted)]">
          <div className="text-lg font-bold text-[var(--text-primary)]">
            {usage.requestCount}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">Requests</div>
        </div>
      </div>
    </div>
  );
}

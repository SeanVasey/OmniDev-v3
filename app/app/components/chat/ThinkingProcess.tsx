'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkingProcessProps {
  content: string;
  isComplete?: boolean;
  className?: string;
}

export function ThinkingProcess({ content, isComplete = false, className }: ThinkingProcessProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'mb-3 rounded-xl border border-[var(--border-subtle)] bg-gradient-to-br from-purple-500/5 to-blue-500/5 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--bg-elevated)]/50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1">
          {isComplete ? (
            <Brain className="w-4 h-4 text-purple-500" />
          ) : (
            <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
          )}
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            {isComplete ? 'Thinking Complete' : 'Thinking...'}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[var(--border-subtle)]"
          >
            <div className="px-4 py-3 text-sm text-[var(--text-secondary)] whitespace-pre-wrap font-mono bg-[var(--bg-muted)]/30">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

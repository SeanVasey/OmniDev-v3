'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkingProcessProps {
  content: string;
  isComplete?: boolean;
  isStreaming?: boolean;
  thinkingDuration?: number;
  className?: string;
}

export function ThinkingProcess({
  content,
  isComplete = false,
  isStreaming = false,
  thinkingDuration,
  className
}: ThinkingProcessProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Animate content streaming
  useEffect(() => {
    if (isStreaming && content) {
      setDisplayedContent(content);
    } else {
      setDisplayedContent(content);
    }
  }, [content, isStreaming]);

  // Track elapsed time while thinking
  useEffect(() => {
    if (!isComplete && !thinkingDuration) {
      startTimeRef.current = Date.now();
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isComplete, thinkingDuration]);

  // Auto-scroll when streaming
  useEffect(() => {
    if (isExpanded && contentRef.current && isStreaming) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [displayedContent, isExpanded, isStreaming]);

  if (!content) return null;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const duration = thinkingDuration || elapsedTime;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'mb-4 rounded-2xl border overflow-hidden',
        'bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5',
        'border-purple-500/20',
        'shadow-lg shadow-purple-500/5',
        className
      )}
    >
      {/* Header - Always visible, clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full px-4 py-3.5 flex items-center gap-3',
          'hover:bg-purple-500/5 transition-all duration-200',
          'group cursor-pointer'
        )}
      >
        {/* Icon with animation */}
        <div className={cn(
          'relative flex items-center justify-center w-8 h-8 rounded-lg',
          'bg-gradient-to-br from-purple-500/20 to-blue-500/20',
          'border border-purple-500/30'
        )}>
          {isComplete ? (
            <Brain className="w-4 h-4 text-purple-400" />
          ) : (
            <>
              <Brain className="w-4 h-4 text-purple-400" />
              <motion.div
                className="absolute inset-0 rounded-lg border-2 border-purple-500/50"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </>
          )}
        </div>

        {/* Title and status */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {isComplete ? 'Reasoning Complete' : 'Reasoning...'}
            </span>
            {!isComplete && (
              <motion.div
                className="flex gap-0.5"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 delay-200" />
              </motion.div>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {isComplete
              ? `Thought for ${formatTime(duration)} • Click to ${isExpanded ? 'collapse' : 'view'} reasoning`
              : `Thinking for ${formatTime(duration)}...`}
          </p>
        </div>

        {/* Timer badge */}
        <div className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg',
          'bg-purple-500/10 border border-purple-500/20',
          'text-xs font-medium text-purple-400'
        )}>
          <Clock className="w-3 h-3" />
          {formatTime(duration)}
        </div>

        {/* Expand/collapse icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[var(--text-muted)] group-hover:text-purple-400 transition-colors"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-purple-500/20"
          >
            <div
              ref={contentRef}
              className={cn(
                'px-4 py-4 max-h-96 overflow-y-auto',
                'bg-[var(--bg-muted)]/30',
                'scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent'
              )}
            >
              {/* Thinking content with typing effect */}
              <div className="relative">
                <pre className={cn(
                  'text-sm text-[var(--text-secondary)] whitespace-pre-wrap font-mono',
                  'leading-relaxed'
                )}>
                  {displayedContent}
                  {isStreaming && !isComplete && (
                    <motion.span
                      className="inline-block w-2 h-4 bg-purple-400 ml-0.5"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </pre>

                {/* Gradient fade at bottom when scrollable */}
                {!isComplete && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--bg-muted)]/50 to-transparent pointer-events-none" />
                )}
              </div>

              {/* Completion indicator */}
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-purple-500/20 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-[var(--text-muted)]">
                    Reasoning complete — Final answer below
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar when thinking */}
      {!isComplete && (
        <motion.div
          className="h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 30, ease: 'linear' }}
          style={{ backgroundSize: '200% 100%' }}
        />
      )}
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';

export function StreamingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-4 bg-[var(--bg-elevated)]">
      <div className="flex gap-3 max-w-3xl w-full">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--bg-muted)] text-[var(--text-muted)] flex items-center justify-center text-sm font-medium">
          AI
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-1 h-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-[var(--text-muted)] rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

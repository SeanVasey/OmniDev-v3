'use client';

import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';
import type { AspectRatio } from '@/types';

interface AspectRatioSelectorProps {
  selected: AspectRatio;
  onSelect: (ratio: AspectRatio) => void;
}

const aspectRatios: { id: AspectRatio; label: string }[] = [
  { id: '1:1', label: '1:1' },
  { id: '3:4', label: '3:4' },
  { id: '4:3', label: '4:3' },
  { id: '16:9', label: '16:9' },
  { id: '9:16', label: '9:16' },
];

export function AspectRatioSelector({ selected, onSelect }: AspectRatioSelectorProps) {
  const { trigger } = useHaptics();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="
        inline-flex flex-col
        bg-[var(--glass-bg-elevated)] backdrop-blur-xl
        border border-[var(--glass-border)]
        rounded-2xl
        p-2
        shadow-xl
      "
    >
      {aspectRatios.map((ratio) => {
        const isSelected = selected === ratio.id;

        return (
          <button
            key={ratio.id}
            onClick={() => {
              trigger('selection');
              onSelect(ratio.id);
            }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all touch-target",
              isSelected
                ? "bg-[var(--purple-600)]/20 text-[var(--purple-400)]"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded flex items-center justify-center border-2 transition-all",
              isSelected
                ? "border-[var(--purple-500)] bg-[var(--purple-600)]"
                : "border-[var(--border-default)]"
            )}>
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>

            <span className="text-lg font-medium">{ratio.label}</span>
          </button>
        );
      })}
    </motion.div>
  );
}

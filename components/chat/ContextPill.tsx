'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';

interface ContextPillProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  accentColor: 'purple' | 'orange' | 'coral' | 'blue';
  onPress: () => void;
}

const accentStyles = {
  purple: {
    active: 'bg-[var(--purple-600)]/20 text-[var(--purple-400)] border-[var(--purple-600)]/50',
    inactive: 'bg-[var(--bg-muted)] text-[var(--text-muted)] border-[var(--border-subtle)]',
    glow: 'shadow-[0_0_20px_var(--purple-glow)]',
  },
  orange: {
    active: 'bg-[var(--orange-500)]/20 text-[var(--orange-400)] border-[var(--orange-500)]/50',
    inactive: 'bg-[var(--bg-muted)] text-[var(--text-muted)] border-[var(--border-subtle)]',
    glow: 'shadow-[0_0_20px_var(--orange-glow)]',
  },
  coral: {
    active: 'bg-[var(--coral-500)]/20 text-[var(--coral-400)] border-[var(--coral-500)]/50',
    inactive: 'bg-[var(--bg-muted)] text-[var(--text-muted)] border-[var(--border-subtle)]',
    glow: 'shadow-[0_0_20px_var(--coral-glow)]',
  },
  blue: {
    active: 'bg-[var(--blue-500)]/20 text-[var(--blue-400)] border-[var(--blue-500)]/50',
    inactive: 'bg-[var(--bg-muted)] text-[var(--text-muted)] border-[var(--border-subtle)]',
    glow: 'shadow-[0_0_20px_var(--blue-glow)]',
  },
};

export function ContextPill({ icon, label, active, accentColor, onPress }: ContextPillProps) {
  const { trigger } = useHaptics();
  const styles = accentStyles[accentColor];

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        trigger('selection');
        onPress();
      }}
      className={cn(
        'flex-shrink-0',
        'flex items-center gap-2',
        'h-9 px-4',
        'rounded-full',
        'border',
        'text-sm font-medium',
        'transition-all duration-200',
        'touch-target',
        active ? styles.active : styles.inactive,
        active && styles.glow
      )}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

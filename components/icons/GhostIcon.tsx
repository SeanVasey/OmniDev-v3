import { cn } from '@/lib/utils';

interface GhostIconProps {
  className?: string;
}

export function GhostIcon({ className }: GhostIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn('w-6 h-6', className)}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12v8a2 2 0 002 2h2v-2H4v-8a8 8 0 1116 0v8h-2v2h2a2 2 0 002-2v-8c0-5.523-4.477-10-10-10zM9 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7.5-1.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM12 22a2 2 0 01-2-2h4a2 2 0 01-2 2z"
      />
    </svg>
  );
}

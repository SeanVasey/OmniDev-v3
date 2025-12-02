'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        style: {
          background: 'var(--glass-bg-elevated)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)',
          borderRadius: '1rem',
        },
      }}
    />
  );
}

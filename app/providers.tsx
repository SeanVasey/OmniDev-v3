'use client';

import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.dataset.theme = 'dark';
  }, []);

  return <>{children}</>;
}

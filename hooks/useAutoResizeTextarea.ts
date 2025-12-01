'use client';

import { useEffect } from 'react';

export function useAutoResizeTextarea(ref: React.RefObject<HTMLTextAreaElement>, value: string) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, [ref, value]);
}

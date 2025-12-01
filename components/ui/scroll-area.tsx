'use client';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils';

const ScrollArea = ({ className, children }: React.PropsWithChildren<{ className?: string }>) => (
  <ScrollAreaPrimitive.Root className={cn('relative overflow-hidden', className)}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar
      orientation="vertical"
      className="flex touch-none select-none p-0.5">
      <ScrollAreaPrimitive.Thumb className="flex-1 rounded-full bg-[var(--border-default)]" />
    </ScrollAreaPrimitive.Scrollbar>
  </ScrollAreaPrimitive.Root>
);

export { ScrollArea };

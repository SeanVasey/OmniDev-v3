'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

const Avatar = AvatarPrimitive.Root;
const AvatarImage = AvatarPrimitive.Image;

const AvatarFallback = (
  props: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
) => {
  return (
    <AvatarPrimitive.Fallback
      {...props}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-[var(--bg-muted)] text-sm font-semibold text-[var(--text-primary)]',
        props.className
      )}
    />
  );
};

export { Avatar, AvatarImage, AvatarFallback };

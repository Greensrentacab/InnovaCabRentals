'use client';

/**
 * UserAvatar.tsx — account photo (Google profile picture) or an initials badge
 * in the brand gradient used by the header logo mark.
 */

import { useState } from 'react';
import { cn } from '@/lib/cn';

const SIZES = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-20 w-20 text-2xl',
};

export function initialsOf(name?: string | null, email?: string | null): string {
  const source = (name || email?.split('@')[0] || '').trim();
  if (!source) return '?';
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

export default function UserAvatar({
  name,
  email,
  photoURL,
  size = 'md',
  className,
}: {
  name?: string | null;
  email?: string | null;
  photoURL?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (photoURL && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote Google avatar, no next/image domain config
      <img
        src={photoURL}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className={cn('shrink-0 rounded-full object-cover ring-2 ring-white', SIZES[size], className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-900 font-extrabold tracking-tight text-white ring-2 ring-white',
        SIZES[size],
        className
      )}
    >
      {initialsOf(name, email)}
    </span>
  );
}

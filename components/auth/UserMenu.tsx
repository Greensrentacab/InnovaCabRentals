'use client';

/**
 * UserMenu.tsx — header account pill (design.md §3.1 utilities row).
 * Signed out: compact sign-in button that opens the AuthDialog.
 * Signed in:  avatar with a dropdown (Profile, My Bookings, Sign out),
 * styled like the nav dropdowns.
 */

import { useEffect, useRef, useState, type ElementType } from 'react';
import Link from 'next/link';
import { CalendarClock, ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UserAvatar from '@/components/auth/UserAvatar';
import { cn } from '@/lib/cn';

export default function UserMenu() {
  const { available, loading, user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  if (available && loading) {
    return <span className="shimmer h-10 w-20 rounded-full" aria-hidden="true" />;
  }

  // Signed out (or accounts not configured yet): visible "Sign in" button → /signin page
  if (!user) {
    return (
      <Link
        href="/signin"
        aria-label="Sign in"
        className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white text-[13px] font-bold text-ink transition hover:border-brand-300 hover:text-brand-700 max-sm:w-10 sm:px-4"
      >
        <UserRound className="h-[18px] w-[18px] text-brand-600 sm:h-4 sm:w-4" />
        <span className="max-sm:sr-only">Sign in</span>
      </Link>
    );
  }

  const name = profile?.displayName || user.displayName || '';
  const photo = profile?.photoURL ?? user.photoURL;

  return (
    <div ref={wrapRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account menu"
        className={cn(
          'flex shrink-0 items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 py-1 pl-1 pr-2.5 text-xs font-bold text-ink transition hover:border-brand-300',
          open && 'border-brand-300'
        )}
      >
        <UserAvatar name={name} email={user.email} photoURL={photo} size="sm" />
        <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="glass-strong absolute right-0 top-[calc(100%+10px)] w-72 animate-drop-in rounded-3xl bg-white/95 p-2">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <UserAvatar name={name} email={user.email} photoURL={photo} size="md" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold text-ink">{name || 'Your account'}</span>
              <span className="block truncate text-xs text-slate-500">{user.email}</span>
            </span>
          </div>
          <div className="mt-1">
            <MenuLink href="/profile" icon={UserRound} label="My Profile" onClick={() => setOpen(false)} />
            <MenuLink href="/profile?tab=bookings" icon={CalendarClock} label="My Bookings" onClick={() => setOpen(false)} />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <LogOut className="h-4 w-4" />
              </span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-2xl p-2.5 text-left text-sm font-bold text-ink transition-colors hover:bg-slate-50"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
        <Icon className="h-4 w-4" />
      </span>
      {label}
    </Link>
  );
}

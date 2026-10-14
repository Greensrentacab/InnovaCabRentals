'use client';

/**
 * AuthPage.tsx — full-page Sign in / Sign up (booking-step4-auth design):
 * brand line, intro, Sign in / Sign up tabs, Google + email (AuthPanel),
 * account benefits on Sign up. Signed-in visitors see their account strip.
 * After success the visitor returns to `?next=` (default: My Profile).
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarClock, Check, LogOut, UserRound } from 'lucide-react';
import WhatsAppIcon from '@/components/ds/WhatsAppIcon';
import AuthPanel from '@/components/auth/AuthPanel';
import UserAvatar from '@/components/auth/UserAvatar';
import { useAuth, type AuthMode } from '@/context/AuthContext';
import { siteConfig } from '@/lib/siteConfig';

const PERKS = ['Track and manage your trips', 'Faster checkout next time', 'Booking updates on WhatsApp'];

/** Only same-site paths are allowed as a return target. */
const safeNext = (next: string | null) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/profile');

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const { user, profile, loading, signOut } = useAuth();
  const isSignUp = mode === 'signup';

  // Already signed in when the page opens with a return target → go straight there
  useEffect(() => {
    if (!loading && user && params.get('next')) router.replace(next);
  }, [loading, user, next, params, router]);

  return (
    <div className="ds-scope bg-porcelain">
      <section className="relative isolate pb-16 pt-28 sm:pt-32">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-sky-100 via-sky-50 to-porcelain"
          aria-hidden="true"
        />
        <div className="section">
          <div className="mx-auto w-full max-w-[440px] rounded-4xl bg-white p-5 shadow-[0_24px_60px_-18px_rgba(56,189,248,0.45),0_0_0_1px_rgba(186,230,253,0.9)] sm:p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-700">{siteConfig.brand.headerName}</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Sign in or create an account</h1>

            {user ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3 rounded-2xl bg-live-500/10 p-3">
                  <UserAvatar name={profile?.displayName || user.displayName} email={user.email} photoURL={profile?.photoURL ?? user.photoURL} />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-bold text-ink">{profile?.displayName || user.displayName || 'Your account'}</p>
                    <p className="truncate text-slate-500">{user.email}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">You&apos;re signed in.</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/profile" className="btn-ghost px-3">
                    <UserRound className="h-4 w-4" /> My Profile
                  </Link>
                  <Link href="/profile?tab=bookings" className="btn-ghost px-3">
                    <CalendarClock className="h-4 w-4" /> My Bookings
                  </Link>
                </div>
                <button type="button" onClick={() => void signOut()} className="btn-ghost w-full text-rose-600">
                  <LogOut className="h-4 w-4" /> Not you? Sign out
                </button>
              </div>
            ) : (
              <div className="mt-4 rounded-3xl border border-brand-100 bg-brand-50/50 p-4">
                <p className="mb-3 text-center text-[13.5px] font-semibold leading-snug text-ink">
                  To confirm your booking, please sign in or register.
                </p>
                <AuthPanel
                  key={mode}
                  initialMode={mode}
                  idPrefix={`page-${mode}`}
                  onSuccess={() => router.replace(next)}
                />
                {isSignUp && (
                  <ul className="mt-4 space-y-1 text-[12.5px] text-slate-600">
                    {PERKS.map((p) => (
                      <li key={p} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 shrink-0 text-live-600" strokeWidth={3} /> {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

          </div>

          <p className="mx-auto mt-6 flex max-w-[440px] items-center justify-center gap-1.5 text-center text-xs text-slate-500">
            <WhatsAppIcon className="h-3.5 w-3.5 text-live-600" /> Prefer not to sign in? Call or WhatsApp {siteConfig.contact.phone.display} to book.
          </p>
        </div>
      </section>
    </div>
  );
}

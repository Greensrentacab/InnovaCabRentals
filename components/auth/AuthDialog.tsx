'use client';

/**
 * AuthDialog.tsx — global Sign In / Sign Up overlay opened from the header.
 * Same overlay language as the booking drawer: bottom sheet on mobile,
 * centred card on md+. Closes itself once the customer is signed in.
 */

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthPanel from '@/components/auth/AuthPanel';
import { siteConfig } from '@/lib/siteConfig';

export default function AuthDialog() {
  const { authDialog, closeAuthDialog, user } = useAuth();
  const { open, mode } = authDialog;

  useEffect(() => {
    if (open && user) closeAuthDialog();
  }, [open, user, closeAuthDialog]);

  // Esc closes; body scroll locked while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeAuthDialog();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, closeAuthDialog]);

  if (!open) return null;

  return (
    <div className="ds-scope fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-sm" onClick={closeAuthDialog} />

      <div className="pointer-events-none absolute inset-0 flex items-end justify-center md:items-center md:p-4">
        <div className="pointer-events-auto flex max-h-[92dvh] w-full animate-drawer-in flex-col overflow-hidden rounded-t-4xl bg-white shadow-float-lg md:max-w-md md:rounded-4xl">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 pb-4 pt-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">{siteConfig.brand.name}</p>
              <h2 id="auth-dialog-title" className="text-lg font-extrabold tracking-tight text-ink">
                Your Account
              </h2>
            </div>
            <button
              type="button"
              onClick={closeAuthDialog}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-ink transition hover:bg-slate-200"
              aria-label="Close sign-in"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="pb-safe flex-1 overflow-y-auto px-5 py-5 md:pb-5">
            {/* keyed so reopening honours the requested tab */}
            <AuthPanel key={mode} initialMode={mode} idPrefix="auth-dialog" onSuccess={closeAuthDialog} />
          </div>
        </div>
      </div>
    </div>
  );
}

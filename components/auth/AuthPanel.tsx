'use client';

/**
 * AuthPanel.tsx — Sign In / Sign Up card shared by the booking flow (Step 4),
 * the header sign-in dialog and the profile page.
 *
 * Sign In:  Google, or Email + Password
 * Sign Up:  Google, or Full Name + Email + Password (min. 6 characters)
 * Errors that belong to the other tab ("No account found", "Account already
 * exists") offer a one-click switch to it.
 */

import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AuthFlowError, AuthMode, useAuth } from '@/context/AuthContext';
import SegmentedControl from '@/components/home/SegmentedControl';
import { cn } from '@/lib/cn';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

interface AuthPanelProps {
  initialMode?: AuthMode;
  /** Prefix for input ids when more than one panel can be mounted */
  idPrefix?: string;
  onSuccess?: () => void;
  className?: string;
}

export default function AuthPanel({ initialMode = 'signin', idPrefix = 'auth', onSuccess, className }: AuthPanelProps) {
  const { signInWithGoogle, signUpWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<'google' | 'email' | null>(null);
  const [error, setError] = useState<AuthFlowError | null>(null);
  const [invalidField, setInvalidField] = useState<'name' | 'email' | 'password' | null>(null);

  const isSignUp = mode === 'signup';

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setInvalidField(null);
    setPassword('');
  };

  const fail = (message: string, field: typeof invalidField = null) => {
    setError(new AuthFlowError(message));
    setInvalidField(field);
  };

  const run = async (kind: 'google' | 'email', action: () => Promise<void>) => {
    setBusy(kind);
    setError(null);
    setInvalidField(null);
    try {
      await action();
      onSuccess?.();
    } catch (err) {
      const flowErr = err instanceof AuthFlowError ? err : new AuthFlowError('Something went wrong. Please try again.');
      if (!flowErr.silent) setError(flowErr);
    } finally {
      setBusy(null);
    }
  };

  const handleGoogle = () => run('google', isSignUp ? signUpWithGoogle : signInWithGoogle);

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && name.trim().length < 2) return fail('Please enter your full name.', 'name');
    if (!EMAIL_RE.test(email.trim())) return fail('Please enter a valid email address.', 'email');
    if (isSignUp && password.length < 6) return fail('Password must be at least 6 characters.', 'password');
    if (!isSignUp && !password) return fail('Please enter your password.', 'password');

    run('email', () => (isSignUp ? signUpWithEmail(name, email, password) : signInWithEmail(email, password)));
  };

  // Full panel always renders; without Firebase keys every action shows the
  // "sign-in unavailable" message (thrown by AuthContext) instead of hiding the UI.
  return (
    <div className={cn('space-y-4', className)}>
      <SegmentedControl
        ariaLabel="Sign in or create an account"
        options={[
          { value: 'signin', label: 'Sign In' },
          { value: 'signup', label: 'Sign Up' },
        ]}
        value={mode}
        onChange={switchMode}
      />

      <div>
        <h3 className="text-base font-extrabold">{isSignUp ? 'Create your account' : 'Welcome back'}</h3>
        <p className="text-xs text-slate-500">
          {isSignUp
            ? 'Track your trips and get booking receipts by email.'
            : 'Sign in to confirm your booking and view your trips.'}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-rose-300 bg-rose-50/50 px-4 py-3 text-xs font-medium text-rose-600"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {error.message}{' '}
            {error.switchTo && (
              <button
                type="button"
                onClick={() => switchMode(error.switchTo!)}
                className="font-bold text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                {error.switchTo === 'signup' ? 'Go to Sign Up' : 'Go to Sign In'}
              </button>
            )}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy !== null}
        className={cn('btn-ghost w-full', error?.useGoogle && 'border-brand-300 ring-4 ring-brand-500/10')}
      >
        {busy === 'google' ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        ) : (
          <GoogleMark className="h-[18px] w-[18px]" />
        )}
        {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
      </button>

      <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or with email
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleEmail} noValidate className="space-y-3">
        {isSignUp && (
          <div>
            <label htmlFor={`${idPrefix}-name`} className="label">
              Full Name
            </label>
            <input
              id={`${idPrefix}-name`}
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Suresh Kumar"
              className={cn('field', invalidField === 'name' && 'field-error')}
            />
          </div>
        )}

        <div>
          <label htmlFor={`${idPrefix}-email`} className="label">
            Email Address
          </label>
          <input
            id={`${idPrefix}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={cn('field', invalidField === 'email' && 'field-error')}
          />
        </div>

        <div>
          <label htmlFor={`${idPrefix}-password`} className="label">
            Password
          </label>
          <div className="relative">
            <input
              id={`${idPrefix}-password`}
              type={showPassword ? 'text' : 'password'}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignUp ? 'Minimum 6 characters' : 'Your password'}
              className={cn('field pr-12', invalidField === 'password' && 'field-error')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={busy !== null} className="btn-primary group w-full">
          {busy === 'email' ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : null}
          {isSignUp ? 'Create Account' : 'Sign In'}
          {busy !== 'email' && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500">
        {isSignUp ? 'Already have an account? ' : 'New to us? '}
        <button
          type="button"
          onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}
          className="font-bold text-brand-700 hover:text-brand-800"
        >
          {isSignUp ? 'Sign in' : 'Create an account'}
        </button>
      </p>
    </div>
  );
}

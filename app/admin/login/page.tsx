'use client';

/**
 * app/admin/login/page.tsx
 *
 * Admin Authentication portal for Innova Cabs Bangalore (design.md tokens:
 * glass-strong card, .field/.label, btn-primary). Auth logic unchanged.
 * Official Admin Email: greensrentacab@gmail.com
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Car, KeyRound, Lock, Mail, Shield } from 'lucide-react';
import { adminLogin } from '@/app/actions/admin';
import { siteConfig } from '@/lib/siteConfig';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('greensrentacab@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await adminLogin(password);
    if (res.success) {
      router.push('/admin');
      router.refresh();
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    }
  };

  const handleQuickDemoAccess = async () => {
    setLoading(true);
    setError('');
    const res = await adminLogin('innova2026');
    if (res.success) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Could not establish demo session.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-porcelain p-4">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-slate [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,#000_30%,transparent_70%)]" />
        <div className="absolute -top-40 left-1/2 h-[480px] w-[860px] -translate-x-1/2 rounded-full bg-brand-400/20 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-up space-y-6">
        {/* Brand header */}
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-glow">
            <Car className="h-7 w-7" strokeWidth={2.2} />
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{siteConfig.brand.name}</h1>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700">Chauffeur &amp; Dispatch Console</p>
        </div>

        {/* Login card */}
        <div className="glass-strong rounded-4xl p-6 shadow-float-lg sm:p-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <p className="flex items-center gap-2 text-sm font-extrabold">
              <Shield className="h-4 w-4 text-live-600" /> Admin Verification
            </p>
            <span className="pill py-1">Bangalore HQ</span>
          </div>

          {error && (
            <p role="alert" className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-300 bg-rose-50/50 px-4 py-3 text-xs font-medium text-rose-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="admin-email" className="label">
                Admin Dispatch Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="field pl-11 font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="label">
                Secure Password / Passkey
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter dispatch passkey..."
                  required
                  className={`field pl-11 ${error ? 'field-error' : ''}`}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary group w-full py-3.5 text-[15px]">
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In to Operations Console
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick demo access for immediate evaluation */}
          <div className="mt-5 border-t border-slate-100 pt-5">
            <button type="button" onClick={handleQuickDemoAccess} disabled={loading} className="btn-ghost w-full text-xs">
              <KeyRound className="h-3.5 w-3.5 text-brand-600" /> One-Click Quick Admin Access (Development)
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500">
          Authorized personnel only • {siteConfig.brand.name} Operations Desk
        </p>
      </div>
    </div>
  );
}

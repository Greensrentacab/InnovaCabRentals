'use client';

/**
 * app/admin/login/page.tsx
 * 
 * Admin Authentication portal for Innova Cabs Bangalore.
 * Official Admin Email: greensrentacab@gmail.com
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, Car, AlertCircle, KeyRound } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-brand-orange selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(#F0562B_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-orange text-white flex items-center justify-center mx-auto shadow-xl shadow-brand-orange/20">
            <Car className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            INNOVA <span className="text-brand-orange">CABS</span>
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            Chauffeur &amp; Dispatch Console
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Admin Verification</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full">
              Bangalore HQ
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Dispatch Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Secure Password / Passkey
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter dispatch passkey..."
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[46px] flex items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm shadow-lg shadow-brand-orange/25 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Operations Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access for immediate evaluation */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleQuickDemoAccess}
              disabled={loading}
              className="w-full min-h-[42px] flex items-center justify-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-bold transition-all border border-slate-700/60"
            >
              <KeyRound className="w-3.5 h-3.5 text-brand-orange" />
              <span>One-Click Quick Admin Access (Development)</span>
            </button>
          </div>
        </div>

        {/* Help Footer */}
        <p className="text-[11px] text-center text-slate-500">
          Authorized personnel only • {siteConfig.brand.name} Operations Desk
        </p>
      </div>
    </div>
  );
}

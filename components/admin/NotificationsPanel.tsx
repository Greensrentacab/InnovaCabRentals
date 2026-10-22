'use client';

/**
 * NotificationsPanel.tsx
 *
 * Admin → Notifications: turn new-booking / new-user alerts on or off for this
 * device, send a test, and see (or remove) every device that receives them.
 * The push plumbing lives in lib/adminPushClient.ts; the page owns pushState
 * because its live poll also needs it.
 */

import React, { useEffect, useState } from 'react';
import {
  Bell,
  BellOff,
  BellRing,
  Calendar,
  CheckCircle2,
  Info,
  Monitor,
  RefreshCw,
  Send,
  Smartphone,
  Trash2,
  UserRound,
} from 'lucide-react';
import { getAdminPushDevices, removeAdminPushDevice } from '@/app/actions/admin';
import type { AdminPushDevice } from '@/lib/adminPush';
import { PushState, currentDeviceId } from '@/lib/adminPushClient';

interface Props {
  pushState: PushState | null;
  busy: boolean;
  onToggle: () => void;
  onTest: () => void;
  onNotice: (message: string) => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const isPhone = (label: string) => /Android|iOS/.test(label);

const STATE_COPY: Record<PushState, { title: string; text: string }> = {
  on: {
    title: 'Alerts are on for this device',
    text: 'You’ll get a notification for every new booking and new user sign-up, even when this website is closed.',
  },
  off: {
    title: 'Alerts are off for this device',
    text: 'Turn them on to get a notification on this phone or computer for every new booking and new user sign-up, even when the website is closed.',
  },
  blocked: {
    title: 'Notifications are blocked',
    text: 'This browser is blocking notifications from the site. Tap the lock or settings icon next to the address bar, set Notifications to Allow, then reload this page.',
  },
  unsupported: {
    title: 'This browser can’t receive alerts',
    text: 'Open the admin console in Chrome on an Android phone, or in Chrome, Edge or Firefox on a computer. iPhone Safari isn’t supported.',
  },
  unconfigured: {
    title: 'Device alerts aren’t set up yet',
    text: 'Add NEXT_PUBLIC_FIREBASE_VAPID_KEY to the hosting environment variables and redeploy (see DEPLOY.md).',
  },
};

function NotificationPreview({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <img src="/logo-car.webp" alt="" className="h-6 w-6 object-contain" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <Icon className="h-3.5 w-3.5" /> Innova Cabs admin · now
        </p>
        <p className="mt-0.5 text-sm font-extrabold text-ink">{title}</p>
        <p className="whitespace-pre-line text-xs leading-relaxed text-slate-600">{body}</p>
      </div>
    </div>
  );
}

export default function NotificationsPanel({ pushState, busy, onToggle, onTest, onNotice }: Props) {
  const [devices, setDevices] = useState<AdminPushDevice[] | null>(null);
  const [thisDeviceId, setThisDeviceId] = useState<string | null>(null);
  const [devicesError, setDevicesError] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadDevices = async () => {
    setDevicesError(false);
    try {
      const [list, mine] = await Promise.all([getAdminPushDevices(), currentDeviceId().catch(() => null)]);
      setDevices(list);
      setThisDeviceId(mine);
    } catch (err) {
      console.error('[Notifications] Could not load devices:', err);
      setDevicesError(true);
      setDevices([]);
    }
  };

  // Reload whenever this device is switched on or off
  useEffect(() => {
    if (pushState !== null) loadDevices();
  }, [pushState]);

  const handleRemove = async (device: AdminPushDevice) => {
    if (device.id === thisDeviceId) {
      onToggle();
      return;
    }
    setRemovingId(device.id);
    const res = await removeAdminPushDevice(device.id).catch(() => ({ success: false, error: 'Could not remove the device' }));
    setRemovingId(null);
    onNotice(res.success ? `${device.device} will no longer get alerts` : res.error || 'Could not remove the device');
    if (res.success) loadDevices();
  };

  const state = pushState ?? 'off';
  const copy = STATE_COPY[state];
  const canToggle = pushState === 'on' || pushState === 'off';
  const StateIcon = state === 'on' ? BellRing : state === 'off' ? Bell : BellOff;
  const stateTone =
    state === 'on' ? 'bg-emerald-100 text-emerald-700' : state === 'off' ? 'bg-brand-50 text-brand-700' : 'bg-amber-100 text-amber-700';

  return (
    <div className="animate-panel-in space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">Notifications</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Get notified on your phone or computer the moment a customer books a cab or creates an account.
          </p>
        </div>
        {pushState && (
          <span
            className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full px-3.5 py-2 text-xs font-extrabold ${
              state === 'on' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/70 text-slate-700'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${state === 'on' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {state === 'on' ? 'On for this device' : 'Off for this device'}
          </span>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          {/* This device */}
          <section className="adm-card p-4 sm:p-5">
            {pushState === null ? (
              <div className="flex items-center gap-4">
                <span className="shimmer h-14 w-14 shrink-0 rounded-2xl" />
                <span className="shimmer h-5 w-48 rounded-lg" />
              </div>
            ) : (
              <>
                <div className="flex items-start gap-4">
                  <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${stateTone}`}>
                    <StateIcon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">This device</p>
                    <h2 className="mt-0.5 text-lg font-extrabold tracking-tight text-ink">{copy.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{copy.text}</p>
                  </div>
                </div>

                {canToggle && (
                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={state === 'on'}
                      onClick={onToggle}
                      disabled={busy}
                      className="group flex min-h-[44px] min-w-0 items-center gap-3 text-left disabled:opacity-60"
                    >
                      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${state === 'on' ? 'bg-emerald-600' : 'bg-slate-400'}`}>
                        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${state === 'on' ? 'left-6' : 'left-1'}`} />
                      </span>
                      <span className={`text-sm font-extrabold ${state === 'on' ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {busy ? 'Please wait…' : state === 'on' ? 'Alerts on' : 'Turn on alerts'}
                      </span>
                    </button>
                    {state === 'on' && (
                      <button type="button" onClick={onTest} disabled={busy} className="adm-btn-ghost shrink-0">
                        <Send className="h-4 w-4" /> Send test notification
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </section>

          {/* Devices */}
          <section className="adm-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold tracking-tight">Devices receiving alerts</h2>
                <p className="text-xs text-slate-500">Turn alerts on once on each phone or computer you use.</p>
              </div>
              <button
                type="button"
                onClick={loadDevices}
                aria-label="Refresh devices"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <ul className="mt-3 divide-y divide-slate-100">
              {devices === null &&
                [0, 1].map((i) => (
                  <li key={i} className="flex items-center gap-3 py-3">
                    <span className="shimmer h-10 w-10 rounded-xl" />
                    <span className="shimmer h-4 w-40 rounded-lg" />
                  </li>
                ))}
              {devices?.map((d) => {
                const DeviceIcon = isPhone(d.device) ? Smartphone : Monitor;
                const mine = d.id === thisDeviceId;
                return (
                  <li key={d.id} className="flex items-center gap-3 py-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <DeviceIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink">
                        {d.device}
                        {mine && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800">
                            This device
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">Added {formatDate(d.createdAt)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(d)}
                      disabled={removingId === d.id || (mine && busy)}
                      aria-label={`Stop alerts on ${d.device}`}
                      className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Remove</span>
                    </button>
                  </li>
                );
              })}
              {devices?.length === 0 && (
                <li className="py-6 text-center text-sm text-slate-400">
                  {devicesError ? 'Could not load devices. Try refreshing.' : 'No devices yet. Turn on alerts above to add this one.'}
                </li>
              )}
            </ul>
          </section>
        </div>

        <div className="space-y-5">
          <section className="adm-card p-4 sm:p-5">
            <h2 className="text-lg font-extrabold tracking-tight">What you’ll be notified about</h2>
            <div className="mt-3 space-y-3">
              <NotificationPreview
                icon={Calendar}
                title="New booking #ICB-10482"
                body={'Ravi Kumar · Airport · Toyota Innova Crysta · ₹2,450\nWed, 21 Oct 2026, 5:30 AM — Kempegowda Airport → Indiranagar'}
              />
              <NotificationPreview icon={UserRound} title="New user signed up" body="Ravi Kumar · ravi@example.com" />
            </div>
            <p className="mt-3 text-xs text-slate-500">Tapping a notification opens that booking or user here.</p>
          </section>

          <section className="adm-card p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
              <Info className="h-4 w-4 text-brand-600" /> Good to know
            </h2>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
              {[
                'While this console is open you’ll also see a pop-up and hear a chime, without a duplicate notification.',
                'Android phones: works even when Chrome is closed.',
                'Computers: works while the browser is running in the background.',
                'iPhone Safari can’t receive these alerts.',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

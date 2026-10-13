'use client';

/**
 * app/profile/page.tsx — customer account (design.md §3.0 cards & buttons,
 * §1.1 status chips).
 *
 * Account Profile (the account owner): name, login email, default WhatsApp
 * number used to prefill bookings, avatar and member-since date.
 * My Bookings: every trip placed from this account (upcoming & past) with
 * reference ID, route, schedule, vehicle, live status, receipt link and a
 * prefilled WhatsApp chat about the trip.
 * Per-trip passenger details stay on each booking, so customers can book for
 * family or guests without changing their profile.
 */

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  Car,
  Check,
  Clock,
  FileText,
  LockKeyhole,
  LogOut,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  User,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthPanel from '@/components/auth/AuthPanel';
import UserAvatar from '@/components/auth/UserAvatar';
import SegmentedControl from '@/components/home/SegmentedControl';
import { Booking, BookingStatus } from '@/lib/types';
import { siteConfig } from '@/lib/siteConfig';
import { formatTime12 } from '@/lib/time';
import { cn } from '@/lib/cn';

type Tab = 'profile' | 'bookings';

const STATUS_STYLES: Record<BookingStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-brand-100 text-brand-800' },
  DRIVER_ASSIGNED: { label: 'Driver Assigned', className: 'bg-brand-100 text-brand-800' },
  TRIP_STARTED: { label: 'Trip Started', className: 'bg-live-500/10 text-live-600' },
  COMPLETED: { label: 'Completed', className: 'bg-slate-100 text-slate-600' },
  CANCELLED: { label: 'Cancelled', className: 'bg-rose-100 text-rose-700' },
};

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function formatTripDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatMemberSince(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function PageBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-porcelain pb-20 pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-slate [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,#000_30%,transparent_70%)]" />
        <div className="absolute -top-40 left-1/2 h-[480px] w-[860px] -translate-x-1/2 rounded-full bg-brand-400/15 blur-[120px]" />
      </div>
      <div className="relative mx-auto w-full max-w-4xl space-y-5 px-4 sm:px-6">{children}</div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <PageBackdrop>
      <div className="card-float space-y-4 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="shimmer h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="shimmer h-5 w-1/2 rounded-full" />
            <div className="shimmer h-3 w-1/3 rounded-full" />
          </div>
        </div>
        <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          Loading your account...
        </p>
      </div>
    </PageBackdrop>
  );
}

function ProfileContent() {
  const { available, loading, user, profile, signOut } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab: Tab = searchParams.get('tab') === 'bookings' ? 'bookings' : 'profile';

  const setTab = (next: Tab) => {
    router.replace(next === 'bookings' ? `${pathname}?tab=bookings` : pathname, { scroll: false });
  };

  if (loading) return <ProfileSkeleton />;

  if (!user) {
    return (
      <PageBackdrop>
        <div className="mx-auto max-w-md">
          <div className="mb-5 text-center">
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
              Your Account
            </span>
            <h1 className="text-balance mt-4 text-3xl font-extrabold tracking-tight">Sign in to view your trips</h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage your details, track booking status and download receipts in one place.
            </p>
          </div>
          <div className="card-float p-5 shadow-float-lg sm:p-6">
            {available ? (
              <AuthPanel idPrefix="profile-auth" />
            ) : (
              <p className="text-sm text-slate-600">Online accounts are temporarily unavailable.</p>
            )}
          </div>
        </div>
      </PageBackdrop>
    );
  }

  const displayName = profile?.displayName || user.displayName || '';
  const memberSince = formatMemberSince(profile?.createdAt ?? user.createdAt);
  const isGoogle = user.providers.includes('google.com');

  return (
    <PageBackdrop>
      {/* Account header */}
      <div className="card-float animate-fade-up p-6 shadow-float-lg sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <UserAvatar name={displayName} email={user.email} photoURL={profile?.photoURL ?? user.photoURL} size="xl" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">{siteConfig.brand.name}</p>
            <h1 className="truncate text-2xl font-extrabold tracking-tight sm:text-3xl">{displayName || 'Your Account'}</h1>
            <p className="truncate text-sm text-slate-500">{user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {memberSince && (
                <span className="pill">
                  <CalendarClock className="h-3.5 w-3.5 text-brand-600" /> Member since {memberSince}
                </span>
              )}
              <span className="pill">
                <LockKeyhole className="h-3.5 w-3.5 text-brand-600" /> {isGoogle ? 'Google account' : 'Email account'}
              </span>
            </div>
          </div>
          <button type="button" onClick={() => void signOut()} className="btn-ghost self-start px-4 sm:self-center">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      <SegmentedControl
        ariaLabel="Account sections"
        className="mx-auto max-w-sm"
        options={[
          { value: 'profile', label: 'Profile', icon: UserRound },
          { value: 'bookings', label: 'My Bookings', icon: CalendarClock },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'profile' ? <ProfileTab /> : <BookingsTab />}
    </PageBackdrop>
  );
}

function ProfileTab() {
  const { user, profile, updateAccountProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setName(profile?.displayName || user?.displayName || '');
    setPhone(profile?.phone || '');
  }, [profile?.displayName, profile?.phone, user?.displayName]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setStatus({ type: 'error', message: 'Please enter your full name.' });
      return;
    }
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      setStatus({ type: 'error', message: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    setSaving(true);
    setStatus(null);
    try {
      await updateAccountProfile({ displayName: trimmed, phone });
      setStatus({ type: 'success', message: 'Your profile has been updated.' });
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Could not save your profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid animate-fade-up gap-5 md:grid-cols-[1fr_300px]">
      <form onSubmit={handleSave} noValidate className="card-float space-y-4 p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">Account Details</h2>
          <p className="text-xs text-slate-500">Used to prefill your bookings. Receipts are always sent to your email.</p>
        </div>

        {status && (
          <p
            role={status.type === 'error' ? 'alert' : 'status'}
            className={cn(
              'flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-medium',
              status.type === 'error'
                ? 'border border-rose-300 bg-rose-50/50 text-rose-600'
                : 'border border-live-500/20 bg-live-500/10 text-live-600'
            )}
          >
            {status.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <Check className="h-4 w-4 shrink-0" />}
            {status.message}
          </p>
        )}

        <div>
          <label htmlFor="profile-name" className="label">
            Full Name
          </label>
          <input
            id="profile-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setStatus(null);
            }}
            placeholder="e.g. Suresh Kumar"
            className="field"
          />
        </div>

        <div>
          <label htmlFor="profile-email" className="label">
            Email Address
          </label>
          <div className="relative">
            <input
              id="profile-email"
              type="email"
              value={user?.email ?? ''}
              readOnly
              className="field cursor-not-allowed pr-11 text-slate-500"
            />
            <LockKeyhole className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          <p className="mt-1.5 pl-1 text-[11px] text-slate-500">Your sign-in email. Booking receipts are sent here.</p>
        </div>

        <div>
          <label htmlFor="profile-phone" className="label">
            Default WhatsApp / Mobile Number
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
              +91
            </span>
            <input
              id="profile-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                setStatus(null);
              }}
              placeholder="9876543210"
              maxLength={10}
              className="field pl-12 tabular-nums"
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
          {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          Save Changes
        </button>
      </form>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-brand-100 bg-brand-50/70 p-5">
          <p className="flex items-center gap-1.5 text-xs font-bold text-brand-800">
            <User className="h-4 w-4 text-brand-600" /> Booking for someone else?
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-brand-800/80">
            Just change the passenger name and number in the booking form. Your profile stays the same, and the receipt still
            comes to your email.
          </p>
        </div>
        <div className="card-float p-5">
          <p className="text-sm font-extrabold">Need help with a trip?</p>
          <p className="mt-1 text-xs text-slate-500">Our operations desk is available {siteConfig.contact.hours.toLowerCase()}.</p>
          <div className="mt-4 grid gap-2">
            <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              <MessageCircle className="h-4 w-4" /> WhatsApp Us
            </a>
            <a href={siteConfig.contact.phone.tel} className="btn-ghost">
              <Phone className="h-4 w-4" /> Call {siteConfig.contact.phone.display}
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

function BookingsTab() {
  const { user, authFetch } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setBookings(null);
    try {
      const res = await authFetch('/api/me/bookings');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not load your bookings.');
      setBookings(data.bookings as Booking[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your bookings.');
    }
  }, [authFetch]);

  useEffect(() => {
    if (user) void load();
  }, [user?.uid, load]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="card-float p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertCircle className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-lg font-extrabold">Couldn&apos;t load your bookings</h2>
        <p className="mx-auto mt-1 max-w-sm text-xs font-medium text-rose-600">{error}</p>
        <button type="button" onClick={() => void load()} className="btn-primary mt-5">
          <RotateCcw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  if (!bookings) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="shimmer h-40 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="card-float animate-fade-up p-8 text-center sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Car className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-xl font-extrabold tracking-tight">No trips yet</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          Your airport transfers, outstation trips and local rentals will appear here once you book.
        </p>
        <Link href="/#book" className="btn-primary group mt-6">
          Book a Cab <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  const today = todayKey();
  const isUpcoming = (b: Booking) =>
    b.bookingStatus !== 'COMPLETED' && b.bookingStatus !== 'CANCELLED' && b.pickupDate >= today;
  const upcoming = bookings
    .filter(isUpcoming)
    .sort((a, b) => `${a.pickupDate} ${a.pickupTime}`.localeCompare(`${b.pickupDate} ${b.pickupTime}`));
  const past = bookings
    .filter((b) => !isUpcoming(b))
    .sort((a, b) => `${b.pickupDate} ${b.pickupTime}`.localeCompare(`${a.pickupDate} ${a.pickupTime}`));

  return (
    <div className="animate-fade-up space-y-6">
      {upcoming.length > 0 && (
        <section>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Upcoming trips · {upcoming.length}
          </p>
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingCard key={b.bookingId} booking={b} />
            ))}
          </div>
        </section>
      )}
      {past.length > 0 && (
        <section>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Past &amp; cancelled · {past.length}
          </p>
          <div className="space-y-3">
            {past.map((b) => (
              <BookingCard key={b.bookingId} booking={b} muted />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BookingCard({ booking, muted = false }: { booking: Booking; muted?: boolean }) {
  const status = STATUS_STYLES[booking.bookingStatus] ?? STATUS_STYLES.PENDING;
  const route = [booking.pickupName, ...(booking.stops ?? []), booking.dropName].join(' → ');
  const fare = booking.fare !== null ? `₹${booking.fare.toLocaleString('en-IN')}` : 'Price on request';
  const whatsAppUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
    `Hello ${siteConfig.brand.name}, I'd like to discuss my booking #${booking.bookingId} (${booking.pickupName} → ${booking.dropName} on ${booking.pickupDate} at ${formatTime12(booking.pickupTime)}).`
  )}`;

  return (
    <article className={cn('card-float card-float-hover p-5 sm:p-6', muted && 'bg-white/70')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-sm font-extrabold tracking-wider text-brand-700">#{booking.bookingId}</span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
            status.className
          )}
        >
          {booking.bookingStatus === 'PENDING' && <Clock className="h-3 w-3" />}
          {status.label}
        </span>
      </div>

      <p className="mt-3 flex items-start gap-2 text-sm font-bold text-ink">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        <span className="min-w-0">{route}</span>
      </p>

      <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
        <span className="flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 shrink-0 text-brand-600" />
          {formatTripDate(booking.pickupDate)} · {formatTime12(booking.pickupTime)}
        </span>
        <span className="flex items-center gap-1.5">
          <Car className="h-3.5 w-3.5 shrink-0 text-brand-600" />
          {booking.vehicleName}
        </span>
        <span className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 shrink-0 text-brand-600" />
          <span className="truncate">{booking.customerName}</span>
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Estimated Tariff</span>
          <span className="text-base font-extrabold tabular-nums text-ink">{fare}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/booking/confirmed?id=${encodeURIComponent(booking.bookingId)}`} className="btn-ghost px-4 py-2 text-xs">
            <FileText className="h-3.5 w-3.5" /> View Booking Receipt
          </Link>
          <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-4 py-2 text-xs">
            <MessageCircle className="h-3.5 w-3.5" /> Chat about this trip
          </a>
        </div>
      </div>
    </article>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}

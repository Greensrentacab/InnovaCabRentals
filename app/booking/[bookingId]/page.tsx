'use client';

/**
 * app/booking/[bookingId]/page.tsx
 *
 * Live Booking Status Tracking Page
 *
 * Features:
 * - Live status timeline: Requested > Confirmed > Driver Assigned > Trip Started > Completed
 * - Real-time updates via Firestore onSnapshot
 * - Trip details display
 * - Driver info (name, phone, vehicle number) once assigned
 * - Call and WhatsApp CTAs for driver + dispatch
 * - Friendly not-found state for invalid booking IDs
 * - Returns only the fields this page needs (via API fallback + onSnapshot)
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { doc, onSnapshot, Firestore } from 'firebase/firestore';
import {

  Clock,
  MapPin,
  Calendar,
  Car,
  User,
  Phone,
  MessageCircle,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  Truck,
  Flag,
  Search,
  Navigation,
  BadgeCheck,
} from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import { BookingStatus } from '@/lib/types';
import { formatTime12 } from '@/lib/time';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface TrackingBooking {
  bookingId: string;
  customerName: string;
  customerPhoneMasked?: string | null;
  pickupName: string;
  pickupAddress: string;
  dropName: string;
  dropAddress: string;
  tripType: string;
  serviceType: string;
  pickupDate: string;
  pickupTime: string;
  vehicleName: string;
  fare: number | null;
  bookingStatus: BookingStatus;
  driverName?: string | null;
  driverPhone?: string | null;
  vehicleRegistration?: string | null;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/*  Status Timeline Config                                                    */
/* -------------------------------------------------------------------------- */

const STATUS_STEPS: {
  key: BookingStatus;
  label: string;
  subLabel: string;
  icon: React.ElementType;
}[] = [
  {
    key: 'PENDING',
    label: 'Requested',
    subLabel: 'Booking request logged',
    icon: Clock,
  },
  {
    key: 'CONFIRMED',
    label: 'Confirmed',
    subLabel: 'Ride confirmed by dispatch',
    icon: BadgeCheck,
  },
  {
    key: 'DRIVER_ASSIGNED',
    label: 'Driver Assigned',
    subLabel: 'Chauffeur details shared',
    icon: User,
  },
  {
    key: 'TRIP_STARTED',
    label: 'Trip Started',
    subLabel: 'En route to destination',
    icon: Navigation,
  },
  {
    key: 'COMPLETED',
    label: 'Completed',
    subLabel: 'Trip finished successfully',
    icon: Flag,
  },
];

const STATUS_ORDER: BookingStatus[] = STATUS_STEPS.map((s) => s.key);

function getStatusIndex(status: BookingStatus): number {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

/* -------------------------------------------------------------------------- */
/*  Status Badge Colors                                                       */
/* -------------------------------------------------------------------------- */

// design.md §1.1 "Status chips (booking pipeline)"
function getStatusChip(status: BookingStatus) {
  switch (status) {
    case 'PENDING':
      return { chip: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' };
    case 'CONFIRMED':
      return { chip: 'bg-brand-100 text-brand-800', dot: 'bg-brand-600' };
    case 'DRIVER_ASSIGNED':
      return { chip: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-600' };
    case 'TRIP_STARTED':
      return { chip: 'bg-sky-100 text-sky-800', dot: 'bg-sky-800' };
    case 'COMPLETED':
      return { chip: 'bg-live-500/15 text-live-600', dot: 'bg-live-500' };
    case 'CANCELLED':
      return { chip: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' };
    default:
      return { chip: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' };
  }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function BookingTrackingPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const bookingId = params.bookingId;

  const [booking, setBooking] = useState<TrackingBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // ----- 1. Initial API fetch -----
  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        const data = await res.json();
        if (data.success && data.booking) {
          setBooking(data.booking);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('[BookingTracking] Fetch error:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  // ----- 2. Live Firestore onSnapshot listener -----
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function setupLiveListener() {
      try {
        // Dynamically import client-side Firebase to avoid SSR issues
        const { db } = await import('@/lib/firebase');
        const bookingRef = doc(db as Firestore, 'bookings', bookingId);

        unsubscribe = onSnapshot(
          bookingRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              const hasDriverInfo =
                data.bookingStatus !== 'PENDING' &&
                data.bookingStatus !== 'CONFIRMED';

              setBooking({
                bookingId: data.bookingId || bookingId,
                customerName: data.customerName || 'Valued Passenger',
                customerPhoneMasked: data.customerPhone
                  ? `******${data.customerPhone.slice(-4)}`
                  : null,
                pickupName: data.pickupName || '',
                pickupAddress: data.pickupAddress || '',
                dropName: data.dropName || '',
                dropAddress: data.dropAddress || '',
                tripType: data.tripType || 'oneway',
                serviceType: data.serviceType || 'outstation',
                pickupDate: data.pickupDate || '',
                pickupTime: data.pickupTime || '',
                vehicleName: data.vehicleName || '',
                fare: data.fare ?? null,
                bookingStatus: data.bookingStatus || 'PENDING',
                ...(hasDriverInfo && {
                  driverName: data.driverName,
                  driverPhone: data.driverPhone,
                  vehicleRegistration: data.vehicleRegistration,
                }),
                createdAt: data.createdAt || '',
              });
              setNotFound(false);
              setIsLive(true);
            }
            // If doc doesn't exist in Firestore, keep the API data
          },
          (error) => {
            console.warn('[BookingTracking] onSnapshot error (fallback to API data):', error);
          }
        );
      } catch (err) {
        console.warn('[BookingTracking] Could not set up live listener:', err);
      }
    }

    if (bookingId) {
      setupLiveListener();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [bookingId]);

  // ----- Copy booking ID -----
  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }, [bookingId]);

  // ----- Derived values -----
  const statusChip = booking ? getStatusChip(booking.bookingStatus) : null;
  const currentStepIndex = booking ? getStatusIndex(booking.bookingStatus) : 0;
  const fareText =
    booking?.fare != null ? `₹${booking.fare.toLocaleString('en-IN')}` : 'Price on request';
  const isCancelled = booking?.bookingStatus === 'CANCELLED';

  const showDriverInfo =
    booking &&
    !isCancelled &&
    booking.driverName &&
    (booking.bookingStatus === 'DRIVER_ASSIGNED' ||
      booking.bookingStatus === 'TRIP_STARTED' ||
      booking.bookingStatus === 'COMPLETED');

  // WhatsApp message prefill
  const waMessage = booking
    ? encodeURIComponent(
        `Hello ${siteConfig.brand.name},\n\nI'd like an update on booking #${bookingId}:\n• Route: ${booking.pickupName} ➔ ${booking.dropName}\n• Date: ${booking.pickupDate} at ${formatTime12(booking.pickupTime)}\n• Vehicle: ${booking.vehicleName}\n\nPlease share the latest status. Thank you!`
      )
    : '';
  const whatsAppUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${waMessage}`;

  const pageShell = (children: React.ReactNode) => (
    <div className="relative bg-porcelain pb-20 pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-slate [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,#000_30%,transparent_70%)]" />
        <div className="absolute -top-40 left-1/2 h-[480px] w-[860px] -translate-x-1/2 rounded-full bg-brand-400/20 blur-[120px]" />
      </div>
      <div className="relative mx-auto w-full max-w-3xl space-y-5 px-4 sm:px-6">{children}</div>
    </div>
  );

  /* ===================================================================== */
  /*  LOADING STATE                                                        */
  /* ===================================================================== */
  if (loading) {
    return pageShell(
      <div className="card-float flex flex-col items-center gap-4 p-10">
        <div className="shimmer h-24 w-3/5 rounded-[40%]" />
        <div className="shimmer h-3 w-2/3 rounded-full" />
        <div className="shimmer h-3 w-1/2 rounded-full" />
        <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          Loading booking #{bookingId}...
        </p>
      </div>
    );
  }

  /* ===================================================================== */
  /*  NOT FOUND STATE                                                      */
  /* ===================================================================== */
  if (notFound || !booking) {
    return pageShell(
      <div className="card-float mx-auto max-w-md animate-fade-up p-8 text-center shadow-float-lg sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Search className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight">Booking Not Found</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
          We couldn&apos;t locate a booking with ID <strong className="font-mono text-ink">{bookingId}</strong>. Please
          double-check the reference number from your confirmation message.
        </p>
        <div className="mt-6 grid gap-2">
          <a
            href={`${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
              `Hello, I'm trying to track my booking but it shows not found. My booking reference is: ${bookingId}. Can you help?`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
          <a href={siteConfig.contact.phone.tel} className="btn-primary">
            <Phone className="h-4 w-4" /> Call Dispatch: +91 {siteConfig.contact.phone.raw}
          </a>
          <Link href="/" className="group mt-2 inline-flex items-center justify-center gap-1.5 text-sm font-bold text-brand-700">
            Back to Homepage
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    );
  }

  /* ===================================================================== */
  /*  MAIN TRACKING VIEW                                                   */
  /* ===================================================================== */
  return pageShell(
    <>
      {/* 1. Header — booking ID + status chip */}
      <div className="card-float animate-fade-up p-6 shadow-float-lg sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">{siteConfig.brand.name}</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Track Your Booking</h1>
          </div>
          {isLive && (
            <span className="chip-live shrink-0">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-live-500" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live-500" />
              </span>
              Live
            </span>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 py-2 pl-4 pr-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Booking ID</span>
            <strong className="font-mono text-lg font-extrabold tracking-wider text-brand-700">{bookingId}</strong>
            <button
              type="button"
              onClick={handleCopyId}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/80 transition hover:text-brand-700 active:scale-95"
              title="Copy Booking ID"
              aria-label="Copy booking ID"
            >
              {copied ? <Check className="h-4 w-4 text-live-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          {statusChip && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide ${statusChip.chip}`}
            >
              <span className="relative flex h-2 w-2">
                {(booking.bookingStatus === 'PENDING' || booking.bookingStatus === 'TRIP_STARTED') && (
                  <span className={`absolute inline-flex h-full w-full animate-pulse-ring rounded-full ${statusChip.dot}`} />
                )}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${statusChip.dot}`} />
              </span>
              {isCancelled ? 'Cancelled' : booking.bookingStatus.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        <p className={`mt-2 h-4 text-[11px] font-semibold text-live-600 transition-opacity ${copied ? 'opacity-100' : 'opacity-0'}`}>
          ✓ Booking ID copied to clipboard!
        </p>
      </div>

      {/* 2. Live status timeline (design.md §3.4 node states, vertical) */}
      {!isCancelled && (
        <div className="card-float animate-fade-up p-6 [animation-delay:100ms] sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <ShieldCheck className="h-5 w-5 text-brand-600" /> Trip Status Timeline
          </h2>

          <ol className="mt-6">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const StepIcon = step.icon;
              const isLast = idx === STATUS_STEPS.length - 1;

              return (
                <li key={step.key} className="relative flex items-start gap-4">
                  {!isLast && (
                    <div className="absolute left-[23px] top-12 h-[calc(100%-40px)] w-0.5 overflow-hidden bg-slate-200">
                      <div
                        className="h-full w-full origin-top bg-brand-600 transition-transform duration-700 ease-premium"
                        style={{ transform: `scaleY(${isCompleted ? 1 : 0})` }}
                      />
                    </div>
                  )}

                  <div className="relative z-10 shrink-0">
                    {isCurrent && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-500/40" />}
                    <div
                      className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                        isCurrent
                          ? 'border-brand-600 bg-brand-600 text-white shadow-glow'
                          : isCompleted
                            ? 'border-brand-200 bg-brand-50 text-brand-700'
                            : 'border-slate-200 bg-white text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="h-5 w-5" strokeWidth={3} /> : <StepIcon className="h-5 w-5" />}
                    </div>
                  </div>

                  <div className={isLast ? 'pt-2' : 'pb-8 pt-2'}>
                    <p className={`text-base font-extrabold ${isCurrent ? 'text-brand-700' : isCompleted ? 'text-ink' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    <p className={`mt-0.5 text-sm ${isCompleted || isCurrent ? 'text-slate-600' : 'text-slate-400'}`}>
                      {step.subLabel}
                    </p>
                    {isCurrent && (
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" /> Current Step
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Cancelled banner */}
      {isCancelled && (
        <div className="card-float animate-fade-up border-rose-300 bg-rose-50/50 p-6 text-center sm:p-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-xl font-extrabold tracking-tight text-rose-700">Booking Cancelled</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-rose-600">
            This booking has been cancelled. If this was a mistake, please contact our dispatch team immediately.
          </p>
        </div>
      )}

      {/* 3. Driver info (only once assigned) */}
      {showDriverInfo && (
        <div className="card-float relative animate-fade-up overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-600 to-brand-400" />
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <Truck className="h-5 w-5 text-brand-600" /> Your Chauffeur
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoTile icon={User} label="Driver name" value={booking.driverName ?? ''} />
            <InfoTile icon={Phone} label="Driver phone" value={`+91 ${booking.driverPhone}`} />
            <InfoTile icon={Car} label="Vehicle number" value={booking.vehicleRegistration ?? ''} mono />
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <a href={`tel:+91${booking.driverPhone}`} className="btn-primary">
              <Phone className="h-4 w-4" /> Call Driver
            </a>
            <a
              href={`https://wa.me/91${booking.driverPhone}?text=${encodeURIComponent(
                `Hello, I have a booking ${bookingId} with ${siteConfig.brand.name}. I'd like to coordinate pickup details.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Driver
            </a>
          </div>
        </div>
      )}

      {/* 4. Trip details */}
      <div className="card-float animate-fade-up p-6 [animation-delay:200ms] sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-extrabold tracking-tight">Trip Details</h2>
          <span className="font-mono text-xs font-bold text-slate-400">#{bookingId}</span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Travel route ({booking.tripType === 'round' ? 'Round Trip' : 'One Way'})
            </p>
            <div className="relative mt-2 space-y-3 pl-8">
              <span className="absolute left-[11px] top-6 h-[calc(100%-36px)] border-l-2 border-dashed border-slate-300" />
              <div className="relative">
                <span className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm font-bold text-ink">{booking.pickupName}</p>
                <p className="text-xs text-slate-500">Pickup: {booking.pickupAddress}</p>
              </div>
              <div className="relative">
                <span className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full bg-live-500/10 text-live-600">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm font-bold text-ink">{booking.dropName}</p>
                <p className="text-xs text-slate-500">Drop: {booking.dropAddress}</p>
              </div>
            </div>
          </div>

          <InfoTile icon={Calendar} label="Departure schedule" value={`${booking.pickupDate} at ${formatTime12(booking.pickupTime)}`}>
            <span className="capitalize">Service Type: {booking.serviceType} transfer</span>
          </InfoTile>
          <InfoTile icon={Car} label="Selected vehicle" value={booking.vehicleName}>
            Clean, AC Chauffeur Driven MPV
          </InfoTile>
          <InfoTile icon={User} label="Passenger" value={booking.customerName}>
            {booking.customerPhoneMasked && <span className="font-mono">{booking.customerPhoneMasked}</span>}
          </InfoTile>
          <div className="rounded-2xl border border-live-500/20 bg-live-500/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-live-600">Estimated tariff</p>
            <p className="mt-1 text-lg font-extrabold text-ink">{fareText}</p>
            <p className="text-[11px] font-semibold text-live-600">No advance payment • Pay chauffeur directly</p>
          </div>
        </div>
      </div>

      {/* 5. Actions */}
      <div className="card-float p-6 text-center sm:p-8">
        <h3 className="text-lg font-extrabold tracking-tight">Need Assistance?</h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
          Our 24/7 dispatch desk is always available. Chat on WhatsApp for the fastest response or call us directly.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
          <a href={siteConfig.contact.phone.tel} className="btn-primary">
            <Phone className="h-4 w-4" /> Call Dispatch: +91 {siteConfig.contact.phone.raw}
          </a>
        </div>
        <div className="mt-5 border-t border-slate-100 pt-4">
          <Link href="/" className="group inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-800">
            Back to Homepage
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  mono = false,
  children,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 flex items-center gap-2 text-sm font-bold text-ink">
        <Icon className="h-4 w-4 shrink-0 text-brand-600" />
        <span className={mono ? 'font-mono tracking-wider' : undefined}>{value}</span>
      </p>
      {children && <p className="mt-0.5 text-xs text-slate-500">{children}</p>}
    </div>
  );
}

'use client';

/**
 * app/booking/confirmed/page.tsx
 *
 * Booking Confirmation & Status Tracker Page (design.md §1.3 confirmation H1,
 * §1.1 status chips, §3.4 timeline nodes, §3.0 cards & buttons).
 * Features:
 * - "Request received, we'll confirm on WhatsApp shortly"
 * - Prominent Booking ID display (e.g. ICB-10482) with Copy button
 * - Trip Details breakdown
 * - "View My Booking" status card with live PENDING badge
 * - "Chat on WhatsApp" button with prefilled wa.me message
 * - Call Dispatch button
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Calendar, Car, Check, Clock, Copy, IndianRupee, MapPin, MessageCircle, Phone, User } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import { Booking } from '@/lib/types';
import { cn } from '@/lib/cn';
import { formatTime12 } from '@/lib/time';

function BookingConfirmedContent() {
  const searchParams = useSearchParams();
  const idFromQuery = searchParams.get('id');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      if (!idFromQuery) {
        // Fallback default demonstration booking if accessed directly without query
        setBooking({
          bookingId: 'ICB-10482',
          customerName: 'Suresh Kumar',
          customerPhone: '9876543210',
          pickupName: 'Kempegowda International Airport (BLR)',
          pickupAddress: 'Terminal 1 Arrivals, BLR Airport, Devanahalli, Bengaluru',
          pickupLat: 13.1986,
          pickupLng: 77.7066,
          dropName: 'Indiranagar 100ft Road',
          dropAddress: 'HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
          dropLat: 12.9784,
          dropLng: 77.6408,
          tripType: 'oneway',
          serviceType: 'airport',
          pickupDate: new Date().toISOString().split('T')[0],
          pickupTime: '18:30',
          vehicleId: 'innova-crysta',
          vehicleName: 'Toyota Innova Crysta',
          fare: null,
          bookingStatus: 'PENDING',
          driverId: null,
          driverName: null,
          driverPhone: null,
          vehicleRegistration: null,
          notes: 'Flight landing assistance required with 3 large baggage bags.',
          createdAt: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/bookings?id=${idFromQuery}`);
        const data = await res.json();
        if (data.success && data.booking) {
          setBooking(data.booking);
        } else {
          // If not found yet in API, keep fallback
          setBooking({
            bookingId: idFromQuery,
            customerName: 'Valued Passenger',
            customerPhone: '9876543210',
            pickupName: 'Bangalore City',
            pickupAddress: 'Bengaluru, Karnataka',
            pickupLat: null,
            pickupLng: null,
            dropName: 'Destination Point',
            dropAddress: 'Karnataka, India',
            dropLat: null,
            dropLng: null,
            tripType: 'oneway',
            serviceType: 'outstation',
            pickupDate: new Date().toISOString().split('T')[0],
            pickupTime: '09:00',
            vehicleId: 'innova-crysta',
            vehicleName: 'Toyota Innova Crysta',
            fare: null,
            bookingStatus: 'PENDING',
            driverId: null,
            driverName: null,
            driverPhone: null,
            vehicleRegistration: null,
            notes: null,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Failed to load booking:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [idFromQuery]);

  const handleCopyId = () => {
    if (booking?.bookingId) {
      navigator.clipboard.writeText(booking.bookingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const bookingId = booking?.bookingId || 'ICB-10482';
  const fareText = booking?.fare !== null && booking?.fare !== undefined ? `₹${booking.fare}` : 'Price on request';

  // Construct WhatsApp URL with prefilled booking details
  const prefilledWaMessage = encodeURIComponent(
    `Hello ${siteConfig.brand.name},\n\nI have placed booking request #${bookingId}:\n• Route: ${booking?.pickupName} ➔ ${booking?.dropName}\n• Service: ${booking?.serviceType.toUpperCase()} (${booking?.tripType === 'round' ? 'Round Trip' : 'One Way'})\n• Date & Time: ${booking?.pickupDate} at ${formatTime12(booking?.pickupTime)}\n• Vehicle: ${booking?.vehicleName}\n• Passenger: ${booking?.customerName} (+91 ${booking?.customerPhone})\n\nPlease confirm availability and share chauffeur details.`
  );
  const whatsAppUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${prefilledWaMessage}`;

  if (loading) return <ConfirmedSkeleton />;

  const steps = [
    { title: '1. Request Placed', hint: 'Logged in queue', state: 'done' as const, icon: Check },
    { title: '2. Chauffeur Allocation', hint: 'Dispatch manager reviewing', state: 'active' as const, icon: Clock },
    { title: '3. Driver Assigned', hint: 'Sent on WhatsApp', state: 'upcoming' as const, icon: Car },
  ];

  return (
    <div className="relative bg-porcelain pb-20 pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-slate [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,#000_30%,transparent_70%)]" />
        <div className="absolute -top-40 left-1/2 h-[480px] w-[860px] -translate-x-1/2 rounded-full bg-live-400/15 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-3xl space-y-5 px-4 sm:px-6">
        {/* 1. Success banner */}
        <div className="card-float animate-fade-up p-6 text-center shadow-float-lg sm:p-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-live-500 text-white shadow-glow-live">
            <Check className="h-8 w-8" strokeWidth={3} />
          </span>
          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
            <Clock className="h-3.5 w-3.5" /> Status: PENDING Confirmation
          </span>
          <h1 className="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Request received, we&apos;ll confirm on WhatsApp shortly
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-slate-600">
            Our 24/7 Bangalore operations desk has logged your travel schedule. Our dispatch manager will verify chauffeur
            availability and connect with you on WhatsApp at <strong className="text-ink">+91 {booking?.customerPhone}</strong>.
          </p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 py-2 pl-4 pr-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Booking reference</span>
            <strong className="font-mono text-lg font-extrabold tracking-wider text-brand-700">{bookingId}</strong>
            <button
              type="button"
              onClick={handleCopyId}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/80 transition hover:text-brand-700 active:scale-95"
              title="Copy Reference ID"
              aria-label="Copy booking reference ID"
            >
              {copied ? <Check className="h-4 w-4 text-live-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className={cn('mt-2 h-4 text-[11px] font-semibold text-live-600 transition-opacity', copied ? 'opacity-100' : 'opacity-0')}>
            ✓ Booking ID copied to clipboard!
          </p>
        </div>

        {/* 2. View my booking */}
        <div className="card-float animate-fade-up p-6 [animation-delay:100ms] sm:p-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">{siteConfig.brand.name}</p>
              <h2 className="text-lg font-extrabold tracking-tight">View My Booking</h2>
            </div>
            <span className="font-mono text-xs font-bold text-slate-400">#{bookingId}</span>
          </div>

          {/* Dispatch progress */}
          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Trip dispatch status</p>
          <ol className="mt-3 grid gap-3 sm:grid-cols-3">
            {steps.map(({ title, hint, state, icon: Icon }) => (
              <li
                key={title}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border p-3',
                  state === 'active' ? 'border-brand-200 bg-brand-50/70' : 'border-slate-200/80 bg-white'
                )}
              >
                <span className="relative flex shrink-0">
                  {state === 'active' && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-500/40" />}
                  <span
                    className={cn(
                      'relative flex h-9 w-9 items-center justify-center rounded-full border-2',
                      state === 'active' && 'border-brand-600 bg-brand-600 text-white shadow-glow',
                      state === 'done' && 'border-brand-200 bg-brand-50 text-brand-700',
                      state === 'upcoming' && 'border-slate-200 bg-white text-slate-400'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </span>
                <span>
                  <span className={cn('block text-sm font-extrabold', state === 'active' ? 'text-brand-700' : 'text-ink')}>{title}</span>
                  <span className="block text-[11px] text-slate-500">{hint}</span>
                </span>
              </li>
            ))}
          </ol>

          {/* Trip details */}
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Trip details</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Travel route ({booking?.tripType === 'round' ? 'Round Trip' : 'One Way'})
              </p>
              <div className="relative mt-2 space-y-3 pl-8">
                <span className="absolute left-[11px] top-6 h-[calc(100%-36px)] border-l-2 border-dashed border-slate-300" />
                <div>
                  <span className="absolute left-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-sm font-bold text-ink">{booking?.pickupName}</p>
                  <p className="text-xs text-slate-500">Pickup: {booking?.pickupAddress}</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full bg-live-500/10 text-live-600">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-sm font-bold text-ink">{booking?.dropName}</p>
                  <p className="text-xs text-slate-500">Drop: {booking?.dropAddress}</p>
                </div>
              </div>
            </div>

            <DetailTile icon={Calendar} label="Departure schedule" value={`${booking?.pickupDate} at ${formatTime12(booking?.pickupTime)}`}>
              <span className="capitalize">Service Type: {booking?.serviceType} transfer</span>
            </DetailTile>
            <DetailTile icon={Car} label="Selected vehicle" value={booking?.vehicleName ?? ''}>
              Clean, AC Chauffeur Driven MPV
            </DetailTile>
            <DetailTile icon={User} label="Passenger contact" value={booking?.customerName ?? ''}>
              <span className="font-mono">+91 {booking?.customerPhone}</span>
            </DetailTile>
            <div className="rounded-2xl border border-live-500/20 bg-live-500/10 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-live-600">
                <IndianRupee className="h-3 w-3" /> Estimated tariff
              </p>
              <p className="mt-1 text-lg font-extrabold text-ink">{fareText}</p>
              <p className="text-[11px] font-semibold text-live-600">No advance payment • Pay chauffeur directly</p>
            </div>
          </div>

          {booking?.notes && (
            <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <strong className="text-ink">Special Requests:</strong> {booking.notes}
            </p>
          )}
        </div>

        {/* 3. Actions */}
        <div className="card-float animate-fade-up p-6 text-center [animation-delay:200ms] sm:p-8">
          <h3 className="text-lg font-extrabold tracking-tight">Need Immediate Assistance?</h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
            Our dispatch desk is active 24/7. Chat directly on WhatsApp to expedite chauffeur assignment or make last-minute
            schedule adjustments.
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
      </div>
    </div>
  );
}

function DetailTile({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: typeof Car;
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 flex items-center gap-2 text-sm font-bold text-ink">
        <Icon className="h-4 w-4 shrink-0 text-brand-600" />
        {value}
      </p>
      {children && <p className="mt-0.5 text-xs text-slate-500">{children}</p>}
    </div>
  );
}

function ConfirmedSkeleton() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-4 px-4 pt-28">
      <div className="shimmer h-24 w-3/5 rounded-[40%]" />
      <div className="shimmer h-3 w-2/3 rounded-full" />
      <div className="shimmer h-3 w-1/2 rounded-full" />
      <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        Loading booking confirmation...
      </p>
    </div>
  );
}

export default function BookingConfirmedPage() {
  return (
    <Suspense fallback={<ConfirmedSkeleton />}>
      <BookingConfirmedContent />
    </Suspense>
  );
}

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
  CheckCircle2,
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

function getStatusColor(status: BookingStatus) {
  switch (status) {
    case 'PENDING':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
      };
    case 'CONFIRMED':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        dot: 'bg-blue-500',
      };
    case 'DRIVER_ASSIGNED':
      return {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-700',
        dot: 'bg-indigo-500',
      };
    case 'TRIP_STARTED':
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500',
      };
    case 'COMPLETED':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        dot: 'bg-green-500',
      };
    case 'CANCELLED':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        dot: 'bg-red-500',
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        dot: 'bg-gray-500',
      };
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
  const statusColor = booking ? getStatusColor(booking.bookingStatus) : null;
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
        `Hello ${siteConfig.brand.name},\n\nI'd like an update on booking #${bookingId}:\n• Route: ${booking.pickupName} ➔ ${booking.dropName}\n• Date: ${booking.pickupDate} at ${booking.pickupTime}\n• Vehicle: ${booking.vehicleName}\n\nPlease share the latest status. Thank you!`
      )
    : '';
  const whatsAppUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${waMessage}`;

  /* ===================================================================== */
  /*  LOADING STATE                                                        */
  /* ===================================================================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-14 h-14 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-brand-navy">
          Loading booking #{bookingId}...
        </p>
      </div>
    );
  }

  /* ===================================================================== */
  /*  NOT FOUND STATE                                                      */
  /* ===================================================================== */
  if (notFound || !booking) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 text-center space-y-5">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <Search className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-navy">
              Booking Not Found
            </h1>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              We couldn&apos;t locate a booking with ID{' '}
              <strong className="text-brand-navy font-mono">{bookingId}</strong>.
              Please double-check the reference number from your confirmation message.
            </p>
          </div>

          {/* Helpful actions */}
          <div className="space-y-3 pt-2">
            <a
              href={`${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
                `Hello, I'm trying to track my booking but it shows not found. My booking reference is: ${bookingId}. Can you help?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat on WhatsApp</span>
            </a>

            <a
              href={siteConfig.contact.phone.tel}
              className="min-h-[48px] w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-navy hover:bg-brand-navy/90 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
            >
              <Phone className="w-4 h-4 text-brand-orange" />
              <span>Call Dispatch: +91 {siteConfig.contact.phone.raw}</span>
            </a>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:underline pt-1"
            >
              <span>Back to Homepage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ===================================================================== */
  /*  MAIN TRACKING VIEW                                                   */
  /* ===================================================================== */
  return (
    <div className="min-h-screen bg-brand-offwhite py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-brand-navy">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        {/* ================================================================ */}
        {/* 1. HEADER CARD — Booking ID + Status Badge                       */}
        {/* ================================================================ */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-5">
          {/* Live indicator */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-orange">
                Innova Cabs Bangalore
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-brand-navy">
                Track Your Booking
              </h1>
            </div>

            {isLive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
          </div>

          {/* Booking ID ribbon */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-brand-navy text-white shadow-md">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Booking ID:
              </span>
              <strong className="text-lg font-mono text-brand-orange tracking-wider font-extrabold">
                {bookingId}
              </strong>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-gray-300 hover:text-white transition-all"
                title="Copy Booking ID"
                aria-label="Copy booking ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Status Badge */}
            {statusColor && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusColor.bg} ${statusColor.border} ${statusColor.text} uppercase tracking-wide`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${statusColor.dot} ${
                    booking.bookingStatus === 'PENDING' ||
                    booking.bookingStatus === 'TRIP_STARTED'
                      ? 'animate-pulse'
                      : ''
                  }`}
                />
                {isCancelled ? 'Cancelled' : booking.bookingStatus.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {copied && (
            <p className="text-[11px] text-emerald-600 font-semibold animate-in fade-in">
              ✓ Booking ID copied to clipboard!
            </p>
          )}
        </div>

        {/* ================================================================ */}
        {/* 2. LIVE STATUS TIMELINE                                          */}
        {/* ================================================================ */}
        {!isCancelled && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-5">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-orange" />
              Trip Status Timeline
            </h2>

            <div className="relative">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isPending = idx > currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    {/* Vertical connector line */}
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`absolute left-[19px] top-[40px] w-0.5 h-[calc(100%-8px)] ${
                          isCompleted
                            ? 'bg-emerald-400'
                            : isCurrent
                            ? 'bg-gradient-to-b from-brand-orange to-gray-200'
                            : 'bg-gray-200'
                        }`}
                      />
                    )}

                    {/* Step circle */}
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                          : isCurrent
                          ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/30 ring-4 ring-brand-orange/20'
                          : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <StepIcon
                          className={`w-5 h-5 ${
                            isCurrent ? 'animate-pulse' : ''
                          }`}
                        />
                      )}
                    </div>

                    {/* Step content */}
                    <div
                      className={`pb-8 ${
                        idx === STATUS_STEPS.length - 1 ? 'pb-0' : ''
                      }`}
                    >
                      <p
                        className={`text-sm font-bold ${
                          isCompleted || isCurrent
                            ? 'text-brand-navy'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          isCompleted || isCurrent
                            ? 'text-gray-500'
                            : 'text-gray-300'
                        }`}
                      >
                        {step.subLabel}
                      </p>

                      {/* Current step pulse indicator */}
                      {isCurrent && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-[10px] font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                          Current Step
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CANCELLED Banner */}
        {isCancelled && (
          <div className="bg-red-50 rounded-3xl p-6 sm:p-8 shadow-xl border border-red-200 space-y-3 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-extrabold text-red-700">
              Booking Cancelled
            </h2>
            <p className="text-sm text-red-600 max-w-md mx-auto">
              This booking has been cancelled. If this was a mistake, please contact
              our dispatch team immediately.
            </p>
          </div>
        )}

        {/* ================================================================ */}
        {/* 3. DRIVER INFO CARD (shown only when driver is assigned)         */}
        {/* ================================================================ */}
        {showDriverInfo && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-5 overflow-hidden relative">
            {/* Decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-orange via-emerald-500 to-brand-navy" />

            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              Your Chauffeur
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Driver name */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Driver Name
                </span>
                <p className="text-sm font-bold text-brand-navy flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-orange shrink-0" />
                  <span>{booking.driverName}</span>
                </p>
              </div>

              {/* Driver phone */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Driver Phone
                </span>
                <p className="text-sm font-bold text-brand-navy flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>+91 {booking.driverPhone}</span>
                </p>
              </div>

              {/* Vehicle registration */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Vehicle Number
                </span>
                <p className="text-sm font-bold text-brand-navy flex items-center gap-2">
                  <Car className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-mono tracking-wider">
                    {booking.vehicleRegistration}
                  </span>
                </p>
              </div>
            </div>

            {/* Driver CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <a
                href={`tel:+91${booking.driverPhone}`}
                className="min-h-[48px] flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-navy hover:bg-brand-navy/90 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
              >
                <Phone className="w-4 h-4 text-brand-orange" />
                <span>Call Driver</span>
              </a>
              <a
                href={`https://wa.me/91${booking.driverPhone}?text=${encodeURIComponent(
                  `Hello, I have a booking ${bookingId} with ${siteConfig.brand.name}. I'd like to coordinate pickup details.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Driver</span>
              </a>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 4. TRIP DETAILS CARD                                             */}
        {/* ================================================================ */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              Trip Details
            </h2>
            <span className="text-xs font-bold text-gray-400 font-mono">
              #{bookingId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Route */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 sm:col-span-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Travel Route (
                {booking.tripType === 'round' ? 'Round Trip' : 'One Way'})
              </span>
              <p className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                <span>
                  {booking.pickupName} ➔ {booking.dropName}
                </span>
              </p>
              <p className="text-xs text-gray-500 pl-6">
                Pickup: {booking.pickupAddress}
              </p>
              <p className="text-xs text-gray-500 pl-6">
                Drop: {booking.dropAddress}
              </p>
            </div>

            {/* Schedule */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Departure Schedule
              </span>
              <p className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-orange shrink-0" />
                <span>
                  {booking.pickupDate} at {booking.pickupTime}
                </span>
              </p>
              <p className="text-xs text-gray-500 capitalize">
                Service Type: {booking.serviceType} transfer
              </p>
            </div>

            {/* Vehicle */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Selected Vehicle
              </span>
              <p className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{booking.vehicleName}</span>
              </p>
              <p className="text-xs text-gray-500">
                Clean, AC Chauffeur Driven MPV
              </p>
            </div>

            {/* Passenger */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Passenger
              </span>
              <p className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <User className="w-4 h-4 text-brand-orange shrink-0" />
                <span>{booking.customerName}</span>
              </p>
              {booking.customerPhoneMasked && (
                <p className="text-xs text-gray-500 font-mono">
                  {booking.customerPhoneMasked}
                </p>
              )}
            </div>

            {/* Fare */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">
                Estimated Tariff
              </span>
              <p className="text-lg font-black text-brand-navy">{fareText}</p>
              <p className="text-[11px] text-emerald-700 font-semibold">
                No advance payment • Pay chauffeur directly
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* 5. ACTION BUTTONS                                                */}
        {/* ================================================================ */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-4 text-center">
          <h3 className="text-base font-bold text-brand-navy">
            Need Assistance?
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Our 24/7 dispatch desk is always available. Chat on WhatsApp for the
            fastest response or call us directly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat on WhatsApp</span>
            </a>

            <a
              href={siteConfig.contact.phone.tel}
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-navy hover:bg-brand-navy/90 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
            >
              <Phone className="w-4 h-4 text-brand-orange" />
              <span>Call Dispatch: +91 {siteConfig.contact.phone.raw}</span>
            </a>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:underline"
            >
              <span>Back to Homepage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

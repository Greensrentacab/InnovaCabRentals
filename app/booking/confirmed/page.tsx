'use client';

/**
 * app/booking/confirmed/page.tsx
 * 
 * Booking Confirmation & Status Tracker Page
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
  HelpCircle,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import { Booking } from '@/lib/types';

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
    `Hello ${siteConfig.brand.name},\n\nI have placed booking request #${bookingId}:\n• Route: ${booking?.pickupName} ➔ ${booking?.dropName}\n• Service: ${booking?.serviceType.toUpperCase()} (${booking?.tripType === 'round' ? 'Round Trip' : 'One Way'})\n• Date & Time: ${booking?.pickupDate} at ${booking?.pickupTime}\n• Vehicle: ${booking?.vehicleName}\n• Passenger: ${booking?.customerName} (+91 ${booking?.customerPhone})\n\nPlease confirm availability and share chauffeur details.`
  );
  const whatsAppUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${prefilledWaMessage}`;

  return (
    <div className="min-h-screen bg-brand-offwhite py-12 px-4 sm:px-6 lg:px-8 text-brand-navy">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
        
        {/* ================================================================== */}
        {/* 1. TOP SUCCESS BANNER                                              */}
        {/* ================================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5" />
              <span>Status: PENDING Confirmation</span>
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy">
              Request received, we&apos;ll confirm on WhatsApp shortly
            </h1>

            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Our 24/7 Bangalore operations desk has logged your travel schedule. Our dispatch manager will verify chauffeur availability and connect with you on WhatsApp at <strong className="text-brand-navy">+91 {booking?.customerPhone}</strong>.
            </p>
          </div>

          {/* Booking ID Ribbon */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-brand-navy text-white shadow-md">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Booking Reference ID:
              </span>
              <strong className="text-lg sm:text-xl font-mono text-brand-orange tracking-wider font-extrabold">
                {bookingId}
              </strong>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-gray-300 hover:text-white transition-all"
                title="Copy Reference ID"
                aria-label="Copy booking reference ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && (
              <p className="text-[11px] text-emerald-600 font-semibold mt-1.5 animate-in fade-in">
                ✓ Booking ID copied to clipboard!
              </p>
            )}
          </div>
        </div>

        {/* ================================================================== */}
        {/* 2. "VIEW MY BOOKING" CARD & TRIP DETAILS                           */}
        {/* ================================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-orange">
                Innova Cabs Bangalore
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-brand-navy">
                View My Booking
              </h2>
            </div>

            <span className="text-xs font-bold text-gray-400 font-mono">
              #{bookingId}
            </span>
          </div>

          {/* Dispatch Progress Steps */}
          <div className="p-4 rounded-2xl bg-brand-offwhite border border-gray-200/80 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
              Trip Dispatch Status
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-bold text-gray-800 block">1. Request Placed</span>
                  <span className="text-[10px] text-gray-400">Logged in queue</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm">
                <Clock className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                <div>
                  <span className="font-bold block">2. Chauffeur Allocation</span>
                  <span className="text-[10px] text-amber-700">Dispatch manager reviewing</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200/60 text-gray-400">
                <Car className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="font-semibold block">3. Driver Assigned</span>
                  <span className="text-[10px] text-gray-400">Sent on WhatsApp</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Summary Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider text-gray-400">
              Trip Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Route */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 sm:col-span-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Travel Route ({booking?.tripType === 'round' ? 'Round Trip' : 'One Way'})
                </span>
                <p className="text-sm font-bold text-brand-navy flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                  <span>{booking?.pickupName} ➔ {booking?.dropName}</span>
                </p>
                <p className="text-xs text-gray-500 pl-6">
                  Pickup: {booking?.pickupAddress}
                </p>
                <p className="text-xs text-gray-500 pl-6">
                  Drop: {booking?.dropAddress}
                </p>
              </div>

              {/* Schedule */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Departure Schedule
                </span>
                <p className="text-sm font-bold text-brand-navy flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-orange shrink-0" />
                  <span>{booking?.pickupDate} at {booking?.pickupTime}</span>
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  Service Type: {booking?.serviceType} transfer
                </p>
              </div>

              {/* Vehicle */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Selected Vehicle
                </span>
                <p className="text-sm font-bold text-brand-navy flex items-center gap-2">
                  <Car className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{booking?.vehicleName}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Clean, AC Chauffeur Driven MPV
                </p>
              </div>

              {/* Passenger */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Passenger Contact
                </span>
                <p className="text-sm font-bold text-brand-navy flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-orange shrink-0" />
                  <span>{booking?.customerName}</span>
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  +91 {booking?.customerPhone}
                </p>
              </div>

              {/* Estimated Tariff */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">
                  Estimated Tariff
                </span>
                <p className="text-lg font-black text-brand-navy">
                  {fareText}
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  No advance payment • Pay chauffeur directly
                </p>
              </div>
            </div>

            {booking?.notes && (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-600">
                <strong className="text-brand-navy">Special Requests:</strong> {booking.notes}
              </div>
            )}
          </div>
        </div>

        {/* ================================================================== */}
        {/* 3. PRIMARY ACTION BUTTONS                                          */}
        {/* ================================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-4 text-center">
          <h3 className="text-base font-bold text-brand-navy">
            Need Immediate Assistance?
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Our dispatch desk is active 24/7. Chat directly on WhatsApp to expedite chauffeur assignment or make last-minute schedule adjustments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {/* Primary: Chat on WhatsApp */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat on WhatsApp</span>
            </a>

            {/* Secondary: Call Dispatch */}
            <a
              href={siteConfig.contact.phone.tel}
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-navy hover:bg-brand-navy-dark text-white font-bold text-sm shadow-md active:scale-95 transition-all"
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

export default function BookingConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-offwhite py-24 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-brand-navy">Loading booking confirmation...</p>
        </div>
      }
    >
      <BookingConfirmedContent />
    </Suspense>
  );
}

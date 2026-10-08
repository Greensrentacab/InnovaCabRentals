'use client';

/**
 * BookingFlowModal.tsx — fare drawer (design.md §3.6 "Overlay" + "Fare drawer
 * internals"): side panel on md+, bottom sheet on mobile, progress segments,
 * trip summary, option cards and a sticky footer action.
 *
 * Booking request flow opened by "Request Booking" on a car in the inline
 * fare results (components/FareResults.tsx).
 * Features (logic unchanged):
 * - Step Tracker (Vehicle -> Details -> Review)
 * - Loading Screen
 * - Vehicle Selection (Firestore cards, nullable price = "Price on request" + "WhatsApp for a Quick Quote", selectable)
 * - Your Details (STRICTLY ONLY Full Name & 10-digit Mobile)
 * - Review with Edit Links for each section
 * - "Send Booking Request" button and Processing Screen
 * - Success Screen with Booking ID (Status: PENDING)
 * - Error Screen with "Try Again" button that keeps all entered data
 */

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Car,
  Check,
  Edit2,
  FileText,
  Luggage,
  MapPin,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useBookingFlow } from '@/context/BookingFlowContext';
import { siteConfig } from '@/lib/siteConfig';
import { cn } from '@/lib/cn';
import { formatTime12 } from '@/lib/time';

const STEP_LABELS = ['Vehicle', 'Your Details', 'Review'];

export default function BookingFlowModal() {
  const {
    state,
    closeBookingFlow,
    setStep,
    selectVehicle,
    updateCustomerDetails,
    submitBooking,
    retrySubmission,
  } = useBookingFlow();

  // Local state for Step 2 validation
  const [name, setName] = useState(state.customerName);
  const [phone, setPhone] = useState(state.customerPhone);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setName(state.customerName);
    setPhone(state.customerPhone);
  }, [state.customerName, state.customerPhone, state.isOpen]);

  // Esc closes; body scroll locked while open
  useEffect(() => {
    if (!state.isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeBookingFlow();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [state.isOpen, closeBookingFlow]);

  if (!state.isOpen) return null;

  // Clean phone validation (Indian 10-digit number starting with 6, 7, 8, 9)
  const validatePhone = (p: string) => {
    const cleaned = p.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleaned);
  };

  const handleContinueToReview = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const cleanedPhone = phone.replace(/\D/g, '');

    if (!trimmedName || trimmedName.length < 2) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!validatePhone(cleanedPhone)) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setFormError('');
    updateCustomerDetails(trimmedName, cleanedPhone);
    setStep('review');
  };

  // Stepper UI helper
  const getStepNumber = () => {
    switch (state.step) {
      case 'vehicle':
        return 1;
      case 'details':
        return 2;
      case 'review':
        return 3;
      default:
        return 0;
    }
  };

  const stepNumber = getStepNumber();
  const selectedFare = state.selectedVehicle ? state.faresMap[state.selectedVehicle.id] ?? null : null;
  const tripLabel =
    state.serviceType === 'outstation'
      ? 'Round Trip'
      : state.serviceType === 'local'
        ? `Local ${state.packageHours ?? ''} hr package`
        : state.tripType === 'round'
          ? 'Airport Round'
          : 'Airport Transfer';
  const routeText = [state.pickupLocation?.name, ...state.stops.map((s) => s.name), state.dropLocation?.name]
    .filter(Boolean)
    .join(' → ');

  return (
    <div className="ds-scope fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="booking-flow-title">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-sm" onClick={closeBookingFlow} />

      <div className="pointer-events-none absolute inset-0 flex items-end md:items-stretch md:justify-end md:p-3">
        <div className="pointer-events-auto flex max-h-[92dvh] w-full animate-drawer-in flex-col overflow-hidden rounded-t-4xl bg-white shadow-float-lg md:max-h-none md:w-[460px] md:rounded-4xl">
          {/* Header */}
          <div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-700">{siteConfig.brand.name}</p>
                <h2 id="booking-flow-title" className="text-lg font-extrabold tracking-tight text-ink">
                  Booking Request
                </h2>
              </div>
              <button
                type="button"
                onClick={closeBookingFlow}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-ink transition hover:bg-slate-200"
                aria-label="Close booking modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {stepNumber > 0 && (
              <div className="mt-4">
                <div className="flex gap-1.5">
                  {STEP_LABELS.map((label, i) => (
                    <div key={label} className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full w-full origin-left bg-brand-600 transition-transform duration-500 ease-premium"
                        style={{ transform: `scaleX(${i < stepNumber ? 1 : 0})` }}
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Step {stepNumber} of 3 · <span className="text-ink">{STEP_LABELS[stepNumber - 1]}</span>
                </p>
              </div>
            )}

            {/* Trip summary */}
            {state.pickupLocation && state.dropLocation && stepNumber > 0 && (
              <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                <p className="flex items-center gap-2 truncate text-sm font-bold text-ink">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-600" />
                  <span className="truncate">
                    {routeText}
                  </span>
                </p>
                <p className="mt-0.5 pl-[22px] text-xs text-slate-500">
                  {state.pickupDate} · {formatTime12(state.pickupTime)}
                  {state.returnDate ? ` → ${state.returnDate}` : ''} · {tripLabel}
                  {state.distanceKm ? ` · ~${state.distanceKm} km` : ''}
                </p>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {/* LOADING */}
            {state.step === 'loading' && (
              <div className="space-y-3 py-6">
                <p className="flex items-center gap-2 text-sm font-bold text-ink">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                  Checking Route &amp; Vehicle Tariffs...
                </p>
                <p className="text-xs text-slate-500">
                  Calculating road distance and fetching availability for {state.pickupLocation?.name} to{' '}
                  {state.dropLocation?.name}.
                </p>
                {[0, 1].map((i) => (
                  <div key={i} className="shimmer h-28 rounded-3xl" />
                ))}
              </div>
            )}

            {/* STEP 1: VEHICLE SELECTION */}
            {state.step === 'vehicle' && (
              <div key="vehicle" className="animate-step-in">
                <h3 className="text-base font-extrabold">Select Your Toyota Innova</h3>
                <p className="text-xs text-slate-500">Clean, sanitized chauffeur-driven MPVs with guaranteed dispatch.</p>

                <div role="radiogroup" aria-label="Vehicle" className="mt-4 space-y-3">
                  {state.availableVehicles.map((v) => {
                    const fare = state.faresMap[v.id] ?? null;
                    const isSelected = state.selectedVehicle?.id === v.id;
                    const quickQuoteUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
                      `Hello ${siteConfig.brand.name}, I would like a Quick Quote for ${v.name} from "${state.pickupLocation?.name}" to "${state.dropLocation?.name}" on ${state.pickupDate} (${state.tripType === 'round' ? 'Round Trip' : 'One Way'}).`
                    )}`;

                    return (
                      <div
                        key={v.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onClick={() => selectVehicle(v)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            selectVehicle(v);
                          }
                        }}
                        className={cn(
                          'relative w-full cursor-pointer rounded-3xl border p-4 text-left transition-all',
                          isSelected
                            ? 'border-brand-500 bg-brand-50/50 ring-4 ring-brand-500/10'
                            : 'border-slate-200/80 hover:border-brand-300'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2',
                            isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white'
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                        </span>

                        <p className="pr-8 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{v.type}</p>
                        <h4 className="text-lg font-extrabold tracking-tight">{v.name}</h4>
                        <div className="mt-2 flex items-center gap-4 text-xs font-medium text-slate-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-brand-600" /> {v.seats} Seats
                          </span>
                          <span className="flex items-center gap-1">
                            <Luggage className="h-3.5 w-3.5 text-brand-600" /> {v.luggage} Luggage Bags
                          </span>
                        </div>
                        <ul className="mt-3 flex flex-wrap gap-1.5">
                          {v.features.map((f) => (
                            <li key={f} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                              {f}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-4 flex flex-wrap items-end justify-between gap-2 border-t border-slate-100 pt-3">
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              Estimated Tariff
                            </span>
                            <span className="text-xl font-extrabold tabular-nums text-ink">
                              {fare !== null ? `₹${fare.toLocaleString('en-IN')}` : 'Price on request'}
                            </span>
                          </div>
                          {fare === null && (
                            <a
                              href={quickQuoteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="btn-whatsapp px-3 py-2 text-xs"
                            >
                              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp for a Quick Quote
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: YOUR DETAILS (ONLY Full Name and 10-digit Mobile) */}
            {state.step === 'details' && (
              <form id="booking-details-form" key="details" onSubmit={handleContinueToReview} className="animate-step-in space-y-4">
                <div>
                  <h3 className="text-base font-extrabold">Your Contact Details</h3>
                  <p className="text-xs text-slate-500">
                    We only need your name and phone number to dispatch driver details via WhatsApp.
                  </p>
                </div>

                {formError && (
                  <p role="alert" className="flex items-center gap-2 rounded-2xl border border-rose-300 bg-rose-50/50 px-4 py-3 text-xs font-medium text-rose-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {formError}
                  </p>
                )}

                <div>
                  <label htmlFor="bf-name" className="label">
                    Full Name *
                  </label>
                  <input
                    id="bf-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="e.g. Suresh Kumar"
                    className={cn('field', formError.includes('name') && 'field-error')}
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="bf-phone" className="label">
                    10-Digit Mobile Number *
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                      +91
                    </span>
                    <input
                      id="bf-phone"
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(val);
                        if (formError) setFormError('');
                      }}
                      placeholder="9876543210"
                      maxLength={10}
                      className={cn('field pl-12 tabular-nums', formError.includes('mobile') && 'field-error')}
                      required
                    />
                  </div>
                  <p className="mt-1.5 pl-1 text-[11px] text-slate-500">
                    Booking confirmation and chauffeur details will be sent to this WhatsApp number.
                  </p>
                </div>
              </form>
            )}

            {/* STEP 3: REVIEW WITH EDIT LINKS */}
            {state.step === 'review' && (
              <div key="review" className="animate-step-in space-y-4">
                <div>
                  <h3 className="text-base font-extrabold">Review Trip Details</h3>
                  <p className="text-xs text-slate-500">Verify your travel schedule before sending your booking request.</p>
                </div>

                <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200/80">
                  <ReviewRow
                    icon={MapPin}
                    label={`Route & Journey (${tripLabel})`}
                    value={routeText}
                    hint={`Pickup: ${state.pickupLocation?.address}`}
                    onEdit={closeBookingFlow}
                  />
                  <ReviewRow
                    icon={Calendar}
                    label="Departure Schedule"
                    value={`${state.pickupDate || 'Date not set'} at ${formatTime12(state.pickupTime) || 'Time not set'}${
                      state.returnDate ? ` · Return ${state.returnDate}` : ''
                    }`}
                    onEdit={closeBookingFlow}
                  />
                  <ReviewRow
                    icon={Car}
                    label="Selected Vehicle"
                    value={`${state.selectedVehicle?.name} (${state.selectedVehicle?.seats} Seater)`}
                    onEdit={() => setStep('vehicle')}
                  />
                  <ReviewRow
                    icon={User}
                    label="Passenger Contact"
                    value={state.customerName}
                    hint={`+91 ${state.customerPhone}`}
                    onEdit={() => setStep('details')}
                  />
                </div>

                <div className="space-y-1.5 rounded-2xl bg-slate-50 p-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Estimated Tariff</span>
                    <span className="font-extrabold text-ink">
                      {selectedFare !== null ? `₹${selectedFare.toLocaleString('en-IN')}` : 'Price on request'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Advance payment</span>
                    <span className="font-bold text-live-600">No Upfront Payment Required</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-brand-800">
                    <ShieldCheck className="h-4 w-4 text-brand-600" /> Request Status: PENDING Confirmation
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-brand-800/80">
                    Submitting will place a booking request. Our dispatch manager will verify car availability and send direct
                    driver assignment via WhatsApp.
                  </p>
                </div>
              </div>
            )}

            {/* PROCESSING */}
            {state.step === 'processing' && (
              <div className="py-14 text-center">
                <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
                <h3 className="mt-5 text-lg font-extrabold">Submitting Your Booking Request...</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                  Logging request for {state.customerName} with our 24/7 Bangalore dispatch desk.
                </p>
              </div>
            )}

            {/* SUCCESS */}
            {state.step === 'success' && (
              <div className="animate-fade-up py-6 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-live-500 text-white shadow-glow-live">
                  <Check className="h-8 w-8" strokeWidth={3} />
                </span>
                <span className="mt-5 inline-flex rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
                  Status: PENDING Admin Confirmation
                </span>
                <h3 className="mt-3 text-2xl font-extrabold tracking-tight">Booking Request Received!</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Booking Reference ID: <strong className="font-mono text-brand-700">{state.confirmedBooking?.bookingId}</strong>
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                  Our dispatch manager has received your travel schedule. We will reach out to you on WhatsApp at{' '}
                  <strong className="text-ink">+91 {state.customerPhone}</strong> to confirm your vehicle.
                </p>

                <div className="mt-6 grid gap-2">
                  {state.confirmedBooking?.bookingId && (
                    <Link
                      href={`/booking/confirmed?id=${state.confirmedBooking.bookingId}`}
                      onClick={closeBookingFlow}
                      className="btn-primary"
                    >
                      <FileText className="h-4 w-4" /> View My Booking
                    </Link>
                  )}
                  {state.adminWhatsAppUrl && (
                    <a href={state.adminWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                      <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                    </a>
                  )}
                  <button type="button" onClick={closeBookingFlow} className="btn-ghost">
                    Close Window
                  </button>
                </div>
              </div>
            )}

            {/* ERROR (Try Again preserves all data) */}
            {state.step === 'error' && (
              <div className="py-8 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <AlertCircle className="h-7 w-7" />
                </span>
                <h3 className="mt-4 text-xl font-extrabold">Booking Request Failed</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs font-medium text-rose-600">
                  {state.errorMessage || 'A network error occurred while submitting your booking request.'}
                </p>
                <p className="mt-2 text-xs font-medium text-live-600">
                  Don&apos;t worry — all your trip details, vehicle selection, and contact info are saved.
                </p>
                <div className="mt-6 grid gap-2">
                  <button type="button" onClick={retrySubmission} className="btn-primary">
                    <RotateCcw className="h-4 w-4" /> Try Again
                  </button>
                  <button type="button" onClick={() => setStep('review')} className="btn-ghost">
                    Review Details
                  </button>
                  <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                    <MessageCircle className="h-4 w-4" /> WhatsApp Us
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sticky footer actions */}
          {stepNumber > 0 && (
            <div className="pb-safe flex shrink-0 items-center gap-2 border-t border-slate-100 bg-white/90 px-5 py-4 backdrop-blur md:pb-4">
              {state.step === 'vehicle' && (
                <>
                  <button type="button" onClick={closeBookingFlow} className="btn-ghost px-4">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    disabled={!state.selectedVehicle}
                    className="btn-primary group flex-1"
                  >
                    Continue to Details
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </>
              )}
              {state.step === 'details' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      updateCustomerDetails(name, phone);
                      closeBookingFlow();
                    }}
                    className="btn-ghost px-4"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to cars
                  </button>
                  <button type="submit" form="booking-details-form" className="btn-primary group flex-1">
                    Continue to Review
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </>
              )}
              {state.step === 'review' && (
                <>
                  <button type="button" onClick={() => setStep('details')} className="btn-ghost px-4">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="button" onClick={submitBooking} className="btn-primary group flex-1 py-3.5 text-[15px]">
                    Send Booking Request
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({
  icon: Icon,
  label,
  value,
  hint,
  onEdit,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 flex items-center gap-2 text-sm font-bold text-ink">
          <Icon className="h-4 w-4 shrink-0 text-brand-600" />
          <span className="truncate">{value}</span>
        </p>
        {hint && <p className="truncate pl-6 text-xs text-slate-500">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-brand-700 transition hover:bg-brand-50"
      >
        <Edit2 className="h-3 w-3" /> Edit
      </button>
    </div>
  );
}

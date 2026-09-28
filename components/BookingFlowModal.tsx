'use client';

/**
 * BookingFlowModal.tsx
 * 
 * Complete booking request flow triggered by "Check Fare".
 * Features:
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
  X,
  Check,
  CheckCircle2,
  ChevronRight,
  Car,
  Users,
  Luggage,
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Edit2,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { useBookingFlow } from '@/context/BookingFlowContext';
import { siteConfig } from '@/lib/siteConfig';

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

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-center items-end md:items-center p-0 md:p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl bg-white md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* ================================================================== */}
        {/* STEP TRACKER HEADER                                                */}
        {/* ================================================================== */}
        <div className="bg-brand-navy text-white px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-orange">
                Innova Cabs Bangalore
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Booking Request
              </h2>
            </div>

            <button
              type="button"
              onClick={closeBookingFlow}
              className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-full text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Close booking modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Step Progress Tracker (Visible on Step 1, 2, 3) */}
          {stepNumber > 0 && (
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              {/* Step 1: Vehicle */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    stepNumber > 1
                      ? 'bg-emerald-500 text-white'
                      : stepNumber === 1
                      ? 'bg-brand-orange text-white'
                      : 'bg-white/20 text-gray-300'
                  }`}
                >
                  {stepNumber > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                </div>
                <span className={stepNumber === 1 ? 'font-bold text-white' : 'text-gray-400'}>
                  Vehicle
                </span>
              </div>

              <div className="flex-1 h-0.5 mx-2 bg-white/10" />

              {/* Step 2: Your Details */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    stepNumber > 2
                      ? 'bg-emerald-500 text-white'
                      : stepNumber === 2
                      ? 'bg-brand-orange text-white'
                      : 'bg-white/20 text-gray-300'
                  }`}
                >
                  {stepNumber > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
                </div>
                <span className={stepNumber === 2 ? 'font-bold text-white' : 'text-gray-400'}>
                  Your Details
                </span>
              </div>

              <div className="flex-1 h-0.5 mx-2 bg-white/10" />

              {/* Step 3: Review */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    stepNumber === 3
                      ? 'bg-brand-orange text-white'
                      : 'bg-white/20 text-gray-300'
                  }`}
                >
                  3
                </div>
                <span className={stepNumber === 3 ? 'font-bold text-white' : 'text-gray-400'}>
                  Review
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================== */}
        {/* MODAL BODY (STEP SWITCHER)                                         */}
        {/* ================================================================== */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-brand-offwhite">
          
          {/* ---------------------------------------------------------------- */}
          {/* STEP 0: LOADING SCREEN                                           */}
          {/* ---------------------------------------------------------------- */}
          {state.step === 'loading' && (
            <div className="py-16 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-brand-orange animate-spin mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-brand-navy">
                  Checking Route &amp; Vehicle Tariffs...
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Calculating road distance and fetching availability for {state.pickupLocation?.name} to {state.dropLocation?.name}.
                </p>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 1: VEHICLE SELECTION                                        */}
          {/* ---------------------------------------------------------------- */}
          {state.step === 'vehicle' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-brand-navy">
                  Select Your Toyota Innova
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Clean, sanitized chauffeur-driven MPVs with guaranteed dispatch.
                </p>
              </div>

              <div className="space-y-4">
                {state.availableVehicles.map((v) => {
                  const fare = state.faresMap[v.id] ?? null;
                  const isSelected = state.selectedVehicle?.id === v.id;
                  const quickQuoteUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
                    `Hello ${siteConfig.brand.name}, I would like a Quick Quote for ${v.name} from "${state.pickupLocation?.name}" to "${state.dropLocation?.name}" on ${state.pickupDate} (${state.tripType === 'round' ? 'Round Trip' : 'One Way'}).`
                  )}`;

                  return (
                    <div
                      key={v.id}
                      onClick={() => selectVehicle(v)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white relative ${
                        isSelected
                          ? 'border-brand-orange ring-2 ring-brand-orange/20 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-bold text-brand-navy">{v.name}</h4>
                            <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {v.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1 font-medium">
                              <Users className="w-3.5 h-3.5 text-brand-orange" />
                              {v.seats} Seats
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <Luggage className="w-3.5 h-3.5 text-emerald-600" />
                              {v.luggage} Luggage Bags
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {v.features.map((f, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-brand-offwhite text-gray-600 px-2 py-0.5 rounded-md"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Price & Action Area */}
                        <div className="sm:text-right pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 space-y-2">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
                              Estimated Tariff
                            </span>
                            <span className="text-xl font-black text-brand-navy">
                              {fare !== null ? `₹${fare}` : 'Price on request'}
                            </span>
                          </div>

                          {/* "WhatsApp for a Quick Quote" button when price is null */}
                          {fare === null && (
                            <a
                              href={quickQuoteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp for a Quick Quote</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Selected Radio Indicator */}
                      <div className="absolute top-4 right-4">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-brand-orange bg-brand-orange text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step 1 Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeBookingFlow}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => setStep('details')}
                  disabled={!state.selectedVehicle}
                  className="min-h-[48px] inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold shadow-md transition-all disabled:opacity-50"
                >
                  <span>Continue to Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 2: YOUR DETAILS (ONLY Full Name and 10-digit Mobile)         */}
          {/* ---------------------------------------------------------------- */}
          {state.step === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-brand-navy">
                  Your Contact Details
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  We only need your name and phone number to dispatch driver details via WhatsApp.
                </p>
              </div>

              <form onSubmit={handleContinueToReview} className="space-y-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="e.g. Suresh Kumar"
                    className="min-h-[48px] w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white"
                    required
                    autoFocus
                  />
                </div>

                {/* 2. 10-Digit Mobile Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    10-Digit Mobile Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(val);
                        if (formError) setFormError('');
                      }}
                      placeholder="9876543210"
                      maxLength={10}
                      className="min-h-[48px] w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white font-medium"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Booking confirmation and chauffeur details will be sent to this WhatsApp number.
                  </p>
                </div>

                {/* Step 2 Actions */}
                <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      updateCustomerDetails(name, phone);
                      setStep('vehicle');
                    }}
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-brand-navy"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Vehicles</span>
                  </button>

                  <button
                    type="submit"
                    className="min-h-[48px] inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold shadow-md transition-all"
                  >
                    <span>Continue to Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 3: REVIEW WITH EDIT LINKS                                   */}
          {/* ---------------------------------------------------------------- */}
          {state.step === 'review' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-brand-navy">
                  Review Trip Details
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verify your travel schedule before sending your booking request.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
                {/* 1. Route Section with Edit link */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">
                      Route &amp; Journey ({state.tripType === 'round' ? 'Round Trip' : 'One Way'})
                    </span>
                    <p className="text-sm font-bold text-brand-navy flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                      <span>{state.pickupLocation?.name} ➔ {state.dropLocation?.name}</span>
                    </p>
                    <p className="text-xs text-gray-500 pl-6">
                      Pickup: {state.pickupLocation?.address}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeBookingFlow}
                    className="text-xs font-bold text-brand-orange hover:underline inline-flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* 2. Schedule Section with Edit link */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">
                      Departure Schedule
                    </span>
                    <p className="text-sm font-bold text-brand-navy flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-orange shrink-0" />
                      <span>{state.pickupDate || 'Date not set'} at {state.pickupTime || 'Time not set'}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeBookingFlow}
                    className="text-xs font-bold text-brand-orange hover:underline inline-flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* 3. Vehicle Section with Edit link */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">
                      Selected Vehicle
                    </span>
                    <p className="text-sm font-bold text-brand-navy flex items-center gap-2">
                      <Car className="w-4 h-4 text-brand-orange shrink-0" />
                      <span>{state.selectedVehicle?.name} ({state.selectedVehicle?.seats} Seater)</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('vehicle')}
                    className="text-xs font-bold text-brand-orange hover:underline inline-flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* 4. Passenger Details Section with Edit link */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">
                      Passenger Contact
                    </span>
                    <p className="text-sm font-bold text-brand-navy">
                      {state.customerName}
                    </p>
                    <p className="text-xs text-gray-500">
                      +91 {state.customerPhone}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="text-xs font-bold text-brand-orange hover:underline inline-flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* 5. Tariff Total */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 block">
                      Estimated Tariff
                    </span>
                    <span className="text-xl font-black text-brand-navy">
                      {state.selectedVehicle && state.faresMap[state.selectedVehicle.id] !== null
                        ? `₹${state.faresMap[state.selectedVehicle.id]}`
                        : 'Price on request'}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    No Upfront Payment Required
                  </span>
                </div>
              </div>

              {/* Status Notice */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Request Status: PENDING Confirmation</span>
                </p>
                <p className="text-[11px] text-blue-700">
                  Submitting will place a booking request. Our dispatch manager will verify car availability and send direct driver assignment via WhatsApp.
                </p>
              </div>

              {/* Step 3 Actions */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-brand-navy"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={submitBooking}
                  className="min-h-[50px] inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-base font-bold shadow-lg shadow-brand-orange/25 transition-all"
                >
                  <span>Send Booking Request</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 4: PROCESSING SCREEN                                        */}
          {/* ---------------------------------------------------------------- */}
          {state.step === 'processing' && (
            <div className="py-16 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-brand-orange animate-spin mx-auto" />
              <div>
                <h3 className="text-xl font-bold text-brand-navy">
                  Submitting Your Booking Request...
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Logging request for {state.customerName} with our 24/7 Bangalore dispatch desk.
                </p>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 5: SUCCESS SCREEN                                           */}
          {/* ---------------------------------------------------------------- */}
          {state.step === 'success' && (
            <div className="py-8 px-2 text-center space-y-5 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Status: PENDING Admin Confirmation
                </span>
                <h3 className="text-2xl font-black text-brand-navy pt-2">
                  Booking Request Received!
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  Booking Reference ID: <strong className="text-brand-navy font-mono">{state.confirmedBooking?.bookingId}</strong>
                </p>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Our dispatch manager has received your travel schedule. We will reach out to you on WhatsApp at <strong className="text-brand-navy">+91 {state.customerPhone}</strong> to confirm your vehicle.
                </p>
              </div>

              {/* Action Buttons: WhatsApp & View My Booking */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                {state.confirmedBooking?.bookingId && (
                  <Link
                    href={`/booking/confirmed?id=${state.confirmedBooking.bookingId}`}
                    onClick={closeBookingFlow}
                    className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm shadow-md transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View My Booking</span>
                  </Link>
                )}

                {state.adminWhatsAppUrl && (
                  <a
                    href={state.adminWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Chat on WhatsApp</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={closeBookingFlow}
                  className="min-h-[48px] w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 6: ERROR SCREEN (WITH TRY AGAIN PRESERVING ALL DATA)        */}
          {/* ---------------------------------------------------------------- */}
          {state.step === 'error' && (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-brand-navy">
                  Booking Request Failed
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {state.errorMessage || 'A network error occurred while submitting your booking request.'}
                </p>
                <p className="text-xs text-emerald-700 font-medium">
                  Don&apos;t worry — all your trip details, vehicle selection, and contact info are saved.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                {/* Try Again Button (Keeps all entered data!) */}
                <button
                  type="button"
                  onClick={retrySubmission}
                  className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm shadow-md transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="min-h-[48px] w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
                >
                  Review Details
                </button>

                <a
                  href={siteConfig.contact.phone.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Us</span>
                </a>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

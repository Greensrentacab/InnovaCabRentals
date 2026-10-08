'use client';

/**
 * BookingFlowContext.tsx
 *
 * Sourced from PROJECT_CONTEXT.md.
 * Two stages:
 *  1. Fare search — "See Fares & Available Innovas" calls /api/fare and the
 *     results (cars, prices, T&Cs, WhatsApp) render inline under the booking
 *     widget (components/FareResults.tsx).
 *  2. Booking request — "Request Booking" on a car opens the modal flow:
 *     Your Details (ONLY Full Name and 10-digit Mobile) → Review →
 *     Processing → Success / Error (Try Again keeps all entered data).
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { LocationData } from '@/lib/googlePlaces';
import { Vehicle, ServiceType, TripType, Booking } from '@/lib/types';
import { formatTime12 } from '@/lib/time';

export type BookingStep = 'loading' | 'vehicle' | 'details' | 'review' | 'processing' | 'success' | 'error';

export interface FareResult {
  vehicleId: string;
  vehicleName: string;
  vehicleType?: string;
  seats?: number;
  luggage?: number;
  features?: string[];
  fare: number | null;
  breakdown: string[];
  terms: string[];
}

export interface TripParams {
  serviceType: ServiceType;
  tripType: TripType;
  pickup: LocationData;
  drop: LocationData;
  stops?: LocationData[];
  date: string;
  time: string;
  returnDate?: string | null;
  packageHours?: number | null;
  packageLabel?: string | null;
  routeSlug?: string;
}

export interface FareSearchState {
  status: 'idle' | 'loading' | 'done' | 'error';
  trip: TripParams | null;
  results: FareResult[];
  distanceKm: number | null;
  totalKm: number | null;
  days: number;
  error: string | null;
  /** Increments per search so the results panel can scroll into view */
  searchId: number;
}

export interface BookingFlowState {
  isOpen: boolean;
  step: BookingStep;
  serviceType: ServiceType;
  tripType: TripType;
  pickupLocation: LocationData | null;
  dropLocation: LocationData | null;
  stops: LocationData[];
  pickupDate: string;
  pickupTime: string;
  returnDate: string | null;
  packageHours: number | null;
  distanceKm: number | null;
  routeSlug?: string;

  // Vehicles & Pricing
  availableVehicles: Vehicle[];
  faresMap: { [vehicleId: string]: number | null };
  selectedVehicle: Vehicle | null;

  // Customer Details (ONLY Full Name and 10-digit Mobile)
  customerName: string;
  customerPhone: string;

  // Outcome
  confirmedBooking: Booking | null;
  adminWhatsAppUrl: string | null;
  errorMessage: string | null;
}

interface BookingFlowContextType {
  state: BookingFlowState;
  search: FareSearchState;
  searchFares: (params: TripParams) => Promise<void>;
  clearSearch: () => void;
  requestBooking: (vehicleId: string) => void;
  closeBookingFlow: () => void;
  setStep: (step: BookingStep) => void;
  selectVehicle: (vehicle: Vehicle) => void;
  updateCustomerDetails: (name: string, phone: string) => void;
  submitBooking: () => Promise<void>;
  retrySubmission: () => Promise<void>;
}

const defaultState: BookingFlowState = {
  isOpen: false,
  step: 'details',
  serviceType: 'outstation',
  tripType: 'round',
  pickupLocation: null,
  dropLocation: null,
  stops: [],
  pickupDate: '',
  pickupTime: '',
  returnDate: null,
  packageHours: null,
  distanceKm: null,
  routeSlug: undefined,
  availableVehicles: [],
  faresMap: {},
  selectedVehicle: null,
  customerName: '',
  customerPhone: '',
  confirmedBooking: null,
  adminWhatsAppUrl: null,
  errorMessage: null,
};

const defaultSearch: FareSearchState = {
  status: 'idle',
  trip: null,
  results: [],
  distanceKm: null,
  totalKm: null,
  days: 1,
  error: null,
  searchId: 0,
};

const toVehicle = (r: FareResult): Vehicle => ({
  id: r.vehicleId,
  name: r.vehicleName,
  type: r.vehicleType || 'Chauffeur-driven MPV',
  seats: r.seats || 7,
  luggage: r.luggage || 3,
  features: r.features || [],
  confirmed: true,
  baseFare: r.fare,
});

const BookingFlowContext = createContext<BookingFlowContextType | undefined>(undefined);

export function BookingFlowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingFlowState>(defaultState);
  const [search, setSearch] = useState<FareSearchState>(defaultSearch);

  // Triggered by "See Fares & Available Innovas" in the booking widget
  const searchFares = useCallback(async (params: TripParams) => {
    setSearch((prev) => ({ ...defaultSearch, status: 'loading', trip: params, searchId: prev.searchId + 1 }));

    try {
      const response = await fetch('/api/fare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: params.serviceType,
          tripType: params.tripType,
          pickupLat: params.pickup.lat,
          pickupLng: params.pickup.lng,
          dropLat: params.drop.lat,
          dropLng: params.drop.lng,
          stops: (params.stops ?? []).map((s) => ({ lat: s.lat, lng: s.lng })),
          pickupDate: params.date,
          returnDate: params.returnDate,
          packageHours: params.packageHours,
          routeSlug: params.routeSlug,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not fetch fares');

      setSearch((prev) => ({
        ...prev,
        status: 'done',
        results: data.results || [],
        distanceKm: data.distanceKm ?? null,
        totalKm: data.totalKm ?? null,
        days: data.days ?? 1,
      }));
    } catch (err) {
      console.error('[BookingFlow] Fare search failed:', err);
      setSearch((prev) => ({
        ...prev,
        status: 'error',
        error: 'We could not load fares right now. Please try again or WhatsApp us for a quick quote.',
      }));
    }
  }, []);

  const clearSearch = useCallback(() => setSearch((prev) => ({ ...defaultSearch, searchId: prev.searchId })), []);

  // "Request Booking" on a result card → modal at the details step
  const requestBooking = useCallback(
    (vehicleId: string) => {
      const trip = search.trip;
      if (!trip) return;
      const vehicles = search.results.map(toVehicle);
      const selected = vehicles.find((v) => v.id === vehicleId) || null;

      setState((prev) => ({
        ...prev,
        isOpen: true,
        step: 'details',
        serviceType: trip.serviceType,
        tripType: trip.tripType,
        pickupLocation: trip.pickup,
        dropLocation: trip.drop,
        stops: trip.stops ?? [],
        pickupDate: trip.date,
        pickupTime: trip.time,
        returnDate: trip.returnDate ?? null,
        packageHours: trip.packageHours ?? null,
        routeSlug: trip.routeSlug,
        distanceKm: search.distanceKm,
        availableVehicles: vehicles,
        faresMap: Object.fromEntries(search.results.map((r) => [r.vehicleId, r.fare])),
        selectedVehicle: selected,
        confirmedBooking: null,
        adminWhatsAppUrl: null,
        errorMessage: null,
      }));
    },
    [search]
  );

  const closeBookingFlow = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const setStep = useCallback((step: BookingStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const selectVehicle = useCallback((vehicle: Vehicle) => {
    setState((prev) => ({ ...prev, selectedVehicle: vehicle }));
  }, []);

  const updateCustomerDetails = useCallback((name: string, phone: string) => {
    setState((prev) => ({ ...prev, customerName: name, customerPhone: phone }));
  }, []);

  // Executes POST /api/bookings to create the booking request
  const executeBookingSubmission = useCallback(async () => {
    setState((prev) => ({ ...prev, step: 'processing', errorMessage: null }));

    try {
      if (!state.pickupLocation || !state.dropLocation || !state.selectedVehicle) {
        throw new Error('Incomplete booking information. Please review your trip details.');
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.customerName,
          phone: state.customerPhone,
          pickupName: state.pickupLocation.name,
          pickupAddress: state.pickupLocation.address,
          pickupLat: state.pickupLocation.lat,
          pickupLng: state.pickupLocation.lng,
          dropName: state.dropLocation.name,
          dropAddress: state.dropLocation.address,
          dropLat: state.dropLocation.lat,
          dropLng: state.dropLocation.lng,
          stops: state.stops.map((s) => ({ name: s.name, address: s.address, lat: s.lat, lng: s.lng })),
          tripType: state.tripType,
          serviceType: state.serviceType,
          pickupDate: state.pickupDate,
          pickupTime: state.pickupTime,
          returnDate: state.returnDate,
          packageHours: state.packageHours,
          vehicleId: state.selectedVehicle.id,
          vehicleName: state.selectedVehicle.name,
          routeSlug: state.routeSlug,
          distanceKm: state.distanceKm,
        }),
      });

      const result = await res.json();

      if (result.success && result.booking) {
        const bk = result.booking;
        const cleanPhone = bk.customerPhone.replace(/\D/g, '');
        const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        const whatsAppUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
          `Hello ${bk.customerName},\n\nThis is Innova Cabs Bangalore. We have received your booking request #${bk.bookingId}:\n• Route: ${bk.pickupName} ➔ ${bk.dropName}\n• Date & Time: ${bk.pickupDate} at ${formatTime12(bk.pickupTime)}\n• Vehicle: ${bk.vehicleName}\n\nOur operations desk will confirm your vehicle shortly!`
        )}`;

        setState((prev) => ({ ...prev, step: 'success', confirmedBooking: bk, adminWhatsAppUrl: whatsAppUrl }));
      } else {
        setState((prev) => ({
          ...prev,
          step: 'error',
          errorMessage: result.error || 'Unable to place booking request. Please check connection.',
        }));
      }
    } catch (error: any) {
      console.error('[BookingFlow] Submission failed:', error);
      setState((prev) => ({
        ...prev,
        step: 'error',
        errorMessage: error.message || 'Network error occurred while reserving vehicle.',
      }));
    }
  }, [state]);

  const submitBooking = useCallback(async () => {
    await executeBookingSubmission();
  }, [executeBookingSubmission]);

  const retrySubmission = useCallback(async () => {
    await executeBookingSubmission();
  }, [executeBookingSubmission]);

  return (
    <BookingFlowContext.Provider
      value={{
        state,
        search,
        searchFares,
        clearSearch,
        requestBooking,
        closeBookingFlow,
        setStep,
        selectVehicle,
        updateCustomerDetails,
        submitBooking,
        retrySubmission,
      }}
    >
      {children}
    </BookingFlowContext.Provider>
  );
}

export function useBookingFlow() {
  const context = useContext(BookingFlowContext);
  if (!context) {
    throw new Error('useBookingFlow must be used within a BookingFlowProvider');
  }
  return context;
}

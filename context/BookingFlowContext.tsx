'use client';

/**
 * BookingFlowContext.tsx
 * 
 * Sourced from PROJECT_CONTEXT.md.
 * Manages the entire booking request flow state across:
 * - Loading Screen
 * - Vehicle Selection (Firestore cards with nullable pricing rules)
 * - Your Details (ONLY Full Name and 10-digit Mobile)
 * - Review with Edit Links
 * - Processing Screen
 * - Success Screen
 * - Error Screen with Try Again (keeps all entered data)
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { LocationData } from '@/lib/googlePlaces';
import { Vehicle, ServiceType, TripType, Booking } from '@/lib/types';
import { createBookingRequest } from '@/app/actions/booking';

export type BookingStep =
  | 'loading'
  | 'vehicle'
  | 'details'
  | 'review'
  | 'processing'
  | 'success'
  | 'error';

export interface BookingFlowState {
  isOpen: boolean;
  step: BookingStep;
  serviceType: ServiceType;
  tripType: TripType;
  pickupLocation: LocationData | null;
  dropLocation: LocationData | null;
  pickupDate: string;
  pickupTime: string;
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
  openBookingFlow: (params: {
    serviceType?: ServiceType;
    tripType: TripType;
    pickup: LocationData;
    drop: LocationData;
    date: string;
    time: string;
    routeSlug?: string;
  }) => Promise<void>;
  closeBookingFlow: () => void;
  setStep: (step: BookingStep) => void;
  selectVehicle: (vehicle: Vehicle) => void;
  updateCustomerDetails: (name: string, phone: string) => void;
  submitBooking: () => Promise<void>;
  retrySubmission: () => Promise<void>;
}

const defaultState: BookingFlowState = {
  isOpen: false,
  step: 'loading',
  serviceType: 'outstation',
  tripType: 'oneway',
  pickupLocation: null,
  dropLocation: null,
  pickupDate: '',
  pickupTime: '',
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

const BookingFlowContext = createContext<BookingFlowContextType | undefined>(undefined);

export function BookingFlowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingFlowState>(defaultState);

  // Triggered when user clicks "Check Fare" in BookingWidget
  const openBookingFlow = useCallback(
    async (params: {
      serviceType?: ServiceType;
      tripType: TripType;
      pickup: LocationData;
      drop: LocationData;
      date: string;
      time: string;
      routeSlug?: string;
    }) => {
      // Open modal in loading state immediately
      setState((prev) => ({
        ...prev,
        isOpen: true,
        step: 'loading',
        serviceType: params.serviceType || 'outstation',
        tripType: params.tripType,
        pickupLocation: params.pickup,
        dropLocation: params.drop,
        pickupDate: params.date,
        pickupTime: params.time,
        routeSlug: params.routeSlug,
        errorMessage: null,
      }));

      try {
        // Fetch server-calculated fares and vehicles
        const response = await fetch('/api/fare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceType: params.serviceType || 'outstation',
            tripType: params.tripType,
            pickupLat: params.pickup.lat,
            pickupLng: params.pickup.lng,
            dropLat: params.drop.lat,
            dropLng: params.drop.lng,
            routeSlug: params.routeSlug,
          }),
        });

        const data = await response.json();

        // Dynamically fetch confirmed vehicles from server calculation results
        const vehiclesFromApi: Vehicle[] = (data.results || []).map((r: any) => ({
          id: r.vehicleId,
          name: r.vehicleName,
          type: r.vehicleType || (r.vehicleName.includes('Crysta') ? 'Luxury Executive 7/8 Seater MPV' : 'Standard 7/8 Seater MPV'),
          seats: r.seats || 7,
          luggage: r.luggage || (r.vehicleName.includes('Crysta') ? 4 : 3),
          features: r.features || (r.vehicleName.includes('Crysta')
            ? ['Climate Control AC', 'Captain Seat Recliners', 'Superior Legroom & Noise Insulation', 'High-Speed Highway Stability']
            : ['Dual Air Conditioning', 'Comfortable 7/8 Seater Layout', 'Audio & AUX Support', 'Experienced Chauffeur']),
          confirmed: true,
          baseFare: data.fares?.[r.vehicleId] ?? null,
        }));

        setState((prev) => ({
          ...prev,
          step: 'vehicle',
          distanceKm: data.distanceKm || null,
          faresMap: data.fares || {},
          availableVehicles: vehiclesFromApi,
          // Pre-select first vehicle if none selected
          selectedVehicle: prev.selectedVehicle || vehiclesFromApi[0] || null,
        }));
      } catch (err) {
        console.error('[BookingFlow] Error initializing fare calculations:', err);
        // Fallback default vehicles in case of network glitch
        setState((prev) => ({
          ...prev,
          step: 'vehicle',
          availableVehicles: [
            {
              id: 'innova',
              name: 'Toyota Innova',
              type: 'Standard 7/8 Seater MPV',
              seats: 7,
              luggage: 3,
              features: ['Comfortable 7/8 Seater', 'Dual AC Vents', 'Experienced Chauffeur'],
              confirmed: true,
              baseFare: null,
            },
            {
              id: 'innova-crysta',
              name: 'Toyota Innova Crysta',
              type: 'Executive Luxury MPV',
              seats: 7,
              luggage: 4,
              features: ['Captain Seat Recliners', 'Dual Climate AC', 'Smooth Highway Ride'],
              confirmed: true,
              baseFare: null,
            },
          ],
        }));
      }
    },
    []
  );

  const closeBookingFlow = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const setStep = useCallback((step: BookingStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const selectVehicle = useCallback((vehicle: Vehicle) => {
    setState((prev) => ({ ...prev, selectedVehicle: vehicle }));
  }, []);

  const updateCustomerDetails = useCallback((name: string, phone: string) => {
    setState((prev) => ({
      ...prev,
      customerName: name,
      customerPhone: phone,
    }));
  }, []);

  // Executes Server Action to create booking
  const executeBookingSubmission = useCallback(async () => {
    setState((prev) => ({ ...prev, step: 'processing', errorMessage: null }));

    try {
      if (!state.pickupLocation || !state.dropLocation || !state.selectedVehicle) {
        throw new Error('Incomplete booking information. Please review your trip details.');
      }

      const result = await createBookingRequest({
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        pickupName: state.pickupLocation.name,
        pickupAddress: state.pickupLocation.address,
        pickupLat: state.pickupLocation.lat,
        pickupLng: state.pickupLocation.lng,
        dropName: state.dropLocation.name,
        dropAddress: state.dropLocation.address,
        dropLat: state.dropLocation.lat,
        dropLng: state.dropLocation.lng,
        tripType: state.tripType,
        serviceType: state.serviceType,
        pickupDate: state.pickupDate,
        pickupTime: state.pickupTime,
        vehicleId: state.selectedVehicle.id,
        vehicleName: state.selectedVehicle.name,
        routeSlug: state.routeSlug,
        distanceKm: state.distanceKm,
      });

      if (result.success && result.booking) {
        setState((prev) => ({
          ...prev,
          step: 'success',
          confirmedBooking: result.booking || null,
          adminWhatsAppUrl: result.adminWhatsAppUrl || null,
        }));
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
        openBookingFlow,
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

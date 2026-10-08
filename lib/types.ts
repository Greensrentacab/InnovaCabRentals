/**
 * Core Type Definitions for Innova Cabs Bangalore
 * Sourced from PROJECT_CONTEXT.md and business requirements.
 */

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DRIVER_ASSIGNED'
  | 'TRIP_STARTED'
  | 'COMPLETED'
  | 'CANCELLED';

export type TripType = 'oneway' | 'round';

export type ServiceType = 'airport' | 'local' | 'outstation' | 'tour';

/**
 * Admin-editable per-car tariff. Every value is nullable: null means
 * "Price on request" (never invent prices). Tolls, parking and state permits
 * are always paid by the customer and are never part of these rates.
 */
export interface VehicleRates {
  /** Outstation round-trip rate per km */
  outstationPerKm: number | null;
  /** Minimum billable km per calendar day of an outstation trip */
  outstationMinKmPerDay: number;
  /** Driver allowance (bata) per outstation day */
  driverAllowancePerDay: number | null;
  /** Airport transfer fixed fare, each way */
  airportFare: number | null;
  /** Local packages (8 hr / 80 km and 12 hr / 120 km; other durations on request) */
  local8h: number | null;
  local12h: number | null;
  /** Local package overage */
  extraKmRate: number | null;
  extraHourRate: number | null;
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  seats: number;
  luggage: number;
  features: string[];
  confirmed: boolean; // Hycross is unconfirmed/false
  imageUrl?: string;
  baseFare?: number | null;
  rates?: VehicleRates;
}

export type RouteCategory = 'hills' | 'temples' | 'heritage' | 'coast' | 'airport';

export interface RouteVehicleFare {
  [vehicleId: string]: number | null;
}

export interface Route {
  id: string;
  name: string;
  slug: string;
  origin: string;
  destination: string;
  distanceKm: number;
  durationText: string;
  fares: RouteVehicleFare; // legacy per-vehicle fixed fares (outstation pricing now comes from VehicleRates)
  description?: string;
  category?: RouteCategory;
}

export interface Booking {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  pickupName: string;
  pickupAddress: string;
  pickupLat: number | null;
  pickupLng: number | null;
  dropName: string;
  dropAddress: string;
  dropLat: number | null;
  dropLng: number | null;
  tripType: TripType;
  serviceType: ServiceType;
  pickupDate: string;
  pickupTime: string;
  /** Outstation return date (round trips) */
  returnDate?: string | null;
  /** Intermediate stops on an outstation route (max 3) */
  stops?: string[];
  /** Local package duration in hours */
  packageHours?: number | null;
  vehicleId: string;
  vehicleName: string;
  fare: number | null; // Nullable; never invent prices
  bookingStatus: BookingStatus;
  driverId: string | null;
  driverName: string | null;
  driverPhone: string | null;
  vehicleRegistration: string | null;
  notes: string | null;
  createdAt: string | Date;
}

export interface Driver {
  driverId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  vehicleRegistration: string;
  vehicleModel: string;
  status: 'available' | 'on_trip' | 'off_duty';
  rating?: number;
  createdAt?: string | Date;
}

export interface Pricing {
  id: string;
  serviceType: ServiceType;
  vehicleId: string;
  basePrice: number | null; // Nullable per client rules
  minimumFare?: number | null;
  perKmPrice: number | null;
  driverAllowance: number | null;
  nightAllowance: number | null;
  minimumKm?: number | null;
  notes?: string;
}

export interface LocalPackage {
  id: string;
  name: string;
  durationHours: number;
  distanceKm: number;
  description: string;
  fares: { [vehicleId: string]: number | null }; // Nullable per rules
}

export interface Enquiry {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  destination: string;
  travelDate: string;
  duration?: string;
  passengers: number;
  vehicleModel?: string;
  notes?: string;
  status: 'PENDING' | 'CONTACTED' | 'CONVERTED' | 'CANCELLED';
  createdAt: string;
}


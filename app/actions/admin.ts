'use server';

/**
 * admin.ts
 * 
 * Server actions powering the Innova Cab Rentals Admin Console.
 * Handles:
 * - Admin Authentication
 * - Dispatch & Bookings Lifecycle (PENDING -> CONFIRMED -> DRIVER_ASSIGNED -> etc.)
 * - Chauffeur Assignment with WhatsApp dispatch notifications
 * - Pricing & Route Tariffs updates (nullable per client policy)
 * - Vehicle fleet confirmation toggles
 * - Tour & Contact Enquiries tracking
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  Booking,
  BookingStatus,
  Route,
  Vehicle,
  VehicleRates,
  Enquiry,
} from '@/lib/types';
import {
  fetchAllBookings,
  updateBookingInStore,
  fetchAllEnquiries,
  updateEnquiryStatusInStore,
  fetchAdminRoutes,
  updateRouteFaresInStore,
  fetchAdminVehicles,
  toggleVehicleInStore,
  updateVehicleRatesInStore,
} from '@/lib/adminStore';
import { siteConfig } from '@/lib/siteConfig';
import { formatTime12 } from '@/lib/time';

const ADMIN_COOKIE_NAME = 'innova_admin_session';
const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7; // 7 days
const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Admin password: ADMIN_PASSWORD is REQUIRED in production. The dev-only
 * fallback exists so local development works without configuration.
 */
function adminPassword(): string | null {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return IS_PROD ? null : 'innova2026';
}

/** Secret used to sign the session cookie (falls back to the admin password). */
function sessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || adminPassword();
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function sign(issuedAt: string, secret: string): string {
  return createHmac('sha256', secret).update(`admin-session:${issuedAt}`).digest('hex');
}

/** Throws if the caller is not a signed-in admin (server actions are public endpoints). */
async function requireAdmin(): Promise<void> {
  if (!(await verifyAdminSession())) {
    throw new Error('Your admin session has expired. Please sign in again.');
  }
}

/** True when bookings/prices are saved to Firestore (not just server memory). */
const isPersistent = () => Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY);

export interface AdminDashboardData {
  bookings: Booking[];
  enquiries: Enquiry[];
  routes: Route[];
  vehicles: Vehicle[];
  /** false = no Firestore configured; changes live only in server memory */
  persistent: boolean;
  stats: {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    activeTrips: number;
    completedTrips: number;
    totalEnquiries: number;
    pendingEnquiries: number;
  };
}

/**
 * Check if the admin is authenticated via cookie
 */
export async function verifyAdminSession(): Promise<boolean> {
  const secret = sessionSecret();
  if (!secret) return false;
  const value = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!value) return false;
  const [issuedAt, signature] = value.split('.');
  if (!issuedAt || !signature) return false;
  const age = Date.now() / 1000 - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > SESSION_MAX_AGE_S) return false;
  return safeEqual(signature, sign(issuedAt, secret));
}

/**
 * Admin Login Action
 */
export async function adminLogin(password: string): Promise<{ success: boolean; error?: string }> {
  const expected = adminPassword();
  const secret = sessionSecret();
  if (!expected || !secret) {
    return { success: false, error: 'Admin login is not configured. Set ADMIN_PASSWORD on the server.' };
  }
  if (typeof password !== 'string' || !safeEqual(password, expected)) {
    return { success: false, error: 'Invalid admin credentials. Please try again.' };
  }

  const issuedAt = Math.floor(Date.now() / 1000).toString();
  cookies().set(ADMIN_COOKIE_NAME, `${issuedAt}.${sign(issuedAt, secret)}`, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_S,
  });
  return { success: true };
}

/**
 * Admin Logout Action
 */
export async function adminLogout(): Promise<void> {
  cookies().delete(ADMIN_COOKIE_NAME);
}

/**
 * Fetches all administrative dashboard data
 */
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  await requireAdmin();
  const [bookings, enquiries, routes, vehicles] = await Promise.all([
    fetchAllBookings(),
    fetchAllEnquiries(),
    fetchAdminRoutes(),
    fetchAdminVehicles(),
  ]);

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.bookingStatus === 'PENDING').length,
    confirmedBookings: bookings.filter((b) => b.bookingStatus === 'CONFIRMED').length,
    activeTrips: bookings.filter((b) => b.bookingStatus === 'DRIVER_ASSIGNED' || b.bookingStatus === 'TRIP_STARTED').length,
    completedTrips: bookings.filter((b) => b.bookingStatus === 'COMPLETED').length,
    totalEnquiries: enquiries.length,
    pendingEnquiries: enquiries.filter((e) => e.status === 'PENDING').length,
  };

  return {
    bookings,
    enquiries,
    routes,
    vehicles,
    persistent: isPersistent(),
    stats,
  };
}

/**
 * Update Booking Status (e.g. PENDING -> CONFIRMED -> COMPLETED)
 */
export async function updateBookingStatus(
  bookingId: string,
  bookingStatus: BookingStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    await updateBookingInStore(bookingId, { bookingStatus });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update booking status' };
  }
}

/**
 * Assign Chauffeur / Driver details to a booking
 */
export async function assignDriverToBooking(
  bookingId: string,
  driverData: {
    driverName: string;
    driverPhone: string;
    vehicleRegistration: string;
  }
): Promise<{ success: boolean; driverWhatsAppUrl?: string; error?: string }> {
  try {
    await requireAdmin();
    const updated = await updateBookingInStore(bookingId, {
      driverId: `DRV-${Date.now().toString(36).toUpperCase()}`,
      driverName: driverData.driverName.trim(),
      driverPhone: driverData.driverPhone.trim(),
      vehicleRegistration: driverData.vehicleRegistration.trim().toUpperCase(),
      bookingStatus: 'DRIVER_ASSIGNED',
    });

    if (!updated) {
      return { success: false, error: 'Booking not found' };
    }

    // Generate Chauffeur Assignment WhatsApp Message to Passenger
    const cleanCustomerPhone = updated.customerPhone.replace(/\D/g, '');
    const customerWaNumber = cleanCustomerPhone.length === 10 ? `91${cleanCustomerPhone}` : cleanCustomerPhone;

    const message = encodeURIComponent(
      `Hello ${updated.customerName},\n\nYour Chauffeur has been assigned for Innova Booking #${updated.bookingId}:\n• Vehicle: ${updated.vehicleName} (${updated.vehicleRegistration})\n• Chauffeur Name: ${updated.driverName}\n• Chauffeur Mobile: ${updated.driverPhone}\n• Pickup Date & Time: ${updated.pickupDate} at ${formatTime12(updated.pickupTime)}\n• Route: ${updated.pickupName} ➔ ${updated.dropName}\n\nOur chauffeur will report 15 minutes before the pickup time. Have a pleasant journey with ${siteConfig.brand.name}!`
    );

    const driverWhatsAppUrl = `https://wa.me/${customerWaNumber}?text=${message}`;

    return {
      success: true,
      driverWhatsAppUrl,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to assign driver' };
  }
}

/**
 * Update Route Fixed Fares
 */
export async function updateRouteFares(
  routeSlug: string,
  fares: { [vehicleId: string]: number | null }
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    await updateRouteFaresInStore(routeSlug, fares);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update route fares' };
  }
}

/**
 * Toggle Vehicle Active/Confirmed Status
 */
export async function toggleVehicleActive(
  vehicleId: string,
  confirmed: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    await toggleVehicleInStore(vehicleId, confirmed);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to toggle vehicle status' };
  }
}

/**
 * Update Enquiry Status
 */
export async function updateEnquiryStatus(
  enquiryId: string,
  status: Enquiry['status']
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    await updateEnquiryStatusInStore(enquiryId, status);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update enquiry status' };
  }
}

const RATE_KEYS: (keyof VehicleRates)[] = [
  'outstationPerKm',
  'outstationMinKmPerDay',
  'driverAllowancePerDay',
  'airportFare',
  'local8h',
  'local12h',
  'extraKmRate',
  'extraHourRate',
];

/**
 * Update a car's tariff (Admin → Pricing). Every storefront page reads these
 * rates, so the whole site is revalidated after a change.
 */
export async function updateVehicleRates(
  vehicleId: string,
  rates: VehicleRates
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const clean = {} as VehicleRates;
    for (const key of RATE_KEYS) {
      const raw = rates[key];
      const num = raw === null || raw === undefined || (raw as unknown) === '' ? null : Number(raw);
      if (num !== null && (!Number.isFinite(num) || num < 0)) {
        return { success: false, error: `Invalid value for ${key}` };
      }
      (clean as unknown as Record<string, number | null>)[key] = num;
    }
    clean.outstationMinKmPerDay = clean.outstationMinKmPerDay && clean.outstationMinKmPerDay > 0 ? clean.outstationMinKmPerDay : 300;

    await updateVehicleRatesInStore(vehicleId, clean);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update car prices' };
  }
}

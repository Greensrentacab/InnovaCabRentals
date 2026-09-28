'use server';

/**
 * admin.ts
 * 
 * Server actions powering the Innova Cabs Bangalore Admin Console.
 * Handles:
 * - Admin Authentication
 * - Dispatch & Bookings Lifecycle (PENDING -> CONFIRMED -> DRIVER_ASSIGNED -> etc.)
 * - Chauffeur Assignment with WhatsApp dispatch notifications
 * - Pricing & Route Tariffs updates (nullable per client policy)
 * - Vehicle fleet confirmation toggles
 * - Tour & Contact Enquiries tracking
 */

import { cookies } from 'next/headers';
import {
  Booking,
  BookingStatus,
  Route,
  Vehicle,
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
} from '@/lib/adminStore';
import { siteConfig } from '@/lib/siteConfig';

const ADMIN_COOKIE_NAME = 'innova_admin_session';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'innova2026';

export interface AdminDashboardData {
  bookings: Booking[];
  enquiries: Enquiry[];
  routes: Route[];
  vehicles: Vehicle[];
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
  const cookieStore = cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME);
  return session?.value === 'authenticated';
}

/**
 * Admin Login Action
 */
export async function adminLogin(password: string): Promise<{ success: boolean; error?: string }> {
  // Support default dev password or environment variable
  if (password === ADMIN_PASSWORD || password === 'admin' || password === 'innova2026') {
    cookies().set(ADMIN_COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return { success: true };
  }
  return { success: false, error: 'Invalid admin credentials. Please try again.' };
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
      `Hello ${updated.customerName},\n\nYour Chauffeur has been assigned for Innova Booking #${updated.bookingId}:\n• Vehicle: ${updated.vehicleName} (${updated.vehicleRegistration})\n• Chauffeur Name: ${updated.driverName}\n• Chauffeur Mobile: ${updated.driverPhone}\n• Pickup Date & Time: ${updated.pickupDate} at ${updated.pickupTime}\n• Route: ${updated.pickupName} ➔ ${updated.dropName}\n\nOur chauffeur will report 15 minutes before the pickup time. Have a pleasant journey with ${siteConfig.brand.name}!`
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
    await toggleVehicleInStore(vehicleId, confirmed);
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
    await updateEnquiryStatusInStore(enquiryId, status);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update enquiry status' };
  }
}

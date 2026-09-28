'use server';

/**
 * Server-Side Booking Creation Action
 * 
 * CORE SECURITY & BUSINESS RULES:
 * 1. Never trusts browser-sent fares. Always recalculates fare on the server using calculateServerFare.
 * 2. Creates a booking with status 'PENDING'.
 * 3. No customer login. No payment gateway. Admin confirms via wa.me link or call.
 */

import { Booking, BookingStatus, ServiceType, TripType } from '@/lib/types';
import { calculateServerFare } from '@/lib/fareCalculator';
import { siteConfig } from '@/lib/siteConfig';

export interface CreateBookingInput {
  customerName: string;
  customerPhone: string;
  pickupName: string;
  pickupAddress: string;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropName: string;
  dropAddress: string;
  dropLat?: number | null;
  dropLng?: number | null;
  tripType: TripType;
  serviceType: ServiceType;
  pickupDate: string;
  pickupTime: string;
  vehicleId: string;
  vehicleName: string;
  routeSlug?: string;
  distanceKm?: number | null;
  notes?: string | null;
}

export interface CreateBookingResponse {
  success: boolean;
  bookingId?: string;
  booking?: Booking;
  adminWhatsAppUrl?: string;
  error?: string;
}

export async function createBookingRequest(
  input: CreateBookingInput
): Promise<CreateBookingResponse> {
  try {
    // 1. SECURITY: Always recalculate fare on the server. Never trust browser-sent fares!
    const fareCalculation = await calculateServerFare({
      serviceType: input.serviceType,
      tripType: input.tripType,
      routeSlug: input.routeSlug,
      distanceKm: input.distanceKm,
      pickupLat: input.pickupLat,
      pickupLng: input.pickupLng,
      dropLat: input.dropLat,
      dropLng: input.dropLng,
      vehicleId: input.vehicleId,
    });

    const calculatedFare = fareCalculation.fares[input.vehicleId] ?? null;

    // 2. Build official Booking object (Status: PENDING)
    const bookingId = `BK-${Date.now().toString(36).toUpperCase()}`;

    const booking: Booking = {
      bookingId,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      pickupName: input.pickupName,
      pickupAddress: input.pickupAddress,
      pickupLat: input.pickupLat ?? null,
      pickupLng: input.pickupLng ?? null,
      dropName: input.dropName,
      dropAddress: input.dropAddress,
      dropLat: input.dropLat ?? null,
      dropLng: input.dropLng ?? null,
      tripType: input.tripType,
      serviceType: input.serviceType,
      pickupDate: input.pickupDate,
      pickupTime: input.pickupTime,
      vehicleId: input.vehicleId,
      vehicleName: input.vehicleName,
      fare: calculatedFare, // Server-calculated fare only
      bookingStatus: 'PENDING',
      driverId: null,
      driverName: null,
      driverPhone: null,
      vehicleRegistration: null,
      notes: input.notes ?? null,
      createdAt: new Date().toISOString(),
    };

    // 3. Save to Firestore 'bookings' collection via Admin SDK
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { adminDb } = await import('@/lib/firebaseAdmin');
      await adminDb.collection('bookings').doc(bookingId).set(booking);
    } else {
      console.log('[BOOKING CREATED - DEV MODE]:', booking);
    }

    // 4. Generate admin WhatsApp confirmation link (Admin clicks wa.me to confirm with customer)
    const fareText = calculatedFare !== null ? `₹${calculatedFare}` : 'Price on request';
    const adminMessage = encodeURIComponent(
      `Hello ${booking.customerName},\n\nThis is ${siteConfig.brand.name}. We have received your booking request #${bookingId}:\n• Route: ${booking.pickupName} ➔ ${booking.dropName}\n• Service: ${booking.serviceType.toUpperCase()} (${booking.tripType === 'round' ? 'Round Trip' : 'One Way'})\n• Date & Time: ${booking.pickupDate} at ${booking.pickupTime}\n• Vehicle: ${booking.vehicleName}\n• Tariff: ${fareText}\n\nWe are pleased to confirm your vehicle. Please let us know if your schedule is finalized!`
    );

    // Format customer phone for international WhatsApp link
    const cleanCustomerPhone = booking.customerPhone.replace(/\D/g, '');
    const customerWaNumber = cleanCustomerPhone.length === 10 ? `91${cleanCustomerPhone}` : cleanCustomerPhone;
    const adminWhatsAppUrl = `https://wa.me/${customerWaNumber}?text=${adminMessage}`;

    return {
      success: true,
      bookingId,
      booking,
      adminWhatsAppUrl,
    };
  } catch (error: any) {
    console.error('[createBookingRequest] Error creating booking:', error);
    return {
      success: false,
      error: error.message || 'Failed to create booking request',
    };
  }
}

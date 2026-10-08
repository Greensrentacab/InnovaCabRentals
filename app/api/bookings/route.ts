import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateServerFare } from '@/lib/fareCalculator';
import { checkRateLimit } from '@/lib/rateLimit';
import { addBooking, generateUniqueBookingId, getBookingById } from '@/lib/adminStore';
import { sendNewBookingEmail } from '@/lib/emailService';
import { Booking, ServiceType, TripType } from '@/lib/types';
import { siteConfig } from '@/lib/siteConfig';

export const dynamic = 'force-dynamic';

// Helper to check if a date string YYYY-MM-DD is in the past
function isPastDate(dateStr: string): boolean {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dateStr.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);

    return targetDate < today;
  } catch {
    return false;
  }
}

// Zod Validation Schema
const createBookingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters long'),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
  pickupDate: z
    .string()
    .refine((date) => !isPastDate(date), {
      message: 'Pickup date cannot be in the past',
    }),
  pickupTime: z.string().min(1, 'Pickup time is required'),
  pickupName: z.string().min(1, 'Pickup location is required'),
  pickupAddress: z.string().optional().default(''),
  pickupLat: z.number().nullable().optional(),
  pickupLng: z.number().nullable().optional(),
  dropName: z.string().min(1, 'Drop location is required'),
  dropAddress: z.string().optional().default(''),
  dropLat: z.number().nullable().optional(),
  dropLng: z.number().nullable().optional(),
  tripType: z.enum(['oneway', 'round']),
  serviceType: z
    .enum(['airport', 'local', 'outstation', 'tour'])
    .default('outstation'),
  vehicleId: z.string().min(1, 'Vehicle selection is required'),
  vehicleName: z.string().min(1, 'Vehicle name is required'),
  routeSlug: z.string().optional(),
  distanceKm: z.number().nullable().optional(),
  returnDate: z.string().nullable().optional(),
  stops: z
    .array(
      z.object({
        name: z.string().min(1),
        address: z.string().optional().default(''),
        lat: z.number().nullable().optional(),
        lng: z.number().nullable().optional(),
      })
    )
    .max(3)
    .optional()
    .default([]),
  packageHours: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});

/**
 * POST /api/bookings
 * 
 * 1. Rate-limit by IP: 5 per 10 minutes
 * 2. Validate input with zod (name, 10-digit Indian mobile, no past dates)
 * 3. Recalculate fare server-side (never trust client fare)
 * 4. Generate unique ID like ICB-10482 with collision check
 * 5. Save with status PENDING in Firestore & admin store
 * 6. Email "New Booking Request" to greensrentacab@gmail.com via Resend
 * 7. Return the unique bookingId & booking object
 */
export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting (5 requests per 10 minutes)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const rateLimit = checkRateLimit(ip, 5, 600000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Too many booking requests from your IP. Please wait a few minutes or contact us directly on WhatsApp or Call.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString(),
          },
        }
      );
    }

    // 2. Parse & Validate with Zod
    const body = await req.json();
    const validationResult = createBookingSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      return NextResponse.json(
        {
          success: false,
          error: errorMessages,
          issues: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // 3. Recalculate fare on server (Never trust client prices)
    const fareCalc = await calculateServerFare({
      serviceType: data.serviceType as ServiceType,
      tripType: data.tripType as TripType,
      routeSlug: data.routeSlug,
      distanceKm: data.distanceKm,
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,
      dropLat: data.dropLat,
      dropLng: data.dropLng,
      stops: data.stops,
      pickupDate: data.pickupDate,
      returnDate: data.returnDate,
      packageHours: data.packageHours,
      vehicleId: data.vehicleId,
    });

    const serverFare = fareCalc.fares[data.vehicleId] ?? null;

    // 4. Generate unique ID like ICB-10482 with collision check
    const bookingId = await generateUniqueBookingId();

    // 5. Construct official Booking entity
    const booking: Booking = {
      bookingId,
      customerName: data.name,
      customerPhone: data.phone,
      pickupName: data.pickupName,
      pickupAddress: data.pickupAddress || data.pickupName,
      pickupLat: data.pickupLat ?? null,
      pickupLng: data.pickupLng ?? null,
      dropName: data.dropName,
      dropAddress: data.dropAddress || data.dropName,
      dropLat: data.dropLat ?? null,
      dropLng: data.dropLng ?? null,
      // Outstation is round trip only
      tripType: (data.serviceType === 'outstation' ? 'round' : data.tripType) as TripType,
      serviceType: data.serviceType as ServiceType,
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime,
      returnDate: data.serviceType === 'outstation' ? data.returnDate ?? null : null,
      stops: data.stops.map((s) => (s.address && s.address !== s.name ? `${s.name}, ${s.address}` : s.name)),
      packageHours: data.serviceType === 'local' ? data.packageHours ?? null : null,
      vehicleId: data.vehicleId,
      vehicleName: data.vehicleName,
      fare: serverFare,
      bookingStatus: 'PENDING',
      driverId: null,
      driverName: null,
      driverPhone: null,
      vehicleRegistration: null,
      notes: data.notes ?? null,
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore and memory store
    await addBooking(booking);

    // 6. Email "New Booking Request" to greensrentacab@gmail.com via Resend
    try {
      await sendNewBookingEmail(booking);
    } catch (emailErr) {
      console.warn('[POST /api/bookings] Email notification failed to dispatch:', emailErr);
    }

    // 7. Return the generated ID and booking object
    return NextResponse.json(
      {
        success: true,
        bookingId,
        booking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/bookings] Error processing booking request:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error while processing booking request.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings?id=... (convenience retrieval for confirmation page)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing booking ID parameter' }, { status: 400 });
  }

  const booking = await getBookingById(id);
  if (!booking) {
    return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, booking });
}

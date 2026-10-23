import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateServerFare } from '@/lib/fareCalculator';
import { checkSharedRateLimit } from '@/lib/rateLimit';
import { addBooking, generateUniqueBookingId, getBookingById, getUserProfile } from '@/lib/adminStore';
import { sendCustomerBookingEmail, sendNewBookingEmail } from '@/lib/emailService';
import { newBookingAlert, sendAdminAlert } from '@/lib/adminPush';
import { getRequestUser } from '@/lib/authServer';
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
    .min(2, 'Name must be at least 2 characters long')
    .max(80, 'Name is too long'),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
  pickupDate: z
    .string()
    .refine((date) => !isPastDate(date), {
      message: 'Pickup date cannot be in the past',
    }),
  pickupTime: z.string().min(1, 'Pickup time is required').max(10),
  pickupName: z.string().min(1, 'Pickup location is required').max(200),
  pickupAddress: z.string().max(400).optional().default(''),
  pickupLat: z.number().nullable().optional(),
  pickupLng: z.number().nullable().optional(),
  dropName: z.string().min(1, 'Drop location is required').max(200),
  dropAddress: z.string().max(400).optional().default(''),
  dropLat: z.number().nullable().optional(),
  dropLng: z.number().nullable().optional(),
  tripType: z.enum(['oneway', 'round']),
  serviceType: z
    .enum(['airport', 'local', 'outstation', 'tour'])
    .default('outstation'),
  vehicleId: z.string().min(1, 'Vehicle selection is required').max(60),
  vehicleName: z.string().min(1, 'Vehicle name is required').max(80),
  routeSlug: z.string().max(120).optional(),
  distanceKm: z.number().nullable().optional(),
  returnDate: z.string().nullable().optional(),
  stops: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        address: z.string().max(400).optional().default(''),
        lat: z.number().nullable().optional(),
        lng: z.number().nullable().optional(),
      })
    )
    .max(3)
    .optional()
    .default([]),
  packageHours: z.number().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

/**
 * POST /api/bookings
 * 
 * 1. Rate-limit by IP: 5 per 10 minutes
 * 2. Require a signed-in customer (Firebase ID token in Authorization header);
 *    userId & customerEmail come from the verified token, never the body
 * 3. Validate input with zod (passenger name, 10-digit Indian mobile, no past dates)
 * 4. Recalculate fare server-side (never trust client fare)
 * 5. Generate unique ID like ICB-10482 with collision check
 * 6. Save with status PENDING in Firestore & admin store
 * 7. Email "New Booking Request" to the admin desk and a receipt to the customer via Resend,
 *    and push a "New booking" alert to the admin's devices (lib/adminPush.ts)
 * 8. Return the unique bookingId & booking object
 */
export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting (5 requests per 10 minutes)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const rateLimit = await checkSharedRateLimit(`booking:${ip}`, 5, 600000);

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

    // 2. Signed-in customers only (Step 4 "Sign in & Confirm")
    const user = await getRequestUser(req);
    if (!user || !user.email) {
      return NextResponse.json(
        {
          success: false,
          code: 'AUTH_REQUIRED',
          error: 'Your sign-in session has expired. Please sign in again to submit your booking request.',
        },
        { status: 401 }
      );
    }

    // 3. Parse & Validate with Zod
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

    // 4. Recalculate fare on server (Never trust client prices)
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
    const serverBreakdown = fareCalc.results.find((r) => r.vehicleId === data.vehicleId)?.breakdown ?? [];

    // 5. Generate unique ID like ICB-10482 with collision check
    const bookingId = await generateUniqueBookingId();

    const profile = await getUserProfile(user.uid).catch(() => null);

    // 6. Construct official Booking entity
    const booking: Booking = {
      bookingId,
      customerName: data.name,
      customerPhone: data.phone,
      userId: user.uid,
      customerEmail: user.email,
      accountName: profile?.displayName || user.displayName || null,
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
      fareBreakdown: serverFare !== null ? serverBreakdown : [],
      distanceKm: fareCalc.distanceKm,
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

    // 7. Email the admin desk and the customer's receipt via Resend, and push an
    // alert to the admin's devices (none of these ever block the booking)
    const [adminEmail, customerEmail] = await Promise.allSettled([
      sendNewBookingEmail(booking),
      booking.customerEmail ? sendCustomerBookingEmail(booking) : Promise.resolve(null),
      sendAdminAlert(newBookingAlert(booking)),
    ]);
    if (adminEmail.status === 'rejected') {
      console.warn('[POST /api/bookings] Admin email failed to dispatch:', adminEmail.reason);
    }
    if (customerEmail.status === 'rejected') {
      console.warn('[POST /api/bookings] Customer email failed to dispatch:', customerEmail.reason);
    }

    // 8. Return the generated ID and booking object
    return NextResponse.json(
      {
        success: true,
        bookingId,
        booking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Includes Firestore write failures: never report a booking that wasn't saved
    console.error('[POST /api/bookings] Error processing booking request:', error);
    return NextResponse.json(
      {
        success: false,
        error: `We could not save your booking right now. Please call or WhatsApp us on ${siteConfig.contact.phone.display}.`,
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

  // Booking IDs are short, so slow down anyone trying to guess them
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  if (!(await checkSharedRateLimit(`lookup:${ip}`, 30, 600000)).allowed) {
    return NextResponse.json({ success: false, error: 'Too many lookups. Please try again in a few minutes.' }, { status: 429 });
  }

  const booking = await getBookingById(id);
  if (!booking) {
    return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
  }

  // Public, ID-only lookup: no account identity, exact coordinates or notes,
  // and the mobile number is masked (only the last 4 digits)
  const {
    userId: _userId,
    customerEmail: _email,
    accountName: _accountName,
    notes: _notes,
    pickupLat: _pickupLat,
    pickupLng: _pickupLng,
    dropLat: _dropLat,
    dropLng: _dropLng,
    driverPhone: _driverPhone,
    ...publicBooking
  } = booking;
  return NextResponse.json({
    success: true,
    booking: {
      ...publicBooking,
      customerPhone: booking.customerPhone ? `******${booking.customerPhone.slice(-4)}` : '',
      notes: null,
    },
  });
}

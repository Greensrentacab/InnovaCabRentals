import { NextRequest, NextResponse } from 'next/server';
import { getBookingById } from '@/lib/adminStore';

export const dynamic = 'force-dynamic';

/**
 * GET /api/bookings/[bookingId]
 * 
 * Returns only the fields the public tracking page needs.
 * No admin data, no customer phone exposed beyond masked format.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  const bookingId = params.bookingId;

  if (!bookingId || bookingId.length < 3) {
    return NextResponse.json(
      { success: false, error: 'Invalid booking ID format' },
      { status: 400 }
    );
  }

  const booking = await getBookingById(bookingId);

  if (!booking) {
    return NextResponse.json(
      { success: false, error: 'Booking not found' },
      { status: 404 }
    );
  }

  // Mask customer phone: show only last 4 digits
  const maskedPhone = booking.customerPhone
    ? `******${booking.customerPhone.slice(-4)}`
    : null;

  // Return only the fields the tracking page needs
  const publicBooking = {
    bookingId: booking.bookingId,
    customerName: booking.customerName,
    customerPhoneMasked: maskedPhone,
    pickupName: booking.pickupName,
    pickupAddress: booking.pickupAddress,
    dropName: booking.dropName,
    dropAddress: booking.dropAddress,
    tripType: booking.tripType,
    serviceType: booking.serviceType,
    pickupDate: booking.pickupDate,
    pickupTime: booking.pickupTime,
    vehicleName: booking.vehicleName,
    fare: booking.fare,
    bookingStatus: booking.bookingStatus,
    // Driver details only when assigned
    ...(booking.bookingStatus !== 'PENDING' &&
      booking.bookingStatus !== 'CONFIRMED' && {
        driverName: booking.driverName,
        driverPhone: booking.driverPhone,
        vehicleRegistration: booking.vehicleRegistration,
      }),
    createdAt: booking.createdAt,
  };

  return NextResponse.json({ success: true, booking: publicBooking });
}

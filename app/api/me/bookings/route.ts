import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/authServer';
import { fetchBookingsByUser } from '@/lib/adminStore';

export const dynamic = 'force-dynamic';

/**
 * GET /api/me/bookings — every booking placed by the signed-in customer
 * (profile → My Bookings), newest first.
 */
export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Please sign in to view your bookings.' }, { status: 401 });
  }

  try {
    // Only the price; distance and fare working stay with the admin desk
    const bookings = (await fetchBookingsByUser(user.uid)).map(
      ({ fareBreakdown: _fareBreakdown, distanceKm: _distanceKm, ...b }) => ({ ...b, fareBreakdown: [], distanceKm: null })
    );
    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('[GET /api/me/bookings] Failed:', error);
    return NextResponse.json({ success: false, error: 'Could not load your bookings right now.' }, { status: 500 });
  }
}

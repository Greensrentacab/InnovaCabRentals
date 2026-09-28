import { NextRequest, NextResponse } from 'next/server';
import { calculateServerFare, FareCalculationInput } from '@/lib/fareCalculator';
import { ServiceType, TripType } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/fare
 * 
 * Returns fare estimates for each vehicle.
 * Implements:
 * 1. Fixed route fare if present.
 * 2. Per-km dynamic calculation with 1.3 road factor: max(minimumFare, distance * perKmRate)
 *    and 2x distance + driver allowance for round trips.
 * 3. Null return ("Price on request") if pricing not configured.
 * 4. Never trusts browser-calculated fares.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const serviceType: ServiceType =
      body.serviceType === 'airport' ||
      body.serviceType === 'local' ||
      body.serviceType === 'outstation' ||
      body.serviceType === 'tour'
        ? body.serviceType
        : 'outstation';

    const tripType: TripType = body.tripType === 'round' ? 'round' : 'oneway';

    const input: FareCalculationInput = {
      serviceType,
      tripType,
      routeSlug: body.routeSlug || undefined,
      distanceKm: body.distanceKm ? Number(body.distanceKm) : undefined,
      pickupLat: body.pickupLat != null ? Number(body.pickupLat) : undefined,
      pickupLng: body.pickupLng != null ? Number(body.pickupLng) : undefined,
      dropLat: body.dropLat != null ? Number(body.dropLat) : undefined,
      dropLng: body.dropLng != null ? Number(body.dropLng) : undefined,
      vehicleId: body.vehicleId || undefined,
    };

    const result = await calculateServerFare(input);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('[API /api/fare] Calculation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate fare',
        fares: {
          innova: null,
          'innova-crysta': null,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fare (convenience query support)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const serviceType = (searchParams.get('serviceType') as ServiceType) || 'outstation';
  const tripType = (searchParams.get('tripType') as TripType) || 'oneway';
  const routeSlug = searchParams.get('routeSlug') || undefined;
  const distanceKm = searchParams.get('distanceKm') ? Number(searchParams.get('distanceKm')) : undefined;

  const pickupLat = searchParams.get('pickupLat') ? Number(searchParams.get('pickupLat')) : undefined;
  const pickupLng = searchParams.get('pickupLng') ? Number(searchParams.get('pickupLng')) : undefined;
  const dropLat = searchParams.get('dropLat') ? Number(searchParams.get('dropLat')) : undefined;
  const dropLng = searchParams.get('dropLng') ? Number(searchParams.get('dropLng')) : undefined;
  const vehicleId = searchParams.get('vehicleId') || undefined;

  const result = await calculateServerFare({
    serviceType,
    tripType,
    routeSlug,
    distanceKm,
    pickupLat,
    pickupLng,
    dropLat,
    dropLng,
    vehicleId,
  });

  return NextResponse.json(result, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

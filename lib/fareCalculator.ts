/**
 * Server-Side Fare Calculator
 * 
 * Sourced from PROJECT_CONTEXT.md.
 * 
 * CORE RULES:
 * 1. If route has a fixed fare, use it.
 * 2. Else if a per-km rate exists in the Firestore 'pricing' doc:
 *    - Use max(minimumFare, roadDistance * perKmRate) with a 1.3 road factor.
 *    - For round trips: 2x distance plus driver allowance.
 * 3. If no pricing is configured (or values are null):
 *    - Return null so the UI shows "Price on request".
 *    - Never invent prices!
 * 4. Always recalculate on the server when a booking is created and never trust a browser-sent fare.
 */

import { ServiceType, TripType, Vehicle, Route, Pricing } from '@/lib/types';
import { getRoutes, getVehicles } from '@/lib/dataService';

export interface FareCalculationInput {
  serviceType: ServiceType;
  tripType: TripType;
  routeSlug?: string;
  distanceKm?: number | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropLat?: number | null;
  dropLng?: number | null;
  vehicleId?: string; // Optional: single vehicle or all
}

export interface VehicleFareResult {
  vehicleId: string;
  vehicleName: string;
  vehicleType?: string;
  seats?: number;
  luggage?: number;
  features?: string[];
  fare: number | null; // null = "Price on request"
  isFixed: boolean;
  breakdown?: {
    distanceKm: number;
    effectiveDistanceKm: number;
    perKmRate: number | null;
    minimumFare: number | null;
    driverAllowance: number | null;
    tripType: TripType;
  };
}

export interface FareCalculationResponse {
  success: boolean;
  distanceKm: number | null;
  tripType: TripType;
  serviceType: ServiceType;
  route?: {
    name: string;
    slug: string;
  } | null;
  fares: {
    [vehicleId: string]: number | null;
  };
  results: VehicleFareResult[];
  notice: string;
}

/**
 * Calculates straight-line distance in kilometres between two coordinates
 */
export function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Fetches pricing document from Firestore 'pricing' collection
 */
async function getPricingFromFirestore(
  serviceType: ServiceType,
  vehicleId: string
): Promise<Pricing | null> {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { adminDb } = await import('@/lib/firebaseAdmin');
      const docId = `${serviceType}_${vehicleId}`;
      const doc = await adminDb.collection('pricing').doc(docId).get();
      if (doc.exists) {
        return doc.data() as Pricing;
      }
    }
  } catch (err) {
    console.warn('[fareCalculator] Could not read pricing document from Firestore:', err);
  }
  return null;
}

/**
 * Master Server-Side Calculation Function
 * Must be used both by /api/fare and server-side booking creation.
 */
export async function calculateServerFare(
  input: FareCalculationInput
): Promise<FareCalculationResponse> {
  const allRoutes = await getRoutes();
  const allVehicles = await getVehicles();

  // Filter out unconfirmed vehicles per client rule
  const confirmedVehicles = allVehicles.filter((v) => v.confirmed !== false);

  // 1. Resolve Route & Distance
  let matchedRoute: Route | null = null;
  let resolvedDistanceKm: number | null = null;

  if (input.routeSlug) {
    matchedRoute = allRoutes.find((r) => r.slug === input.routeSlug) || null;
    if (matchedRoute) {
      resolvedDistanceKm = matchedRoute.distanceKm;
    }
  }

  // If no route distance, use provided distance or calculate from coordinates
  if (resolvedDistanceKm === null || resolvedDistanceKm <= 0) {
    if (input.distanceKm && input.distanceKm > 0) {
      resolvedDistanceKm = input.distanceKm;
    } else if (
      input.pickupLat != null &&
      input.pickupLng != null &&
      input.dropLat != null &&
      input.dropLng != null
    ) {
      const straightLineKm = calculateHaversineKm(
        input.pickupLat,
        input.pickupLng,
        input.dropLat,
        input.dropLng
      );
      // 1.3 ROAD FACTOR APPLIED
      resolvedDistanceKm = Math.round(straightLineKm * 1.3);
    }
  }

  const results: VehicleFareResult[] = [];
  const faresMap: { [vehicleId: string]: number | null } = {};

  const vehiclesToCalculate = input.vehicleId
    ? confirmedVehicles.filter((v) => v.id === input.vehicleId)
    : confirmedVehicles;

  for (const vehicle of vehiclesToCalculate) {
    let finalFare: number | null = null;
    let isFixed = false;
    let breakdown: VehicleFareResult['breakdown'] = undefined;

    // RULE 1: If route has a fixed fare, use it
    if (
      matchedRoute &&
      matchedRoute.fares &&
      matchedRoute.fares[vehicle.id] !== null &&
      matchedRoute.fares[vehicle.id] !== undefined
    ) {
      const baseFixed = matchedRoute.fares[vehicle.id]!;
      isFixed = true;
      if (input.tripType === 'round') {
        finalFare = Math.round(baseFixed * 1.9); // Round trip package pricing if fixed
      } else {
        finalFare = baseFixed;
      }
    } else {
      // RULE 2: Check if per-km rate exists in Firestore 'pricing' doc
      const pricing = await getPricingFromFirestore(input.serviceType, vehicle.id);

      if (
        pricing &&
        pricing.perKmPrice !== null &&
        pricing.perKmPrice !== undefined &&
        resolvedDistanceKm !== null &&
        resolvedDistanceKm > 0
      ) {
        const perKmRate = pricing.perKmPrice;
        const roadDistance = resolvedDistanceKm;
        
        // For round trips: 2x distance plus driver allowance
        const effectiveDistanceKm = input.tripType === 'round' ? roadDistance * 2 : roadDistance;
        const rawDistanceFare = effectiveDistanceKm * perKmRate;
        const minFare = pricing.minimumFare ?? pricing.basePrice ?? 0;
        const baseComputedFare = Math.max(minFare, rawDistanceFare);

        const allowance = input.tripType === 'round' ? (pricing.driverAllowance ?? 0) : 0;
        finalFare = Math.round(baseComputedFare + allowance);

        breakdown = {
          distanceKm: roadDistance,
          effectiveDistanceKm,
          perKmRate,
          minimumFare: minFare,
          driverAllowance: allowance,
          tripType: input.tripType,
        };
      } else {
        // RULE 3: If no pricing is configured, return null (shows "Price on request")
        finalFare = null;
      }
    }

    results.push({
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehicleType: vehicle.type,
      seats: vehicle.seats,
      luggage: vehicle.luggage,
      features: vehicle.features,
      fare: finalFare,
      isFixed,
      breakdown,
    });

    faresMap[vehicle.id] = finalFare;
  }

  return {
    success: true,
    distanceKm: resolvedDistanceKm,
    tripType: input.tripType,
    serviceType: input.serviceType,
    route: matchedRoute
      ? {
          name: matchedRoute.name,
          slug: matchedRoute.slug,
        }
      : null,
    fares: faresMap,
    results,
    notice: 'Fares recalculated on server. Null fares indicate Price on request per client policy.',
  };
}

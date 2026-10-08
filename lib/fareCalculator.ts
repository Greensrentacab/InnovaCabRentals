/**
 * Server-Side Fare Calculator
 *
 * Prices come from each car's admin-editable tariff (Vehicle.rates):
 *  - Outstation (round trip only): billable km = max(actual round-trip km,
 *    min km/day × trip days) × per-km rate + driver allowance × days.
 *    Actual km = pickup → stops → destination → pickup (route distance or
 *    straight-line × 1.3 road factor).
 *  - Airport: fixed fare each way (Round = 2 legs).
 *  - Local: 8 / 12 hour package price; custom durations on request.
 * Any missing rate → fare null ("Price on request"). Never invent prices.
 * Tolls, parking and state permits are always paid by the customer.
 * Always recalculated on the server — never trust a browser-sent fare.
 */

import { ServiceType, TripType, Vehicle, Route, VehicleRates } from '@/lib/types';
import { getRoutes, getVehicles } from '@/lib/dataService';

export interface FarePoint {
  lat?: number | null;
  lng?: number | null;
}

export interface FareCalculationInput {
  serviceType: ServiceType;
  tripType: TripType;
  routeSlug?: string;
  distanceKm?: number | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropLat?: number | null;
  dropLng?: number | null;
  stops?: FarePoint[];
  pickupDate?: string | null;
  returnDate?: string | null;
  packageHours?: number | null;
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
  /** Human-readable fare lines, e.g. "600 km × ₹16/km" */
  breakdown: string[];
  /** Car- and service-specific terms & conditions */
  terms: string[];
}

export interface FareCalculationResponse {
  success: boolean;
  distanceKm: number | null;
  /** Round-trip / billable km for outstation */
  totalKm: number | null;
  days: number;
  tripType: TripType;
  serviceType: ServiceType;
  route?: { name: string; slug: string } | null;
  fares: { [vehicleId: string]: number | null };
  results: VehicleFareResult[];
  notice: string;
}

const ROAD_FACTOR = 1.3;
const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0;

/**
 * Calculates straight-line distance in kilometres between two coordinates
 */
export function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const hasCoords = (p: FarePoint) => p.lat != null && p.lng != null;
const roadKm = (a: FarePoint, b: FarePoint) => calculateHaversineKm(a.lat!, a.lng!, b.lat!, b.lng!) * ROAD_FACTOR;

/** Calendar days covered by a trip (inclusive), minimum 1. */
export function tripDays(pickupDate?: string | null, returnDate?: string | null): number {
  if (!pickupDate || !returnDate) return 1;
  const [y1, m1, d1] = pickupDate.split('-').map(Number);
  const [y2, m2, d2] = returnDate.split('-').map(Number);
  const diff = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
  return Number.isFinite(diff) && diff >= 0 ? diff + 1 : 1;
}

const COMMON_TERMS = [
  'Tolls, parking, state permits and entry taxes are paid by the customer.',
  'Fare is an estimate; final fare is confirmed by our dispatch team before the trip.',
  'No advance payment. Pay after the trip.',
  'Free cancellation or rescheduling up to 4 hours before pickup.',
];

function outstationQuote(rates: VehicleRates, totalKm: number | null, days: number) {
  const minKm = rates.outstationMinKmPerDay * days;
  const terms = [
    `Round trip only. Minimum ${rates.outstationMinKmPerDay} km billed per day (${minKm} km for ${days} day${days > 1 ? 's' : ''}).`,
    isNum(rates.outstationPerKm)
      ? `Extra km beyond the estimate billed at ${inr(rates.outstationPerKm)}/km.`
      : 'Per-km rate shared on request.',
    isNum(rates.driverAllowancePerDay)
      ? `Driver allowance ${inr(rates.driverAllowancePerDay)}/day included.`
      : 'Driver allowance per day extra, shared on confirmation.',
    'Night driving allowance applies between 10:00 PM and 6:00 AM.',
    ...COMMON_TERMS,
  ];

  if (!isNum(rates.outstationPerKm)) return { fare: null, breakdown: [], terms };

  const billableKm = Math.max(totalKm ?? 0, minKm);
  const kmFare = billableKm * rates.outstationPerKm;
  const allowance = isNum(rates.driverAllowancePerDay) ? rates.driverAllowancePerDay * days : 0;
  const breakdown = [
    `${Math.round(billableKm)} km × ${inr(rates.outstationPerKm)}/km = ${inr(kmFare)}`,
    ...(allowance ? [`Driver allowance ${days} day${days > 1 ? 's' : ''} × ${inr(rates.driverAllowancePerDay!)} = ${inr(allowance)}`] : []),
  ];
  return { fare: Math.round(kmFare + allowance), breakdown, terms };
}

function airportQuote(rates: VehicleRates, legs: number) {
  const terms = [
    legs > 1 ? 'Fixed fare per leg; round trip = 2 legs.' : 'Fixed airport fare, one way.',
    'Airport parking and toll charges are paid by the customer.',
    ...COMMON_TERMS.slice(1),
  ];
  if (!isNum(rates.airportFare)) return { fare: null, breakdown: [], terms };
  return {
    fare: Math.round(rates.airportFare * legs),
    breakdown: [`${legs} leg${legs > 1 ? 's' : ''} × ${inr(rates.airportFare)}`],
    terms,
  };
}

function localQuote(rates: VehicleRates, hours: number) {
  // Only 8 hr / 80 km and 12 hr / 120 km packages have list prices;
  // any other duration (custom) is quoted on request.
  const pkg = hours === 8 ? rates.local8h : hours === 12 ? rates.local12h : null;
  const isCustom = hours !== 8 && hours !== 12;
  const km = hours * 10;
  const terms = [
    isCustom
      ? 'Custom duration — our dispatch team shares the fare on request.'
      : `Package includes ${hours} hours / ${km} km from pickup.`,
    isNum(rates.extraKmRate) ? `Extra km at ${inr(rates.extraKmRate)}/km.` : 'Extra km charged at actuals, shared on request.',
    isNum(rates.extraHourRate) ? `Extra hour at ${inr(rates.extraHourRate)}/hr.` : 'Extra hours charged at actuals, shared on request.',
    ...COMMON_TERMS,
  ];
  if (!isNum(pkg)) return { fare: null, breakdown: [], terms };
  return { fare: Math.round(pkg), breakdown: [`${hours} hr / ${km} km package = ${inr(pkg)}`], terms };
}

/**
 * Master Server-Side Calculation Function
 * Used by both /api/fare and server-side booking creation.
 */
export async function calculateServerFare(input: FareCalculationInput): Promise<FareCalculationResponse> {
  const [allRoutes, allVehicles] = await Promise.all([getRoutes(), getVehicles()]);

  // Confirmed cars only (Hycross stays hidden until confirmed)
  const confirmedVehicles = allVehicles.filter((v) => v.confirmed !== false);
  const vehiclesToCalculate: Vehicle[] = input.vehicleId
    ? confirmedVehicles.filter((v) => v.id === input.vehicleId)
    : confirmedVehicles;

  const matchedRoute: Route | null = input.routeSlug ? allRoutes.find((r) => r.slug === input.routeSlug) || null : null;
  const pickup: FarePoint = { lat: input.pickupLat, lng: input.pickupLng };
  const drop: FarePoint = { lat: input.dropLat, lng: input.dropLng };
  const stops = (input.stops ?? []).slice(0, 3);
  const days = input.serviceType === 'outstation' ? tripDays(input.pickupDate, input.returnDate) : 1;

  // One-way distance (pickup → stops → destination)
  let oneWayKm: number | null = null;
  let totalKm: number | null = null;
  const path = [pickup, ...stops, drop];
  if (path.every(hasCoords)) {
    oneWayKm = path.slice(1).reduce((sum, p, i) => sum + roadKm(path[i], p), 0);
    totalKm = oneWayKm + roadKm(drop, pickup);
  } else if (matchedRoute?.distanceKm) {
    oneWayKm = matchedRoute.distanceKm;
    totalKm = matchedRoute.distanceKm * 2;
  } else if (isNum(input.distanceKm)) {
    oneWayKm = input.distanceKm;
    totalKm = input.distanceKm * 2;
  }

  const results: VehicleFareResult[] = vehiclesToCalculate.map((vehicle) => {
    const rates = vehicle.rates!;
    const quote =
      input.serviceType === 'airport'
        ? airportQuote(rates, input.tripType === 'round' ? 2 : 1)
        : input.serviceType === 'local'
          ? localQuote(rates, input.packageHours ?? 8)
          : outstationQuote(rates, totalKm, days);

    return {
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehicleType: vehicle.type,
      seats: vehicle.seats,
      luggage: vehicle.luggage,
      features: vehicle.features,
      fare: quote.fare,
      isFixed: input.serviceType !== 'outstation',
      breakdown: quote.breakdown,
      terms: quote.terms,
    };
  });

  return {
    success: true,
    distanceKm: oneWayKm !== null ? Math.round(oneWayKm) : null,
    totalKm: input.serviceType === 'outstation' && totalKm !== null ? Math.round(totalKm) : null,
    days,
    tripType: input.tripType,
    serviceType: input.serviceType,
    route: matchedRoute ? { name: matchedRoute.name, slug: matchedRoute.slug } : null,
    fares: Object.fromEntries(results.map((r) => [r.vehicleId, r.fare])),
    results,
    notice: 'Fares recalculated on server. Null fares indicate Price on request per client policy.',
  };
}

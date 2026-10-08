/**
 * storefrontData.ts — shared view-model builders for the storefront.
 *
 * All prices come from each car's admin-editable tariff (Vehicle.rates) so a
 * change in Admin → Pricing is reflected across the whole site. Prices are
 * nullable — null renders as "On request" (PROJECT_CONTEXT.md §8.3).
 */

import type { LocalPackage, Route, Vehicle } from '@/lib/types';
import type { WidgetDestination, WidgetLocalPackage } from '@/components/home/QuickBookingWidget';
import type { FleetCardData } from '@/components/home/FleetSection';
import type { SliderRoute } from '@/components/home/RouteCard';

export const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export const minFare = (values: Array<number | null | undefined>) => {
  const nums = values.filter((v): v is number => typeof v === 'number' && v > 0);
  return nums.length ? Math.min(...nums) : null;
};

export const fareOrRequest = (n: number | null | undefined) =>
  typeof n === 'number' && n > 0 ? formatINR(n) : 'On request';

const PACKAGE_LABELS: Record<number, string> = { 0: 'Custom', 8: 'Full-day', 12: 'Extended' };

export const packageLabel = (pkg: LocalPackage) => PACKAGE_LABELS[pkg.durationHours] ?? `${pkg.durationHours} hr`;

const VEHICLE_COPY: Record<string, { shortName: string; tagline: string }> = {
  innova: { shortName: 'Innova', tagline: 'The dependable family & corporate workhorse.' },
  'innova-crysta': { shortName: 'Crysta', tagline: 'Plush captain seats for long highway miles.' },
  ertiga: { shortName: 'Ertiga', tagline: 'Compact, economical 7-seater for small groups.' },
};

export const vehicleShortName = (v: Pick<Vehicle, 'id' | 'name'>) =>
  VEHICLE_COPY[v.id]?.shortName ?? v.name.replace(/^(Toyota|Maruti Suzuki) /, '');

/** Confirmed models only (Toyota Innova, Innova Crysta & Maruti Suzuki Ertiga). */
export const confirmedFleet = (vehicles: Vehicle[]) =>
  vehicles.filter((v) => v.confirmed !== false && !v.id.includes('hycross'));

export const findAirportRoute = (routes: Route[]) => routes.find((r) => r.slug.includes('airport'));

/** 8 hr, 12 hr, then the custom (0 hr, on request) package last. */
export const sortPackages = (packages: LocalPackage[]) =>
  [...packages].sort((a, b) => (a.durationHours || 999) - (b.durationHours || 999));

/**
 * Same-day round-trip estimate for a route (matches lib/fareCalculator.ts):
 * max(2 × distance, min km/day) × per-km + 1 day driver allowance.
 */
export function routeRoundTripFare(route: Route, vehicle: Vehicle): number | null {
  const r = vehicle.rates;
  if (!r || typeof r.outstationPerKm !== 'number' || r.outstationPerKm <= 0) return null;
  if (route.slug.includes('airport')) {
    return typeof r.airportFare === 'number' && r.airportFare > 0 ? r.airportFare : null;
  }
  const km = Math.max(route.distanceKm * 2, r.outstationMinKmPerDay);
  return Math.round(km * r.outstationPerKm + (r.driverAllowancePerDay ?? 0));
}

/** Lowest "from" fare for a route across the confirmed fleet. */
export const routeFromFare = (route: Route, fleet: Vehicle[]) => minFare(fleet.map((v) => routeRoundTripFare(route, v)));

/** Props for QuickBookingWidget. */
export function buildWidgetData(routes: Route[], packages: LocalPackage[], fleet: Vehicle[]) {
  const fleetIds = fleet.map((v) => v.id);
  const airportRoute = findAirportRoute(routes);

  const destinations: WidgetDestination[] = routes
    .filter((r) => r !== airportRoute)
    .map((r) => ({ slug: r.slug, destination: r.destination, distanceKm: r.distanceKm }));

  const localPackages: WidgetLocalPackage[] = sortPackages(packages).map((p) => {
    const from = minFare(fleetIds.map((id) => p.fares?.[id]));
    return {
      id: p.id,
      name: p.name,
      label: packageLabel(p),
      meta: p.durationHours ? `${p.durationHours} hr · ${p.distanceKm} km` : 'Any duration',
      fareLabel: from ? `from ${formatINR(from)}` : 'On request',
      hours: p.durationHours,
    };
  });

  return { destinations, localPackages, airportRouteSlug: airportRoute?.slug };
}

/** Route card view-model (slider + route grids). */
export function buildRouteCards(routes: Route[], fleet: Vehicle[]): SliderRoute[] {
  return routes.map((r) => {
    const isAirport = r.slug.includes('airport');
    const from = routeFromFare(r, fleet);
    return {
      slug: r.slug,
      isAirport,
      from: isAirport ? 'BLR Airport' : r.origin,
      title: isAirport ? 'Bangalore City' : r.destination,
      distanceKm: r.distanceKm,
      durationText: r.durationText,
      highlights: r.description || `Chauffeur-driven cab from ${r.origin} to ${r.destination}`,
      fromFare: from ? formatINR(from) : 'On request',
      fareLabel: isAirport ? 'Airport transfer from' : 'Round trip from',
      footnote: from
        ? isAirport
          ? 'Fixed fare, each way · tolls extra'
          : 'Same-day estimate · tolls paid by customer'
        : 'Price on request · quick quote on WhatsApp',
    };
  });
}

/** Fleet card view-model with Airport / Per km / Full-day fare trio. */
export function buildFleetCards(fleet: Vehicle[]): FleetCardData[] {
  return fleet.map((v) => ({
    id: v.id,
    name: v.name,
    shortName: vehicleShortName(v),
    type: v.type,
    tagline: VEHICLE_COPY[v.id]?.tagline ?? 'Chauffeur-driven comfort for every trip.',
    seats: v.seats,
    luggage: v.luggage,
    features: v.features,
    href: `/${v.id}-rental-bangalore`,
    fares: [
      { label: 'Airport', value: fareOrRequest(v.rates?.airportFare) },
      { label: 'Per km', value: fareOrRequest(v.rates?.outstationPerKm) },
      { label: 'Full-day', value: fareOrRequest(v.rates?.local8h) },
    ],
  }));
}

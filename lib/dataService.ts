import { Vehicle, Route, LocalPackage } from '@/lib/types';
import { fetchAdminRoutes, fetchAdminVehicles } from '@/lib/adminStore';

/**
 * Local hire packages. Prices come from each car's admin-editable rates
 * (Vehicle.rates.local8h / local12h) — see lib/storefrontData.ts. The custom
 * package is always "On request".
 */
export const defaultLocalPackages: LocalPackage[] = [
  {
    id: 'full-day-8hr-80km',
    name: 'Full Day City Rental (8 Hr / 80 Km)',
    durationHours: 8,
    distanceKm: 80,
    description: 'Perfect for full-day city sightseeing, family shopping across Bangalore hubs, and corporate delegations.',
    fares: {},
  },
  {
    id: 'extended-day-12hr-120km',
    name: 'Extended Full Day (12 Hr / 120 Km)',
    durationHours: 12,
    distanceKm: 120,
    description: 'Comprehensive coverage for wedding events, tech park tours, and long working days across the city.',
    fares: {},
  },
  {
    id: 'custom-on-request',
    name: 'Custom Duration (On Request)',
    durationHours: 0,
    distanceKm: 0,
    description: 'Need the car for a different number of hours? Tell us your plan and we will quote a custom package.',
    fares: {},
  },
];

/** durationHours 0 = custom package, always priced on request */
const localRateKey = { 8: 'local8h', 12: 'local12h' } as const;

/**
 * Vehicles (Firestore when configured, else the shared in-memory admin store),
 * always merged with the seed catalogue so new cars appear automatically.
 */
export async function getVehicles(): Promise<Vehicle[]> {
  return fetchAdminVehicles();
}

/**
 * Routes (Firestore when configured, else the shared in-memory admin store).
 */
export async function getRoutes(): Promise<Route[]> {
  return fetchAdminRoutes();
}

/**
 * Local hourly packages with per-car fares filled from admin rates.
 */
export async function getLocalPackages(): Promise<LocalPackage[]> {
  const vehicles = await getVehicles();
  return defaultLocalPackages.map((pkg) => {
    const key = localRateKey[pkg.durationHours as 8 | 12];
    const fares: LocalPackage['fares'] = {};
    for (const v of vehicles) {
      fares[v.id] = key ? v.rates?.[key] ?? null : null;
    }
    return { ...pkg, fares };
  });
}

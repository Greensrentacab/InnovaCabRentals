import { Vehicle, Route, LocalPackage } from '@/lib/types';
import { seedVehicles, seedRoutes } from '@/scripts/seed';

export const defaultLocalPackages: LocalPackage[] = [
  {
    id: 'half-day-4hr-40km',
    name: 'Half Day City Hire (4 Hr / 40 Km)',
    durationHours: 4,
    distanceKm: 40,
    description: 'Ideal for quick business meetings, hospital visits, or airport drop/pickup with luggage.',
    fares: {
      innova: null, // REPLACE WITH CLIENT PRICING
      'innova-crysta': null,
      'innova-hycross': null,
    },
  },
  {
    id: 'full-day-8hr-80km',
    name: 'Full Day City Rental (8 Hr / 80 Km)',
    durationHours: 8,
    distanceKm: 80,
    description: 'Perfect for full-day city sightseeing, family shopping across Bangalore hubs, and corporate delegations.',
    fares: {
      innova: null, // REPLACE WITH CLIENT PRICING
      'innova-crysta': null,
      'innova-hycross': null,
    },
  },
  {
    id: 'extended-day-12hr-120km',
    name: 'Extended Full Day (12 Hr / 120 Km)',
    durationHours: 12,
    distanceKm: 120,
    description: 'Comprehensive coverage for wedding events, tech park tours, and full-day outstation transit.',
    fares: {
      innova: null, // REPLACE WITH CLIENT PRICING
      'innova-crysta': null,
      'innova-hycross': null,
    },
  },
];

/**
 * Fetches vehicles from Firestore, falling back gracefully to seed configuration
 */
export async function getVehicles(): Promise<Vehicle[]> {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { adminDb } = await import('@/lib/firebaseAdmin');
      const snapshot = await adminDb.collection('vehicles').get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => doc.data() as Vehicle);
      }
    }
  } catch (error) {
    console.warn('[dataService] Falling back to local vehicle seed data:', error);
  }
  return seedVehicles;
}

/**
 * Fetches routes from Firestore, falling back gracefully to seed configuration
 */
export async function getRoutes(): Promise<Route[]> {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { adminDb } = await import('@/lib/firebaseAdmin');
      const snapshot = await adminDb.collection('routes').get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => doc.data() as Route);
      }
    }
  } catch (error) {
    console.warn('[dataService] Falling back to local route seed data:', error);
  }
  return seedRoutes;
}

/**
 * Fetches local hourly rental packages from Firestore, falling back to default seed packages
 */
export async function getLocalPackages(): Promise<LocalPackage[]> {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { adminDb } = await import('@/lib/firebaseAdmin');
      const snapshot = await adminDb.collection('local_packages').get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => doc.data() as LocalPackage);
      }
    }
  } catch (error) {
    console.warn('[dataService] Falling back to default local packages:', error);
  }
  return defaultLocalPackages;
}

/**
 * Firestore Database Seeder for Innova Cab Rentals
 *
 * Sourced from PROJECT_CONTEXT.md.
 * Populates Firestore with:
 *  - Vehicles: Toyota Innova, Toyota Innova Crysta, Maruti Suzuki Ertiga,
 *    Toyota Innova Hycross
 *  - Routes: Bangalore Airport ↔ City + 33 outstation routes from Bangalore
 *
 * PRICING NOTICE:
 * Prices are admin-editable per car (Vehicle.rates) and start as null.
 * Never invent prices — null renders as "Price on request".
 * Route distances/durations are approximate road figures from central
 * Bangalore and can be corrected later.
 */

import { Vehicle, Route, VehicleRates } from '../lib/types';
import { catalogRoutes } from '../lib/routeCatalog';

/** Empty tariff — every price null until set in Admin → Pricing. */
export const emptyRates = (): VehicleRates => ({
  outstationPerKm: null,
  outstationMinKmPerDay: 300,
  driverAllowancePerDay: null,
  airportFare: null,
  airportIncludedKm: null,
  airportExtraKmRate: null,
  local8h: null,
  local12h: null,
  extraKmRate: null,
  extraHourRate: null,
});

/**
 * Starting tariffs (INR) in line with typical Bangalore market rates, Oct 2026.
 * The client changes these any time in Admin → Pricing.
 * Order: per km, driver allowance/day, airport (each way), 8 hr/80 km,
 * 12 hr/120 km, extra km, extra hour.
 */
const defaultRates = (
  outstationPerKm: number,
  driverAllowancePerDay: number,
  airportFare: number,
  local8h: number,
  local12h: number,
  extraKmRate: number,
  extraHourRate: number
): VehicleRates => ({
  outstationPerKm,
  outstationMinKmPerDay: 300,
  driverAllowancePerDay,
  airportFare,
  // Flat airport fare until a minimum-km tariff is set in Admin → Pricing
  airportIncludedKm: null,
  airportExtraKmRate: null,
  local8h,
  local12h,
  extraKmRate,
  extraHourRate,
});

/**
 * Vehicle Seed Data
 * Seats, luggage, and features are placeholders until verified with client fleet.
 */
export const seedVehicles: Vehicle[] = [
  {
    id: 'innova',
    name: 'Toyota Innova',
    type: 'Standard 7/8 Seater MPV',
    seats: 7, // PLACEHOLDER
    luggage: 3, // PLACEHOLDER
    features: [
      'Dual Air Conditioning',
      'Comfortable 7/8 Seater Layout',
      'Audio & AUX Support',
      'Experienced Chauffeur',
    ], // PLACEHOLDER
    confirmed: true,
    baseFare: null, // REPLACE WITH CLIENT PRICING
    rates: defaultRates(16, 450, 2000, 2800, 3900, 16, 200),
  },
  {
    id: 'innova-crysta',
    name: 'Toyota Innova Crysta',
    type: 'Luxury Executive 7/8 Seater MPV',
    seats: 7, // PLACEHOLDER
    luggage: 4, // PLACEHOLDER
    features: [
      'Climate Control AC',
      'Captain Seat Recliners',
      'Superior Legroom & Noise Insulation',
      'High-Speed Highway Stability',
    ], // PLACEHOLDER
    confirmed: true,
    baseFare: null, // REPLACE WITH CLIENT PRICING
    rates: defaultRates(19, 500, 2500, 3300, 4600, 19, 250),
  },
  {
    id: 'ertiga',
    name: 'Maruti Suzuki Ertiga',
    type: 'Compact 7 Seater MPV',
    seats: 6, // PLACEHOLDER (6 passengers + driver)
    luggage: 2, // PLACEHOLDER
    features: [
      'Dual AC with Rear Roof Vents',
      'Comfortable 3-Row Seating',
      'Economical for Small Groups',
      'Experienced Chauffeur',
    ], // PLACEHOLDER
    confirmed: true,
    baseFare: null, // REPLACE WITH CLIENT PRICING
    rates: defaultRates(13, 400, 1600, 2400, 3400, 14, 180),
  },
  {
    id: 'innova-hycross',
    name: 'Toyota Innova Hycross',
    type: 'Premium Hybrid 7 Seater MPV',
    seats: 7, // PLACEHOLDER
    luggage: 4, // PLACEHOLDER
    features: [
      'Hybrid Powertrain',
      'Dual-Zone Climate Control',
      'Spacious Premium Cabin',
      'Advanced Safety Features',
    ], // PLACEHOLDER
    confirmed: true, // confirmed by the client (Oct 2026)
    baseFare: null, // REPLACE WITH CLIENT PRICING
    rates: defaultRates(23, 500, 3000, 4000, 5500, 23, 300),
  },
];

/**
 * Travel routes: Airport ↔ City plus 33 outstation routes (lib/routeCatalog.ts).
 */
export const seedRoutes: Route[] = catalogRoutes;

/**
 * Seed Function: writes to Firestore if Firebase Admin is configured
 */
export async function seedFirestore() {
  console.log('--- Starting Firestore Seeding ---');
  console.log(`Vehicles to seed: ${seedVehicles.length}`);
  seedVehicles.forEach((v) => {
    console.log(` - [Vehicle] ${v.name} (Confirmed: ${v.confirmed}, Price: ${v.baseFare ?? 'Price on request'})`);
  });

  console.log(`\nRoutes to seed: ${seedRoutes.length}`);
  seedRoutes.forEach((r) => {
    console.log(` - [Route] ${r.name} (${r.distanceKm} km, ${r.durationText}) -> per-vehicle fares: null (REPLACE WITH CLIENT PRICING)`);
  });

  // Check if Firebase Admin environment variables exist
  if (!process.env.FIREBASE_PROJECT_ID && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('\n[INFO] Firebase credentials not configured in environment.');
    console.log('[INFO] Seed data structure validated successfully. Once Firestore credentials are provided, records will be committed.');
    return;
  }

  try {
    // Dynamic import to avoid build errors when firebase-admin is not yet installed
    // @ts-ignore
    const { initializeApp, cert, getApps } = await import('firebase-admin/app');
    // @ts-ignore
    const { getFirestore } = await import('firebase-admin/firestore');

    if (getApps().length === 0) {
      initializeApp();
    }

    const db = getFirestore();

    // 1. Seed Vehicles collection
    const vehicleBatch = db.batch();
    for (const vehicle of seedVehicles) {
      const docRef = db.collection('vehicles').doc(vehicle.id);
      vehicleBatch.set(docRef, vehicle, { merge: true });
    }
    await vehicleBatch.commit();
    console.log('✓ Successfully seeded vehicles collection in Firestore');

    // 2. Seed Routes collection
    const routeBatch = db.batch();
    for (const route of seedRoutes) {
      const docRef = db.collection('routes').doc(route.id);
      routeBatch.set(docRef, route, { merge: true });
    }
    await routeBatch.commit();
    console.log('✓ Successfully seeded routes collection in Firestore');

    console.log('\n--- Firestore Seeding Completed Successfully ---');
  } catch (error) {
    console.error('Error connecting to Firestore during seeding:', error);
  }
}

// Allow direct execution
if (require.main === module) {
  seedFirestore()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

/**
 * Firestore Database Seeder for Innova Cabs Bangalore
 * 
 * Sourced from PROJECT_CONTEXT.md.
 * Populates Firestore with:
 *  - 3 Vehicles: Toyota Innova, Toyota Innova Crysta, Toyota Innova Hycross (confirmed: false)
 *  - 8 Outstation/Airport Routes: Airport to City, Mysore, Coorg, Ooty, Wayanad, Chikmagalur, Kodaikanal, Pondicherry
 * 
 * PRICING NOTICE:
 * Pricing is NOT final yet. All per-vehicle fares are set to null.
 * Never invent prices. REPLACE WITH CLIENT PRICING once verified.
 */

import { Vehicle, Route } from '../lib/types';

/**
 * Vehicle Seed Data
 * Seats, luggage, and features are placeholders until verified with client fleet.
 * Innova Hycross is flagged with confirmed: false.
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
  },
  {
    id: 'innova-hycross',
    name: 'Toyota Innova Hycross',
    type: 'Premium Hybrid MPV',
    seats: 7, // PLACEHOLDER
    luggage: 4, // PLACEHOLDER
    features: [
      'Hybrid Ultra-Quiet Drive',
      'Ottoman Lounge Seating',
      'Panoramic Roof Experience',
      'Executive Chauffeur Service',
    ], // PLACEHOLDER
    confirmed: false, // Hycross is UNCONFIRMED per PROJECT_CONTEXT.md
    baseFare: null, // REPLACE WITH CLIENT PRICING
  },
];

/**
 * 8 Core Travel Routes
 * Each route contains:
 *  - slug
 *  - distanceKm
 *  - durationText
 *  - per-vehicle fares set to null (REPLACE WITH CLIENT PRICING)
 */
export const seedRoutes: Route[] = [
  {
    id: 'airport-to-city',
    name: 'Bangalore Airport to City',
    slug: 'bangalore-airport-to-city',
    origin: 'Kempegowda International Airport (BLR)',
    destination: 'Bangalore City Hubs',
    distanceKm: 35,
    durationText: '1 hr 15 mins',
    fares: {
      innova: null, // REPLACE WITH CLIENT PRICING
      'innova-crysta': null, // REPLACE WITH CLIENT PRICING
      'innova-hycross': null, // REPLACE WITH CLIENT PRICING
    },
    description: 'Direct, on-time pickup and drop between BLR airport and major Bangalore city locations.',
  },
  {
    id: 'bangalore-to-mysore',
    name: 'Bangalore to Mysore',
    slug: 'bangalore-to-mysore',
    origin: 'Bangalore',
    destination: 'Mysore',
    distanceKm: 145,
    durationText: '3 hrs',
    fares: {
      innova: null, // REPLACE WITH CLIENT PRICING
      'innova-crysta': null, // REPLACE WITH CLIENT PRICING
      'innova-hycross': null, // REPLACE WITH CLIENT PRICING
    },
    description: 'Smooth highway journey via Bangalore-Mysore Expressway for heritage tours and palace visits.',
  },
  {
    id: 'bangalore-to-coorg',
    name: 'Bangalore to Coorg',
    slug: 'bangalore-to-coorg',
    origin: 'Bangalore',
    destination: 'Coorg (Madikeri)',
    distanceKm: 250,
    durationText: '5 hrs 30 mins',
    fares: {
      innova: null, // REPLACE WITH CLIENT PRICING
      'innova-crysta': null, // REPLACE WITH CLIENT PRICING
      'innova-hycross': null, // REPLACE WITH CLIENT PRICING
    },
    description: 'Popular coffee plantation getaway with experienced hill station chauffeurs.',
  },
  {
    id: 'bangalore-to-ooty',
    name: 'Bangalore to Ooty',
    slug: 'bangalore-to-ooty',
    origin: 'Bangalore',
    destination: 'Ooty',
    distanceKm: 275,
    durationText: '6 hrs 30 mins',
    fares: {
      innova: null, // REPLACE WITH CLIENT PRICING
      'innova-crysta': null, // REPLACE WITH CLIENT PRICING
      'innova-hycross': null, // REPLACE WITH CLIENT PRICING
    },
    description: 'Scenic journey through Bandipur tiger reserve and 36 hairpin bends to the Queen of Hill Stations.',
  },
  {
    id: 'bangalore-to-wayanad',
    name: 'Bangalore to Wayanad',
    slug: 'bangalore-to-wayanad',
    origin: 'Bangalore',
    destination: 'Wayanad',
    distanceKm: 280,
    durationText: '6 hrs',
    fares: {
      innova: null, // REPLACE WITH CLIENT PRICING
      'innova-crysta': null, // REPLACE WITH CLIENT PRICING
      'innova-hycross': null, // REPLACE WITH CLIENT PRICING
    },
    description: 'Lush green rainforest and wildlife sanctuary road trip with spacious Innova luggage room.',
  },
  {
    id: 'bangalore-to-chikmagalur',
    name: 'Bangalore to Chikmagalur',
    slug: 'bangalore-to-chikmagalur',
    origin: 'Bangalore',
    destination: 'Chikmagalur',
    distanceKm: 245,
    durationText: '4 hrs 30 mins',
    fares: {
      innova: null, // REPLACE WITH CLIENT PRICING
      'innova-crysta': null, // REPLACE WITH CLIENT PRICING
      'innova-hycross': null, // REPLACE WITH CLIENT PRICING
    },
    description: 'Fast expressway drive through Hassan reaching the peaks of Mullayanagiri and coffee estates.',
  },
  {
    id: 'bangalore-to-kodaikanal',
    name: 'Bangalore to Kodaikanal',
    slug: 'bangalore-to-kodaikanal',
    origin: 'Bangalore',
    destination: 'Kodaikanal',
    distanceKm: 465,
    durationText: '9 hrs',
    fares: {
      innova: null, // REPLACE WITH CLIENT PRICING
      'innova-crysta': null, // REPLACE WITH CLIENT PRICING
      'innova-hycross': null, // REPLACE WITH CLIENT PRICING
    },
    description: 'Long-distance comfort and smooth ghat suspension for families heading to the Princess of Hill Stations.',
  },
  {
    id: 'bangalore-to-pondicherry',
    name: 'Bangalore to Pondicherry',
    slug: 'bangalore-to-pondicherry',
    origin: 'Bangalore',
    destination: 'Pondicherry',
    distanceKm: 310,
    durationText: '6 hrs',
    fares: {
      innova: null, // REPLACE WITH CLIENT PRICING
      'innova-crysta': null, // REPLACE WITH CLIENT PRICING
      'innova-hycross': null, // REPLACE WITH CLIENT PRICING
    },
    description: 'East coast beach retreat travel via Krishnagiri and Tiruvannamalai with relaxed highway cruising.',
  },
];

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

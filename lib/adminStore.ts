/**
 * adminStore.ts
 * 
 * Provides administrative data access, managing bookings, enquiries, routes,
 * and vehicles. Integrates with Firestore Admin SDK when credentials are configured,
 * and uses an in-memory reactive state in local development.
 */

import { Booking, BookingStatus, Route, Vehicle, Enquiry, VehicleRates } from '@/lib/types';
import { seedVehicles, seedRoutes, emptyRates } from '@/scripts/seed';

// Live bookings store (empty by default; populated from Firestore or live submissions)
let memoryBookings: Booking[] = [];

let memoryEnquiries: Enquiry[] = [
  {
    id: 'ENQ-901',
    name: 'Vikram Seth',
    phone: '9820123456',
    email: 'vikram.seth@example.com',
    destination: 'Coorg 3-Day Nature & Plantation Tour',
    travelDate: new Date(Date.now() + 604800000).toISOString().split('T')[0],
    duration: '3 Days / 2 Nights',
    passengers: 5,
    vehicleModel: 'Toyota Innova Crysta',
    notes: 'Need hotel pickup in Koramangala and homestay recommendation in Madikeri.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'ENQ-902',
    name: 'Dr. Ananya Sharma',
    phone: '9886098765',
    email: 'ananya.s@example.com',
    destination: 'Ooty & Kodaikanal 5-Day Circuit',
    travelDate: new Date(Date.now() + 1209600000).toISOString().split('T')[0],
    duration: '5 Days / 4 Nights',
    passengers: 6,
    vehicleModel: 'Toyota Innova Crysta',
    notes: 'Traveling with elderly parents. Require calm, hill-experienced chauffeur.',
    status: 'CONTACTED',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Kept on globalThis so admin server actions and storefront pages share one
// in-memory catalogue during local development (no Firestore configured).
const memoryGlobal = globalThis as unknown as {
  __icbRoutes?: Route[];
  __icbVehicles?: Vehicle[];
};
memoryGlobal.__icbRoutes ??= [...seedRoutes];
memoryGlobal.__icbVehicles ??= seedVehicles.map((v) => ({ ...v, rates: { ...emptyRates(), ...v.rates } }));
let memoryRoutes: Route[] = memoryGlobal.__icbRoutes;
let memoryVehicles: Vehicle[] = memoryGlobal.__icbVehicles;

/**
 * True when Firebase Admin credentials are present. Firestore is then the only
 * source of truth for bookings & enquiries: errors are thrown (never hidden
 * behind the in-memory demo data, which serverless instances can't share).
 * The in-memory store is only used for local development without Firebase.
 */
const hasFirestore = () =>
  Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      (process.env.FIREBASE_PRIVATE_KEY_BASE64 || process.env.FIREBASE_PRIVATE_KEY)
  );

async function getAdminDb() {
  const { adminDb } = await import('@/lib/firebaseAdmin');
  return adminDb;
}

/**
 * Stored docs are layered over the seed catalogue (so partial docs written by
 * admin edits still have every field) and seed items missing from Firestore
 * are appended (e.g. newly added cars/routes).
 */
function mergeWithSeed<T>(stored: T[], seed: T[], key: (item: T) => string): T[] {
  const seedByKey = new Map(seed.map((item) => [key(item), item]));
  const seen = new Set(stored.map(key));
  return [
    ...stored.map((item) => ({ ...(seedByKey.get(key(item)) ?? {}), ...item }) as T),
    ...seed.filter((item) => !seen.has(key(item))),
  ];
}

const withRates = (v: Vehicle): Vehicle => ({ ...v, rates: { ...emptyRates(), ...(v.rates ?? {}) } });

const seedOrder = (id: string) => {
  const i = seedVehicles.findIndex((v) => v.id === id);
  return i === -1 ? 99 : i;
};

export async function fetchAllBookings(): Promise<Booking[]> {
  if (!hasFirestore()) return memoryBookings;

  const adminDb = await getAdminDb();
  const snapshot = await adminDb.collection('bookings').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => doc.data() as Booking);
}

export async function addBooking(booking: Booking): Promise<void> {
  if (!hasFirestore()) {
    memoryBookings = [booking, ...memoryBookings.filter((b) => b.bookingId !== booking.bookingId)];
    return;
  }

  const adminDb = await getAdminDb();
  await adminDb.collection('bookings').doc(booking.bookingId).set(booking);
}

export async function updateBookingInStore(
  bookingId: string,
  updates: Partial<Booking>
): Promise<Booking | null> {
  if (!hasFirestore()) {
    const index = memoryBookings.findIndex((b) => b.bookingId === bookingId);
    if (index === -1) return null;
    memoryBookings[index] = { ...memoryBookings[index], ...updates };
    return memoryBookings[index];
  }

  const adminDb = await getAdminDb();
  const ref = adminDb.collection('bookings').doc(bookingId);
  const existing = await ref.get();
  if (!existing.exists) return null;
  await ref.update(updates);
  return { ...(existing.data() as Booking), ...updates };
}

export async function fetchAllEnquiries(): Promise<Enquiry[]> {
  if (!hasFirestore()) return memoryEnquiries;

  const adminDb = await getAdminDb();
  const snapshot = await adminDb.collection('enquiries').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => ({ ...(doc.data() as Enquiry), id: doc.id }));
}

export async function updateEnquiryStatusInStore(
  id: string,
  status: Enquiry['status']
): Promise<void> {
  if (!hasFirestore()) {
    const index = memoryEnquiries.findIndex((e) => e.id === id);
    if (index !== -1) {
      memoryEnquiries[index].status = status;
    }
    return;
  }

  const adminDb = await getAdminDb();
  await adminDb.collection('enquiries').doc(id).update({ status });
}

/**
 * Catalogue reads keep falling back to the seed data on error so the public
 * storefront stays up even if Firestore is briefly unreachable.
 */
export async function fetchAdminRoutes(): Promise<Route[]> {
  try {
    if (hasFirestore()) {
      const adminDb = await getAdminDb();
      const snapshot = await adminDb.collection('routes').get();
      if (!snapshot.empty) {
        return mergeWithSeed(snapshot.docs.map((doc) => doc.data() as Route), seedRoutes, (r) => r.slug);
      }
    }
  } catch (error) {
    console.error('[adminStore] Falling back to seed routes:', error);
  }
  return memoryRoutes;
}

export async function updateRouteFaresInStore(
  slug: string,
  fares: { [vehicleId: string]: number | null }
): Promise<void> {
  const index = memoryRoutes.findIndex((r) => r.slug === slug);
  if (index !== -1) {
    memoryRoutes[index] = {
      ...memoryRoutes[index],
      fares: {
        ...memoryRoutes[index].fares,
        ...fares,
      },
    };
  }

  if (hasFirestore()) {
    const adminDb = await getAdminDb();
    // set+merge creates the doc for routes that only exist in the seed catalogue
    await adminDb.collection('routes').doc(slug).set({ slug, fares }, { merge: true });
  }
}

export async function fetchAdminVehicles(): Promise<Vehicle[]> {
  try {
    if (hasFirestore()) {
      const adminDb = await getAdminDb();
      const snapshot = await adminDb.collection('vehicles').get();
      if (!snapshot.empty) {
        return mergeWithSeed(snapshot.docs.map((doc) => doc.data() as Vehicle), seedVehicles, (v) => v.id)
          .map(withRates)
          .sort((a, b) => seedOrder(a.id) - seedOrder(b.id));
      }
    }
  } catch (error) {
    console.error('[adminStore] Falling back to seed vehicles:', error);
  }
  return memoryVehicles.map(withRates);
}

/**
 * Update a car's admin-editable tariff (Admin → Pricing).
 */
export async function updateVehicleRatesInStore(vehicleId: string, rates: VehicleRates): Promise<void> {
  const index = memoryVehicles.findIndex((v) => v.id === vehicleId);
  if (index !== -1) {
    memoryVehicles[index] = { ...memoryVehicles[index], rates };
  }

  if (hasFirestore()) {
    const adminDb = await getAdminDb();
    // set+merge creates the doc for cars that only exist in the seed catalogue
    await adminDb.collection('vehicles').doc(vehicleId).set({ id: vehicleId, rates }, { merge: true });
  }
}

export async function toggleVehicleInStore(
  vehicleId: string,
  confirmed: boolean
): Promise<void> {
  const index = memoryVehicles.findIndex((v) => v.id === vehicleId);
  if (index !== -1) {
    memoryVehicles[index] = {
      ...memoryVehicles[index],
      confirmed,
    };
  }

  if (hasFirestore()) {
    const adminDb = await getAdminDb();
    await adminDb.collection('vehicles').doc(vehicleId).set({ id: vehicleId, confirmed }, { merge: true });
  }
}

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  if (!hasFirestore()) {
    return memoryBookings.find((b) => b.bookingId.toLowerCase() === bookingId.toLowerCase()) || null;
  }

  const adminDb = await getAdminDb();
  // Booking IDs are stored upper-case (ICB-10482); accept any casing from the URL
  const doc = await adminDb.collection('bookings').doc(bookingId.trim().toUpperCase()).get();
  return doc.exists ? (doc.data() as Booking) : null;
}

/**
 * Generates unique booking ID like ICB-10482 with collision checking
 */
export async function generateUniqueBookingId(): Promise<string> {
  let attempts = 0;
  while (attempts < 50) {
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digits
    const candidateId = `ICB-${randomNum}`;
    const existing = await getBookingById(candidateId);
    if (!existing) {
      return candidateId;
    }
    attempts++;
  }
  // Fallback with timestamp in extreme collision cases
  return `ICB-${Date.now().toString().slice(-5)}`;
}


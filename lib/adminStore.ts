/**
 * adminStore.ts
 * 
 * Provides administrative data access, managing bookings, enquiries, routes,
 * and vehicles. Integrates with Firestore Admin SDK when credentials are configured,
 * and uses an in-memory reactive state in local development.
 */

import { Booking, BookingStatus, Route, Vehicle, Enquiry } from '@/lib/types';
import { seedVehicles, seedRoutes } from '@/scripts/seed';

// Sample pre-populated bookings for realistic testing & operation
let memoryBookings: Booking[] = [
  {
    bookingId: 'BK-INV8921',
    customerName: 'Suresh Kumar',
    customerPhone: '9876543210',
    pickupName: 'Kempegowda Airport (BLR)',
    pickupAddress: 'Terminal 1 Arrivals, BLR Airport, Devanahalli, Bengaluru',
    pickupLat: 13.1986,
    pickupLng: 77.7066,
    dropName: 'Indiranagar 100ft Road',
    dropAddress: 'HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    dropLat: 12.9784,
    dropLng: 77.6408,
    tripType: 'oneway',
    serviceType: 'airport',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '18:30',
    vehicleId: 'innova-crysta',
    vehicleName: 'Toyota Innova Crysta',
    fare: null, // Price on request
    bookingStatus: 'PENDING',
    driverId: null,
    driverName: null,
    driverPhone: null,
    vehicleRegistration: null,
    notes: 'Flight 6E-452 arriving from Delhi. Requires luggage assistance.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    bookingId: 'BK-INV8920',
    customerName: 'Ramesh Iyer',
    customerPhone: '9845012345',
    pickupName: 'Jayanagar 4th Block',
    pickupAddress: 'Jayanagar, Bengaluru, Karnataka 560011',
    pickupLat: 12.9250,
    pickupLng: 77.5938,
    dropName: 'Mysore Palace',
    dropAddress: 'Sayyaji Rao Rd, Mysuru, Karnataka 570001',
    dropLat: 12.3051,
    dropLng: 76.6551,
    tripType: 'round',
    serviceType: 'outstation',
    pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    pickupTime: '06:00',
    vehicleId: 'innova',
    vehicleName: 'Toyota Innova',
    fare: null,
    bookingStatus: 'CONFIRMED',
    driverId: null,
    driverName: null,
    driverPhone: null,
    vehicleRegistration: null,
    notes: 'Family trip with senior citizens. Prefer peaceful driving.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    bookingId: 'BK-INV8918',
    customerName: 'Priya Nair',
    customerPhone: '9741234567',
    pickupName: 'Whitefield ITPL',
    pickupAddress: 'ITPL Main Rd, Whitefield, Bengaluru, Karnataka 560066',
    pickupLat: 12.9866,
    pickupLng: 77.7381,
    dropName: 'Kempegowda Airport (BLR)',
    dropAddress: 'BLR Airport, Devanahalli, Bengaluru',
    dropLat: 13.1986,
    dropLng: 77.7066,
    tripType: 'oneway',
    serviceType: 'airport',
    pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    pickupTime: '04:30',
    vehicleId: 'innova-crysta',
    vehicleName: 'Toyota Innova Crysta',
    fare: null,
    bookingStatus: 'DRIVER_ASSIGNED',
    driverId: 'DRV-102',
    driverName: 'Manjunath Gowda',
    driverPhone: '9448123456',
    vehicleRegistration: 'KA 04 MP 7821',
    notes: 'Early morning flight at 07:00 AM.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    bookingId: 'BK-INV8915',
    customerName: 'Karthik Raja',
    customerPhone: '9980112233',
    pickupName: 'Electronic City Phase 1',
    pickupAddress: 'Hosur Rd, Electronic City, Bengaluru',
    pickupLat: 12.8452,
    pickupLng: 77.6602,
    dropName: 'Ooty (Udhagamandalam)',
    dropAddress: 'Ooty, Tamil Nadu 643001',
    dropLat: 11.4102,
    dropLng: 76.6950,
    tripType: 'round',
    serviceType: 'outstation',
    pickupDate: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    pickupTime: '05:00',
    vehicleId: 'innova-crysta',
    vehicleName: 'Toyota Innova Crysta',
    fare: null,
    bookingStatus: 'COMPLETED',
    driverId: 'DRV-101',
    driverName: 'Santhosh Kumar',
    driverPhone: '9880198765',
    vehicleRegistration: 'KA 03 AA 4589',
    notes: '3-day round trip completed successfully.',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
];

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

let memoryRoutes: Route[] = [...seedRoutes];
let memoryVehicles: Vehicle[] = [...seedVehicles];

export async function fetchAllBookings(): Promise<Booking[]> {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { adminDb } = await import('@/lib/firebaseAdmin');
      const snapshot = await adminDb.collection('bookings').orderBy('createdAt', 'desc').get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => doc.data() as Booking);
      }
    }
  } catch (error) {
    console.warn('[adminStore] Falling back to memory bookings:', error);
  }
  return memoryBookings;
}

export async function addBooking(booking: Booking): Promise<void> {
  memoryBookings = [booking, ...memoryBookings.filter((b) => b.bookingId !== booking.bookingId)];
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { adminDb } = await import('@/lib/firebaseAdmin');
      await adminDb.collection('bookings').doc(booking.bookingId).set(booking);
    }
  } catch (error) {
    console.warn('[adminStore] Could not write booking to Firestore:', error);
  }
}

export async function updateBookingInStore(
  bookingId: string,
  updates: Partial<Booking>
): Promise<Booking | null> {
  const index = memoryBookings.findIndex((b) => b.bookingId === bookingId);
  if (index !== -1) {
    memoryBookings[index] = { ...memoryBookings[index], ...updates };
  }

  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { adminDb } = await import('@/lib/firebaseAdmin');
      await adminDb.collection('bookings').doc(bookingId).update(updates);
    }
  } catch (error) {
    console.warn('[adminStore] Could not update Firestore booking:', error);
  }

  return memoryBookings.find((b) => b.bookingId === bookingId) || null;
}

export async function fetchAllEnquiries(): Promise<Enquiry[]> {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { adminDb } = await import('@/lib/firebaseAdmin');
      const snapshot = await adminDb.collection('enquiries').orderBy('createdAt', 'desc').get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Enquiry) }));
      }
    }
  } catch (error) {
    console.warn('[adminStore] Falling back to memory enquiries:', error);
  }
  return memoryEnquiries;
}

export async function updateEnquiryStatusInStore(
  id: string,
  status: Enquiry['status']
): Promise<void> {
  const index = memoryEnquiries.findIndex((e) => e.id === id);
  if (index !== -1) {
    memoryEnquiries[index].status = status;
  }
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { adminDb } = await import('@/lib/firebaseAdmin');
      await adminDb.collection('enquiries').doc(id).update({ status });
    }
  } catch (error) {
    console.warn('[adminStore] Could not update enquiry status:', error);
  }
}

export async function fetchAdminRoutes(): Promise<Route[]> {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { adminDb } = await import('@/lib/firebaseAdmin');
      const snapshot = await adminDb.collection('routes').get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => doc.data() as Route);
      }
    }
  } catch (error) {
    console.warn('[adminStore] Falling back to memory routes:', error);
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

  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { adminDb } = await import('@/lib/firebaseAdmin');
      await adminDb.collection('routes').doc(slug).update({ fares });
    }
  } catch (error) {
    console.warn('[adminStore] Could not update route fares:', error);
  }
}

export async function fetchAdminVehicles(): Promise<Vehicle[]> {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { adminDb } = await import('@/lib/firebaseAdmin');
      const snapshot = await adminDb.collection('vehicles').get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => doc.data() as Vehicle);
      }
    }
  } catch (error) {
    console.warn('[adminStore] Falling back to memory vehicles:', error);
  }
  return memoryVehicles;
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

  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { adminDb } = await import('@/lib/firebaseAdmin');
      await adminDb.collection('vehicles').doc(vehicleId).update({ confirmed });
    }
  } catch (error) {
    console.warn('[adminStore] Could not toggle vehicle status:', error);
  }
}

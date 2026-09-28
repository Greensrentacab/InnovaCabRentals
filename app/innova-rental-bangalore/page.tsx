import { notFound } from 'next/navigation';
import VehicleDetailTemplate from '@/components/VehicleDetailTemplate';
import { getVehicles } from '@/lib/dataService';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: `Innova Rental Bangalore | 7 & 8 Seater Toyota Innova Cab Hire | ${siteConfig.brand.name}`,
  description:
    'Book Toyota Innova cab rental in Bangalore with experienced driver for outstation road trips, Kempegowda Airport transfers, and local city use. Clean, comfortable 7 and 8 seater Innova taxi.',
  keywords: [
    'Innova Rental Bangalore',
    'Innova Cabs Bangalore',
    'Innova Taxi Bangalore',
    'Innova with Driver Bangalore',
    'Book Innova Cab Bangalore',
    'Innova Cab Bangalore Price',
  ],
};

export default async function InnovaRentalBangalorePage() {
  const allVehicles = await getVehicles();
  const vehicle = allVehicles.find((v) => v.id === 'innova');

  // CRITICAL RULE: If a vehicle has confirmed:false, hide its page
  if (!vehicle || vehicle.confirmed === false) {
    notFound();
  }

  const galleryPlaceholders = [
    {
      title: 'Toyota Innova Exterior Front & Profile',
      caption: 'Sanitized classic Innova MPV in pristine silver/white finish',
    },
    {
      title: 'Cabin Interior & Reclining Seats',
      caption: 'Spacious 7/8 seater layout with dual air conditioning vents',
    },
    {
      title: 'Rear Boot & Luggage Space',
      caption: 'Generous luggage storage with foldable third-row seating',
    },
    {
      title: 'Cockpit & Safety Controls',
      caption: 'GPS-enabled fleet vehicle with emergency first-aid kit',
    },
  ];

  const idealFor = [
    'Family Holiday Trips (Mysore, Coorg, Ooty)',
    'Kempegowda Airport (BLR) Pickup & Drop',
    'Full-Day Bangalore City Shopping & Events',
    'Wedding Guest Transit & Group Logistics',
    'South India Temple Tours & Weekend Road Trips',
  ];

  const detailedSpecs = [
    { label: 'Seating Capacity', value: `${vehicle.seats} Passengers + 1 Driver` },
    { label: 'Luggage Capacity', value: `${vehicle.luggage} Large Bags + Carriers` },
    { label: 'Air Conditioning', value: 'Dual Zone Powerful AC' },
    { label: 'Audio Entertainment', value: 'Bluetooth, AUX, USB Support' },
    { label: 'Safety Systems', value: 'Dual Airbags, ABS, Speed Governor' },
    { label: 'Availability', value: '24/7 Doorstep Dispatch' },
  ];

  return (
    <VehicleDetailTemplate
      vehicle={vehicle}
      h1="Toyota Innova Rental Bangalore – 7 & 8 Seater Cab with Driver"
      tagline="Comfortable Cars. Experienced Drivers. Reliable Journeys."
      overview="The classic Toyota Innova remains India's most beloved multi-purpose vehicle for good reason. Renowned for its bulletproof reliability, plush shock absorption, and spacious 7 and 8 passenger seating, it is the number one choice for family holidays and outstation highway travel across Karnataka, Tamil Nadu, and Kerala."
      idealFor={idealFor}
      galleryPlaceholders={galleryPlaceholders}
      detailedSpecs={detailedSpecs}
    />
  );
}

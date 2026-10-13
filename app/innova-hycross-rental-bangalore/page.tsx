import { notFound } from 'next/navigation';
import VehicleDetailTemplate from '@/components/VehicleDetailTemplate';
import { getVehicles } from '@/lib/dataService';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  alternates: { canonical: '/innova-hycross-rental-bangalore' },
  title: `Innova Hycross Rental Bangalore | Toyota Innova Hycross Hybrid Cab Hire | ${siteConfig.brand.name}`,
  description:
    'Book a chauffeur-driven Toyota Innova Hycross in Bangalore. Quiet hybrid drive and a spacious 7-seater cabin for airport transfers, local rentals and outstation trips.',
  keywords: [
    'Innova Hycross Rental Bangalore',
    'Innova Cabs Bangalore',
    'Innova Rental Bangalore',
    'Innova Taxi Bangalore',
    'Innova with Driver Bangalore',
    'Book Innova Cab Bangalore',
  ],
};

export default async function InnovaHycrossRentalBangalorePage() {
  const allVehicles = await getVehicles();
  const vehicle = allVehicles.find((v) => v.id === 'innova-hycross');

  // Hidden (404) if the car is switched off in Admin → Fleet
  if (!vehicle || vehicle.confirmed === false) {
    notFound();
  }

  const idealFor = [
    'Corporate & Executive Travel',
    'Airport Transfers with Luggage',
    'Family Trips & Weekend Getaways',
    'Weddings & Special Occasions',
  ];

  // Trim-specific extras (ottoman seats, panoramic roof, ADAS) vary by car,
  // so only features common to the Hycross are listed here.
  const detailedSpecs = [
    { label: 'Powertrain', value: 'Self-Charging Strong Hybrid' },
    { label: 'Seating Layout', value: `${vehicle.seats} Passengers + Chauffeur` },
    { label: 'Luggage Boot', value: `${vehicle.luggage} Large Bags` },
    { label: 'Climate Control', value: 'Automatic Climate Control' },
    { label: 'Cabin', value: 'Quiet, Spacious Hybrid Cabin' },
    { label: 'Chauffeur', value: 'Experienced, Verified Driver' },
  ];

  return (
    <VehicleDetailTemplate
      vehicle={vehicle}
      h1="Innova Hycross Rental Bangalore – Premium Hybrid MPV"
      tagline="Comfortable Cars. Experienced Drivers. Reliable Journeys."
      overview="The Toyota Innova Hycross pairs a self-charging hybrid engine with a quiet, spacious cabin and a smooth ride. It is a premium choice for airport transfers, corporate travel and long outstation trips from Bangalore, driven by an experienced chauffeur."
      idealFor={idealFor}
      detailedSpecs={detailedSpecs}
    />
  );
}

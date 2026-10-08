import { notFound } from 'next/navigation';
import VehicleDetailTemplate from '@/components/VehicleDetailTemplate';
import { getVehicles } from '@/lib/dataService';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: `Innova Hycross Rental Bangalore | Toyota Innova Hycross Hybrid Cab Hire | ${siteConfig.brand.name}`,
  description:
    'Rent the revolutionary Toyota Innova Hycross in Bangalore with chauffeur. Whisper-quiet hybrid drive, panoramic roof, ottoman lounge seating, and next-generation luxury.',
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

  // CRITICAL RULE: If a vehicle has confirmed:false, hide its page and return 404
  if (!vehicle || vehicle.confirmed === false) {
    notFound();
  }

  const idealFor = [
    'VIP Diplomats & International Corporate Delegates',
    'Green & Eco-Friendly Corporate Travel Policy',
    'Luxury Airport Chauffeur Transfers',
    'High-End Wedding Transportation',
  ];

  const detailedSpecs = [
    { label: 'Powertrain', value: 'Self-Charging Strong Hybrid Electric' },
    { label: 'Seating Layout', value: `${vehicle.seats} Powered Ottoman Lounge Seats` },
    { label: 'Luggage Boot', value: `${vehicle.luggage} Full-Size International Bags` },
    { label: 'Roof Experience', value: 'Panoramic Glass Sunroof' },
    { label: 'Cabin Sound Level', value: 'Whisper-Quiet EV Electric Mode' },
    { label: 'Safety Technology', value: 'Toyota Safety Sense ADAS & 6 Airbags' },
  ];

  return (
    <VehicleDetailTemplate
      vehicle={vehicle}
      h1="Innova Hycross Rental Bangalore – Premium Hybrid MPV"
      tagline="Comfortable Cars. Experienced Drivers. Reliable Journeys."
      overview="Experience the pinnacle of modern luxury with the Toyota Innova Hycross. Built on Toyota's state-of-the-art TNGA monocoque platform with self-charging hybrid technology, the Hycross delivers an eerily quiet cabin, powered ottoman calf-support recliners, a grand panoramic glass roof, and cloud-like suspension. It represents the ultimate chauffeur-driven executive experience in Bangalore."
      idealFor={idealFor}
      detailedSpecs={detailedSpecs}
    />
  );
}

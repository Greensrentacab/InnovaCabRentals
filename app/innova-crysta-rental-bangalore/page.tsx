import { notFound } from 'next/navigation';
import VehicleDetailTemplate from '@/components/VehicleDetailTemplate';
import { getVehicles } from '@/lib/dataService';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: `Innova Crysta Rental Bangalore | Luxury 7 Seater Innova Crysta Cab Hire | ${siteConfig.brand.name}`,
  description:
    'Rent Toyota Innova Crysta in Bangalore with chauffeur. Premium executive captain seats, automatic climate control, and unmatched luxury for corporate delegations, airport VIP transfers, and family outstation trips.',
  keywords: [
    'Innova Crysta Rental Bangalore',
    'Innova Cabs Bangalore',
    'Innova Rental Bangalore',
    'Innova Taxi Bangalore',
    'Innova with Driver Bangalore',
    'Book Innova Cab Bangalore',
    'Innova Cab Bangalore Price',
  ],
};

export default async function InnovaCrystaRentalBangalorePage() {
  const allVehicles = await getVehicles();
  const vehicle = allVehicles.find((v) => v.id === 'innova-crysta');

  // CRITICAL RULE: If a vehicle has confirmed:false, hide its page
  if (!vehicle || vehicle.confirmed === false) {
    notFound();
  }

  const idealFor = [
    'Executive Corporate Delegations & Tech Summits',
    'VIP Kempegowda Airport (BLR) Chauffeur Transfers',
    'Luxury Hill Station Escapes (Coorg, Ooty, Wayanad)',
    'Bridal & Groom Wedding Entourage Transport',
    'Extended Multi-Day South Indian Vacation Circuits',
  ];

  const detailedSpecs = [
    { label: 'Seating Layout', value: `${vehicle.seats} Executive Captain Layout` },
    { label: 'Luggage Boot', value: `${vehicle.luggage} Full-Size International Bags` },
    { label: 'Climate Control', value: 'Automatic Multi-Zone AC' },
    { label: 'Seat Material', value: 'Plush Leatherette with Armrests' },
    { label: 'Highway Stability', value: 'Advanced Suspension & Sound Proofing' },
    { label: 'Safety Rating', value: '7 Airbags, Vehicle Stability Control' },
  ];

  return (
    <VehicleDetailTemplate
      vehicle={vehicle}
      h1="Innova Crysta Rental Bangalore – Luxury Chauffeur Driven MPV"
      tagline="Comfortable Cars. Experienced Drivers. Reliable Journeys."
      overview="Step into executive comfort with the Toyota Innova Crysta. Designed for travelers who demand the highest tier of ride smoothness, privacy, and refinement, the Crysta features plush middle-row captain recliners, independent digital AC zones, superior noise isolation, and a commanding road presence. It is the premier choice for corporate executives, VIP airport transfers, and luxury family vacations."
      idealFor={idealFor}
      detailedSpecs={detailedSpecs}
    />
  );
}

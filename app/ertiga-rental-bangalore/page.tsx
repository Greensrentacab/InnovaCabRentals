import { notFound } from 'next/navigation';
import VehicleDetailTemplate from '@/components/VehicleDetailTemplate';
import { getVehicles } from '@/lib/dataService';
import { siteConfig } from '@/lib/siteConfig';

export const revalidate = 60;

export const metadata = {
  title: `Ertiga Rental Bangalore | Maruti Suzuki Ertiga Cab with Driver | ${siteConfig.brand.name}`,
  description:
    'Rent a Maruti Suzuki Ertiga with driver in Bangalore. Economical, comfortable 7 seater for airport transfers, local city hire and outstation round trips. No advance payment; tolls paid by customer.',
  keywords: [
    'Ertiga Rental Bangalore',
    'Ertiga Cab Bangalore',
    'Ertiga Taxi Bangalore',
    'Ertiga with Driver Bangalore',
    'Book Ertiga Cab Bangalore',
  ],
};

export default async function ErtigaRentalBangalorePage() {
  const allVehicles = await getVehicles();
  const vehicle = allVehicles.find((v) => v.id === 'ertiga');

  // CRITICAL RULE: If a vehicle has confirmed:false, hide its page
  if (!vehicle || vehicle.confirmed === false) {
    notFound();
  }

  const idealFor = [
    'Small Families & Groups of 4–6',
    'Kempegowda Airport (BLR) Pickup & Drop',
    'Budget-Friendly Weekend Getaways',
    'Local City Shopping & Errands',
    'Temple Trips (Tirupati, Dharmasthala, Kukke)',
  ];

  const detailedSpecs = [
    { label: 'Seating Capacity', value: `${vehicle.seats} Passengers + 1 Driver` },
    { label: 'Luggage Capacity', value: `${vehicle.luggage} Medium Bags` },
    { label: 'Air Conditioning', value: 'Dual AC with Rear Roof Vents' },
    { label: 'Seating Layout', value: '3-Row Family Seating' },
    { label: 'Best For', value: 'Economical Group Travel' },
    { label: 'Availability', value: '24/7 Doorstep Dispatch' },
  ];

  return (
    <VehicleDetailTemplate
      vehicle={vehicle}
      h1="Ertiga Rental Bangalore – Maruti Suzuki Ertiga Cab with Driver"
      tagline="Comfortable Cars. Experienced Drivers. Reliable Journeys."
      overview="The Maruti Suzuki Ertiga is a compact, fuel-efficient 7 seater that is ideal for smaller groups who want the comfort of three rows without the size of a full MPV. With air-conditioning for every row and a smooth city ride, it is a value-for-money choice for airport transfers, local hire and weekend round trips from Bangalore."
      idealFor={idealFor}
      detailedSpecs={detailedSpecs}
    />
  );
}

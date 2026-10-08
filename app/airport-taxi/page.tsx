import { Plane, Clock, ShieldCheck, Luggage, Navigation } from 'lucide-react';
import LandingTemplate from '@/components/LandingTemplate';
import { getVehicles, getRoutes, getLocalPackages } from '@/lib/dataService';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: `Innova Airport Taxi Bangalore | BLR Airport Pickup & Drop | ${siteConfig.brand.name}`,
  description:
    'Book Toyota Innova, Innova Crysta & Ertiga airport taxi in Bangalore. Reliable 24/7 Kempegowda International Airport pickup and drop with zero surge charges and flight tracking.',
};

export default async function AirportTaxiPage() {
  const vehicles = await getVehicles();
  const allRoutes = await getRoutes();
  const localPackages = await getLocalPackages();
  const airportRoutes = allRoutes.filter(
    (r) => r.slug.includes('airport') || r.destination.toLowerCase().includes('airport')
  );

  const benefits = [
    {
      icon: Clock,
      title: '24/7 Flight Tracking',
      description: 'Chauffeurs monitor flight arrival times in real-time to adjust for early touchdowns or unexpected flight delays.',
    },
    {
      icon: ShieldCheck,
      title: 'Zero Surge Pricing',
      description: 'Fixed, transparent airport tariffs without peak hour multipliers or surge charges regardless of weather or traffic.',
    },
    {
      icon: Luggage,
      title: 'Luggage Accommodating',
      description: 'Spacious boots easily holding 4 to 5 international luggage cases plus carry-ons with optional top carrier racks.',
    },
    {
      icon: Navigation,
      title: 'Terminal Meet & Greet',
      description: 'Driver coordinates directly via WhatsApp and meets you at the designated airport passenger pickup lane.',
    },
  ];

  const faqs = [
    {
      q: 'Where will the driver pick me up at Kempegowda International Airport (BLR)?',
      a: 'After landing and collecting baggage, our chauffeur will message you on WhatsApp and wait at the authorized cab pickup point (Lane 1/2) with your vehicle registration details.',
    },
    {
      q: 'What happens if my flight is delayed?',
      a: 'We monitor flight numbers provided during booking. Your pickup time will automatically adjust according to the revised landing schedule at no extra waiting penalty.',
    },
    {
      q: 'Are airport highway toll charges included in the fare?',
      a: 'No. Airport trumpet toll fees and airport parking charges are paid by the customer at actuals.',
    },
    {
      q: 'Can I book an airport drop at 2:00 AM or 3:00 AM?',
      a: 'Yes, our airport dispatch team operates 24 hours a day, 365 days a year. We recommend booking at least 3 hours in advance for late-night or early-morning departures.',
    },
  ];

  return (
    <LandingTemplate
      breadcrumb="Airport Taxi"
      badge="Kempegowda International Airport (BLR)"
      title="Innova Airport Taxi Bangalore"
      subtitle="Chauffeur-driven Toyota Innova, Innova Crysta and Maruti Suzuki Ertiga airport transfers with flight tracking, verified drivers, and guaranteed zero surge pricing."
      heroNotice="24/7 Flight Tracking & Guaranteed On-Time Airport Pickup"
      benefitsTitle="Why Choose Our Innova Airport Cabs"
      benefitsSubtitle="Enjoy a stress-free transition from baggage claim to your doorstep."
      benefits={benefits}
      routesTitle="Popular Airport Transfer Routes"
      routesSubtitle="Seamless airport connectivity to all prime Bangalore technology corridors."
      routes={airportRoutes.length > 0 ? airportRoutes : allRoutes.slice(0, 4)}
      allRoutes={allRoutes}
      vehicles={vehicles}
      localPackages={localPackages}
      faqs={faqs}
      showLocalAreas={true}
      localAreasTitle="Kempegowda Airport Taxi Coverage Across Bangalore Localities"
      customCtaTitle="Reserve Your Innova Airport Cab"
      serviceType="airport"
    />
  );
}

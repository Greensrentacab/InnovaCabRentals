import { Car, Clock, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';
import LandingTemplate from '@/components/LandingTemplate';
import { getVehicles, getRoutes, getLocalPackages } from '@/lib/dataService';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: `Local Innova Car Rental Bangalore | Hourly & Full Day Packages | ${siteConfig.brand.name}`,
  description:
    'Rent Toyota Innova, Innova Crysta and Maruti Suzuki Ertiga in Bangalore for local city travel. 8hr/80km full-day and 12hr/120km extended rental packages, custom durations on request, and point-to-point city transfers.',
};

export default async function LocalRidesPage() {
  const vehicles = await getVehicles();
  const allRoutes = await getRoutes();
  const localPackages = await getLocalPackages();

  const benefits = [
    {
      icon: Clock,
      title: 'Unlimited Multi-Stop Freedom',
      description: 'Retain the vehicle and driver for multiple errands, business meetings, family shopping, or social functions without booking separate rides.',
    },
    {
      icon: MapPin,
      title: 'Doorstep Pickup Anywhere in Bangalore',
      description: 'Chauffeur arrives at your residence, apartment gate, tech park campus, or hotel lobby at your scheduled time.',
    },
    {
      icon: ShieldCheck,
      title: 'Zero Peak Hour Surge',
      description: 'Unlike app aggregators, our hourly and full-day tariffs remain locked with zero sudden surge multipliers during peak office hours.',
    },
    {
      icon: Car,
      title: 'Air-Conditioned Comfort',
      description: 'Stay relaxed, cool, and productive in high Bangalore traffic with spacious captain seats, phone charging, and plush interiors.',
    },
  ];

  const faqs = [
    {
      q: 'What is included in the 8 Hour / 80 Km full day local package?',
      a: 'The package covers 8 continuous hours and up to 80 kilometers of city driving from your scheduled pickup time. Additional kilometers and extra hours are billed at a transparent nominal rate.',
    },
    {
      q: 'Can I use the local rental package for Bangalore Airport drops or pickups?',
      a: 'Yes, local packages can include an airport trip as long as the travel fits within the purchased hours and kilometer limit. Toll charges at the airport trumpet are paid by the customer.',
    },
    {
      q: 'Do you offer point-to-point one-way city transfers within Bangalore?',
      a: 'Yes! We offer direct one-way city transfers across all Bangalore localities (e.g. Electronic City to Whitefield, Indiranagar to Kengeri). Contact us on WhatsApp for instant point-to-point quotes.',
    },
    {
      q: 'Are parking fees and toll charges included in local packages?',
      a: 'Mall parking fees, tech park entry charges, and tollway charges (like Electronic City flyover or Airport expressway) are paid by the customer at actuals.',
    },
  ];

  return (
    <LandingTemplate
      breadcrumb="Local Rides"
      badge="Local City Hire & Hourly Packages"
      title="Local Innova Car Rental in Bangalore"
      subtitle="Chauffeur-driven Toyota Innova, Innova Crysta and Maruti Suzuki Ertiga rentals for point-to-point city transfers, full-day business meetings, and extended family outings."
      heroNotice="8 Hr & 12 Hr Packages • Custom Durations On Request • Zero Surge"
      benefitsTitle="Why Book a Full-Day Local Innova Rental"
      benefitsSubtitle="Enjoy the convenience of a dedicated chauffeur and spacious MPV at your disposal."
      benefits={benefits}
      routesTitle="Popular City Transit & Peripheral Routes"
      routesSubtitle="Door-to-door transit between major Bangalore technology parks and tourist spots."
      routes={allRoutes.slice(0, 4)}
      allRoutes={allRoutes}
      vehicles={vehicles}
      faqs={faqs}
      showLocalAreas={true}
      localAreasTitle="Bangalore Local Chauffeur Service Coverage"
      localPackages={localPackages}
      showPackages={true}
      customCtaTitle="Reserve Your Local Innova Rental"
      serviceType="local"
    />
  );
}

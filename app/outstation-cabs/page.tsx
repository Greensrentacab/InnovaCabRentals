import { MapPin, ShieldCheck, Compass, Users, HeartHandshake } from 'lucide-react';
import LandingTemplate from '@/components/LandingTemplate';
import { getVehicles, getRoutes, getLocalPackages } from '@/lib/dataService';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: `Outstation Innova Cabs Bangalore | Mysore, Coorg, Ooty, Wayanad | ${siteConfig.brand.name}`,
  description:
    'Book outstation round-trip Innova, Crysta and Ertiga cabs from Bangalore with up to 3 stops on the way. Seasoned highway drivers and transparent per-km billing; tolls paid by customer.',
};

export default async function OutstationCabsPage() {
  const vehicles = await getVehicles();
  const allRoutes = await getRoutes();
  const localPackages = await getLocalPackages();
  const outstationRoutes = allRoutes.filter((r) => !r.slug.includes('airport'));

  const benefits = [
    {
      icon: Compass,
      title: 'Highway & Ghat Specialists',
      description: 'Chauffeurs skilled with South Indian expressways, forest checkposts, wildlife reserves, and steep hill station hairpin curves.',
    },
    {
      icon: ShieldCheck,
      title: 'Supreme Ride Comfort',
      description: 'The legendary Toyota Innova ladder-frame chassis absorbs rough highway patches, ensuring zero travel fatigue for elders and kids.',
    },
    {
      icon: Users,
      title: 'Spacious Group Seating',
      description: 'Comfortably seats 6 to 7 passengers with generous legroom, individual AC vents, and deep reclining backrests.',
    },
    {
      icon: HeartHandshake,
      title: 'Transparent Per-Km Billing',
      description: 'Clear driver beta/allowance, state entry permits, and night charge calculations shared upfront before trip confirmation.',
    },
  ];

  const faqs = [
    {
      q: 'How are outstation cab fares calculated?',
      a: 'Outstation trips are billed on a transparent per-kilometre basis (with a standard 300 km/day minimum allowance) plus driver allowance. Tolls, parking and interstate permits are paid by the customer at actuals.',
    },
    {
      q: 'Can we stop for sightseeing, food, or coffee en route?',
      a: 'Yes, absolutely. Our drivers are courteous and flexible. You can pause at highway restaurants or popular roadside viewpoints without extra hassle.',
    },
    {
      q: 'Can I add stops on the way to my destination?',
      a: 'Yes. All outstation trips are round trips, and you can add up to 3 stops on the same route when booking — for example Srirangapatna on the way to Mysore. The car and chauffeur stay with you until you return to Bangalore.',
    },
    {
      q: 'Are interstate permits handled by your driver?',
      a: 'Yes, when traveling from Karnataka to Tamil Nadu (Ooty, Kodaikanal, Pondicherry) or Kerala (Wayanad), our chauffeurs assist with entry tax payments at border RTO counters.',
    },
  ];

  return (
    <LandingTemplate
      breadcrumb="Outstation Cabs"
      badge="Intercity & Hill Station Travel"
      title="Outstation Innova Cabs from Bangalore"
      subtitle="Chauffeur-driven Toyota Innova, Innova Crysta and Maruti Suzuki Ertiga rentals for scenic weekend getaways, family pilgrimages, and outstation holiday tours across South India."
      heroNotice="Verified Highway Chauffeurs • 300km/Day Minimum Allowance"
      benefitsTitle="Why Travel Outstation with Innova Cabs Bangalore"
      benefitsSubtitle="Enjoy unmatched highway reliability, safety, and scenic road trip freedom."
      benefits={benefits}
      routesTitle="Top Outstation Destinations from Bangalore"
      routesSubtitle="Click on any route below to view distance, driving duration, and route highlights."
      routes={outstationRoutes}
      allRoutes={allRoutes}
      vehicles={vehicles}
      localPackages={localPackages}
      faqs={faqs}
      showLocalAreas={false}
      customCtaTitle="Reserve Your Outstation Innova Cab"
      serviceType="outstation"
    />
  );
}

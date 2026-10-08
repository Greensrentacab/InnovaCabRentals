import { MessageCircle, Phone } from 'lucide-react';
import RoutesSearchList from '@/components/RoutesSearchList';
import PageHero from '@/components/ds/PageHero';
import CtaBand from '@/components/ds/CtaBand';
import { getRoutes, getVehicles } from '@/lib/dataService';
import { confirmedFleet, formatINR, routeFromFare } from '@/lib/storefrontData';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: `Popular Innova Cab Routes from Bangalore | Outstation Taxi | ${siteConfig.brand.name}`,
  description:
    'Search 30+ outstation round-trip routes from Bangalore — Coorg, Ooty, Mysore, Tirupati, Munnar, Gokarna, Kochi and more — in Innova, Crysta or Ertiga with seasoned chauffeurs.',
  keywords: [
    'Innova Cab Bangalore to Coorg',
    'Innova Cab Bangalore to Ooty',
    'Innova Cab Bangalore to Mysore',
    'Innova Cabs Bangalore',
    'Innova Rental Bangalore',
    'Innova Taxi Bangalore',
    'Outstation Innova Bangalore',
  ],
};

export default async function RoutesPage() {
  const [routes, vehicles] = await Promise.all([getRoutes(), getVehicles()]);
  const fleet = confirmedFleet(vehicles);
  const fromFares = Object.fromEntries(
    routes.map((r) => {
      const from = routeFromFare(r, fleet);
      return [r.slug, from ? formatINR(from) : 'On request'];
    })
  );

  return (
    <div className="bg-porcelain">
      <PageHero
        breadcrumbs={[{ label: 'Routes' }]}
        eyebrow="Searchable Highway & Outstation Corridors"
        title="Popular Outstation Cab Routes from Bangalore"
        lead={
          <>
            <p className="font-bold text-brand-700">{siteConfig.brand.closingLine}</p>
            <p className="mt-3">
              Explore South India&apos;s most popular highway road trips. Filter routes, check driving distance, travel
              durations, and reserve your chauffeur-driven Toyota Innova.
            </p>
          </>
        }
      >
        <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <a href={siteConfig.contact.phone.tel} className="btn-primary">
            <Phone className="h-4 w-4" /> {siteConfig.cta.instantBooking}
          </a>
          <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            <MessageCircle className="h-4 w-4" /> {siteConfig.cta.quickQuote}
          </a>
        </div>
      </PageHero>

      <section className="section pb-16 pt-4 sm:pb-20">
        <RoutesSearchList initialRoutes={routes} fromFares={fromFares} />
      </section>

      <CtaBand service="outstation" />
    </div>
  );
}

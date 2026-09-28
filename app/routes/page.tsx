import { Sparkles, Phone, MessageCircle } from 'lucide-react';
import RoutesSearchList from '@/components/RoutesSearchList';
import { getRoutes } from '@/lib/dataService';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: `Popular Innova Cab Routes from Bangalore | Outstation Taxi | ${siteConfig.brand.name}`,
  description:
    'Search popular outstation Innova and Crysta cab routes from Bangalore to Mysore, Coorg, Ooty, Wayanad, Chikmagalur, and Kodaikanal. Transparent per-km tariffs and seasoned chauffeurs.',
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
  const routes = await getRoutes();

  return (
    <div className="flex flex-col min-h-screen bg-brand-offwhite">
      {/* Header Banner */}
      <section className="bg-brand-navy text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-brand-orange border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Searchable Highway &amp; Outstation Corridors</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Popular Outstation Cab Routes from Bangalore
          </h1>

          <p className="text-lg text-brand-orange font-medium">
            {siteConfig.brand.closingLine}
          </p>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Explore South India&apos;s most popular highway road trips. Filter routes, check driving distance, travel durations, and reserve your chauffeur-driven Toyota Innova.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={siteConfig.contact.phone.tel}
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm shadow-md transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>{siteConfig.cta.instantBooking}</span>
            </a>

            <a
              href={siteConfig.contact.phone.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{siteConfig.cta.quickQuote}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Searchable Routes Grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <RoutesSearchList initialRoutes={routes} />
      </section>
    </div>
  );
}

import RoutesSearchList from '@/components/RoutesSearchList';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import CtaBand from '@/components/ds/CtaBand';
import { getRoutes, getVehicles } from '@/lib/dataService';
import { confirmedFleet, formatINR, routeFromFare } from '@/lib/storefrontData';
import { siteConfig } from '@/lib/siteConfig';
import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo({
  alternates: { canonical: '/routes' },
  title: 'Innova Cab Routes from Bangalore | Outstation Taxi Fares',
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
});

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
      {/* Route-map header: unlike the other inner pages, it shows Bangalore as the hub of the route network */}
      <section className="relative isolate overflow-hidden bg-[#0b1530] pb-12 pt-28 text-white sm:pb-16 sm:pt-36">
        <BreadcrumbJsonLd items={[{ label: 'Routes' }]} />
        <div className="pointer-events-none absolute -left-24 top-10 -z-10 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" aria-hidden="true" />
        <div className="section grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-14">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300">
              <span className="h-px w-8 bg-sky-300/70" aria-hidden="true" /> From Bangalore
            </p>
            <h1 className="text-balance mt-3 text-[2rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Pick a destination. <span className="text-sky-300">We&apos;ll drive.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-lg">
              Popular outstation routes from Bangalore with distance, travel time and round-trip fares upfront, in a
              chauffeur-driven Toyota Innova.
            </p>
            <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-6">
              {[
                { v: `${routes.length}`, l: 'Routes to choose from' },
                { v: '4', l: 'Car models' },
                { v: '24/7', l: 'Booking & dispatch' },
              ].map((x) => (
                <div key={x.l}>
                  <dt className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{x.v}</dt>
                  <dd className="mt-0.5 text-xs font-medium text-slate-400 sm:text-sm">{x.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Network sketch: Bangalore hub with lines out to popular destinations */}
          <svg viewBox="0 0 520 340" className="hidden h-auto w-full lg:block" fill="none" aria-hidden="true">
            <defs>
              <radialGradient id="hub" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#38bdf8" stopOpacity="0.5" />
                <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
              </radialGradient>
            </defs>
            {[
              [90, 70, 'Coorg'],
              [250, 40, 'Mysore'],
              [430, 80, 'Ooty'],
              [470, 220, 'Munnar'],
              [330, 300, 'Kochi'],
              [100, 250, 'Gokarna'],
              [40, 160, 'Hampi'],
            ].map(([x, y, label]) => (
              <g key={label as string}>
                <path d={`M260 170 Q ${(260 + (x as number)) / 2 + 20} ${(170 + (y as number)) / 2 - 30} ${x} ${y}`} stroke="rgba(125,211,252,0.45)" strokeWidth="1.4" strokeDasharray="4 6" />
                <circle cx={x as number} cy={y as number} r="5" fill="#0b1530" stroke="#7dd3fc" strokeWidth="2" />
                <text x={(x as number) + 10} y={(y as number) + 4} fill="rgba(226,232,240,0.9)" fontSize="13" fontWeight="600">
                  {label}
                </text>
              </g>
            ))}
            <circle cx="260" cy="170" r="60" fill="url(#hub)" />
            <circle cx="260" cy="170" r="11" fill="#2563eb" stroke="#fff" strokeWidth="3" />
            <text x="260" y="205" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="800">
              Bangalore
            </text>
          </svg>
        </div>
      </section>

      <section className="section pb-16 pt-4 sm:pb-20">
        <RoutesSearchList initialRoutes={routes} fromFares={fromFares} />
      </section>

      <CtaBand service="outstation" />
    </div>
  );
}

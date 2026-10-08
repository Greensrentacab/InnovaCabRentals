/**
 * ServicesSection.tsx — "Our services" grid (design.md §3.3) with real car photos.
 */

import Link from 'next/link';
import { ArrowRight, Check, Hourglass, Mountain, Plane, type LucideIcon } from 'lucide-react';
import Reveal from '@/components/home/Reveal';
import { PhotoCredit } from '@/components/ds/VehiclePhotoCard';
import { fleetPhotos, type FleetPhoto } from '@/lib/fleetPhotos';

export interface ServiceFares {
  airport: string | null;
  outstation: string | null;
  local: string | null;
}

interface ServiceCard {
  title: string;
  icon: LucideIcon;
  /** Real car photo (Wikimedia Commons, credited) */
  photo: FleetPhoto;
  badges: { label: string; tone: 'amber' | 'glass' }[];
  description: string;
  bullets: string[];
  fare: string | null;
  fareCaption: string;
  cta: string;
  href: string;
}

export default function ServicesSection({ fares }: { fares: ServiceFares }) {
  const cards: ServiceCard[] = [
    {
      title: 'Airport Transfers',
      icon: Plane,
      photo: fleetPhotos['innova-crysta'][0], // white Innova Crysta
      badges: [
        { label: '24/7', tone: 'amber' },
        { label: 'Flight Tracked', tone: 'glass' },
      ],
      description: 'Kempegowda International (BLR) pickups & drops, Terminal 1 and 2.',
      bullets: ['Airport fare quoted before you book', 'Meet-and-greet at arrivals', 'Live flight-delay monitoring'],
      fare: fares.airport,
      fareCaption: 'starting fare',
      cta: 'Airport taxi',
      href: '/airport-taxi',
    },
    {
      title: 'Outstation Trips',
      icon: Mountain,
      photo: fleetPhotos.innova[0], // white Toyota Innova
      badges: [{ label: 'Per-km billing', tone: 'glass' }],
      description: 'Weekend escapes to Mysore, Coorg, Ooty, Wayanad & beyond.',
      bullets: ['Transparent per-km fares, tolls paid by customer', 'Experienced hill-station chauffeurs', 'Multi-day round trips, up to 3 stops'],
      fare: fares.outstation,
      fareCaption: 'starting fare',
      cta: 'Outstation',
      href: '/outstation-cabs',
    },
    {
      title: 'Local Hourly Rentals',
      icon: Hourglass,
      photo: fleetPhotos.ertiga[0], // white Maruti Suzuki Ertiga
      badges: [{ label: '8 hr · 12 hr · custom', tone: 'glass' }],
      description: 'An Innova, Crysta or Ertiga with chauffeur on standby for your day in the city.',
      bullets: ['8 hr full-day & 12 hr extended hire', 'Business meetings, errands & shopping', 'Multiple stops, no re-booking'],
      fare: fares.local,
      fareCaption: '8 hr full-day package',
      cta: 'Local rentals',
      href: '/local-rides',
    },
  ];

  return (
    <section id="services" className="section scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Our services</span>
        <h2 className="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">One fleet. Every kind of trip.</h2>
        <p className="mt-3 text-slate-600">
          Chauffeur-driven Innova, Crysta &amp; Ertiga for every journey — whether you&apos;re catching a 5 AM flight or heading to the hills.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Reveal key={card.title} delay={i * 0.1} className="h-full">
              <article className="card-float card-float-hover group flex h-full flex-col overflow-hidden">
                <div className="relative h-44 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.photo.src}
                    alt={card.photo.alt}
                    width={card.photo.width}
                    height={card.photo.height}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/5 to-transparent" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
                    {card.badges.map((badge) =>
                      badge.tone === 'amber' ? (
                        <span key={badge.label} className="rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-extrabold text-amber-950 shadow">
                          {badge.label}
                        </span>
                      ) : (
                        <span key={badge.label} className="glass rounded-full px-2.5 py-1 text-[11px] font-bold text-slate-800">
                          {badge.label}
                        </span>
                      )
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-2.5 text-white">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30 backdrop-blur-md">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-xl font-extrabold tracking-tight">{card.title}</h3>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-sm text-slate-600">{card.description}</p>
                  <ul className="mt-4 space-y-2.5">
                    {card.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-live-500/10 text-live-600">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                    <span className="text-sm font-semibold text-slate-500">
                      {card.fare ? (
                        <>
                          <span className="text-lg font-extrabold text-ink">{card.fare}</span>
                          <span className="block text-[11px] uppercase tracking-wide">{card.fareCaption}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-base font-extrabold text-ink">Price on request</span>
                          <span className="block text-[11px] uppercase tracking-wide">quoted upfront</span>
                        </>
                      )}
                    </span>
                    <Link href={card.href} className="btn-ghost group/btn shrink-0 px-4 py-2.5">
                      {card.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                  <PhotoCredit photo={card.photo} className="mt-3 block" />
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

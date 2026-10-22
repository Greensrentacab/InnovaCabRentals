/**
 * ServicesSection.tsx — "Our services" grid (design.md §3.3). Each card header is a
 * photo carousel: by default the matching hero scene plus our own fleet photos;
 * the photos and their order are set in Admin → Homepage images.
 */

import Link from 'next/link';
import { ArrowRight, Check, Hourglass, Mountain, Plane, type LucideIcon } from 'lucide-react';
import Reveal from '@/components/home/Reveal';
import { cn } from '@/lib/cn';
import CardGallery from '@/components/ds/CardGallery';
import type { CarouselPhoto } from '@/components/home/PhotoCarousel';
import { DEFAULT_SITE_IMAGES, type HeroScene, type ResolvedImage } from '@/lib/siteImages';

const toPhotos = (images: ResolvedImage[]): CarouselPhoto[] =>
  images.map(({ src, alt, width, height, position }) => ({ src, alt, width, height, position }));

export interface ServiceFares {
  airport: string | null;
  outstation: string | null;
  local: string | null;
}

interface ServiceCard {
  title: string;
  icon: LucideIcon;
  /** Carousel photos (Admin → Homepage images) */
  photos: CarouselPhoto[];
  badges: { label: string; tone: 'amber' | 'glass' }[];
  description: string;
  bullets: string[];
  fare: string | null;
  fareCaption: string;
  cta: string;
  href: string;
}

export default function ServicesSection({
  fares,
  galleries = DEFAULT_SITE_IMAGES.services,
}: {
  fares: ServiceFares;
  /** Card photos per service (published in Admin → Homepage images) */
  galleries?: Record<HeroScene, ResolvedImage[]>;
}) {
  const cards: ServiceCard[] = [
    {
      title: 'Airport Transfers',
      icon: Plane,
      photos: toPhotos(galleries.airport),
      badges: [
        { label: '24/7', tone: 'amber' },
        { label: 'Flight Tracked', tone: 'glass' },
      ],
      description: 'Kempegowda International (BLR) pickups & drops, Terminal 1 and 2.',
      bullets: ['Airport fare quoted before you book', 'Meet-and-greet at arrivals', 'Live flight-delay monitoring'],
      fare: fares.airport,
      fareCaption: 'starting fare',
      cta: 'Airport taxi',
      href: '/bangalore-airport-taxi',
    },
    {
      title: 'Outstation Trips',
      icon: Mountain,
      photos: toPhotos(galleries.outstation),
      badges: [{ label: 'Per-km billing', tone: 'glass' }],
      description: 'Weekend escapes to Mysore, Coorg, Ooty, Wayanad & beyond.',
      bullets: ['Transparent per-km fares, tolls paid by customer', 'Experienced hill-station chauffeurs', 'Multi-day round trips, up to 3 stops'],
      fare: fares.outstation,
      fareCaption: 'starting fare',
      cta: 'Outstation',
      href: '/bangalore-outstation-cab-service',
    },
    {
      title: 'Local & Hourly Rentals',
      icon: Hourglass,
      photos: toPhotos(galleries.local),
      badges: [{ label: '8 hr · 12 hr · custom', tone: 'glass' }],
      description: 'An Innova, Crysta or Ertiga with chauffeur on standby for your day in the city.',
      bullets: ['8 hr & 12 hr packages', 'Business meetings, errands & shopping', 'Multiple stops, no re-booking'],
      fare: fares.local,
      fareCaption: '8 hr / 80 km package',
      cta: 'Local rentals',
      href: '/bangalore-local-city-taxi',
    },
  ];

  return (
    <section id="services" className="section scroll-mt-24 pb-10 pt-8 sm:pb-20 sm:pt-10">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Our services</span>
        <h2 className="section-title mt-3 sm:mt-4">One fleet. Every kind of trip.</h2>
        <p className="mt-3 text-slate-600">
          Chauffeur-driven Innova, Crysta, Hycross &amp; Ertiga for every journey — whether you&apos;re catching a 5 AM flight or heading to the hills.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-12 md:grid-cols-3 md:gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Reveal key={card.title} delay={i * 0.1} className={cn('h-full', i === cards.length - 1 && cards.length % 2 === 1 && 'col-span-2 md:col-span-1')}>
              <article className="card-float card-float-hover group flex h-full flex-col overflow-hidden">
                <CardGallery photos={card.photos} label={`${card.title} photos`} href={card.href} delay={i * 1300} className={cn('md:h-48', i === cards.length - 1 && cards.length % 2 === 1 ? 'aspect-[5/2] sm:aspect-[2/1]' : 'aspect-[4/3] sm:aspect-square', 'md:aspect-auto')}>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/5 to-transparent" />
                  <div className="pointer-events-none absolute left-4 top-4 z-[6] flex flex-wrap gap-1.5 max-md:hidden">
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
                  <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-[6] flex items-center gap-2 text-white md:bottom-4 md:left-4 md:gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/30 backdrop-blur-md md:h-10 md:w-10 md:rounded-xl">
                      <Icon className="h-4 w-4 md:h-5 md:w-5" />
                    </span>
                    <h3 className="text-[13px] font-extrabold leading-tight tracking-tight md:text-xl">{card.title}</h3>
                  </div>
                </CardGallery>

                <div className="flex flex-1 flex-col p-3 md:p-5">
                  <p className="text-[13px] leading-snug text-slate-600 max-md:line-clamp-2 md:text-sm">{card.description}</p>
                  <ul className="mt-4 hidden space-y-2.5 md:block">
                    {card.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-live-500/10 text-live-600">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <div className={cn('mt-auto flex gap-2.5 pt-2 md:flex-row md:items-center md:justify-between md:gap-3 md:pt-6', i === cards.length - 1 && cards.length % 2 === 1 ? 'flex-row items-center justify-between' : 'flex-col')}>
                    <span className="text-sm font-semibold text-slate-500">
                      {card.fare ? (
                        <>
                          <span className="text-base font-extrabold text-ink md:text-lg">{card.fare}</span>
                          <span className="block text-[11px] uppercase tracking-wide">{card.fareCaption}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-base font-extrabold text-ink">Price on request</span>
                          <span className="block text-[11px] uppercase tracking-wide">quoted upfront</span>
                        </>
                      )}
                    </span>
                    <Link href={card.href} className="btn-ghost group/btn shrink-0 !min-h-0 justify-center px-3 py-2 text-[13px] md:px-4 md:py-2.5 md:text-sm">
                      {card.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

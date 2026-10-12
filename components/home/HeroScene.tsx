'use client';

/**
 * HeroScene.tsx — homepage hero picture that follows the booking widget's
 * service tab (cross-fade):
 *   Airport    → Innova Hycross at Bangalore airport
 *   Outstation → Toyota Innova on a hill highway
 *   Local      → Innova Crysta at Vidhana Soudha, Bangalore
 * AI-generated scenes supplied by the client. Shown clear — no wash over the car.
 *   HeroBackdrop: desktop, whole picture across the top of the hero (car on the right).
 *   HeroBand:     mobile/tablet, picture behind the heading with the car bottom-right.
 * Each variant only loads its pictures at its own screen width.
 */

import { useEffect, useState } from 'react';
import { SERVICE_EVENT, type HomeService } from '@/components/home/scrollToBook';
import { cn } from '@/lib/cn';

interface Scene {
  name: string;
  alt: string;
  /** object-position on desktop (keeps the car in view on the right) */
  pos: string;
}

const SCENES: Record<HomeService, Scene> = {
  airport: {
    name: 'airport',
    alt: 'White Toyota Innova Hycross waiting at the Bangalore airport terminal',
    pos: '100% 70%',
  },
  outstation: {
    name: 'outstation',
    alt: 'Silver Toyota Innova on a hill highway through tea plantations',
    pos: '100% 60%',
  },
  local: {
    name: 'local',
    alt: 'Silver Toyota Innova Crysta parked near Vidhana Soudha, Bangalore',
    pos: '100% 70%',
  },
};

const ORDER: HomeService[] = ['airport', 'outstation', 'local'];

const srcFor = (s: Scene, w: 960 | 1920) => `/images/hero/hero-${s.name}-${w}.webp`;

function useHeroService() {
  const [service, setService] = useState<HomeService>('airport');
  useEffect(() => {
    const onChange = (e: Event) => {
      const next = (e as CustomEvent<HomeService>).detail;
      if (next && next in SCENES) setService(next);
    };
    window.addEventListener(SERVICE_EVENT, onChange);
    return () => window.removeEventListener(SERVICE_EVENT, onChange);
  }, []);
  return service;
}

/** true ≥1024px, false below, null until known (so nothing loads twice). */
function useIsDesktop() {
  const [wide, setWide] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return wide;
}

function SceneImages({ service, desktop, imgClass }: { service: HomeService; desktop?: boolean; imgClass?: string }) {
  return (
    <>
      {ORDER.map((key) => {
        const s = SCENES[key];
        const on = key === service;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={key}
            src={srcFor(s, desktop ? 1920 : 960)}
            srcSet={`${srcFor(s, 960)} 960w, ${srcFor(s, 1920)} 1920w`}
            sizes="100vw"
            alt={on ? s.alt : ''}
            aria-hidden={!on}
            width={1920}
            height={1071}
            fetchPriority={key === 'airport' ? 'high' : 'low'}
            decoding="async"
            style={desktop ? { objectPosition: s.pos } : undefined}
            className={cn(
              imgClass ?? 'absolute inset-0 h-full w-full object-cover',
              'transition-opacity duration-700 ease-premium',
              on ? 'opacity-100' : 'opacity-0'
            )}
          />
        );
      })}
    </>
  );
}

/** Desktop: full-bleed picture behind the hero. Light only behind the copy on the left. */
export function HeroBackdrop({ className }: { className?: string }) {
  const service = useHeroService();
  const wide = useIsDesktop();
  return (
    <div className={cn('pointer-events-none absolute overflow-hidden bg-sky-100', className)}>
      {wide === true && <SceneImages service={service} desktop />}
      <div className="absolute inset-y-0 left-0 w-[46%] bg-gradient-to-r from-white/80 via-white/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-porcelain" />
    </div>
  );
}

/**
 * Mobile/tablet band behind the header and heading: soft sky on top for the
 * text, the picture anchored bottom-right so the car shows clearly below it.
 */
export function HeroBand({ className }: { className?: string }) {
  const service = useHeroService();
  const wide = useIsDesktop();
  return (
    <div className={cn('pointer-events-none absolute overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-sky-100', className)}>
      <div className="absolute bottom-0 right-0 aspect-[1920/1071] w-[160%] max-w-none [mask-image:linear-gradient(to_bottom,transparent,#000_30%)] sm:w-[110%]">
        {wide === false && <SceneImages service={service} />}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-porcelain" />
    </div>
  );
}

const COPY: Record<HomeService, { title: string; lead: string }> = {
  airport: {
    title: 'Innova Airport Taxi',
    lead: 'Book Bangalore airport transfers with professional drivers and comfortable Ertiga, Innova, Crysta, and Hycross cabs. Reliable airport pickup and drop services.',
  },
  outstation: {
    title: 'Innova Outstation Cabs',
    lead: 'Book outstation round trips from Bangalore with professional drivers and comfortable Ertiga, Innova, Crysta, and Hycross cabs. Reliable trips to hill stations, temples and beyond.',
  },
  local: {
    title: 'Innova Local & Hourly Cabs',
    lead: 'Book local and hourly cab rentals in Bangalore with professional drivers and comfortable Ertiga, Innova, Crysta, and Hycross cabs. Flexible 8 hr, 12 hr and custom packages.',
  },
};

/** Hero heading that follows the tab. Server HTML always has the main (airport) heading for SEO. */
export function HeroTitle() {
  const service = useHeroService();
  return (
    <>
      {COPY[service].title} <span className="text-brand-700">Bangalore</span>
    </>
  );
}

export function HeroLead() {
  const service = useHeroService();
  return <>{COPY[service].lead}</>;
}

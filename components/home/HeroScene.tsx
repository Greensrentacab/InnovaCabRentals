'use client';

/**
 * HeroScene.tsx — homepage hero picture that follows the booking widget's
 * service tab (cross-fade):
 *   Airport    → Innova Hycross at Bangalore airport
 *   Outstation → Toyota Innova on a hill highway
 *   Local      → Innova Crysta at Vidhana Soudha, Bangalore
 * AI-generated scenes supplied by the client. Shown clear — no wash over the car.
 *   HeroBand: picture behind the heading with the car bottom-right (all sizes);
 *   the booking form sits beside it on desktop.
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

function SceneImages({ service, only, pos }: { service: HomeService; only?: HomeService; pos?: string }) {
  return (
    <>
      {ORDER.filter((key) => !only || key === only).map((key) => {
        const s = SCENES[key];
        const on = key === service;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={key}
            src={srcFor(s, 960)}
            srcSet={`${srcFor(s, 960)} 960w, ${srcFor(s, 1920)} 1920w`}
            sizes="(min-width: 1024px) 60vw, 160vw"
            alt={on ? s.alt : ''}
            aria-hidden={!on}
            width={1920}
            height={1071}
            fetchPriority={key === service ? 'high' : 'low'}
            decoding="async"
            style={{ objectPosition: pos ?? s.pos }}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-premium',
              on ? 'opacity-100' : 'opacity-0'
            )}
          />
        );
      })}
    </>
  );
}

/**
 * Picture band behind the hero copy (all screen sizes): soft sky on top for
 * the text, the picture anchored bottom-right so the car shows clearly below
 * it. On the homepage it follows the booking tab; landing pages pass `scene`.
 */
export function HeroBand({ className, scene, flip, plain, cover }: { className?: string; scene?: HomeService; flip?: boolean; plain?: boolean; cover?: boolean }) {
  const tab = useHeroService();
  const service = scene ?? tab;
  return (
    <div className={cn('pointer-events-none absolute overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-sky-100', className)}>
      <div
        className={cn(
          'absolute max-w-none',
          // Default: picture anchored bottom-right, sized by its own aspect ratio
          !plain && !cover && 'bottom-0 right-0 aspect-[1920/1071] w-[160%] [mask-image:linear-gradient(to_bottom,transparent,#000_30%)] sm:w-[110%]',
          // Cover: fills the band (e.g. 4:5 on phones); heading area fades into the sky so the copy stays readable
          cover && 'inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,transparent_38%,#000_80%)]',
          plain && 'inset-0 h-full w-full',
          !plain && 'lg:inset-auto lg:bottom-0 lg:right-0 lg:h-auto lg:aspect-[1920/1071] lg:w-full lg:[mask-image:linear-gradient(to_bottom,transparent,#000_28%)]',
          flip && 'lg:-scale-x-100'
        )}
      >
        <SceneImages service={service} only={scene} />
      </div>
      {/* Readability scrim behind the heading + copy (left, top part only) so the car stays clear */}
      {plain && (
        <div
          className="absolute left-0 top-0 h-[68%] w-[68%] bg-gradient-to-r from-white/90 via-white/70 to-transparent [mask-image:linear-gradient(to_bottom,#000_72%,transparent)]"
          aria-hidden="true"
        />
      )}
      {!plain && <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-porcelain" />}
      {!plain && <div className={cn('absolute inset-y-0 hidden w-16 from-transparent to-porcelain lg:block', flip ? 'left-0 bg-gradient-to-l' : 'right-0 bg-gradient-to-r')} />}
    </div>
  );
}

/**
 * Hero picture in the page flow, right under the subheading, so text never
 * sits on the car (phones/tablets). Top edge fades into the sky background;
 * phones crop to 4:3 so the car shows larger. Follows the booking tab unless
 * a fixed `scene` is passed. `children` overlay the bottom (trust strip).
 */
export function HeroPicture({
  className,
  scene,
  children,
}: {
  className?: string;
  scene?: HomeService;
  children?: React.ReactNode;
}) {
  const tab = useHeroService();
  const service = scene ?? tab;
  return (
    <div className={cn('relative', className)}>
      <div className="relative aspect-[4/3] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_20%)] sm:aspect-[1920/1071]">
        <SceneImages service={service} only={scene} pos="88% 72%" />
      </div>
      {children}
    </div>
  );
}

/**
 * Phones/tablets: full-bleed picture behind the hero copy with a blue gradient
 * from the top so white text stays readable; the car shows clearly below it.
 * Fills its (relative) parent.
 */
export function HeroCover({ className, scene }: { className?: string; scene?: HomeService }) {
  const tab = useHeroService();
  const service = scene ?? tab;
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden bg-slate-900', className)} aria-hidden="true">
      <SceneImages service={service} only={scene} pos="88% 72%" />
      {/* Portrait airport picture made for phones (sky on top for the copy, car at the bottom) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero/hero-airport-mobile.webp"
        alt=""
        width={768}
        height={1376}
        fetchPriority="high"
        decoding="async"
        style={{ objectPosition: '50% 100%' }}
        className={cn(
          'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-premium',
          service === 'airport' ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 via-60% to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 to-transparent" />
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
      {COPY[service].title} <span className="text-sky-300 lg:text-brand-700">Bangalore</span>
    </>
  );
}

export function HeroLead() {
  const service = useHeroService();
  return <>{COPY[service].lead}</>;
}

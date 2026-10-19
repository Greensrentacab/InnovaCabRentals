'use client';

/**
 * HeroScene.tsx — homepage hero picture that follows the booking widget's
 * service tab (cross-fade):
 *   Airport    → Innova Hycross at Bangalore airport
 *   Outstation → Toyota Innova on a hill highway
 *   Local      → Innova Crysta at Vidhana Soudha, Bangalore
 * AI-generated scenes supplied by the client. Shown clear — no wash over the car.
 * Each scene can be replaced in Admin → Homepage images (desktop picture plus
 * an optional phone picture); pages pass the published set as `images`.
 *   HeroBand: picture behind the heading with the car bottom-right (all sizes);
 *   the booking form sits beside it on desktop.
 */

import { useEffect, useState } from 'react';
import { BadgeIndianRupee, Radar, ShieldCheck, Users } from 'lucide-react';
import { SERVICE_EVENT, type HomeService } from '@/components/home/scrollToBook';
import { cn } from '@/lib/cn';
// Type-only: lib/siteImages pulls in zod, which must stay out of the storefront bundle
import type { SiteImagesView } from '@/lib/siteImages';

export type HeroImages = SiteImagesView['hero'];

/** Default object-position per scene (keeps the car in view on the right) when no focal point is set */
const SCENE_POS: Record<HomeService, string> = {
  airport: '100% 70%',
  outstation: '100% 60%',
  local: '100% 70%',
};

const ORDER: HomeService[] = ['airport', 'outstation', 'local'];

function useHeroService() {
  const [service, setService] = useState<HomeService>('airport');
  useEffect(() => {
    const onChange = (e: Event) => {
      const next = (e as CustomEvent<HomeService>).detail;
      if (next && next in SCENE_POS) setService(next);
    };
    window.addEventListener(SERVICE_EVENT, onChange);
    return () => window.removeEventListener(SERVICE_EVENT, onChange);
  }, []);
  return service;
}

function SceneImages({
  service,
  only,
  pos,
  images,
  mirror,
  skip,
}: {
  service: HomeService;
  only?: HomeService;
  pos?: string;
  images: HeroImages;
  /** Desktop: flip pictures marked "mirror" (the built-in scenes face left there) */
  mirror?: boolean;
  /** Scenes not to draw (e.g. ones that have their own phone picture) */
  skip?: (key: HomeService) => boolean;
}) {
  return (
    <>
      {ORDER.filter((key) => (!only || key === only) && !skip?.(key)).map((key) => {
        const img = images[key].desktop;
        const on = key === service;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={key}
            src={img.src}
            srcSet={img.srcSet}
            sizes="(min-width: 1024px) 60vw, 160vw"
            alt={on ? img.alt : ''}
            aria-hidden={!on}
            width={img.width}
            height={img.height}
            fetchPriority={key === service ? 'high' : 'low'}
            decoding="async"
            style={{ objectPosition: img.position ?? pos ?? SCENE_POS[key] }}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-premium',
              mirror && img.mirror && '-scale-x-100',
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
export function HeroBand({
  className,
  scene,
  flip,
  plain,
  cover,
  images,
}: {
  className?: string;
  scene?: HomeService;
  flip?: boolean;
  plain?: boolean;
  cover?: boolean;
  images: HeroImages;
}) {
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
        <SceneImages service={service} only={scene} images={images} />
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
  images,
}: {
  className?: string;
  scene?: HomeService;
  children?: React.ReactNode;
  images: HeroImages;
}) {
  const tab = useHeroService();
  const service = scene ?? tab;
  return (
    <div className={cn('relative', className)}>
      <div className="relative aspect-[4/3] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_20%)] sm:aspect-[1920/1071]">
        <SceneImages service={service} only={scene} pos="88% 72%" images={images} />
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
export function HeroCover({
  className,
  scene,
  desktop,
  images,
}: {
  className?: string;
  scene?: HomeService;
  desktop?: boolean;
  /** From getSiteImages(): Admin → Homepage images over the built-in scenes */
  images: HeroImages;
}) {
  const tab = useHeroService();
  const service = scene ?? tab;
  if (desktop) {
    // Desktop: landscape picture across the whole hero (car on the left), dark wash
    // from the top-left so white copy reads, booking card on the right.
    return (
      <div className={cn('pointer-events-none absolute inset-0 overflow-hidden bg-slate-900', className)} aria-hidden="true">
        <div className="absolute inset-0">
          <SceneImages service={service} only={scene} pos="100% 70%" images={images} mirror />
        </div>
        {/* Soft navy shade on the copy side only, so white text is readable and the car stays bright */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/35 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-slate-950/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/45 to-transparent" />
      </div>
    );
  }
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden bg-slate-900', className)} aria-hidden="true">
      {/* Landscape pictures, cropped, for scenes without their own phone picture */}
      <SceneImages service={service} only={scene} pos="88% 72%" images={images} skip={(key) => Boolean(images[key].mobile)} />
      {/* Portrait pictures made for phones (sky on top for the copy, car at the bottom), kept bright; a light wash plus a text shadow keep the copy readable */}
      {ORDER.filter((key) => (!scene || key === scene) && images[key].mobile).map((key) => {
        const img = images[key].mobile!;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={key}
            src={img.src}
            srcSet={img.srcSet}
            sizes="100vw"
            alt=""
            width={img.width}
            height={img.height}
            fetchPriority={key === service ? 'high' : 'low'}
            decoding="async"
            style={{ objectPosition: img.position ?? '50% 100%' }}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-premium',
              key === service ? 'opacity-100' : 'opacity-0'
            )}
          />
        );
      })}
      {/* Soft navy shade at the top and bottom so white copy stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/50 via-55% to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/45 to-transparent" />
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
      {COPY[service].title} <span className="text-sky-300">Bangalore</span>
    </>
  );
}

export function HeroLead() {
  const service = useHeroService();
  return <>{COPY[service].lead}</>;
}

/**
 * Hero trust points. "Flight tracking" only applies to airport trips, so it
 * is hidden while the Outstation or Local & Hourly tab is selected.
 */
export function HeroTrustList({ className, itemClassName, extraLabel }: { className?: string; itemClassName?: string; extraLabel?: string }) {
  const service = useHeroService();
  const items = [
    { icon: ShieldCheck, tone: 'text-emerald-300', label: 'Verified drivers' },
    ...(service === 'airport' ? [{ icon: Radar, tone: 'text-sky-300', label: 'Flight tracking' }] : []),
    { icon: BadgeIndianRupee, tone: 'text-sky-300', label: 'Transparent price' },
    ...(extraLabel ? [{ icon: Users, tone: 'text-sky-300', label: extraLabel }] : []),
  ];
  return (
    <ul className={className}>
      {items.map(({ icon: Icon, tone, label }) => (
        <li key={label} className={cn('flex items-center gap-2', itemClassName)}>
          <Icon className={cn('h-[18px] w-[18px] shrink-0', tone)} /> {label}
        </li>
      ))}
    </ul>
  );
}

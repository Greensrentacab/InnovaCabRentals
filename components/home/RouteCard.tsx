/**
 * RouteCard.tsx — design.md §3.3 "Route card" with a destination photo.
 * Used by the homepage slider and the route grids on service landing pages.
 */

import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Plane, Route } from 'lucide-react';
import type { ResolvedImage } from '@/lib/siteImages';

export interface SliderRoute {
  slug: string;
  isAirport: boolean;
  from: string;
  title: string;
  distanceKm: number;
  durationText: string;
  highlights: string;
  /** Lowest fare across the fleet, or "On request" */
  fromFare: string;
  fareLabel: string;
  footnote: string;
  /** Built-in destination photo or the one published in Admin → Homepage images */
  photo?: Pick<ResolvedImage, 'src' | 'srcSet' | 'alt' | 'position'>;
}

export default function RouteCard({ route }: { route: SliderRoute }) {
  const Icon = route.isAirport ? Plane : MapPin;
  return (
    <Link
      href={`/routes/${route.slug}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition-colors duration-300 hover:border-slate-300"
    >
      {/* Photo with the destination written on it */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
        {route.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={route.photo.src}
            srcSet={route.photo.srcSet}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            alt={route.photo.alt}
            width={800}
            height={500}
            style={{ objectPosition: route.photo.position }}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent" />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[10px] md:left-3 md:top-3 md:px-2 md:py-1 md:text-[11px] font-bold text-ink shadow-sm">
          <Icon className="h-3 w-3 shrink-0 text-brand-600" />
          {route.isAirport ? 'Airport transfer' : 'Round trip'}
        </span>
        <div className="absolute inset-x-2.5 bottom-2 text-white md:inset-x-3 md:bottom-3">
          <p className="truncate text-[10px] font-medium text-white/80 md:text-xs">From {route.from}</p>
          <h3 className="truncate text-base font-extrabold leading-tight md:text-xl tracking-tight">{route.title}</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2.5 md:p-4">
        {/* Trip facts */}
        <div className="flex items-center gap-2 text-[11px] font-semibold md:gap-4 [&>span]:min-w-0 md:text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 whitespace-nowrap md:gap-1.5">
            <Route className="h-3 w-3 shrink-0 text-slate-400 md:h-3.5 md:w-3.5" /> ~{route.distanceKm} km
          </span>
          <span className="h-3 w-px bg-slate-200" aria-hidden="true" />
          <span className="inline-flex items-center gap-1 whitespace-nowrap md:gap-1.5">
            <Clock className="h-3 w-3 shrink-0 text-slate-400 md:h-3.5 md:w-3.5" /> ~
            <span className="md:hidden">{route.durationText.replace(/\s*hrs?\b/i, 'h').replace(/\s*mins?\b/i, 'm')}</span>
            <span className="max-md:hidden">{route.durationText}</span>
          </span>
        </div>

        {/* Price + action */}
        <div className="mt-auto pt-2 md:pt-3.5">
        <div className="flex items-end justify-between gap-2 border-t border-slate-100 pt-2 md:gap-3 md:pt-3.5">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-medium text-slate-500 md:text-[11px]">{route.fareLabel}</p>
            <p className="text-base font-extrabold leading-tight tabular-nums md:text-xl text-ink">{route.fromFare}</p>
            <p className="hidden truncate text-[11px] text-slate-400 md:block">{route.footnote}</p>
          </div>
          <span
            className="flex h-8 w-8 shrink-0 items-center md:h-10 md:w-10 justify-center rounded-full bg-brand-600 text-white transition-colors group-hover:bg-brand-700"
            aria-hidden="true"
          >
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
        </div>
      </div>
    </Link>
  );
}

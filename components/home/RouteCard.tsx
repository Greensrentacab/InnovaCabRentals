/**
 * RouteCard.tsx — design.md §3.3 "Route card" with a destination photo.
 * Used by the homepage slider and the route grids on service landing pages.
 */

import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Plane, Route } from 'lucide-react';
import type { RoutePhoto } from '@/lib/routePhotos';

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
  photo?: RoutePhoto;
}

export default function RouteCard({ route }: { route: SliderRoute }) {
  const Icon = route.isAirport ? Plane : MapPin;
  return (
    <Link
      href={`/routes/${route.slug}`}
      className="card-float card-float-hover group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl text-left"
    >
      {/* Photo with the destination written on it */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
        {route.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={route.photo.src}
            alt={route.photo.alt}
            width={800}
            height={500}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-bold text-ink shadow-sm">
          <Icon className="h-3 w-3 shrink-0 text-brand-600" />
          {route.isAirport ? 'Airport transfer' : 'Round trip'}
        </span>
        <div className="absolute inset-x-3 bottom-3 text-white">
          <p className="truncate text-xs font-medium text-white/80">From {route.from}</p>
          <h3 className="truncate text-xl font-extrabold leading-tight tracking-tight">{route.title}</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {/* Trip facts */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Route className="h-3.5 w-3.5 text-slate-400" /> ~{route.distanceKm} km
          </span>
          <span className="h-3 w-px bg-slate-200" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" /> ~{route.durationText}
          </span>
        </div>

        {/* Price + action */}
        <div className="mt-auto pt-3.5">
        <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-3.5">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-500">{route.fareLabel}</p>
            <p className="text-xl font-extrabold leading-tight tabular-nums text-ink">{route.fromFare}</p>
            <p className="truncate text-[11px] text-slate-400">{route.footnote}</p>
          </div>
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-colors group-hover:bg-brand-700"
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

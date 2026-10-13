/**
 * RouteCard.tsx — design.md §3.3 "Route card" with a destination photo.
 * Used by the homepage slider and the route grids on service landing pages.
 */

import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Plane } from 'lucide-react';
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
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
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
        <span className="absolute left-2.5 top-2.5 inline-flex max-w-[calc(100%-20px)] items-center gap-1 truncate rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink shadow-sm backdrop-blur">
          <Icon className="h-3 w-3 shrink-0 text-brand-600" /> ~{route.distanceKm} km
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="truncate text-xs font-semibold text-slate-500">{route.from} →</p>
        <h3 className="truncate text-lg font-extrabold tracking-tight">{route.title}</h3>
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="h-3 w-3" /> ~{route.durationText}
        </p>
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{route.fareLabel}</p>
          <p className="text-sm font-extrabold tabular-nums">{route.fromFare}</p>
          <p className="mt-0.5 text-[10px] font-medium text-slate-400">{route.footnote}</p>
        </div>
        <span className="mt-auto pt-3">
          <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50/60 px-3 py-2 text-xs font-bold text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
            View details <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </span>
      </div>
    </Link>
  );
}

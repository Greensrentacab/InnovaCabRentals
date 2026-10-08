/**
 * RouteCard.tsx — design.md §3.3 "Route card". Used by the homepage slider
 * and the route grids on service landing pages.
 */

import Link from 'next/link';
import { ArrowUpRight, Clock, MapPin, Plane } from 'lucide-react';

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
}

export default function RouteCard({ route }: { route: SliderRoute }) {
  const Icon = route.isAirport ? Plane : MapPin;
  return (
    <Link
      href={`/routes/${route.slug}`}
      className="card-float card-float-hover group flex h-full min-w-0 flex-col rounded-2xl p-4 text-left"
    >
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span className="flex min-w-0 items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 shrink-0 text-brand-600" />
          <span className="truncate">{route.from} →</span>
        </span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600" />
      </div>
      <h3 className="mt-1 truncate text-lg font-extrabold tracking-tight">{route.title}</h3>
      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        ~{route.distanceKm} km
        <span className="h-1 w-1 rounded-full bg-slate-300" />
        <Clock className="h-3 w-3" /> ~{route.durationText}
      </p>
      <p className="mb-3 mt-2 truncate text-xs text-slate-400">{route.highlights}</p>
      <div className="mt-auto border-t border-slate-100 pt-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{route.fareLabel}</p>
        <p className="text-sm font-extrabold tabular-nums">{route.fromFare}</p>
      </div>
      <p className="mt-1 text-[10px] font-medium text-slate-400">{route.footnote}</p>
    </Link>
  );
}

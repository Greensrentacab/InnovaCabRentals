'use client';

/**
 * RoutesSearchList.tsx — searchable route grid (design.md §3.3 route card,
 * §3.2.7 quick-pick chips, search bar rounded-3xl). Filtering unchanged.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, MapPin, MessageCircle, Plane, Search, X } from 'lucide-react';
import { Route, RouteCategory } from '@/lib/types';
import { siteConfig } from '@/lib/siteConfig';
import { cn } from '@/lib/cn';

interface RoutesSearchListProps {
  initialRoutes: Route[];
  /** Lowest round-trip fare per route slug (from admin car rates) */
  fromFares: Record<string, string>;
}

type Filter = 'all' | RouteCategory;

export default function RoutesSearchList({ initialRoutes, fromFares }: RoutesSearchListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<Filter>('all');

  const filteredRoutes = useMemo(() => {
    let result = initialRoutes;

    // Filter by category
    if (selectedFilter !== 'all') {
      result = result.filter((r) => r.category === selectedFilter);
    }

    // Filter by search text
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.destination.toLowerCase().includes(query) ||
          r.origin.toLowerCase().includes(query) ||
          r.slug.toLowerCase().includes(query) ||
          (r.description && r.description.toLowerCase().includes(query))
      );
    }

    return result;
  }, [initialRoutes, searchQuery, selectedFilter]);

  const count = (c: RouteCategory) => initialRoutes.filter((r) => r.category === c).length;
  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: `All Routes (${initialRoutes.length})` },
    { value: 'hills', label: `Hill Stations (${count('hills')})` },
    { value: 'temples', label: `Temples & Pilgrimage (${count('temples')})` },
    { value: 'heritage', label: `Heritage & Wildlife (${count('heritage')})` },
    { value: 'coast', label: `Beaches & Coast (${count('coast')})` },
    { value: 'airport', label: 'Airport Transfers' },
  ];

  return (
    <div>
      {/* Search & filter controls */}
      <div className="glass-strong rounded-3xl p-4 shadow-float-lg sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destination, city, or route (e.g. Coorg, Mysore, Ooty, Airport)..."
            aria-label="Search routes"
            className="field pl-11 pr-11"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="no-scrollbar -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1" role="radiogroup" aria-label="Route category">
          {filters.map((f) => {
            const selected = selectedFilter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setSelectedFilter(f.value)}
                className={cn(
                  'pill shrink-0 whitespace-nowrap transition hover:border-brand-300 hover:text-brand-700',
                  selected && 'border-brand-300 bg-brand-50 text-brand-700'
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Routes grid */}
      {filteredRoutes.length > 0 ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRoutes.map((route) => {
            const isAirport = route.slug.includes('airport');
            const Icon = isAirport ? Plane : MapPin;
            const whatsappRouteUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
              `Hello ${siteConfig.brand.name}, I would like a round-trip quote for the ${route.name} cab.`
            )}`;

            return (
              <article key={route.id} className="card-float card-float-hover flex h-full flex-col rounded-2xl p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-brand-600" />
                  <span className="truncate">{route.origin} →</span>
                </p>
                <h3 className="mt-1 text-lg font-extrabold tracking-tight">{route.name}</h3>
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  ~{route.distanceKm} km
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <Clock className="h-3 w-3" /> ~{route.durationText}
                </p>
                <p className="mb-3 mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {route.description ||
                    `Comfortable chauffeur-driven Toyota Innova road trip between ${route.origin} and ${route.destination}. Experienced highway drivers.`}
                </p>

                <div className="mt-auto border-t border-slate-100 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    {isAirport ? 'Airport transfer from' : 'Round trip from'}
                  </p>
                  <p className="text-sm font-extrabold tabular-nums">{fromFares[route.slug] ?? 'On request'}</p>
                  <p className="text-[10px] font-medium text-slate-400">Tolls &amp; parking paid by customer</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link href={`/routes/${route.slug}`} className="btn-ghost group px-3 py-2.5">
                    Route Details
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <a href={whatsappRouteUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-3 py-2.5">
                    <MessageCircle className="h-4 w-4" /> Quick Quote
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="card-float mt-8 px-6 py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <MapPin className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-lg font-extrabold">No matching routes found</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            We operate across all South Indian destinations! Contact our dispatch team for custom round-trip pricing.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="btn-ghost"
            >
              Clear Search
            </button>
            <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              <MessageCircle className="h-4 w-4" /> WhatsApp Us
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

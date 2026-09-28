'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, MapPin, Clock, ArrowRight, MessageCircle, X } from 'lucide-react';
import { Route } from '@/lib/types';
import { siteConfig } from '@/lib/siteConfig';

interface RoutesSearchListProps {
  initialRoutes: Route[];
}

export default function RoutesSearchList({ initialRoutes }: RoutesSearchListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'hill' | 'airport' | 'heritage'>('all');

  const filteredRoutes = useMemo(() => {
    let result = initialRoutes;

    // Filter by category tag
    if (selectedFilter === 'hill') {
      result = result.filter((r) =>
        ['coorg', 'ooty', 'wayanad', 'chikmagalur', 'kodaikanal'].some((tag) =>
          r.slug.toLowerCase().includes(tag)
        )
      );
    } else if (selectedFilter === 'airport') {
      result = result.filter((r) => r.slug.toLowerCase().includes('airport'));
    } else if (selectedFilter === 'heritage') {
      result = result.filter((r) =>
        ['mysore', 'pondicherry'].some((tag) => r.slug.toLowerCase().includes(tag))
      );
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

  return (
    <div className="space-y-8">
      {/* Search & Filter Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destination, city, or route (e.g. Coorg, Mysore, Ooty, Airport)..."
            className="min-h-[50px] w-full pl-12 pr-10 py-3 text-sm sm:text-base rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Quick Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`min-h-[38px] px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors border ${
              selectedFilter === 'all'
                ? 'bg-brand-navy text-white border-brand-navy'
                : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
            }`}
          >
            All Outstation Routes ({initialRoutes.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('hill')}
            className={`min-h-[38px] px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors border ${
              selectedFilter === 'hill'
                ? 'bg-brand-navy text-white border-brand-navy'
                : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
            }`}
          >
            Hill Stations (Coorg, Ooty, Chikmagalur...)
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('heritage')}
            className={`min-h-[38px] px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors border ${
              selectedFilter === 'heritage'
                ? 'bg-brand-navy text-white border-brand-navy'
                : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
            }`}
          >
            Heritage &amp; Coast (Mysore, Pondicherry)
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('airport')}
            className={`min-h-[38px] px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors border ${
              selectedFilter === 'airport'
                ? 'bg-brand-navy text-white border-brand-navy'
                : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
            }`}
          >
            Airport Transfers
          </button>
        </div>
      </div>

      {/* Routes Grid */}
      {filteredRoutes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => {
            const whatsappRouteUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
              `Hello ${siteConfig.brand.name}, I would like to get a quote for the ${route.name} cab in Toyota Innova.`
            )}`;

            return (
              <div
                key={route.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="font-bold text-brand-orange bg-brand-orange-light px-2.5 py-1 rounded-md">
                      {route.distanceKm} km
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{route.durationText}</span>
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-brand-navy mb-2">
                    {route.name}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-6">
                    {route.description ||
                      `Comfortable chauffeur-driven Toyota Innova road trip between ${route.origin} and ${route.destination}. Experienced highway drivers.`}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-auto space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Tariff</span>
                    <span className="font-bold text-brand-navy">Price on request</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/routes/${route.slug}`}
                      className="min-h-[44px] flex items-center justify-center px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-brand-navy text-xs font-semibold transition-colors"
                    >
                      <span>Route Details</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>

                    <a
                      href={whatsappRouteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Quick Quote</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 px-4 bg-white rounded-3xl border border-dashed border-gray-300 text-center space-y-3">
          <MapPin className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-lg font-bold text-brand-navy">No matching routes found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            We operate across all South Indian destinations! Contact our dispatch team for custom one-way or round-trip pricing.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-semibold"
            >
              Clear Search
            </button>
            <a
              href={siteConfig.contact.phone.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

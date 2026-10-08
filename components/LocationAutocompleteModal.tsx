'use client';

/**
 * LocationAutocompleteModal.tsx
 * 
 * Full-screen sheet on mobile & centered dialog on desktop.
 * Sourced from PROJECT_CONTEXT.md.
 * 
 * ==============================================================================
 * SECURITY & COST NOTICE:
 * 1. Restrict NEXT_PUBLIC_GOOGLE_PLACES_API_KEY by HTTP Referrer in Google Cloud Console
 *    (e.g., https://yourdomain.com/* and http://localhost:3000/*).
 * 2. Set a daily quota cap in Google Cloud Console to prevent runaway billing.
 * ==============================================================================
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  Clock,
  X,
  AlertCircle,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import {
  LocationData,
  getRecentLocations,
  saveRecentLocation,
  searchPlaces,
  getPlaceCoordinates,
  loadGoogleMapsScript,
} from '@/lib/googlePlaces';

interface LocationAutocompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: LocationData) => void;
  title: string;
  placeholder?: string;
  initialValue?: string;
}

export default function LocationAutocompleteModal({
  isOpen,
  onClose,
  onSelect,
  title,
  placeholder = 'Search location in Bengaluru or Outstation...',
  initialValue = '',
}: LocationAutocompleteModalProps) {
  const [query, setQuery] = useState(initialValue);
  const [predictions, setPredictions] = useState<LocationData[]>([]);
  const [recentLocations, setRecentLocations] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const sessionTokenRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Initialize session token and Google Maps Script on open
  useEffect(() => {
    if (isOpen) {
      setQuery(initialValue);
      setHasSearched(false);
      setSearchError(false);
      setRecentLocations(getRecentLocations());

      // Preload Google script
      loadGoogleMapsScript().then(() => {
        if (typeof window !== 'undefined' && window.google?.maps?.places?.AutocompleteSessionToken) {
          sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        }
      });

      // Auto-focus input after mount
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialValue]);

  // Execute debounced search (300ms)
  const performSearch = useCallback(async (text: string) => {
    if (!text.trim()) {
      setPredictions([]);
      setHasSearched(false);
      setSearchError(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSearchError(false);

    try {
      const results = await searchPlaces(text, sessionTokenRef.current);
      setPredictions(results);
      setHasSearched(true);
      if (results.length === 0) {
        setSearchError(true);
      }
    } catch (err) {
      console.error('[LocationAutocomplete] Search error:', err);
      setPredictions([]);
      setHasSearched(true);
      setSearchError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 300ms debounce requirement
    debounceTimerRef.current = setTimeout(() => {
      performSearch(val);
    }, 300);
  };

  const handleRetry = () => {
    setSearchError(false);
    performSearch(query);
  };

  const handleSelectLocation = async (item: LocationData & { _placeId?: string }) => {
    let finalLocation = { ...item };

    // Fetch coordinates if not present and placeId exists
    if (item._placeId) {
      const details = await getPlaceCoordinates(item._placeId, sessionTokenRef.current);
      if (details) {
        finalLocation.lat = details.lat;
        finalLocation.lng = details.lng;
        // Full formatted address includes the pincode
        if (details.address) finalLocation.address = details.address;
      }
    }
    delete (finalLocation as { _placeId?: string })._placeId;

    // Save to localStorage (max 3)
    saveRecentLocation(finalLocation);

    // Reset session token for next search
    if (typeof window !== 'undefined' && window.google?.maps?.places?.AutocompleteSessionToken) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }

    onSelect(finalLocation);
    onClose();
  };

  // "Use my current location" handler with GPS & Geocoding
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (typeof window !== 'undefined' && window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            setIsLocating(false);
            if (status === 'OK' && results && results[0]) {
              const fullAddress = results[0].formatted_address;
              const placeName = results[0].address_components?.[0]?.long_name || 'Current Location';
              const loc: LocationData = {
                name: placeName,
                address: fullAddress,
                lat,
                lng,
              };
              handleSelectLocation(loc);
            } else {
              handleSelectLocation({
                name: 'Current Location',
                address: `Bengaluru (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
                lat,
                lng,
              });
            }
          });
        } else {
          setIsLocating(false);
          handleSelectLocation({
            name: 'Current Location',
            address: `Bengaluru Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            lat,
            lng,
          });
        }
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        alert('Could not access current location. Please check browser location permissions or type manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Esc closes; body scroll locked while open (design.md §3.6 overlay behaviour)
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rowClass =
    'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50 active:bg-brand-50';

  return (
    <div className="ds-scope fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="location-modal-title">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-3 sm:items-center">
        <div className="pointer-events-auto flex max-h-[88dvh] w-full animate-drawer-in flex-col overflow-hidden rounded-4xl bg-white shadow-float-lg sm:w-[560px]">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 pb-4 pt-5">
            <h3 id="location-modal-title" className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-ink">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <MapPin className="h-4 w-4" />
              </span>
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-ink transition hover:bg-slate-200"
              aria-label="Close location selector"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search input */}
          <div className="px-5 pt-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={predictions.length > 0}
                value={query}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="field pl-11 pr-11"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery('');
                    setPredictions([]);
                    setHasSearched(false);
                    setSearchError(false);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="group flex w-full items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 px-3 py-2.5 text-left transition hover:border-brand-300 disabled:opacity-70"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink group-hover:text-brand-700">
                  {isLocating ? 'Detecting current location...' : 'Use my current location'}
                </span>
                <span className="block text-xs text-slate-500">GPS location via device</span>
              </span>
            </button>

            {isLoading && (
              <div className="space-y-2" aria-live="polite">
                <p className="flex items-center gap-2 px-1 text-xs font-semibold text-slate-500">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                  Searching Bengaluru locations...
                </p>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="shimmer h-12 rounded-xl" />
                ))}
              </div>
            )}

            {!isLoading && hasSearched && searchError && (
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-8 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                  <AlertCircle className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-bold text-ink">We couldn&apos;t find that location</p>
                <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">
                  Try checking for spelling errors or search for a nearby major road, landmark, or area.
                </p>
                <button type="button" onClick={handleRetry} className="btn-ghost mt-4 px-4 py-2.5">
                  <RotateCcw className="h-3.5 w-3.5" /> Retry Search
                </button>
              </div>
            )}

            {!isLoading && predictions.length > 0 && (
              <div role="listbox" aria-label="Suggestions">
                <p className="px-1 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Suggestions (search by area, landmark or pincode)</p>
                {predictions.map((p, idx) => (
                  <button key={idx} type="button" role="option" aria-selected={false} onClick={() => handleSelectLocation(p)} className={rowClass}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">{p.name}</span>
                      <span className="block truncate text-xs text-slate-500">{p.address}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!query && recentLocations.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 px-1 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <Clock className="h-3.5 w-3.5" /> Recent Locations
                </p>
                {recentLocations.map((loc, idx) => (
                  <button key={idx} type="button" onClick={() => handleSelectLocation(loc)} className={rowClass}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <Clock className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">{loc.name}</span>
                      <span className="block truncate text-xs text-slate-500">{loc.address}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer note */}
          <p className="border-t border-slate-100 px-5 py-3 text-center text-[10px] text-slate-400">
            Biased to Bengaluru • Restricted to India • Google Places API
          </p>
        </div>
      </div>
    </div>
  );
}

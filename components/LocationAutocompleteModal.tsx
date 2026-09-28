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
  Check,
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
    if ((finalLocation.lat === null || finalLocation.lng === null) && item._placeId) {
      const coords = await getPlaceCoordinates(item._placeId, sessionTokenRef.current);
      if (coords) {
        finalLocation.lat = coords.lat;
        finalLocation.lng = coords.lng;
      }
    }

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-center items-end md:items-center p-0 md:p-4 animate-in fade-in duration-150">
      {/* Full-screen sheet on mobile (h-full w-full rounded-none), Centered Dialog on desktop */}
      <div
        className="w-full h-full md:h-auto md:max-h-[85vh] md:max-w-lg bg-white md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Title & Close (min 44px touch target) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-brand-navy text-white">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-orange" />
            <h3 className="text-base font-bold tracking-tight text-white">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-full text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            aria-label="Close location selector"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="min-h-[48px] w-full pl-10 pr-10 py-3 text-sm sm:text-base rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white shadow-inner"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setPredictions([]);
                  setHasSearched(false);
                  setSearchError(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[40px] min-w-[40px] flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body / Results / Recents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 1. "Use my current location" Action (min 44px height) */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="min-h-[48px] w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-brand-orange/5 hover:bg-brand-orange/10 border border-brand-orange/20 text-brand-navy active:scale-[0.99] transition-all group"
          >
            {isLocating ? (
              <Loader2 className="w-5 h-5 text-brand-orange animate-spin" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center shrink-0 shadow-sm">
                <Navigation className="w-4 h-4" />
              </div>
            )}
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-brand-navy group-hover:text-brand-orange transition-colors">
                {isLocating ? 'Detecting current location...' : 'Use my current location'}
              </p>
              <p className="text-xs text-gray-500">GPS location via device</p>
            </div>
          </button>

          {/* 2. Loading Spinner */}
          {isLoading && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
              <span className="text-xs">Searching Bengaluru locations...</span>
            </div>
          )}

          {/* 3. Error state: "We couldn't find that location" with Retry */}
          {!isLoading && hasSearched && searchError && (
            <div className="py-8 px-4 text-center space-y-3 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">
                  We couldn&apos;t find that location
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Try checking for spelling errors or search for a nearby major road, landmark, or area.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-semibold hover:bg-brand-navy-light active:scale-95 transition-all shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Search</span>
              </button>
            </div>
          )}

          {/* 4. Autocomplete Predictions List */}
          {!isLoading && predictions.length > 0 && (
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2">
                Suggestions in India
              </p>
              {predictions.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectLocation(p)}
                  className="min-h-[48px] w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-100 active:bg-gray-200 text-left transition-colors"
                >
                  <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-navy truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {p.address}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 5. Recent Locations (3 items from localStorage) */}
          {!query && recentLocations.length > 0 && (
            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between px-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Recent Locations</span>
                </p>
              </div>

              {recentLocations.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectLocation(loc)}
                  className="min-h-[48px] w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-100 active:bg-gray-200 text-left transition-colors border border-gray-100"
                >
                  <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-navy truncate">
                      {loc.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {loc.address}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400">
            Biased to Bengaluru • Restricted to India • Google Places API
          </p>
        </div>
      </div>
    </div>
  );
}

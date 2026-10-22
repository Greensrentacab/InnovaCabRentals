/**
 * Google Places API Integration Helper
 * 
 * Sourced from PROJECT_CONTEXT.md.
 * 
 * ==============================================================================
 * SECURITY & COST NOTICE:
 * 1. Restrict NEXT_PUBLIC_GOOGLE_PLACES_API_KEY by HTTP Referrer in Google Cloud Console
 *    (e.g., https://yourdomain.com/* and http://localhost:3000/*).
 * 2. Set a daily quota cap (e.g., 5,000 requests/day) in Google Cloud Console
 *    to prevent runaway billing or unauthorized scraping.
 * ==============================================================================
 */

import { siteConfig } from '@/lib/siteConfig';
import { searchAreas } from '@/lib/bengaluruAreas';

declare global {
  interface Window {
    google?: any;
  }
}

export interface LocationData {
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
}

const RECENT_LOCATIONS_KEY = 'innova_recent_locations';

/**
 * Retrieve up to 3 recent locations from localStorage
 */
export function getRecentLocations(): LocationData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_LOCATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    return [];
  }
}

/**
 * Save selected location to localStorage (maintaining max 3 recent, deduplicated)
 */
export function saveRecentLocation(loc: LocationData): void {
  if (typeof window === 'undefined' || !loc.name) return;
  try {
    const recents = getRecentLocations();
    const filtered = recents.filter(
      (r) => r.name.toLowerCase() !== loc.name.toLowerCase() && r.address.toLowerCase() !== loc.address.toLowerCase()
    );
    const updated = [loc, ...filtered].slice(0, 3);
    localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[googlePlaces] Could not save recent location to localStorage:', err);
  }
}

/**
 * Dynamically loads the Google Maps JavaScript API with Places library
 */
let googleMapsPromise: Promise<void> | null = null;

export function loadGoogleMapsScript(apiKey?: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  // Already loaded
  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!key || key.includes('Placeholder')) {
    // Graceful fallback: resolved without real script, mock places will be used
    return Promise.resolve();
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if script tag is already in DOM
    const existingScript = document.getElementById('google-maps-places-script') as HTMLScriptElement;
    if (existingScript) {
      if (window.google?.maps?.places) {
        resolve();
      } else {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', (e) => reject(e));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-places-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&language=en&region=IN`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => {
      console.warn('[googlePlaces] Google Maps script failed to load. Operating in fallback mode.', err);
      resolve(); // Graceful degradation
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

/**
 * Bengaluru Bounding Box & Coordinates for Location Bias
 * Bengaluru Center: 12.9716° N, 77.5946° E
 */
export const BENGALURU_COORDINATES = {
  lat: 12.9716,
  lng: 77.5946,
};

/** Bengaluru metro (airport, Electronic City, Kengeri, Whitefield, Hoskote side) for strict searches */
const BENGALURU_BOUNDS = { south: 12.78, west: 77.35, north: 13.27, east: 77.88 };

/** true when a place's address names Bengaluru / Bangalore */
export const isBengaluruAddress = (text?: string | null) => /bengaluru|bangalore/i.test(text ?? '');

/**
 * Fallback local dataset when Google Places API key is not configured or network is offline
 */
const MOCK_PLACES: LocationData[] = [
  {
    name: 'Kempegowda International Airport (BLR)',
    address: 'KIAL Rd, Devanahalli, Bengaluru, Karnataka 560300',
    lat: 13.1986,
    lng: 77.7066,
  },
  {
    name: 'Whitefield',
    address: 'Whitefield, Bengaluru, Karnataka 560066',
    lat: 12.9698,
    lng: 77.7500,
  },
  {
    name: 'Indiranagar',
    address: 'Indiranagar, Bengaluru, Karnataka 560038',
    lat: 12.9784,
    lng: 77.6408,
  },
  {
    name: 'Koramangala',
    address: 'Koramangala, Bengaluru, Karnataka 560034',
    lat: 12.9352,
    lng: 77.6245,
  },
  {
    name: 'HSR Layout',
    address: 'HSR Layout, Bengaluru, Karnataka 560102',
    lat: 12.9121,
    lng: 77.6446,
  },
  {
    name: 'Marathahalli',
    address: 'Marathahalli, Bengaluru, Karnataka 560037',
    lat: 12.9591,
    lng: 77.6974,
  },
  {
    name: 'MG Road',
    address: 'Mahatma Gandhi Rd, Bengaluru, Karnataka 560001',
    lat: 12.9756,
    lng: 77.6066,
  },
  {
    name: 'JP Nagar',
    address: 'Jayaprakash Narayan Nagara, Bengaluru, Karnataka 560078',
    lat: 12.9063,
    lng: 77.5857,
  },
  {
    name: 'Mysore (Outstation)',
    address: 'Mysuru, Karnataka 570001',
    lat: 12.2958,
    lng: 76.6394,
  },
  {
    name: 'Coorg / Madikeri (Outstation)',
    address: 'Madikeri, Kodagu, Karnataka 571201',
    lat: 12.4244,
    lng: 75.7382,
  },
  {
    name: 'Ooty (Outstation)',
    address: 'Ooty, Tamil Nadu 643001',
    lat: 11.4102,
    lng: 76.6950,
  },
  {
    name: 'Wayanad (Outstation)',
    address: 'Wayanad, Kerala 673121',
    lat: 11.6854,
    lng: 76.1320,
  },
  {
    name: 'Chikmagalur (Outstation)',
    address: 'Chikkamagaluru, Karnataka 577101',
    lat: 13.3153,
    lng: 75.7754,
  },
];

/**
 * The Places library (Places API (New): AutocompleteSuggestion, Place), or
 * null when the Google script is not loaded. Google stopped offering the
 * legacy AutocompleteService / PlacesService to new Cloud projects (March 2025).
 */
async function placesLibrary(): Promise<any | null> {
  const maps = typeof window !== 'undefined' ? window.google?.maps : undefined;
  if (!maps) return null;
  if (maps.places?.AutocompleteSuggestion) return maps.places;
  try {
    return maps.importLibrary ? await maps.importLibrary('places') : null;
  } catch {
    return null;
  }
}

/** Suggestions shown by place id, so picking one reuses its search session (one billed session per pick). */
const predictionsById = new Map<string, any>();

/**
 * Searches places (Places API (New)):
 * - Restricts to India
 * - Bengaluru only (airport / local rides) or biased to 50 km around Bengaluru
 * - Uses sessionToken
 * - Falls back to curated Bangalore data if Google API is offline or key unconfigured
 */
export async function searchPlaces(
  query: string,
  sessionToken?: any,
  options: { bengaluruOnly?: boolean } = {}
): Promise<LocationData[]> {
  const { bengaluruOnly = false } = options;
  const trimmed = query.trim();
  if (!trimmed) return [];

  const places = await placesLibrary();
  // Fallback search when Google script is not present
  if (!places?.AutocompleteSuggestion) return fallbackSearch(trimmed, bengaluruOnly);

  try {
    const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: trimmed,
      includedRegionCodes: ['in'], // Restrict strictly to India
      language: 'en',
      region: 'in',
      ...(bengaluruOnly
        ? { locationRestriction: BENGALURU_BOUNDS } // Airport / local rides: Bengaluru only
        : { locationBias: { center: BENGALURU_COORDINATES, radius: 50000 } }), // Otherwise just bias to Bengaluru (50 km)
      ...(sessionToken ? { sessionToken } : {}),
    });

    const predictions = (suggestions ?? []).map((s: any) => s.placePrediction).filter(Boolean);
    const inScope = bengaluruOnly ? predictions.filter((p: any) => isBengaluruAddress(p.text?.text)) : predictions;
    // No Google match: fall back to the local Bengaluru list
    if (inScope.length === 0) return fallbackSearch(trimmed, bengaluruOnly);

    return inScope.slice(0, 5).map((p: any) => {
      predictionsById.set(p.placeId, p);
      const full: string = p.text?.text ?? '';
      return {
        name: p.mainText?.text || full.split(',')[0] || full,
        address: full,
        lat: null, // Will be enriched on selection
        lng: null,
        _placeId: p.placeId,
      } as LocationData & { _placeId?: string };
    });
  } catch (err) {
    // Key blocked, API not enabled or offline: keep the booking form usable
    console.warn('[googlePlaces] Place suggestions failed, using the local list:', err);
    return fallbackSearch(trimmed, bengaluruOnly);
  }
}

/**
 * Fetches coordinates and the full formatted address (incl. pincode) for a
 * selected place using Place Details. The session token travels with the
 * suggestion (toPlace), which closes the search session.
 */
export async function getPlaceCoordinates(
  placeId: string,
  _sessionToken?: any
): Promise<{ lat: number; lng: number; address?: string } | null> {
  const places = await placesLibrary();
  if (!places?.Place) return null;

  try {
    const prediction = predictionsById.get(placeId);
    const place = prediction?.toPlace ? prediction.toPlace() : new places.Place({ id: placeId });
    await place.fetchFields({ fields: ['location', 'formattedAddress'] });
    if (!place.location) return null;
    return {
      lat: place.location.lat(),
      lng: place.location.lng(),
      address: place.formattedAddress || undefined,
    };
  } catch {
    return null;
  }
}

/** Indian pincode, e.g. "560066" or "560 066" */
export const isPincode = (q: string) => /^\d{3}\s?\d{3}$/.test(q.trim());

function fallbackSearch(query: string, bengaluruOnly = false): LocationData[] {
  const lower = query.toLowerCase().replace(/\s+(?=\d)/g, '');
  const curated = MOCK_PLACES.filter(
    (p) =>
      (!bengaluruOnly || isBengaluruAddress(`${p.name} ${p.address}`)) &&
      (p.name.toLowerCase().includes(lower) ||
      p.address.toLowerCase().includes(lower) ||
      p.address.replace(/\s/g, '').includes(lower))
  );
  const seen = new Set(curated.map((p) => p.name.toLowerCase()));
  const areas: LocationData[] = searchAreas(query)
    .filter((name) => !seen.has(name.toLowerCase()))
    .map((name) => ({ name, address: `${name}, Bengaluru, Karnataka`, lat: null, lng: null }));
  return [...curated, ...areas].slice(0, 6);
}

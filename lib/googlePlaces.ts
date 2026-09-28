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
 * Searches places:
 * - Restricts to India (componentRestrictions: { country: 'in' })
 * - Biases to Bengaluru (50km radius or bounds)
 * - Uses sessionToken
 * - Falls back to curated Bangalore data if Google API is offline or key unconfigured
 */
export async function searchPlaces(
  query: string,
  sessionToken?: any
): Promise<LocationData[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // If real Google Maps Places is available
  if (typeof window !== 'undefined' && window.google?.maps?.places?.AutocompleteService) {
    return new Promise((resolve) => {
      try {
        const service = new window.google.maps.places.AutocompleteService();
        
        // Setup Bengaluru bias using Circle
        const bengaluruCircle = new window.google.maps.Circle({
          center: BENGALURU_COORDINATES,
          radius: 50000, // 50 km bias
        });

        service.getPlacePredictions(
          {
            input: trimmed,
            componentRestrictions: { country: 'in' }, // Restrict strictly to India
            locationBias: bengaluruCircle.getBounds(), // Bias to Bengaluru
            sessionToken: sessionToken || undefined,
          },
          (predictions: any, status: any) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions &&
              predictions.length > 0
            ) {
              const dummyDiv = document.createElement('div');
              const placesService = new window.google.maps.places.PlacesService(dummyDiv);

              // Map predictions to place details promises (or quick prediction format)
              const formatted: LocationData[] = predictions.slice(0, 5).map((p: any) => ({
                name: p.structured_formatting?.main_text || p.description.split(',')[0] || p.description,
                address: p.description,
                lat: null, // Will be enriched on selection
                lng: null,
                _placeId: p.place_id,
              } as LocationData & { _placeId?: string }));

              resolve(formatted);
            } else {
              resolve([]);
            }
          }
        );
      } catch (err) {
        console.warn('[googlePlaces] Error executing AutocompleteService:', err);
        resolve(fallbackSearch(trimmed));
      }
    });
  }

  // Fallback search when Google script is not present
  return fallbackSearch(trimmed);
}

/**
 * Fetches coordinates for a selected place using Place Details
 */
export async function getPlaceCoordinates(
  placeId: string,
  sessionToken?: any
): Promise<{ lat: number; lng: number } | null> {
  if (typeof window === 'undefined' || !window.google?.maps?.places?.PlacesService) {
    return null;
  }

  return new Promise((resolve) => {
    try {
      const dummyDiv = document.createElement('div');
      const service = new window.google.maps.places.PlacesService(dummyDiv);
      service.getDetails(
        {
          placeId,
          fields: ['geometry'],
          sessionToken,
        },
        (place: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
            resolve({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            });
          } else {
            resolve(null);
          }
        }
      );
    } catch {
      resolve(null);
    }
  });
}

function fallbackSearch(query: string): LocationData[] {
  const lower = query.toLowerCase();
  return MOCK_PLACES.filter(
    (p) => p.name.toLowerCase().includes(lower) || p.address.toLowerCase().includes(lower)
  );
}

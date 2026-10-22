'use client';

/**
 * MapPickerDialog.tsx — "Choose on map": the customer drags the map under a
 * fixed centre pin (or taps "Use my current location") and confirms; the
 * address under the pin fills the location field.
 *
 * Uses Google Maps (Maps JavaScript API + Geocoding API on the same
 * NEXT_PUBLIC_GOOGLE_PLACES_API_KEY) when a key is configured; otherwise
 * falls back to OpenStreetMap tiles (Leaflet) with Nominatim reverse
 * geocoding, so the picker also works without a key.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Crosshair, MapPin, X } from 'lucide-react';
import { BENGALURU_COORDINATES, isBengaluruAddress, loadGoogleMapsScript, type LocationData } from '@/lib/googlePlaces';

const LEAFLET_VERSION = '1.9.4';

let leafletPromise: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
    document.head.appendChild(css);
    const script = document.createElement('script');
    script.src = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;
    script.async = true;
    script.onload = () => resolve(w.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return leafletPromise;
}

/** First part of a formatted address as the short name ("Indiranagar", "MG Road") */
function shortName(address: string) {
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  // Skip a leading plus code / house number when there is something better after it
  const first = parts.find((p) => !/^[A-Z0-9]{4}\+[A-Z0-9]{2,}/.test(p) && !/^\d+[A-Za-z]?$/.test(p)) ?? parts[0];
  return first ?? 'Pinned location';
}

interface Props {
  open: boolean;
  title: string;
  /** Start here (the field's current value), else Bengaluru */
  initial?: LocationData | null;
  bengaluruOnly?: boolean;
  onClose: () => void;
  onPick: (location: LocationData) => void;
}

export default function MapPickerDialog({ open, title, initial, bengaluruOnly, onClose, onPick }: Props) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const engine = useRef<{
    center: () => { lat: number; lng: number };
    panTo: (lat: number, lng: number) => void;
    destroy: () => void;
  } | null>(null);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reverseRef = useRef<(lat: number, lng: number) => Promise<string | null>>(async () => null);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [moving, setMoving] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const lookUp = useCallback(() => {
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(async () => {
      const c = engine.current?.center();
      if (!c) return;
      const text = await reverseRef.current(c.lat, c.lng).catch(() => null);
      setAddress(text ?? `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`);
      setMoving(false);
    }, 600);
  }, []);

  // Build the map when the dialog opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const start =
      initial?.lat != null && initial?.lng != null ? { lat: initial.lat, lng: initial.lng } : BENGALURU_COORDINATES;
    setReady(false);
    setFailed(false);
    setAddress(null);
    setGeoError(null);

    (async () => {
      await loadGoogleMapsScript();
      const g = (window as any).google?.maps;
      if (cancelled || !mapEl.current) return;

      if (g?.Map) {
        const map = new g.Map(mapEl.current, {
          center: start,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          clickableIcons: false,
        });
        const geocoder = new g.Geocoder();
        reverseRef.current = (lat, lng) =>
          geocoder
            .geocode({ location: { lat, lng } })
            .then((r: any) => r.results?.[0]?.formatted_address ?? null);
        map.addListener('dragstart', () => setMoving(true));
        map.addListener('idle', lookUp);
        engine.current = {
          center: () => ({ lat: map.getCenter().lat(), lng: map.getCenter().lng() }),
          panTo: (lat, lng) => {
            map.panTo({ lat, lng });
            map.setZoom(17);
          },
          destroy: () => g.event.clearInstanceListeners(map),
        };
      } else {
        const L = await loadLeaflet();
        if (cancelled || !mapEl.current) return;
        const map = L.map(mapEl.current, { zoomControl: true, attributionControl: true }).setView([start.lat, start.lng], 15);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
        reverseRef.current = async (lat, lng) => {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=0&lat=${lat}&lon=${lng}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (!res.ok) return null;
          const data = await res.json();
          return data?.display_name ?? null;
        };
        map.on('movestart', () => setMoving(true));
        map.on('moveend', lookUp);
        // The dialog animates in; measure again once it has its final size
        setTimeout(() => !cancelled && map.invalidateSize(), 350);
        engine.current = {
          center: () => {
            const c = map.getCenter();
            return { lat: c.lat, lng: c.lng };
          },
          panTo: (lat, lng) => map.setView([lat, lng], 17),
          destroy: () => map.remove(),
        };
        lookUp();
      }
      setReady(true);
    })().catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
      engine.current?.destroy();
      engine.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Esc closes; page behind does not scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Location is not available on this device.');
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setMoving(true);
        engine.current?.panTo(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLocating(false);
        setGeoError('Could not get your location. Allow location access or move the map to your spot.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!open) return null;

  const outsideCity = bengaluruOnly && address != null && !moving && !isBengaluruAddress(address);
  const canConfirm = ready && !moving && address != null && !outsideCity;

  const confirm = () => {
    const c = engine.current?.center();
    if (!c || !address) return;
    onPick({ name: shortName(address), address, lat: c.lat, lng: c.lng });
    onClose();
  };

  return (
    <div className="ds-scope fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-labelledby="map-picker-title">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-2 pt-4 sm:p-4 max-lg:pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto flex h-full max-h-[640px] w-full animate-drawer-in flex-col overflow-hidden rounded-4xl bg-white shadow-float-lg sm:max-w-2xl">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <h3 id="map-picker-title" className="flex items-center gap-2.5 text-base font-extrabold tracking-tight text-ink sm:text-lg">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <MapPin className="h-4 w-4" />
              </span>
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close map"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-ink transition hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative min-h-0 flex-1 bg-slate-100">
            <div ref={mapEl} className="absolute inset-0 z-0" />
            {/* Fixed pin: the map moves under it */}
            {ready && (
              <span className="pointer-events-none absolute left-1/2 top-1/2 z-[500] -translate-x-1/2 -translate-y-full" aria-hidden="true">
                <MapPin
                  className={`h-10 w-10 fill-brand-600 text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] transition-transform ${moving ? '-translate-y-2' : ''}`}
                  strokeWidth={1.5}
                />
              </span>
            )}
            {!ready && !failed && (
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-500">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" /> Loading map…
              </div>
            )}
            {failed && (
              <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm font-semibold text-slate-600">
                The map could not load. Please type your address instead.
              </div>
            )}
            {ready && (
              <button
                type="button"
                onClick={useMyLocation}
                className="absolute bottom-3 left-3 z-[500] inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-brand-700 shadow-float transition hover:bg-brand-50"
              >
                <Crosshair className={`h-4 w-4 ${locating ? 'animate-spin' : ''}`} />
                {locating ? 'Finding you…' : 'Use my current location'}
              </button>
            )}
          </div>

          <div className="shrink-0 space-y-3 border-t border-slate-100 px-5 py-4">
            <div className="min-h-[40px]">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">Pinned location</p>
              <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-ink">
                {moving || (ready && address == null) ? 'Finding address…' : address ?? 'Move the map to place the pin'}
              </p>
              {outsideCity && <p className="mt-1 text-xs font-medium text-rose-600">Please pick a location in Bangalore.</p>}
              {geoError && <p className="mt-1 text-xs font-medium text-rose-600">{geoError}</p>}
            </div>
            <button type="button" onClick={confirm} disabled={!canConfirm} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
              <Check className="h-4 w-4" /> Confirm this location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * QuickBookingWidget.tsx — "Quick Fare Estimate" (design.md §3.2.2–3.2.10).
 *
 * Locations are chosen through the Google Places LocationAutocompleteModal
 * (search by area, landmark or pincode; full address incl. pincode is kept).
 * "See Fares & Available Innovas" calls BookingFlowContext.searchFares → the
 * cars, prices and T&Cs render inline under the widget (FareResults).
 *
 * Service mapping:
 *  - Airport:    Pickup = airport → address · Drop = address → airport ·
 *                Round = address → airport → address. Swap flips Pickup/Drop.
 *  - Outstation: ROUND TRIP ONLY. pickup → up to 3 stops → destination → back.
 *                Swap exchanges pickup and destination. Pickup date defaults to
 *                tomorrow, return date to the day after, time to 9:00 AM.
 *  - Local:      pickup area + 4 / 8 / 12 hour package.
 */

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDownUp,
  ArrowRight,
  Clock,
  Hourglass,
  MapPin,
  Mountain,
  Navigation,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Plus,
  Repeat,
  ShieldCheck,
  X,
} from 'lucide-react';
import LocationAutocompleteModal from '@/components/LocationAutocompleteModal';
import SegmentedControl from '@/components/home/SegmentedControl';
import DatePickerField, { addDays, fromDateKey, toDateKey } from '@/components/home/DatePickerField';
import { BOOK_EVENT, type HomeService } from '@/components/home/scrollToBook';
import { useBookingFlow } from '@/context/BookingFlowContext';
import { LocationData } from '@/lib/googlePlaces';
import { cn } from '@/lib/cn';

export interface WidgetDestination {
  slug: string;
  destination: string;
  distanceKm: number;
}

export interface WidgetLocalPackage {
  id: string;
  name: string;
  label: string;
  meta: string;
  fareLabel: string;
  hours: number;
}

interface QuickBookingWidgetProps {
  destinations: WidgetDestination[];
  localPackages: WidgetLocalPackage[];
  airportRouteSlug?: string;
  /** Tab opened on load (service landing pages preselect their own service). */
  initialService?: HomeService;
  /** Prefilled outstation trip (route detail pages). */
  initialOutstation?: {
    pickup: LocationData | null;
    drop: LocationData | null;
    routeSlug?: string;
  };
}

type AirportMode = 'pickup' | 'drop' | 'round';
type Terminal = 'T1' | 'T2';
type ModalTarget = { kind: 'city' | 'pickup' | 'drop' } | { kind: 'stop'; index: number } | null;

const BOOKING_WINDOW_DAYS = 180;
const MIN_LEAD_MINUTES = 60;
const MAX_STOPS = 3;
const DEFAULT_TIME = '09:00';

const SERVICE_TABS: { value: HomeService; label: string; icon: typeof Plane }[] = [
  { value: 'airport', label: 'Airport Taxi', icon: Plane },
  { value: 'outstation', label: 'Outstation', icon: Mountain },
  { value: 'local', label: 'Local Hourly', icon: Hourglass },
];

const TERMINALS: Record<Terminal, string> = {
  T1: 'Terminal 1 · Domestic',
  T2: 'Terminal 2 · Domestic & International',
};

function airportLocation(terminal: Terminal): LocationData {
  return {
    name: `Kempegowda Intl. Airport (BLR) – ${terminal}`,
    address: 'Kempegowda International Airport, Devanahalli, Bengaluru, Karnataka 562300',
    lat: 13.1989,
    lng: 77.7068,
  };
}

/** 30-minute slots, 12-hour labels. For today, hides slots < 60 min away. */
function buildTimeSlots(dateKey: string, now: Date) {
  const isToday = dateKey === toDateKey(now);
  const cutoff = now.getHours() * 60 + now.getMinutes() + MIN_LEAD_MINUTES;
  const slots: { value: string; label: string }[] = [];
  for (let mins = 0; mins < 24 * 60; mins += 30) {
    if (isToday && mins < cutoff) continue;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const label = `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
    slots.push({ value, label });
  }
  return slots;
}

function LocationTrigger({
  value,
  placeholder,
  tone,
  error,
  onOpen,
  onClear,
  clearLabel = 'Clear location',
}: {
  value: LocationData | null;
  placeholder: string;
  tone: 'pickup' | 'drop' | 'stop';
  error?: string;
  onOpen: () => void;
  onClear: () => void;
  clearLabel?: string;
}) {
  const Icon = tone === 'pickup' ? Navigation : MapPin;
  return (
    <div>
      <div className="relative">
        <span
          className={cn(
            'pointer-events-none absolute left-3 top-1/2 z-[1] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full',
            tone === 'pickup' && 'bg-brand-50 text-brand-700',
            tone === 'drop' && 'bg-live-500/10 text-live-600',
            tone === 'stop' && 'bg-amber-100 text-amber-700'
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
        <button
          type="button"
          role="combobox"
          aria-expanded={false}
          aria-invalid={!!error}
          onClick={onOpen}
          className={cn('field block min-h-[52px] pl-12 text-left', value && 'pr-10', error && 'field-error')}
        >
          {value ? (
            <span className="block min-w-0">
              <span className="block truncate font-semibold">{value.name}</span>
              {value.address && value.address !== value.name && (
                <span className="block truncate text-xs font-normal text-slate-500">{value.address}</span>
              )}
            </span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </button>
        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label={clearLabel}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 pl-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

function SwapButton({ onClick, label, className }: { onClick: () => void; label: string; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'absolute -right-2.5 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-brand-700 shadow-float transition duration-300 hover:rotate-180 hover:border-brand-300',
        className ?? 'top-1/2'
      )}
    >
      <ArrowDownUp className="h-4 w-4" />
    </button>
  );
}

export default function QuickBookingWidget({
  destinations,
  localPackages,
  airportRouteSlug,
  initialService = 'airport',
  initialOutstation,
}: QuickBookingWidgetProps) {
  const { searchFares, search } = useBookingFlow();

  const [service, setService] = useState<HomeService>(initialService);
  const [airportMode, setAirportMode] = useState<AirportMode>('pickup');
  const [terminal, setTerminal] = useState<Terminal>('T1');
  const [localPackageId, setLocalPackageId] = useState(
    () => localPackages.find((p) => p.label === 'Full-day')?.id ?? localPackages[0]?.id ?? ''
  );

  // Stored location data: { name, address (incl. pincode), lat, lng }
  const [cityLocation, setCityLocation] = useState<LocationData | null>(null); // airport + local
  const [outPickup, setOutPickup] = useState<LocationData | null>(initialOutstation?.pickup ?? null);
  const [outDrop, setOutDrop] = useState<LocationData | null>(initialOutstation?.drop ?? null);
  const [outStops, setOutStops] = useState<(LocationData | null)[]>([]);
  const [routeSlug, setRouteSlug] = useState<string | undefined>(initialOutstation?.routeSlug);

  const [activeModal, setActiveModal] = useState<ModalTarget>(null);
  const [errors, setErrors] = useState<{ pickup?: string; drop?: string; stops?: string }>({});

  // Dates depend on the visitor's clock, so they are initialised after mount
  const [now, setNow] = useState<Date | null>(null);
  const [date, setDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [time, setTime] = useState(DEFAULT_TIME);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    const current = new Date();
    setNow(current);
    setDate(toDateKey(addDays(current, 1))); // tomorrow
    setReturnDate(toDateKey(addDays(current, 2))); // day after tomorrow
    setTime(DEFAULT_TIME); // 9:00 AM
    setPortalReady(true);
  }, []);

  // Other homepage surfaces can preselect a tab (scrollToBook('outstation'))
  useEffect(() => {
    const onBook = (e: Event) => {
      const detail = (e as CustomEvent<HomeService>).detail;
      if (detail) setService(detail);
    };
    window.addEventListener(BOOK_EVENT, onBook);
    return () => window.removeEventListener(BOOK_EVENT, onBook);
  }, []);

  const today = useMemo(() => (now ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) : null), [now]);
  const todayHasSlots = now ? buildTimeSlots(toDateKey(now), now).length > 0 : false;
  const minDate = today ? (todayHasSlots ? today : addDays(today, 1)) : null;
  const maxDate = today ? addDays(today, BOOKING_WINDOW_DAYS) : null;

  const timeSlots = useMemo(() => (now && date ? buildTimeSlots(date, now) : []), [date, now]);

  // Keep the chosen time valid when the date changes (e.g. switching to today)
  useEffect(() => {
    if (timeSlots.length && !timeSlots.some((s) => s.value === time)) {
      setTime(timeSlots[0].value);
    }
  }, [timeSlots, time]);

  // Return date can never be before the pickup date
  const changePickupDate = (key: string) => {
    setDate(key);
    if (returnDate && returnDate < key) setReturnDate(key);
  };

  const selectedPackage = localPackages.find((p) => p.id === localPackageId) ?? localPackages[0];

  const clearError = (field: 'pickup' | 'drop' | 'stops') => setErrors((prev) => ({ ...prev, [field]: undefined }));

  const switchService = (next: HomeService) => {
    setService(next);
    setErrors({});
  };

  // ---- Outstation helpers ----
  const swapOutstation = () => {
    setOutPickup(outDrop);
    setOutDrop(outPickup);
    setOutStops((stops) => [...stops].reverse());
    setRouteSlug(undefined);
    setErrors({});
  };

  const addStop = () => {
    if (outStops.length >= MAX_STOPS) return;
    const index = outStops.length;
    setOutStops((stops) => [...stops, null]);
    setActiveModal({ kind: 'stop', index });
  };

  const removeStop = (index: number) => {
    setOutStops((stops) => stops.filter((_, i) => i !== index));
    clearError('stops');
  };

  // Which value the open modal edits
  const modalValue: LocationData | null = !activeModal
    ? null
    : activeModal.kind === 'stop'
      ? outStops[activeModal.index] ?? null
      : service === 'outstation'
        ? activeModal.kind === 'pickup'
          ? outPickup
          : outDrop
        : cityLocation;

  const modalTitle = !activeModal
    ? ''
    : activeModal.kind === 'stop'
      ? `Add Stop ${activeModal.index + 1}`
      : activeModal.kind === 'drop' && service === 'outstation'
        ? 'Select Destination'
        : activeModal.kind === 'drop' || (service === 'airport' && airportMode === 'pickup')
          ? 'Select Drop Location'
          : 'Select Pickup Location';

  const handleModalSelect = (loc: LocationData) => {
    if (!activeModal) return;
    if (activeModal.kind === 'stop') {
      const { index } = activeModal;
      setOutStops((stops) => stops.map((s, i) => (i === index ? loc : s)));
      setRouteSlug(undefined);
      clearError('stops');
    } else if (service === 'outstation') {
      if (activeModal.kind === 'pickup') {
        setOutPickup(loc);
        clearError('pickup');
      } else {
        setOutDrop(loc);
        setRouteSlug(undefined);
        clearError('drop');
      }
    } else {
      setCityLocation(loc);
      clearError('pickup');
      clearError('drop');
    }
  };

  // Closing the stop picker without choosing removes the empty stop row
  const handleModalClose = () => {
    setOutStops((stops) => stops.filter((s) => s !== null));
    setActiveModal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const travelDate = date || toDateKey(addDays(new Date(), 1));
    const travelTime = time || DEFAULT_TIME;

    if (service === 'airport') {
      if (!cityLocation) {
        const field = airportMode === 'pickup' ? 'drop' : 'pickup';
        setErrors({ [field]: `Enter a ${field} address in Bangalore` });
        setActiveModal({ kind: 'city' });
        return;
      }
      const airport = airportLocation(terminal);
      await searchFares({
        serviceType: 'airport',
        tripType: airportMode === 'round' ? 'round' : 'oneway',
        pickup: airportMode === 'pickup' ? airport : cityLocation,
        drop: airportMode === 'pickup' ? cityLocation : airport,
        date: travelDate,
        time: travelTime,
        routeSlug: airportRouteSlug,
      });
      return;
    }

    if (service === 'outstation') {
      if (!outPickup) {
        setErrors({ pickup: 'Enter a pickup area or address' });
        setActiveModal({ kind: 'pickup' });
        return;
      }
      if (!outDrop) {
        setErrors({ drop: 'Choose a destination' });
        setActiveModal({ kind: 'drop' });
        return;
      }
      const stops = outStops.filter((s): s is LocationData => s !== null);
      await searchFares({
        serviceType: 'outstation',
        tripType: 'round',
        pickup: outPickup,
        drop: outDrop,
        stops,
        date: travelDate,
        time: travelTime,
        returnDate: returnDate && returnDate >= travelDate ? returnDate : travelDate,
        routeSlug: stops.length ? undefined : routeSlug,
      });
      return;
    }

    if (!cityLocation) {
      setErrors({ pickup: 'Enter a pickup area or address' });
      setActiveModal({ kind: 'city' });
      return;
    }
    await searchFares({
      serviceType: 'local',
      tripType: 'oneway',
      pickup: cityLocation,
      drop: {
        name: `Local hire · ${selectedPackage?.name ?? 'City rental'}`,
        address: cityLocation.address,
        lat: cityLocation.lat,
        lng: cityLocation.lng,
      },
      date: travelDate,
      time: travelTime,
      packageHours: selectedPackage?.hours ?? 8,
      packageLabel: selectedPackage ? `${selectedPackage.label} (${selectedPackage.meta})` : null,
    });
  };

  const airportRow = (
    <div className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 px-3 py-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
        <Plane className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">Kempegowda Intl. Airport (BLR)</p>
        <p className="truncate text-[11px] font-medium text-slate-500">{TERMINALS[terminal]}</p>
      </div>
      <SegmentedControl
        size="sm"
        ariaLabel="Terminal"
        className="mr-5 w-[92px] shrink-0"
        value={terminal}
        onChange={setTerminal}
        options={[
          { value: 'T1', label: 'T1' },
          { value: 'T2', label: 'T2' },
        ]}
      />
    </div>
  );

  const airportAddressField = (
    <LocationTrigger
      value={cityLocation}
      tone={airportMode === 'pickup' ? 'drop' : 'pickup'}
      placeholder={airportMode === 'pickup' ? 'Drop address or pincode in Bangalore' : 'Pickup address or pincode in Bangalore'}
      error={airportMode === 'pickup' ? errors.drop : errors.pickup}
      onOpen={() => setActiveModal({ kind: 'city' })}
      onClear={() => setCityLocation(null)}
    />
  );

  const activeTabIndex = SERVICE_TABS.findIndex((t) => t.value === service);
  const showReturn = service === 'outstation';

  return (
    <form
      id="book"
      onSubmit={handleSubmit}
      noValidate
      className="glass-strong relative animate-fade-up scroll-mt-28 rounded-4xl p-4 shadow-float-lg [animation-delay:150ms] sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-ink">Quick Fare Estimate</h2>
          <p className="text-xs font-medium text-slate-500">Instant estimate · ₹0 advance · Pay after the trip</p>
        </div>
        <span className="chip-live">
          <span className="h-1.5 w-1.5 rounded-full bg-live-500" /> Live
        </span>
      </div>

      {/* Service tabs */}
      <div role="tablist" aria-label="Service" className="relative mb-4 grid grid-cols-3 gap-1 rounded-2xl bg-slate-100/80 p-1">
        <span
          aria-hidden="true"
          className="absolute bottom-1 left-1 top-1 rounded-xl bg-white shadow-float ring-1 ring-slate-200/80 transition-transform duration-300 ease-[cubic-bezier(0.34,1.2,0.64,1)]"
          style={{
            width: 'calc((100% - 16px) / 3)',
            transform: `translateX(calc(${activeTabIndex} * (100% + 4px)))`,
          }}
        />
        {SERVICE_TABS.map((tab) => {
          const Icon = tab.icon;
          const selected = tab.value === service;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => switchService(tab.value)}
              className={cn(
                'relative flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-bold transition-colors sm:flex-row sm:justify-center sm:text-[13px]',
                selected ? 'text-brand-700' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <Icon className="relative h-4 w-4" />
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Service panel */}
      <div key={service} role="tabpanel" className="animate-panel-in space-y-3">
        {service === 'airport' && (
          <>
            <SegmentedControl
              ariaLabel="Airport trip type"
              value={airportMode}
              onChange={(v) => {
                setAirportMode(v);
                setErrors({});
              }}
              options={[
                { value: 'pickup', label: 'Pickup', icon: PlaneLanding },
                { value: 'drop', label: 'Drop', icon: PlaneTakeoff },
                { value: 'round', label: 'Round', icon: Repeat },
              ]}
            />
            <div className="relative space-y-2">
              {airportMode === 'pickup' ? (
                <>
                  {airportRow}
                  {airportAddressField}
                </>
              ) : (
                <>
                  {airportAddressField}
                  {airportRow}
                </>
              )}
              {airportMode !== 'round' && (
                <SwapButton
                  label="Swap pickup and drop"
                  onClick={() => setAirportMode(airportMode === 'pickup' ? 'drop' : 'pickup')}
                />
              )}
            </div>
          </>
        )}

        {service === 'outstation' && (
          <>
            <p className="flex items-center gap-2 rounded-2xl bg-brand-50/70 px-3 py-2 text-xs font-semibold text-brand-800">
              <Repeat className="h-3.5 w-3.5 text-brand-600" /> Round trip · we drive you there and back
            </p>

            <div className="relative space-y-2">
              <div className="pointer-events-none absolute left-[25px] top-[40px] z-[1] h-[calc(100%-80px)] border-l-2 border-dashed border-slate-300" />
              <LocationTrigger
                value={outPickup}
                tone="pickup"
                placeholder="Pickup address or pincode"
                error={errors.pickup}
                onOpen={() => setActiveModal({ kind: 'pickup' })}
                onClear={() => setOutPickup(null)}
              />
              {outStops.map((stop, i) =>
                stop ? (
                  <LocationTrigger
                    key={`stop-${i}`}
                    value={stop}
                    tone="stop"
                    placeholder={`Stop ${i + 1}`}
                    onOpen={() => setActiveModal({ kind: 'stop', index: i })}
                    onClear={() => removeStop(i)}
                    clearLabel={`Remove stop ${i + 1}`}
                  />
                ) : null
              )}
              <LocationTrigger
                value={outDrop}
                tone="drop"
                placeholder="Destination city or address"
                error={errors.drop}
                onOpen={() => setActiveModal({ kind: 'drop' })}
                onClear={() => {
                  setOutDrop(null);
                  setRouteSlug(undefined);
                }}
              />
              <SwapButton label="Swap pickup and destination" onClick={swapOutstation} className="top-[56px]" />
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={addStop}
                disabled={outStops.length >= MAX_STOPS}
                className="pill transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" /> Add stop
              </button>
              <span className="text-[11px] font-medium text-slate-400">
                {outStops.length}/{MAX_STOPS} stops on the way
              </span>
            </div>

            {destinations.length > 0 && (
              <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
                {destinations.slice(0, 12).map((d) => {
                  const selected = routeSlug === d.slug;
                  return (
                    <button
                      key={d.slug}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setOutDrop({ name: d.destination, address: `${d.destination}, India`, lat: null, lng: null });
                        setRouteSlug(d.slug);
                        clearError('drop');
                      }}
                      className={cn(
                        'pill shrink-0 transition hover:border-brand-300 hover:text-brand-700',
                        selected && 'border-brand-300 bg-brand-50 text-brand-700'
                      )}
                    >
                      {d.destination}
                      <span className="text-slate-400">{d.distanceKm} km</span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {service === 'local' && (
          <>
            <LocationTrigger
              value={cityLocation}
              tone="pickup"
              placeholder="Pickup address or pincode in Bangalore"
              error={errors.pickup}
              onOpen={() => setActiveModal({ kind: 'city' })}
              onClear={() => setCityLocation(null)}
            />
            <div role="radiogroup" aria-label="Local package" className="grid grid-cols-3 gap-2">
              {localPackages.map((pkg) => {
                const selected = pkg.id === selectedPackage?.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setLocalPackageId(pkg.id)}
                    className={cn(
                      'rounded-2xl border px-2 py-2.5 text-left transition-all',
                      selected
                        ? 'border-brand-500 bg-brand-50 ring-4 ring-brand-500/10'
                        : 'border-slate-200/80 bg-white hover:border-brand-300'
                    )}
                  >
                    <span className="block text-[13px] font-extrabold text-ink">{pkg.label}</span>
                    <span className="block text-[11px] font-semibold text-slate-500">{pkg.meta}</span>
                    <span className="mt-1 block text-[11px] font-bold text-brand-700">{pkg.fareLabel}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Dates + time */}
      <div className="mt-4 space-y-3">
        {today && minDate && maxDate ? (
          <div className={cn('grid gap-3', showReturn && 'sm:grid-cols-2')}>
            <DatePickerField
              value={date}
              onChange={changePickupDate}
              minDate={minDate}
              maxDate={maxDate}
              today={today}
              label={showReturn ? 'Pickup date' : 'Travel date'}
            />
            {showReturn && (
              <DatePickerField
                value={returnDate}
                onChange={setReturnDate}
                minDate={date ? fromDateKey(date) : minDate}
                maxDate={maxDate}
                today={today}
                label="Return date"
              />
            )}
          </div>
        ) : (
          <div>
            <span className="label">Travel date</span>
            <div className="shimmer h-[46px] rounded-2xl" />
          </div>
        )}

        <div>
          <label htmlFor="pickup-time" className="label">
            Pickup time
          </label>
          <div className="relative">
            <Clock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              id="pickup-time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="field block appearance-none pl-11 pr-10"
            >
              {timeSlots.length === 0 && <option value={DEFAULT_TIME}>9:00 AM</option>}
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={search.status === 'loading'}
        className="btn-primary group mt-5 w-full py-3.5 text-[15px]"
      >
        {search.status === 'loading' ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Finding available cars...
          </>
        ) : (
          <>
            See Fares &amp; Available Innovas
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1.5 font-medium text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-live-600" /> No surge · Tolls paid by customer
        </span>
        <span className="font-semibold text-slate-600">
          Advance <span className="font-extrabold text-ink">₹0</span>
        </span>
      </div>

      {/* Google Places picker, portalled so the hero's stacking context can't trap it */}
      {portalReady &&
        createPortal(
          <LocationAutocompleteModal
            isOpen={activeModal !== null}
            onClose={handleModalClose}
            title={modalTitle}
            placeholder={
              activeModal?.kind === 'drop' && service === 'outstation'
                ? 'Search a city, place, address or pincode...'
                : 'Search area, landmark, street or pincode...'
            }
            initialValue={modalValue?.name || ''}
            onSelect={handleModalSelect}
          />,
          document.body
        )}
    </form>
  );
}

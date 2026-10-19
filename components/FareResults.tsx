'use client';

/**
 * FareResults.tsx — available cars (same card layout as "Our fleet"), prices,
 * per-car T&Cs behind a toggle, and WhatsApp actions, one car per row. Rendered as the car step
 * of the booking popup (BookingFlowModal) after "See Fares & Available Innovas"
 * (design.md §3.3 cards, §3.0 buttons).
 *
 * The WhatsApp button sends the full trip + selected car to the dispatch
 * (admin) WhatsApp number. Tapping a row selects the car; "Continue" in the
 * popup footer moves on to the details step so the
 * request is also saved to Admin → Bookings.
 */

import { useCallback, useEffect, useState } from 'react';
import { Check, ChevronRight, FileText, Info, Luggage, Users } from 'lucide-react';
import WhatsAppIcon from '@/components/ds/WhatsAppIcon';
import { useBookingFlow, toVehicle, type FareResult, type FareSearchState, type TripParams } from '@/context/BookingFlowContext';
import { cn } from '@/lib/cn';
import { siteConfig } from '@/lib/siteConfig';
import { fleetPhotos } from '@/lib/fleetPhotos';
import TermsSheet from '@/components/ds/TermsSheet';
import { formatDateLong, formatTime12 } from '@/lib/time';

const SERVICE_LABEL: Record<string, string> = {
  outstation: 'Outstation (Round Trip)',
  airport: 'Airport Transfer',
  local: 'Local & Hourly Rental',
  tour: 'Tour',
};

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const placeText = (p: { name: string; address: string }) =>
  p.address && p.address !== p.name ? `${p.name}, ${p.address}` : p.name;

function tripTypeLabel(trip: TripParams) {
  if (trip.serviceType === 'airport') {
    if (trip.tripType === 'round') return 'Airport Transfer (Round)';
    return trip.drop.name.includes('Airport') ? 'Airport Drop' : 'Airport Pickup';
  }
  if (trip.serviceType === 'local') return `Local & Hourly Rental${trip.packageLabel ? ` · ${trip.packageLabel}` : ''}`;
  return SERVICE_LABEL[trip.serviceType] ?? trip.serviceType;
}

/** Message sent to the dispatch WhatsApp number for one car. */
export function buildAdminWhatsAppMessage(
  trip: TripParams,
  car: FareResult,
  extra: { totalKm: number | null; days: number }
) {
  const lines = [
    `Hello ${siteConfig.brand.name}, I would like to book a cab:`,
    '',
    `• Service: ${tripTypeLabel(trip)}`,
    `• Pickup: ${placeText(trip.pickup)}`,
    ...(trip.stops ?? []).map((s, i) => `• Stop ${i + 1}: ${placeText(s)}`),
    `• ${trip.serviceType === 'local' ? 'Area' : 'Drop / Destination'}: ${placeText(trip.drop)}`,
    `• Pickup date & time: ${formatDateLong(trip.date)} at ${formatTime12(trip.time)}`,
    ...(trip.returnDate ? [`• Return date: ${formatDateLong(trip.returnDate)}`] : []),
    ...(trip.serviceType === 'outstation' && extra.totalKm
      ? [`• Estimated distance: ~${extra.totalKm} km round trip, ${extra.days} day${extra.days > 1 ? 's' : ''}`]
      : []),
    `• Car: ${car.vehicleName}${car.vehicleType ? ` (${car.vehicleType})` : ''}`,
    `• Estimated fare: ${car.fare !== null ? inr(car.fare) : 'Price on request'} (tolls, parking & permits paid by me)`,
    '',
    'Please confirm availability and the final fare.',
  ];
  return lines.join('\n');
}

/** What the fare is for, shown under each price (e.g. "for ~15 km"). */
function fareBasis(search: FareSearchState): string | null {
  const trip = search.trip;
  if (!trip) return null;
  if (trip.serviceType === 'airport' && search.distanceKm !== null)
    return `for ~${Math.round(search.distanceKm)} km${trip.tripType === 'round' ? ' each way' : ''}`;
  if (trip.serviceType === 'outstation' && search.totalKm !== null)
    return `~${Math.round(search.totalKm)} km · ${search.days} day${search.days > 1 ? 's' : ''}`;
  if (trip.serviceType === 'local' && trip.packageHours) return `${trip.packageHours} hr package`;
  return null;
}

function ResultRow({
  car,
  trip,
  basis,
  isLowest,
  totalKm,
  days,
  inclusions,
  exclusions,
}: {
  car: FareResult;
  trip: TripParams;
  basis: string | null;
  isLowest: boolean;
  totalKm: number | null;
  days: number;
  inclusions: string[];
  exclusions: string[];
}) {
  const { state, selectVehicle } = useBookingFlow();
  const [showTerms, setShowTerms] = useState(false);
  const closeTerms = useCallback(() => setShowTerms(false), []);
  const isSelected = state.selectedVehicle?.id === car.vehicleId;
  // The published photo from the fare API, else the built-in photo
  const photo = car.photos?.[0] ?? fleetPhotos[car.vehicleId]?.[0];
  const typeTag = car.vehicleType && car.vehicleType.length <= 16 ? car.vehicleType : null;
  const waUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
    buildAdminWhatsAppMessage(trip, car, { totalKm, days })
  )}`;
  const select = () => selectVehicle(toVehicle(car));

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={select}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select();
        }
      }}
      className={cn(
        'relative cursor-pointer rounded-2xl border-2 p-3 outline-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-brand-500/20 active:scale-[0.99] sm:p-3.5',
        isSelected
          ? 'border-brand-600 bg-brand-50/40 shadow-[0_12px_28px_-18px_rgba(37,99,235,0.7)]'
          : 'border-slate-200/80 bg-white hover:border-brand-200',
        isLowest && 'mt-3'
      )}
    >
      {/* "Lowest fare" ribbon sits on the top border so the name line stays clean */}
      {isLowest && (
        <span className="absolute -top-2.5 left-3 rounded-full bg-live-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
          Lowest fare
        </span>
      )}

      <div className="flex items-center gap-3">
        <div className="relative h-[60px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-16 sm:w-24">
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.src}
              alt=""
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
              style={{ objectPosition: photo.position }}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-extrabold leading-snug tracking-tight text-ink sm:text-base">{car.vehicleName}</h3>
          {(car.seats || car.luggage) ? (
            <p className="mt-1 flex flex-wrap items-center gap-x-2.5 text-xs font-medium text-slate-500">
              {car.seats ? (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 shrink-0" /> {car.seats}
                </span>
              ) : null}
              {car.luggage ? (
                <span className="inline-flex items-center gap-1">
                  <Luggage className="h-3.5 w-3.5 shrink-0" /> {car.luggage}
                </span>
              ) : null}
              {typeTag && <span className="truncate text-slate-400">· {typeTag}</span>}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-extrabold leading-none tracking-tight tabular-nums text-ink sm:text-xl">
            {car.fare !== null ? inr(car.fare) : <span className="text-xs font-bold">On request</span>}
          </p>
          {car.fare !== null && basis && <p className="mt-1 text-[11px] font-medium text-slate-400">{basis}</p>}
        </div>

        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
            isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white'
          )}
          aria-hidden="true"
        >
          {isSelected && <Check className="h-3 w-3" strokeWidth={3.5} />}
        </span>
      </div>

      {/* Selected car: how the fare is worked out, T&Cs and WhatsApp */}
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
          isSelected ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-3 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200/70">
            {car.breakdown?.length > 0 && (
              <ul className="space-y-1 text-xs font-medium tabular-nums text-slate-600">
                {car.breakdown.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-300" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            )}
            <div className={cn('flex items-center gap-2', car.breakdown?.length > 0 && 'mt-2.5 border-t border-slate-100 pt-2.5')}>
              <button
                type="button"
                aria-haspopup="dialog"
                tabIndex={isSelected ? 0 : -1}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTerms(true);
                }}
                className="inline-flex min-h-[32px] flex-1 items-center gap-1.5 text-xs font-bold text-brand-700"
              >
                <FileText className="h-3.5 w-3.5" /> Terms &amp; inclusions
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isSelected ? 0 : -1}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full bg-[#25D366]/10 px-3 text-xs font-bold text-[#128C7E] transition hover:bg-[#25D366]/15"
                aria-label={`Send ${car.vehicleName} booking details on WhatsApp`}
              >
                <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <TermsSheet
        open={showTerms}
        onClose={closeTerms}
        title={car.vehicleName}
        subtitle={car.fare !== null ? `Estimated fare ${inr(car.fare)}` : undefined}
        sections={[
          { title: 'How this fare is worked out', items: car.breakdown ?? [], tone: 'fare' },
          { title: "What's included", items: inclusions, tone: 'included' },
          { title: 'Not included', items: exclusions, tone: 'excluded' },
          { title: 'Terms', items: car.terms, tone: 'terms' },
        ]}
      />
    </div>
  );
}

/** Car step of the booking popup: one car per row; tap a row to select it. */
export default function FareResults() {
  const { search, state, selectVehicle } = useBookingFlow();
  const sorted = [...search.results].sort((a, b) => (a.fare ?? Infinity) - (b.fare ?? Infinity));
  const lowest = sorted.find((c) => c.fare !== null);

  // Always have a car selected once fares arrive (the lowest priced one)
  useEffect(() => {
    if (search.status === 'done' && !state.selectedVehicle && lowest) selectVehicle(toVehicle(lowest));
  }, [search.status, state.selectedVehicle, lowest, selectVehicle]);

  if (search.status === 'idle' || !search.trip) return null;
  const trip = search.trip;
  const basis = fareBasis(search);
  const notIncluded =
    search.exclusions.length > 0
      ? `Not included: ${search.exclusions.join(', ')}.`
      : 'Not included: toll fees, parking and state permits.';

  return (
    <div aria-live="polite">
      {search.status === 'loading' && (
        <div className="space-y-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border-2 border-slate-100 p-3">
              <div className="shimmer h-[60px] w-[84px] shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="shimmer h-4 w-2/3 rounded-lg" />
                <div className="shimmer h-3 w-1/3 rounded-full" />
              </div>
              <div className="shimmer h-6 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {search.status === 'error' && (
        <div className="rounded-2xl border-2 border-slate-100 p-6 text-center">
          <p className="text-sm font-semibold text-rose-600">{search.error}</p>
          <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-4">
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp for a Quick Quote
          </a>
        </div>
      )}

      {search.status === 'done' && (
        <>
          <div role="radiogroup" aria-label="Choose a car" className="space-y-2.5">
            {sorted.map((car, i) => (
              <div key={car.vehicleId} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <ResultRow
                  car={car}
                  trip={trip}
                  basis={basis}
                  isLowest={car.vehicleId === lowest?.vehicleId}
                  totalKm={search.totalKm}
                  days={search.days}
                  inclusions={search.inclusions}
                  exclusions={search.exclusions}
                />
              </div>
            ))}
            {search.results.length === 0 && (
              <p className="rounded-2xl border-2 border-slate-100 p-6 text-sm text-slate-600">
                No cars are available for this trip right now. Please WhatsApp us and we&apos;ll arrange one.
              </p>
            )}
          </div>

          {search.results.length > 0 && (
            <p className="mt-4 flex items-start gap-2 px-1 text-[11px] leading-relaxed text-slate-500">
              <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>{notIncluded} Final fare is confirmed on WhatsApp before your trip.</span>
            </p>
          )}
        </>
      )}
    </div>
  );
}

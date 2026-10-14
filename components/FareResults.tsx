'use client';

/**
 * FareResults.tsx — available cars (same card layout as "Our fleet"), prices,
 * per-car T&Cs behind a toggle, and WhatsApp
 * actions, rendered inline directly under the booking widget's section after
 * "See Fares & Available Innovas" (design.md §3.3 cards, §3.0 buttons).
 *
 * The WhatsApp button sends the full trip + selected car to the dispatch
 * (admin) WhatsApp number. "Request Booking" opens the booking modal so the
 * request is also saved to Admin → Bookings.
 */

import { useEffect, useId, useRef, useState } from 'react';
import { Calendar, Check, ChevronDown, Clock, FileText, Info, Luggage, MapPin, MessageCircle, Pencil, Route as RouteIcon, Snowflake, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useBookingFlow, type FareResult, type TripParams } from '@/context/BookingFlowContext';
import { siteConfig } from '@/lib/siteConfig';
import { fleetPhotos } from '@/lib/fleetPhotos';
import PhotoCarousel from '@/components/home/PhotoCarousel';
import { formatDateLong, formatTime12 } from '@/lib/time';
import { scrollToBook } from '@/components/home/scrollToBook';

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

/** Short tag on each car photo (factual, no ratings) */
const CAR_TAG: Record<string, string> = {
  ertiga: 'Best Value',
  innova: 'Classic Comfort',
  'innova-crysta': 'Captain Seats',
  'innova-hycross': 'Strong Hybrid',
};

/** What the shown fare covers, in a few words */
function fareCaption(trip: TripParams, totalKm: number | null, days: number) {
  if (trip.serviceType === 'airport') return trip.tripType === 'round' ? 'Airport round trip' : 'Airport · one way';
  if (trip.serviceType === 'local') return trip.packageLabel ? `${trip.packageLabel} package` : 'Local package';
  if (trip.serviceType === 'outstation')
    return totalKm ? `~${totalKm} km · ${days} day${days > 1 ? 's' : ''} round trip` : 'Round trip';
  return 'Estimated fare';
}

/** Compact 2-up result card (mobile first): photos, specs, price, T&C toggle, actions. */
function ResultCard({
  car,
  trip,
  totalKm,
  days,
  index,
}: {
  car: FareResult;
  trip: TripParams;
  totalKm: number | null;
  days: number;
  index: number;
}) {
  const { requestBooking } = useBookingFlow();
  const [showTerms, setShowTerms] = useState(false);
  const termsId = useId();
  const photos = (fleetPhotos[car.vehicleId] ?? []).slice(0, 5);
  const waUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
    buildAdminWhatsAppMessage(trip, car, { totalKm, days })
  )}`;
  const tag = CAR_TAG[car.vehicleId];

  return (
    <article className="card-float flex h-full min-w-0 flex-col overflow-hidden rounded-3xl">
      {photos.length > 0 && (
        <PhotoCarousel photos={photos} label={`${car.vehicleName} photos`} delay={index * 900} className="aspect-[4/3]">
          {/* Photo opens the car's page (dots stay clickable above it) */}
          <Link
            href={`/${car.vehicleId}-rental-bangalore`}
            aria-label={`View ${car.vehicleName} details`}
            className="absolute inset-0 z-[5]"
          />
          {tag && (
            <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur sm:left-3 sm:top-3 sm:px-2.5 sm:text-[11px]">
              {tag}
            </span>
          )}
        </PhotoCarousel>
      )}

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-2 text-[13px] font-extrabold leading-snug tracking-tight sm:text-base">{car.vehicleName}</h3>
        {car.vehicleType && <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">{car.vehicleType}</p>}

        <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-semibold text-slate-600 sm:text-xs">
          {car.seats ? (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-brand-600" /> {car.seats}+1
            </span>
          ) : null}
          {car.luggage ? (
            <span className="flex items-center gap-1">
              <Luggage className="h-3.5 w-3.5 text-brand-600" /> {car.luggage}
            </span>
          ) : null}
          <span className="flex items-center gap-1">
            <Snowflake className="h-3.5 w-3.5 text-brand-600" /> AC
          </span>
        </p>

        <div className="mt-3 rounded-2xl bg-slate-50 px-2.5 py-2 ring-1 ring-slate-200/70 sm:px-3">
          <p className="text-lg font-extrabold leading-tight tracking-tight tabular-nums text-ink sm:text-xl">
            {car.fare !== null ? inr(car.fare) : <span className="text-sm">Price on request</span>}
          </p>
          <p className="mt-0.5 text-[10px] font-medium leading-snug text-slate-500 sm:text-[11px]">{fareCaption(trip, totalKm, days)}</p>
          <p className="text-[10px] font-medium leading-snug text-amber-700 sm:text-[11px]">Tolls &amp; parking extra</p>
        </div>

        {/* Terms & conditions: hidden until tapped */}
        <button
          type="button"
          aria-expanded={showTerms}
          aria-controls={termsId}
          onClick={() => setShowTerms((v) => !v)}
          className="mt-2 inline-flex w-fit items-center gap-1 text-[10.5px] font-bold text-slate-500 transition hover:text-brand-700 sm:text-[11px]"
        >
          <FileText className="h-3 w-3" /> T&amp;C
          <ChevronDown className={cn('h-3 w-3 transition-transform', showTerms && 'rotate-180')} />
        </button>
        {showTerms && (
          <ul id={termsId} className="mt-1.5 animate-fade-in space-y-1 rounded-xl bg-slate-50 p-2">
            {[...car.breakdown, ...car.terms].map((term) => (
              <li key={term} className="flex items-start gap-1.5 text-[10.5px] leading-snug text-slate-600 sm:text-[11px]">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-live-600" strokeWidth={3} />
                {term}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto grid gap-1.5 pt-3">
          <button
            type="button"
            onClick={() => requestBooking(car.vehicleId)}
            className="btn-primary w-full px-2 py-2.5 text-[13px] shadow-[0_10px_22px_-8px_rgba(56,189,248,0.8)]"
          >
            Book Now
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full px-2 py-2.5 text-[13px]"
            aria-label={`Send ${car.vehicleName} booking details on WhatsApp`}
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}

export default function FareResults() {
  const { search } = useBookingFlow();
  const sectionRef = useRef<HTMLElement>(null);

  // Bring the results into view for every new search
  useEffect(() => {
    if (search.searchId === 0 || search.status !== 'loading') return;
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }, [search.searchId, search.status]);

  if (search.status === 'idle' || !search.trip) return null;
  const trip = search.trip;

  return (
    <section ref={sectionRef} id="fares" aria-live="polite" className="ds-scope section scroll-mt-24 pb-4 pt-10">
      <div className="card-float p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <span className="eyebrow">Available cars</span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{tripTypeLabel(trip)}</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span className="min-w-0">
                  {[trip.pickup, ...(trip.stops ?? []), trip.drop].map((p) => p.name).join(' → ')}
                  {trip.serviceType === 'outstation' && ` → ${trip.pickup.name}`}
                </span>
              </li>
              <li className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand-600" /> {formatDateLong(trip.date)}
                  {trip.returnDate && ` – ${formatDateLong(trip.returnDate)}`}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-600" /> {formatTime12(trip.time)}
                </span>
                {trip.serviceType === 'outstation' && search.totalKm !== null && (
                  <span className="flex items-center gap-2">
                    <RouteIcon className="h-4 w-4 text-brand-600" /> ~{search.totalKm} km round trip · {search.days} day
                    {search.days > 1 ? 's' : ''}
                  </span>
                )}
              </li>
            </ul>
          </div>
          <button type="button" onClick={() => scrollToBook()} className="btn-ghost shrink-0">
            <Pencil className="h-4 w-4" /> Edit trip
          </button>
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
          <Info className="mt-px h-4 w-4 shrink-0" />
          Toll fees, parking and state permits are paid by the customer and are not included in these fares.
        </p>
      </div>

      {search.status === 'loading' && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card-float overflow-hidden">
              <div className="shimmer aspect-[4/3]" />
              <div className="space-y-2 p-3">
                <div className="shimmer h-8 w-1/2 rounded-lg" />
                <div className="shimmer h-3 rounded-full" />
                <div className="shimmer h-3 w-4/5 rounded-full" />
                <div className="shimmer h-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {search.status === 'error' && (
        <div className="card-float mt-5 p-6 text-center">
          <p className="text-sm font-semibold text-rose-600">{search.error}</p>
          <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-4">
            <MessageCircle className="h-4 w-4" /> WhatsApp for a Quick Quote
          </a>
        </div>
      )}

      {search.status === 'done' && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {search.results.map((car, i) => (
            <div key={car.vehicleId} className="min-w-0 animate-fade-up">
              <ResultCard car={car} trip={trip} totalKm={search.totalKm} days={search.days} index={i} />
            </div>
          ))}
          {search.results.length === 0 && (
            <p className="card-float p-6 text-sm text-slate-600 col-span-2 lg:col-span-4">
              No cars are available for this trip right now. Please WhatsApp us and we&apos;ll arrange one.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

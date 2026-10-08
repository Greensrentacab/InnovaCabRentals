'use client';

/**
 * FareResults.tsx — available cars, prices, per-car T&Cs and WhatsApp
 * actions, rendered inline directly under the booking widget's section after
 * "See Fares & Available Innovas" (design.md §3.3 cards, §3.0 buttons).
 *
 * The WhatsApp button sends the full trip + selected car to the dispatch
 * (admin) WhatsApp number. "Request Booking" opens the booking modal so the
 * request is also saved to Admin → Bookings.
 */

import { useEffect, useRef } from 'react';
import { ArrowRight, Calendar, Check, Clock, Info, Luggage, MapPin, MessageCircle, Pencil, Route as RouteIcon, Users } from 'lucide-react';
import { useBookingFlow, type FareResult, type TripParams } from '@/context/BookingFlowContext';
import { siteConfig } from '@/lib/siteConfig';
import { primaryPhoto } from '@/lib/fleetPhotos';
import { formatDateLong, formatTime12 } from '@/lib/time';
import { scrollToBook } from '@/components/home/scrollToBook';
import { PhotoCredit } from '@/components/ds/VehiclePhotoCard';

const SERVICE_LABEL: Record<string, string> = {
  outstation: 'Outstation (Round Trip)',
  airport: 'Airport Transfer',
  local: 'Local Hourly Rental',
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
  if (trip.serviceType === 'local') return `Local Hourly Rental${trip.packageLabel ? ` · ${trip.packageLabel}` : ''}`;
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

function ResultCard({ car, trip, totalKm, days }: { car: FareResult; trip: TripParams; totalKm: number | null; days: number }) {
  const { requestBooking } = useBookingFlow();
  const photo = primaryPhoto(car.vehicleId);
  const waUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
    buildAdminWhatsAppMessage(trip, car, { totalKm, days })
  )}`;

  return (
    <article className="card-float card-float-hover flex h-full flex-col overflow-hidden">
      {photo && (
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">{car.vehicleType}</p>
            <h3 className="text-xl font-extrabold leading-tight">{car.vehicleName}</h3>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {!photo && <h3 className="text-xl font-extrabold tracking-tight">{car.vehicleName}</h3>}

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Estimated fare</p>
            <p className="text-3xl font-extrabold tracking-tight tabular-nums text-ink">
              {car.fare !== null ? inr(car.fare) : <span className="text-xl">Price on request</span>}
            </p>
          </div>
          <div className="flex shrink-0 gap-1.5 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1">
              <Users className="h-3.5 w-3.5 text-brand-600" /> {car.seats}
            </span>
            <span className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1">
              <Luggage className="h-3.5 w-3.5 text-brand-600" /> {car.luggage}
            </span>
          </div>
        </div>

        {car.breakdown.length > 0 && (
          <ul className="mt-3 space-y-1 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
            {car.breakdown.map((line) => (
              <li key={line} className="tabular-nums">
                {line}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Terms &amp; conditions</p>
          <ul className="mt-2 space-y-1.5">
            {car.terms.map((term) => (
              <li key={term} className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-live-500/10 text-live-600">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                {term}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto grid grid-cols-[auto_1fr] gap-2 pt-5">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp h-12 w-12 p-0"
            aria-label={`Send ${car.vehicleName} booking details on WhatsApp`}
            title="Send trip & car details on WhatsApp"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          <button type="button" onClick={() => requestBooking(car.vehicleId)} className="btn-primary group">
            Request Booking
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        {photo && <PhotoCredit photo={photo} className="mt-3 block" />}
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
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card-float overflow-hidden">
              <div className="shimmer aspect-[16/9]" />
              <div className="space-y-3 p-5">
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
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {search.results.map((car) => (
            <div key={car.vehicleId} className="min-w-0 animate-fade-up">
              <ResultCard car={car} trip={trip} totalKm={search.totalKm} days={search.days} />
            </div>
          ))}
          {search.results.length === 0 && (
            <p className="card-float p-6 text-sm text-slate-600 md:col-span-2 lg:col-span-3">
              No cars are available for this trip right now. Please WhatsApp us and we&apos;ll arrange one.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

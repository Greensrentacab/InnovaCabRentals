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

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Calendar, ChevronRight, Clock, FileText, Info, Luggage, MapPin, MessageCircle, Pencil, Route as RouteIcon, Users } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useBookingFlow, type FareResult, type TripParams } from '@/context/BookingFlowContext';
import { siteConfig } from '@/lib/siteConfig';
import { fleetPhotos } from '@/lib/fleetPhotos';
import CardGallery from '@/components/ds/CardGallery';
import TermsSheet from '@/components/ds/TermsSheet';
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
  const closeTerms = useCallback(() => setShowTerms(false), []);
  // Car photo carousel (our own fleet photos where available)
  const photos = (fleetPhotos[car.vehicleId] ?? []).slice(0, 5);
  const waUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
    buildAdminWhatsAppMessage(trip, car, { totalKm, days })
  )}`;

  // Same layout as the homepage "Our fleet" cards, plus the trip fare
  return (
    <article className="card-float card-float-hover flex h-full flex-col overflow-hidden !rounded-xl">
      {photos.length > 0 && (
        <CardGallery photos={photos} label={`${car.vehicleName} photos`} delay={index * 900} className="aspect-[4/3]">
          {car.seats ? (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-bold text-ink shadow-sm">
              {car.seats} + driver
            </span>
          ) : null}
        </CardGallery>
      )}

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="min-h-[2.5em] text-[15px] font-extrabold leading-tight tracking-tight sm:text-lg">{car.vehicleName}</h3>

        {(car.seats || car.luggage) ? (
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-600">
            {car.seats ? (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5 shrink-0 text-brand-600" /> {car.seats} seats
              </span>
            ) : null}
            {car.luggage ? (
              <span className="inline-flex items-center gap-1">
                <Luggage className="h-3.5 w-3.5 shrink-0 text-brand-600" /> {car.luggage} bags
              </span>
            ) : null}
          </p>
        ) : null}

        <div className="mt-auto pt-3">
          <div className="border-t border-slate-100 pt-3">
            <p className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wide text-slate-400">Estimated fare</p>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <p className="text-xl font-extrabold leading-tight tracking-tight tabular-nums text-ink sm:text-2xl">
                {car.fare !== null ? inr(car.fare) : <span className="text-sm">Price on request</span>}
              </p>
            {/* Terms & conditions: hidden until the customer taps the button */}
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => setShowTerms(true)}
              className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 transition hover:text-brand-700"
            >
              <FileText className="h-3 w-3" /> Terms
              <ChevronRight className="h-3 w-3" />
            </button>
            </div>
          </div>
          <TermsSheet
            open={showTerms}
            onClose={closeTerms}
            title={car.vehicleName}
            subtitle={car.fare !== null ? `Estimated fare ${inr(car.fare)}` : undefined}
            terms={car.terms}
          />

          <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp !min-h-0 h-11 w-11 !rounded-lg p-0"
              aria-label={`Send ${car.vehicleName} booking details on WhatsApp`}
              title="Send trip & car details on WhatsApp"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
            </a>
            <button type="button" onClick={() => requestBooking(car.vehicleId)} className="btn-primary !min-h-0 h-11 !rounded-lg !px-3 text-sm">
              Book
            </button>
          </div>
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
      <div className="card-float overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-brand-700">Available cars</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{tripTypeLabel(trip)}</h2>
            </div>
            <button
              type="button"
              onClick={() => scrollToBook()}
              className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 transition hover:border-brand-300 hover:text-brand-700"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>

          {/* Route as a simple timeline */}
          {(() => {
            const points = [trip.pickup, ...(trip.stops ?? []), trip.drop].map((p) => p.name);
            if (trip.serviceType === 'outstation') points.push(trip.pickup.name);
            return (
              <ol className="relative mt-4 space-y-2.5 pl-6">
                <span className="absolute bottom-2 left-[5px] top-2 w-px bg-slate-300" aria-hidden="true" />
                {points.map((name, i) => (
                  <li key={`${name}-${i}`} className="relative text-sm font-semibold leading-snug text-ink">
                    <span
                      className={cn(
                        'absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-brand-600',
                        i === points.length - 1 ? 'bg-brand-600' : 'bg-white'
                      )}
                      aria-hidden="true"
                    />
                    {name}
                  </li>
                ))}
              </ol>
            );
          })()}

          {/* Date, time and distance chips */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
              <Calendar className="h-3.5 w-3.5 text-brand-600" /> {formatDateLong(trip.date)}
              {trip.returnDate && ` – ${formatDateLong(trip.returnDate)}`}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-brand-600" /> {formatTime12(trip.time)}
            </span>
            {trip.serviceType === 'outstation' && search.totalKm !== null && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                <RouteIcon className="h-3.5 w-3.5 text-brand-600" /> ~{search.totalKm} km round trip · {search.days} day
                {search.days > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <p className="flex items-start gap-2 border-t border-amber-100 bg-amber-50/80 px-4 py-2.5 text-[11px] font-semibold leading-snug text-amber-800 sm:px-6">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" />
          Toll fees, parking and state permits are paid by the customer and are not included in these fares.
        </p>
      </div>

      {search.status === 'loading' && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
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
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
          {[...search.results]
            .sort((a, b) => (a.fare ?? Infinity) - (b.fare ?? Infinity))
            .map((car, i) => (
            <div key={car.vehicleId} className="min-w-0 animate-fade-up">
              <ResultCard car={car} trip={trip} totalKm={search.totalKm} days={search.days} index={i} />
            </div>
          ))}
          {search.results.length === 0 && (
            <p className="card-float p-6 text-sm text-slate-600 col-span-2 xl:col-span-4">
              No cars are available for this trip right now. Please WhatsApp us and we&apos;ll arrange one.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

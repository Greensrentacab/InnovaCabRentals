/**
 * FleetSection.tsx — featured vehicles (design.md §3.3 "Fleet card").
 * Only confirmed models are passed in (Innova, Innova Crysta, Innova Hycross & Ertiga).
 */

import Link from 'next/link';
import { ArrowRight, Check, Clock, Luggage, Plane, Route, Users } from 'lucide-react';
import Reveal from '@/components/home/Reveal';
import BookButton from '@/components/home/BookButton';
import { rateRows } from '@/components/ds/RateList';
import type { FleetPhoto } from '@/lib/fleetPhotos';
import type { VehicleRates } from '@/lib/types';
import { cn } from '@/lib/cn';

export interface FleetCardData {
  id: string;
  name: string;
  shortName: string;
  type: string;
  tagline: string;
  seats: number;
  luggage: number;
  features: string[];
  fares: { label: string; value: string }[];
  href: string;
  /** Built-in photo or the one published in Admin → Homepage images */
  photo?: Pick<FleetPhoto, 'src' | 'alt' | 'width' | 'height' | 'position'> & { srcSet?: string };
  rates?: VehicleRates;
}

export default function FleetSection({ vehicles }: { vehicles: FleetCardData[] }) {
  return (
    <section id="fleet" className="section scroll-mt-24 pb-8 pt-6 sm:py-20">
      <div className="flex items-end justify-between gap-3 md:gap-4">
        <div className="max-w-2xl">
          <span className="eyebrow">Our fleet</span>
          <h2 className="section-title mt-3 sm:mt-4">
            {vehicles.length === 4 ? 'Four cars. Pick your comfort.' : vehicles.length === 3 ? 'Three cars. Pick your comfort.' : 'Pick your car.'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 md:mt-3 md:text-base">
            Every car is sanitised after each trip, GPS-enabled and maintained to the highest safety standards.
          </p>
        </div>
        <Link href="#compare-fleet" className="btn-ghost group shrink-0 !min-h-0 px-3 py-2 text-[13px] md:px-4 md:py-2.5 md:text-sm">
          Compare fleet
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className={cn('no-scrollbar -mx-4 mt-5 flex scroll-px-4 snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain [touch-action:pan-x_pan-y] px-4 pb-3 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:mt-10 md:grid md:grid-cols-2 md:gap-5 md:overflow-y-visible md:overflow-x-visible md:p-0', vehicles.length >= 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3')}>
        {vehicles.map((v, i) => (
          <Reveal key={v.id} delay={i * 0.1} className="h-full w-[76%] shrink-0 snap-start max-md:max-w-[300px] md:w-auto">
            <article className="card-float card-float-hover relative max-md:shadow-none flex h-full flex-col overflow-hidden">
              {v.photo && (
                <Link href={v.href} className="group relative block aspect-[16/10] overflow-hidden bg-slate-100 max-md:aspect-[3/2]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.photo.src}
                    srcSet={v.photo.srcSet}
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    alt={v.photo.alt}
                    width={v.photo.width}
                    height={v.photo.height}
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: v.photo.position }}
                    className="h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
                  />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-slate-950/75 via-slate-950/30 to-transparent" />
                  <span className="absolute inset-x-3 bottom-2 block text-base md:inset-x-4 md:bottom-3 md:text-[1.35rem] font-extrabold leading-tight tracking-tight text-white drop-shadow">
                    {v.name}
                  </span>
                </Link>
              )}
              <div className="flex min-w-0 flex-1 flex-col p-3 md:p-5">
              <p className="w-fit rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700">{v.type}</p>
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-slate-600 md:mt-2 md:text-sm">{v.tagline}</p>

              <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-xs md:mt-4 md:gap-2 md:text-[13px] font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-50/70 px-2.5 py-1.5 md:gap-2 md:rounded-xl md:px-3 md:py-2.5">
                  <Users className="h-4 w-4 shrink-0 text-brand-600" /> {v.seats} + driver
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-50/70 px-2.5 py-1.5 md:gap-2 md:rounded-xl md:px-3 md:py-2.5">
                  <Luggage className="h-4 w-4 shrink-0 text-brand-600" /> {v.luggage} bags
                </span>
              </div>

              <ul className="mt-2.5 grid gap-y-1 md:mt-4 md:gap-y-1.5">
                {v.features.map((feature, fi) => (
                  <li key={feature} className={cn(fi >= 3 && 'max-md:hidden', 'flex items-start gap-2 text-xs font-medium leading-snug text-slate-700 md:text-[13px]')}>
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-live-600" strokeWidth={3} />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-3 md:pt-5">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 md:mb-2">Starting fares</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {v.fares.map((fare, fi) => {
                    const FareIcon = [Plane, Route, Clock][fi] ?? Clock;
                    return (
                      <div key={fare.label} className="rounded-lg border border-slate-200/80 bg-white px-1 py-1.5 text-center md:rounded-xl md:px-1.5 md:py-2.5 shadow-sm">
                        <FareIcon className="mx-auto h-4 w-4 text-brand-600" aria-hidden="true" />
                        <p className="mt-1 text-sm font-extrabold md:mt-1.5 md:text-[15px] leading-none tabular-nums text-ink">{fare.value}</p>
                        <p className="mt-1 text-[9px] font-bold uppercase leading-tight md:mt-1.5 md:text-[10px] tracking-wide text-slate-400">
                          {fare.label.replace(/\s*package/i, '')}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 md:mt-4">
                  <Link href={v.href} className="btn-ghost group whitespace-nowrap px-3 max-md:!min-h-0 max-md:py-2 max-md:text-[13px]">
                    View details
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 xl:hidden 2xl:block" />
                  </Link>
                  <BookButton className="btn-primary px-3 max-md:!min-h-0 max-md:shadow-none max-md:py-2 max-md:text-[13px]">Book</BookButton>
                </div>
              </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {vehicles.length > 1 && (
        <Reveal className="mt-12">
          <div id="compare-fleet" className="scroll-mt-24">
            <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">Compare side by side</h3>
            <p className="mt-1 text-sm text-slate-600">
              Seats, luggage and current rates. Tolls, parking &amp; state permits are paid by the customer.
            </p>
            <p className="mt-3 text-xs font-semibold text-slate-400 md:hidden">Swipe sideways to compare all cars →</p>
            <div className="card-float mt-2 overflow-x-auto overflow-y-hidden overscroll-x-contain [touch-action:pan-x_pan-y] md:mt-5">
              <table className="w-full min-w-[620px] border-separate border-spacing-0 text-left text-sm md:min-w-[760px]">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-20 w-[96px] min-w-[96px] border-b border-slate-100 bg-white px-3 py-3 align-bottom text-[10px] font-bold uppercase tracking-wide text-slate-400 md:w-[22%] md:px-4">
                      Feature
                    </th>
                    {vehicles.map((v) => (
                      <th key={v.id} className="min-w-[132px] border-b border-slate-100 bg-slate-50/70 px-3 py-3 align-top md:px-4">
                        <Link href={v.href} className="group block">
                          {v.photo && (
                            <span className="mb-2 block aspect-[16/10] w-full max-w-[180px] overflow-hidden rounded-lg bg-slate-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={v.photo.src}
                                alt={v.photo.alt}
                                width={v.photo.width}
                                height={v.photo.height}
                                loading="lazy"
                                decoding="async"
                                style={{ objectPosition: v.photo.position }}
                                className="h-full w-full object-cover"
                              />
                            </span>
                          )}
                          <span className="block min-h-[2.5em] text-[13px] font-extrabold leading-tight tracking-tight text-ink group-hover:text-brand-700 md:text-sm">
                            {v.name}
                          </span>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th colSpan={vehicles.length + 1} className="sticky left-0 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700 md:px-4">
                      Specifications
                    </th>
                  </tr>
                  {[
                    { label: 'Type', get: (v: FleetCardData) => v.type },
                    { label: 'Passengers', get: (v: FleetCardData) => `${v.seats} + driver` },
                    { label: 'Luggage', get: (v: FleetCardData) => `${v.luggage} bags` },
                  ].map((row) => (
                    <tr key={row.label}>
                      <th className="sticky left-0 z-10 border-b border-slate-100 bg-white px-3 py-3 align-top text-xs font-semibold text-slate-500 md:px-4 md:text-sm">{row.label}</th>
                      {vehicles.map((v) => (
                        <td key={v.id} className="border-b border-slate-100 px-3 py-3 align-top text-[13px] font-semibold leading-snug md:px-4 md:text-sm">{row.get(v)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th colSpan={vehicles.length + 1} className="sticky left-0 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700 md:px-4">
                      Rates
                    </th>
                  </tr>
                  {rateRows().map((row, i) => (
                    <tr key={row.label}>
                      <th className="sticky left-0 z-10 border-b border-slate-100 bg-white px-3 py-3 align-top text-xs font-semibold leading-snug text-slate-500 md:px-4 md:text-sm">{row.label}</th>
                      {vehicles.map((v) => (
                        <td key={v.id} className="border-b border-slate-100 px-3 py-3 align-top text-[13px] font-extrabold tabular-nums md:px-4 md:text-sm">
                          {rateRows(v.rates)[i].value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      )}
    </section>
  );
}

/**
 * VehicleDetailTemplate.tsx — vehicle pages (/innova-rental-bangalore, etc.)
 * built to design.md: inner hero with representative photo card (§3.6, §3.3),
 * photo gallery, feature/spec cards, sticky reservation card, CTA band.
 */

import Link from 'next/link';
import { ArrowRight, Check, ChevronRight, Clock, Luggage, MapPin, Phone, Users } from 'lucide-react';
import WhatsAppIcon from '@/components/ds/WhatsAppIcon';
import { Vehicle } from '@/lib/types';
import { siteConfig } from '@/lib/siteConfig';
import { getSiteImages } from '@/lib/siteContentStore';
import { carPhotos } from '@/lib/siteImages';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import ProductGallery from '@/components/ds/ProductGallery';
import CtaBand from '@/components/ds/CtaBand';
import Reveal from '@/components/home/Reveal';
import { rateRows } from '@/components/ds/RateList';

export interface VehicleDetailTemplateProps {
  vehicle: Vehicle;
  h1: string;
  tagline: string;
  overview: string;
  idealFor: string[];
  detailedSpecs?: {
    label: string;
    value: string;
  }[];
}

const included = [
  'Experienced, background-verified chauffeur',
  'Sanitized, air-conditioned vehicle',
  'Doorstep pickup anywhere in Bangalore',
  '24/7 dedicated dispatch support',
];

export default async function VehicleDetailTemplate({
  vehicle,
  h1,
  tagline,
  overview,
  idealFor,
  detailedSpecs,
}: VehicleDetailTemplateProps) {
  const images = await getSiteImages();
  const whatsappUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
    `Hello ${siteConfig.brand.name}, I am interested in renting the ${vehicle.name} in Bangalore. Please share tariff and availability.`
  )}`;
  // Published photo set (Admin → Homepage images → Car photos), else the built-in photos
  const photos = carPhotos(images, vehicle.id);
  const rows = rateRows(vehicle.rates);

  return (
    <div className="bg-porcelain">
      <header className="section pt-28 sm:pt-32 lg:pt-28">
        <BreadcrumbJsonLd items={[{ label: 'Vehicles', href: '/vehicles' }, { label: vehicle.name }]} />
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/vehicles" className="hover:text-brand-700">Vehicles</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-700" aria-current="page">{vehicle.name}</span>
        </nav>
      </header>

      <section className="section pb-12 pt-4 sm:pb-16 sm:pt-5">
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
          {/* Title: above the gallery on phones, beside it (over the price card) on desktop */}
          <div className="min-w-0 lg:col-start-2 lg:row-start-1">
            <span className="eyebrow mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
              {vehicle.type} · Bangalore
            </span>
            <h1 className="text-balance text-xl font-extrabold leading-snug tracking-tight text-ink sm:text-3xl lg:text-[1.75rem] lg:leading-tight">
              {h1}
            </h1>
          </div>

          <div className="min-w-0 space-y-8 lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <ProductGallery photos={photos} />

            <div>
              <p className="font-bold text-brand-700">{tagline}</p>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight">About the {vehicle.name}</h2>
              <p className="mt-2 leading-relaxed text-slate-600">{overview}</p>
            </div>

            <Reveal>
              <div className="card-float p-6 sm:p-8">
                <h2 className="text-xl font-extrabold tracking-tight">Key features &amp; cabin amenities</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {vehicle.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-live-500/10 text-live-600">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {detailedSpecs && detailedSpecs.length > 0 && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Technical &amp; cabin specifications
                    </h3>
                    <dl className="mt-2 divide-y divide-slate-100 text-sm">
                      {detailedSpecs.map((spec) => (
                        <div key={spec.label} className="flex items-baseline justify-between gap-4 py-2">
                          <dt className="shrink-0 text-xs font-semibold text-slate-500">{spec.label}</dt>
                          <dd className="text-right font-bold text-ink">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal>
              <div className="card-float p-6 sm:p-8">
                <h2 className="text-xl font-extrabold tracking-tight">Ideal for your travel needs</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Whether traveling across Bengaluru city hubs or taking a long-distance road trip, the {vehicle.name}{' '}
                  delivers optimum comfort for:
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {idealFor.map((item) => (
                    <li key={item} className="pill">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Sticky reservation card */}
          <aside className="min-w-0 space-y-5 lg:sticky lg:top-28 lg:col-start-2 lg:row-start-2">
            <div className="card-float p-6 shadow-float-lg">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Outstation from</p>
                  <p className="mt-1 text-3xl font-extrabold leading-none tracking-tight text-ink">
                    {rows[0].value.replace('/km', '')}
                    {rows[0].value.endsWith('/km') && <span className="text-base font-bold text-slate-500"> /km</span>}
                  </p>
                </div>
                <span className="rounded-full bg-live-500/10 px-2.5 py-1 text-[11px] font-bold text-live-600">No surge pricing</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {[rows[3], rows[4], rows[5], rows[2]].map((row) => (
                  <div key={row.label} className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{row.label}</p>
                    <p className="mt-0.5 text-base font-extrabold tabular-nums text-ink">{row.value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Outstation billed for a minimum of {rows[1].value} per day. Custom local durations on request.
              </p>
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700">
                Tolls, parking &amp; state permits paid by customer.
              </p>

              <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 text-sm font-medium text-slate-700">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0 text-brand-600" /> {vehicle.seats} passengers
                </span>
                <span className="flex items-center gap-2">
                  <Luggage className="h-4 w-4 shrink-0 text-brand-600" /> {vehicle.luggage} suitcases
                </span>
              </div>

              <ul className="mt-4 space-y-2">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-live-500/10 text-live-600">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 grid gap-2">
                <Link href="/contact-and-booking" className="btn-primary group w-full py-3.5 text-[15px]">
                  Reserve {vehicle.name}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full">
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp Us for Quick Quote
                </a>
                <a href={siteConfig.contact.phone.tel} className="btn-ghost w-full">
                  <Phone className="h-4 w-4" /> Call {siteConfig.contact.phone.display}
                </a>
              </div>
              <p className="mt-3 text-center text-[11px] text-slate-500">
                Submitting reserves your booking request. Contact our team to pre-book in advance.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-sm text-slate-300 shadow-float">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-600/40 blur-3xl" />
              <p className="relative text-[11px] font-bold uppercase tracking-[0.12em] text-brand-400">Head dispatch office</p>
              <p className="relative mt-3 flex items-start gap-2 leading-relaxed">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                {siteConfig.contact.address.full}
              </p>
              <p className="relative mt-3 flex items-center gap-2 border-t border-white/10 pt-3 font-semibold text-live-400">
                <Clock className="h-4 w-4" /> {siteConfig.contact.hours}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <CtaBand title={`Reserve your ${vehicle.name}`} />
    </div>
  );
}

/**
 * VehicleDetailTemplate.tsx — vehicle pages (/innova-rental-bangalore, etc.)
 * built to design.md: inner hero with representative photo card (§3.6, §3.3),
 * photo gallery, feature/spec cards, sticky reservation card, CTA band.
 */

import Link from 'next/link';
import { ArrowRight, Check, Clock, Luggage, MapPin, MessageCircle, Phone, Users } from 'lucide-react';
import { Vehicle } from '@/lib/types';
import { siteConfig } from '@/lib/siteConfig';
import { fleetPhotos } from '@/lib/fleetPhotos';
import PageHero from '@/components/ds/PageHero';
import CtaBand from '@/components/ds/CtaBand';
import VehiclePhotoCard from '@/components/ds/VehiclePhotoCard';
import Reveal from '@/components/home/Reveal';
import RateList from '@/components/ds/RateList';

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

export default function VehicleDetailTemplate({
  vehicle,
  h1,
  tagline,
  overview,
  idealFor,
  detailedSpecs,
}: VehicleDetailTemplateProps) {
  const whatsappUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
    `Hello ${siteConfig.brand.name}, I am interested in renting the ${vehicle.name} in Bangalore. Please share tariff and availability.`
  )}`;
  const photos = fleetPhotos[vehicle.id] ?? [];
  const [mainPhoto, ...galleryPhotos] = photos;

  return (
    <div className="bg-porcelain">
      <PageHero
        breadcrumbs={[{ label: 'Vehicles', href: '/vehicles' }, { label: vehicle.name }]}
        eyebrow={vehicle.type}
        title={h1}
        lead={
          <>
            <p className="font-bold text-brand-700">{tagline}</p>
            <p className="mt-3">{overview}</p>
          </>
        }
        aside={
          mainPhoto ? (
            <VehiclePhotoCard
              photo={mainPhoto}
              eyebrow={vehicle.type}
              title={vehicle.name}
              badge={`${vehicle.seats} seats`}
              priority
            />
          ) : undefined
        }
      >
        <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <a href={siteConfig.contact.phone.tel} className="btn-primary">
            <Phone className="h-4 w-4" /> {siteConfig.cta.instantBooking}
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            <MessageCircle className="h-4 w-4" /> {siteConfig.cta.quickQuote}
          </a>
        </div>
      </PageHero>

      <section className="section py-16 sm:py-20">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            {galleryPhotos.length > 0 && (
              <Reveal>
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">{vehicle.name} photo gallery</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {galleryPhotos.map((photo) => (
                      <VehiclePhotoCard key={photo.src} photo={photo} title={photo.label} showNote={false} className="rounded-3xl" />
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

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
                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Technical &amp; cabin specifications
                    </h3>
                    <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {detailedSpecs.map((spec) => (
                        <div key={spec.label} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
                          <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{spec.label}</dt>
                          <dd className="mt-0.5 text-sm font-bold text-ink">{spec.value}</dd>
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
          <aside className="space-y-5 lg:sticky lg:top-28">
            <div className="card-float p-6 shadow-float-lg">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Rental tariff</p>
              <p className="mt-1 text-xs text-slate-500">Per-km and package billing with zero surge pricing</p>
              <RateList rates={vehicle.rates} className="mt-3" />

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-medium text-slate-700">
                  <Users className="h-4 w-4 shrink-0 text-brand-600" /> {vehicle.seats} passengers
                </span>
                <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-medium text-slate-700">
                  <Luggage className="h-4 w-4 shrink-0 text-brand-600" /> {vehicle.luggage} suitcases
                </span>
              </div>

              <ul className="mt-5 space-y-2.5">
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
                <Link href="/contact" className="btn-primary group w-full py-3.5 text-[15px]">
                  Reserve {vehicle.name}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full">
                  <MessageCircle className="h-4 w-4" /> WhatsApp Us for Quick Quote
                </a>
                <a href={siteConfig.contact.phone.tel} className="btn-ghost w-full">
                  <Phone className="h-4 w-4" /> Call {siteConfig.contact.phone.display}
                </a>
              </div>
              <p className="mt-3 text-center text-[11px] text-slate-500">
                No advance payment needed. Submitting reserves your booking request.
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

/**
 * LandingTemplate.tsx — service landing pages (/airport-taxi, /local-rides,
 * /outstation-cabs), built to design.md:
 *  - Inner page hero with aside (§2.3, §3.6) + Quick Fare Estimate widget (§3.2)
 *  - Local packages (§3.2.4 / §3.3), benefits cards, route grid (§3.3)
 *  - Local coverage grid, fleet cards (§3.3), FAQ accordion + dark CTA band (§3.6)
 */

import React from 'react';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { HeroCover } from '@/components/home/HeroScene';
import { ArrowRight, ChevronRight, Clock, MapPin, Phone, Radar, ShieldCheck, Users, BadgeIndianRupee } from 'lucide-react';
import WhatsAppIcon from '@/components/ds/WhatsAppIcon';
import PackageSelector from '@/components/PackageSelector';
import QuickBookingWidget from '@/components/home/QuickBookingWidget';
import FleetSection from '@/components/home/FleetSection';
import FaqAccordion from '@/components/home/FaqAccordion';
import RouteCard from '@/components/home/RouteCard';
import FareResults from '@/components/FareResults';
import BookButton from '@/components/home/BookButton';
import Reveal from '@/components/home/Reveal';
import type { HomeService } from '@/components/home/scrollToBook';
import { siteConfig } from '@/lib/siteConfig';
import { cn } from '@/lib/cn';
import { LocalPackage, Route, Vehicle } from '@/lib/types';
import {
  buildFleetCards,
  buildRouteCards,
  buildWidgetData,
  confirmedFleet,
  sortPackages,
} from '@/lib/storefrontData';
import { getPublishedPolicies, getSiteImages } from '@/lib/siteContentStore';
import { IncludedExcluded } from '@/components/policies/PolicyViews';

export interface LandingBenefit {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export interface LandingFaq {
  q: string;
  a: string;
}

export interface LandingTemplateProps {
  /** Breadcrumb label for the current page */
  breadcrumb: string;
  badge: string;
  title: string;
  subtitle: string;
  heroNotice?: string;
  benefitsTitle?: string;
  benefitsSubtitle?: string;
  benefits: LandingBenefit[];
  routesTitle?: string;
  routesSubtitle?: string;
  /** Routes shown in the route grid */
  routes: Route[];
  /** Every route (feeds the booking widget's destinations + fleet fares) */
  allRoutes: Route[];
  vehicles: Vehicle[];
  /** Local packages (feed the widget + fleet fares) */
  localPackages: LocalPackage[];
  /** Show the local package selector section */
  showPackages?: boolean;
  faqs: LandingFaq[];
  showLocalAreas?: boolean;
  localAreasTitle?: string;
  customCtaTitle?: string;
  serviceType: HomeService;
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  centered = true,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}) {
  return (
    <div className={cn('max-w-2xl', centered && 'mx-auto text-center')}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-slate-600">{subtitle}</p>}
    </div>
  );
}

const hairline = (
  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
);

export default async function LandingTemplate({
  breadcrumb,
  badge,
  title,
  subtitle,
  heroNotice,
  benefitsTitle = 'Why Choose Our Service',
  benefitsSubtitle = 'Transparent billing, experienced chauffeurs, and immaculately maintained Toyota MPVs.',
  benefits,
  routesTitle = 'Popular Travel Routes',
  routesSubtitle = 'Top destinations with fixed transparent rates and reliable highway chauffeurs.',
  routes,
  allRoutes,
  vehicles,
  localPackages,
  showPackages = false,
  faqs,
  showLocalAreas = false,
  localAreasTitle = 'Bangalore Local Pickup & Drop Coverage',
  customCtaTitle = 'Reserve Your Innova in Advance',
  serviceType,
}: LandingTemplateProps) {
  const fleet = confirmedFleet(vehicles);
  const [images, policies] = await Promise.all([getSiteImages(), getPublishedPolicies()]);
  const widgetData = buildWidgetData(allRoutes, localPackages, fleet, images);
  const routeCards = buildRouteCards(routes, fleet, images);
  const fleetCards = buildFleetCards(fleet, images);

  return (
    <div className="ds-scope bg-porcelain">
      {/* ================================================================ */}
      {/* 1. INNER PAGE HERO + QUICK FARE ESTIMATE                         */}
      {/*    No overflow-hidden on the section: the calendar pop-up must   */}
      {/*    extend past it (design.md §3.2.1).                            */}
      {/* ================================================================ */}
      <section className="relative isolate z-10 pb-4 pt-0 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-14 lg:pt-28">
        {/* Desktop: full-bleed picture with a dark wash, same look as the homepage */}
        <HeroCover desktop scene={serviceType} images={images.hero} className="-z-10 hidden lg:block" />

        <div className="section grid w-full items-start gap-6 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-center lg:gap-12">
          <div className="relative min-w-0 lg:col-start-1 lg:row-start-1 lg:pt-4">
            {/* Phones/tablets: picture runs edge to edge from the top with the copy on it */}
            <div className="relative -mx-4 px-4 pb-14 pt-[6rem] sm:-mx-6 sm:px-6 sm:pt-28 lg:mx-0 lg:overflow-visible lg:p-0">
              <HeroCover scene={serviceType} images={images.hero} className="lg:hidden" />
              <div className="relative max-lg:[text-shadow:0_1px_3px_rgba(0,0,0,0.6),0_2px_16px_rgba(0,0,0,0.45)]">
                <BreadcrumbJsonLd items={[{ label: breadcrumb }]} />
                <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs font-semibold text-white/80 [text-shadow:none]">
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-white" aria-current="page">
                    {breadcrumb}
                  </span>
                </nav>

                <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border max-sm:hidden border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white shadow-sm backdrop-blur-md [text-shadow:none]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-live-500" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  {badge}
                </span>

                <h1 className="text-balance mt-0 animate-fade-up text-[2.15rem] font-extrabold leading-[1.02] tracking-tight text-white [animation-delay:80ms] sm:mt-6 sm:text-5xl lg:text-[3.25rem]">
                  {title}
                </h1>

                <span className="mt-3 block h-1 w-12 rounded-full bg-sky-300 lg:hidden" aria-hidden="true" />
                <p className="mt-3 line-clamp-4 max-w-xl animate-fade-up text-[13px] font-medium leading-snug text-white [animation-delay:160ms] sm:mt-5 sm:line-clamp-none sm:text-lg">
                  {subtitle}
                </p>

                {heroNotice && (
                  <p className="mt-4 inline-flex max-w-xl items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md [text-shadow:none]">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-300" />
                    {heroNotice}
                  </p>
                )}

                {/* Trust points: two per row on phones, one open row on desktop */}
                <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 whitespace-nowrap text-[12px] font-semibold text-white sm:max-w-md sm:text-sm lg:mt-7 lg:flex lg:max-w-none lg:flex-wrap lg:items-center lg:gap-x-6 lg:gap-y-2 lg:[text-shadow:0_1px_6px_rgba(0,0,0,0.6)] max-lg:[text-shadow:0_1px_3px_rgba(0,0,0,0.7),0_2px_12px_rgba(0,0,0,0.5)]">
                  {[
                    { icon: ShieldCheck, tone: 'text-emerald-300', label: 'Verified drivers' },
                    serviceType === 'airport'
                      ? { icon: Radar, tone: 'text-sky-300', label: 'Flight tracking' }
                      : { icon: Clock, tone: 'text-sky-300', label: siteConfig.contact.hours },
                    { icon: BadgeIndianRupee, tone: 'text-sky-300', label: 'Transparent price' },
                  ].map(({ icon: Icon, tone, label }) => (
                    <li key={label} className="flex items-center gap-2">
                      <Icon className={`h-[18px] w-[18px] shrink-0 ${tone}`} /> {label}
                    </li>
                  ))}
                  <li className="flex items-center gap-2">
                    <Users className="h-[18px] w-[18px] shrink-0 text-sky-300" /> {siteConfig.trustClaims.customersServed.label}
                  </li>
                </ul>

                {/* Room for the car in the picture */}
                <div className="h-12 sm:h-48 lg:h-[clamp(120px,22vh,260px)]" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="relative z-10 -mt-[100px] min-w-0 lg:col-start-2 lg:row-start-1 lg:mt-0 lg:pt-4">
            <QuickBookingWidget {...widgetData} initialService={serviceType} />
          </div>
        </div>
      </section>

      {/* Available cars, prices & T&Cs (after "See Fares") */}
      <FareResults />

      {/* ================================================================ */}
      {/* 2. LOCAL RENTAL PACKAGES                                         */}
      {/* ================================================================ */}
      {showPackages && localPackages.length > 0 && (
        <section id="packages" className="relative scroll-mt-24 bg-white py-10 sm:py-20">
          {hairline}
          <div className="section">
            <SectionHeading
              eyebrow="Flexible hourly & daily tariffs"
              title="Local Rental Packages"
              subtitle="Choose between flexible point-to-point rides or hourly full-day rental packages for city travel."
            />
            <div className="mt-10">
              <PackageSelector
                packages={sortPackages(localPackages)}
                vehicles={fleet}
                vehiclePhotos={Object.fromEntries(fleet.map((v) => [v.id, images.fleet[v.id]?.[0]]))}
              />
            </div>
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* 3. BENEFITS                                                      */}
      {/* ================================================================ */}
      <section className="section py-10 sm:py-20">
        <SectionHeading eyebrow="Service highlights" title={benefitsTitle} subtitle={benefitsSubtitle} />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-5 lg:grid-cols-4">
          {benefits.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={i * 0.1} className="h-full min-w-0">
                <article className="card-float card-float-hover h-full min-w-0 !rounded-2xl p-4 sm:!rounded-3xl sm:p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 sm:h-10 sm:w-10">
                    <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                  </span>
                  <h3 className="mt-3 text-[15px] font-extrabold leading-tight tracking-tight [overflow-wrap:anywhere] sm:mt-5 sm:text-lg">{item.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-snug text-slate-600 [overflow-wrap:anywhere] sm:mt-2 sm:text-sm sm:leading-relaxed">{item.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 3b. WHAT'S INCLUDED (Admin → Terms & policies)                   */}
      {/* ================================================================ */}
      <section id="included" className="section scroll-mt-24 pb-10 sm:pb-20">
        <SectionHeading
          eyebrow="Clear pricing"
          title="What's included in your fare"
          subtitle="Know exactly what you pay for before you book."
        />
        <IncludedExcluded policy={policies.services[serviceType]} className="mx-auto mt-8 max-w-4xl sm:mt-10" />
        <p className="mt-5 text-center text-sm">
          <Link href={`/terms#${serviceType}`} className="font-bold text-brand-700 underline-offset-4 hover:text-brand-800 hover:underline">
            Read the full terms &amp; conditions
          </Link>
        </p>
      </section>

      {/* ================================================================ */}
      {/* 4. RELEVANT ROUTES                                               */}
      {/* ================================================================ */}
      {routeCards.length > 0 && (
        <section id="routes" className="relative scroll-mt-24 bg-white py-10 sm:py-20">
          {hairline}
          <div className="section">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <SectionHeading eyebrow="Popular corridors" title={routesTitle} subtitle={routesSubtitle} centered={false} />
              <Link href="/routes" className="btn-ghost group shrink-0">
                All routes
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {routeCards.map((route, i) => (
                <Reveal key={route.slug} delay={(i % 4) * 0.06} y={16} className="h-full">
                  <RouteCard route={route} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* 5. LOCAL COVERAGE (airport + local pages)                        */}
      {/* ================================================================ */}
      {showLocalAreas && (
        <section className="section py-10 sm:py-20">
          <SectionHeading
            eyebrow="Doorstep pickup across Bangalore"
            title={localAreasTitle}
            subtitle="We operate 24/7 across every major Bangalore hub, IT park, residential layout, and transit terminal."
          />
          <ul className="mt-10 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {siteConfig.localAreas.map((area) => (
              <li key={area} className="card-float flex items-center gap-3 rounded-2xl p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-ink">{area}</span>
                  <span className="block text-[11px] font-medium text-slate-500">24/7 Innova Dispatch</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ================================================================ */}
      {/* 6. FLEET (confirmed models only)                                 */}
      {/* ================================================================ */}
      <div className="relative bg-white">
        {hairline}
        <FleetSection vehicles={fleetCards} />
      </div>

      {/* ================================================================ */}
      {/* 7. FAQ                                                           */}
      {/* ================================================================ */}
      <section id="faq" className="section scroll-mt-24 py-10 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="max-w-2xl">
            <span className="eyebrow">Got questions?</span>
            <h2 className="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/faq" className="btn-ghost group">
                Read full FAQ
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
              </a>
            </div>
          </div>
          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      {/* ================================================================ */}
      {/* 8. CTA BAND                                                      */}
      {/* ================================================================ */}
      <section className="section pb-20">
        <div className="relative overflow-hidden rounded-4xl bg-ink p-8 text-white shadow-float-lg sm:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-60 w-60 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">{customCtaTitle}</h2>
              <p className="mt-2 text-slate-300">&ldquo;{siteConfig.brand.closingLine}&rdquo;</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <BookButton service={serviceType} className="btn group bg-white text-ink hover:-translate-y-0.5">
                Get instant fare
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </BookButton>
              <a href={siteConfig.contact.phone.tel} className="btn border border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Phone className="h-4 w-4" /> Call 24/7
              </a>
              <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

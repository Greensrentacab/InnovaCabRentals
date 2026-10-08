/**
 * LandingTemplate.tsx — service landing pages (/airport-taxi, /local-rides,
 * /outstation-cabs), built to design.md:
 *  - Inner page hero with aside (§2.3, §3.6) + Quick Fare Estimate widget (§3.2)
 *  - Local packages (§3.2.4 / §3.3), benefits cards, route grid (§3.3)
 *  - Local coverage grid, fleet cards (§3.3), FAQ accordion + dark CTA band (§3.6)
 */

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, MapPin, MessageCircle, Phone, ShieldCheck, Star, Users } from 'lucide-react';
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

export default function LandingTemplate({
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
  const widgetData = buildWidgetData(allRoutes, localPackages, fleet);
  const routeCards = buildRouteCards(routes, fleet);
  const fleetCards = buildFleetCards(fleet);

  return (
    <div className="ds-scope bg-porcelain">
      {/* ================================================================ */}
      {/* 1. INNER PAGE HERO + QUICK FARE ESTIMATE                         */}
      {/*    No overflow-hidden on the section: the calendar pop-up must   */}
      {/*    extend past it (design.md §3.2.1).                            */}
      {/* ================================================================ */}
      <section className="relative isolate z-10 pb-12 pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-grid-slate [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,#000_30%,transparent_70%)]" />
          <div className="absolute -top-40 left-1/2 h-[480px] w-[860px] -translate-x-1/2 rounded-full bg-brand-400/20 blur-[120px]" />
        </div>

        <div className="section grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
          <div className="lg:pt-6">
            <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-brand-700">
                Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-700" aria-current="page">
                {breadcrumb}
              </span>
            </nav>

            <span className="eyebrow animate-fade-up">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
              {badge}
            </span>

            <h1 className="text-balance mt-5 animate-fade-up text-[2.2rem] font-extrabold leading-[1.06] tracking-tight text-ink [animation-delay:80ms] sm:text-5xl">
              {title}
            </h1>

            <p className="mt-3 animate-fade-up text-base font-bold text-brand-700 [animation-delay:120ms]">
              {siteConfig.brand.closingLine}
            </p>

            <p className="mt-4 max-w-xl animate-fade-up text-base leading-relaxed text-slate-600 [animation-delay:160ms] sm:text-lg">
              {subtitle}
            </p>

            {heroNotice && (
              <p className="pill mt-6 animate-fade-up py-2 text-live-600 [animation-delay:200ms]">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                {heroNotice}
              </p>
            )}

            <div className="mt-7 flex animate-fade-up flex-col gap-2 [animation-delay:240ms] sm:flex-row sm:flex-wrap">
              <a href={siteConfig.contact.phone.tel} className="btn-primary">
                <Phone className="h-4 w-4" /> {siteConfig.cta.instantBooking}
              </a>
              <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                <MessageCircle className="h-4 w-4" /> {siteConfig.cta.quickQuote}
              </a>
            </div>

            <ul className="mt-6 flex animate-fade-up flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-600 [animation-delay:320ms]">
              <li className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {siteConfig.trustClaims.googleRating.value}-Star Rated · {siteConfig.trustClaims.happyCustomers.value} customers
              </li>
              <li className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-brand-600" /> Verified chauffeurs
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-live-600" /> {siteConfig.contact.hours}
              </li>
            </ul>
          </div>

          <div className="min-w-0">
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
        <section id="packages" className="relative scroll-mt-24 bg-white py-16 sm:py-20">
          {hairline}
          <div className="section">
            <SectionHeading
              eyebrow="Flexible hourly & daily tariffs"
              title="Local Rental Packages"
              subtitle="Choose between flexible point-to-point rides or hourly full-day rental packages for city travel."
            />
            <div className="mt-10">
              <PackageSelector packages={sortPackages(localPackages)} vehicles={fleet} />
            </div>
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* 3. BENEFITS                                                      */}
      {/* ================================================================ */}
      <section className="section py-16 sm:py-20">
        <SectionHeading eyebrow="Service highlights" title={benefitsTitle} subtitle={benefitsSubtitle} />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={i * 0.1} className="h-full">
                <article className="card-float card-float-hover h-full p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 4. RELEVANT ROUTES                                               */}
      {/* ================================================================ */}
      {routeCards.length > 0 && (
        <section id="routes" className="relative scroll-mt-24 bg-white py-16 sm:py-20">
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
        <section className="section py-16 sm:py-20">
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
      <section id="faq" className="section scroll-mt-24 py-16 sm:py-20">
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
                <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
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
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

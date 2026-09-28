import React from 'react';
import Link from 'next/link';
import {
  Phone,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Car,
  ChevronRight,
  HelpCircle,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import BookingWidget from '@/components/BookingWidget';
import PackageSelector from '@/components/PackageSelector';
import { siteConfig } from '@/lib/siteConfig';
import { Vehicle, Route, LocalPackage, ServiceType } from '@/lib/types';

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
  badge: string;
  title: string;
  subtitle: string;
  heroNotice?: string;
  benefitsTitle?: string;
  benefitsSubtitle?: string;
  benefits: LandingBenefit[];
  routesTitle?: string;
  routesSubtitle?: string;
  routes: Route[];
  vehicles: Vehicle[];
  faqs: LandingFaq[];
  showLocalAreas?: boolean;
  localAreasTitle?: string;
  localPackages?: LocalPackage[];
  customCtaTitle?: string;
  serviceType?: ServiceType;
}

export default function LandingTemplate({
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
  vehicles,
  faqs,
  showLocalAreas = false,
  localAreasTitle = 'Bangalore Local Pickup & Drop Coverage',
  localPackages,
  customCtaTitle = 'Reserve Your Innova in Advance',
  serviceType,
}: LandingTemplateProps) {
  return (
    <div className="flex flex-col min-h-screen bg-brand-offwhite">
      {/* ==================================================================== */}
      {/* 1. HERO + BOOKING WIDGET                                             */}
      {/* ==================================================================== */}
      <section className="relative bg-brand-navy text-white py-12 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F0562B_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-brand-orange border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{badge}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
                {title}
              </h1>

              <p className="text-lg sm:text-xl font-medium text-brand-orange">
                {siteConfig.brand.closingLine}
              </p>

              <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
                {subtitle}
              </p>

              {heroNotice && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-emerald-300 inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{heroNotice}</span>
                </div>
              )}

              {/* Quick Primary Actions */}
              <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3.5 pt-2">
                <a
                  href={siteConfig.contact.phone.tel}
                  className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover active:scale-[0.99] text-white text-base font-bold shadow-lg shadow-brand-orange/25 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  <span>{siteConfig.cta.instantBooking}</span>
                </a>

                <a
                  href={siteConfig.contact.phone.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-base font-semibold shadow-lg transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{siteConfig.cta.quickQuote}</span>
                </a>
              </div>
            </div>

            {/* Right Hero: Reusable BookingWidget */}
            <div className="lg:col-span-5 w-full mt-6 lg:mt-0">
              <BookingWidget serviceType={serviceType} />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. LOCAL RIDES PACKAGE SELECTOR (Point-to-point & Full-day)         */}
      {/* ==================================================================== */}
      {localPackages && localPackages.length > 0 && (
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Flexible Hourly &amp; Daily Tariffs
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy mt-1">
              Local Rental Packages
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Choose between flexible point-to-point rides or hourly full-day rental packages for city travel.
            </p>
          </div>

          <PackageSelector packages={localPackages} vehicles={vehicles} />
        </section>
      )}

      {/* ==================================================================== */}
      {/* 3. BENEFITS                                                          */}
      {/* ==================================================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
            Service Highlights
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy mt-1">
            {benefitsTitle}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            {benefitsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-gray-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-orange-light text-brand-orange flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-navy mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. RELEVANT ROUTES                                                   */}
      {/* ==================================================================== */}
      {routes && routes.length > 0 && (
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-200/60">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                Popular Corridors
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy mt-1">
                {routesTitle}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                {routesSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {routes.map((route) => (
                <Link
                  key={route.id}
                  href={`/routes/${route.slug}`}
                  className="group bg-brand-offwhite rounded-3xl p-6 border border-gray-200 hover:border-brand-orange/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span className="font-semibold text-brand-orange">{route.distanceKm} km</span>
                      <span>{route.durationText}</span>
                    </div>

                    <h3 className="text-lg font-bold text-brand-navy group-hover:text-brand-orange transition-colors mb-2">
                      {route.name}
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                      {route.description || `Chauffeur-driven Innova cab service from ${route.origin} to ${route.destination}.`}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200/80 flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-500">Price on request</span>
                    <span className="font-bold text-brand-orange flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* 5. LOCAL SEO SECTION (Local Areas List)                              */}
      {/* Included on Airport and Local pages per requirement                  */}
      {/* ==================================================================== */}
      {showLocalAreas && (
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-brand-navy-light text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                Doorstep Pickup Across Bangalore
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {localAreasTitle}
              </h2>
              <p className="text-sm text-gray-300 mt-2">
                We operate 24/7 across every major Bangalore hub, IT park, residential layout, and transit terminal.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {siteConfig.localAreas.map((area) => (
                <div
                  key={area}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">{area}</p>
                    <p className="text-[11px] text-gray-300">24/7 Innova Dispatch</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* 6. VEHICLES FROM FIRESTORE                                           */}
      {/* ==================================================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
            Our Toyota Fleet
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy mt-1">
            Available Vehicle Models
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Spacious, air-conditioned MPVs maintained for peak highway reliability and family comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.filter((v) => v.confirmed !== false).map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Vehicle Placeholder */}
                <div className="bg-brand-navy/5 h-48 flex flex-col items-center justify-center p-6 border-b border-gray-100 text-center relative">
                  <Car className="w-12 h-12 text-brand-navy/40 mb-2" />
                  <span className="text-xs uppercase tracking-wider font-bold text-gray-600">
                    {vehicle.name}
                  </span>
                  <span className="text-[11px] text-gray-400 mt-0.5">
                    (Client vehicle photo placeholder)
                  </span>

                  {!vehicle.confirmed && (
                    <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                      Unconfirmed / Enquiry
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-orange-light text-brand-orange">
                      {vehicle.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {vehicle.seats} Seater
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-brand-navy mb-4">
                    {vehicle.name}
                  </h3>

                  <ul className="space-y-2 mb-6">
                    {vehicle.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-gray-100 mt-auto">
                <div className="flex items-center justify-between py-3 mb-4">
                  <span className="text-xs text-gray-500 font-medium">Rental Tariff</span>
                  <span className="text-sm font-bold text-brand-navy">
                    {vehicle.baseFare !== null && vehicle.baseFare !== undefined
                      ? `₹${vehicle.baseFare}`
                      : 'Price on request'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/${vehicle.id}-rental-bangalore`}
                    className="min-h-[44px] flex items-center justify-center px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-brand-navy text-xs font-semibold transition-colors"
                  >
                    Vehicle Info
                  </Link>
                  <a
                    href={siteConfig.contact.phone.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] flex items-center justify-center px-3 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Quick Quote
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. FAQ                                                               */}
      {/* ==================================================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm"
            >
              <h3 className="text-base sm:text-lg font-bold text-brand-navy mb-2 flex items-start gap-2.5">
                <HelpCircle className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-7.5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. CALL TO ACTION                                                    */}
      {/* ==================================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="bg-brand-navy text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-xs uppercase font-bold tracking-wider text-brand-orange bg-white/10 px-3.5 py-1.5 rounded-full inline-block">
              24/7 Chauffeur Dispatch
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {customCtaTitle}
            </h2>

            <p className="text-base sm:text-lg text-gray-200 leading-relaxed pt-1">
              &ldquo;{siteConfig.brand.closingLine}&rdquo;
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-6">
              <a
                href={siteConfig.contact.phone.tel}
                className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover active:scale-[0.99] text-white text-base font-bold shadow-lg transition-all"
              >
                <Phone className="w-5 h-5" />
                <span>{siteConfig.cta.instantBooking}</span>
              </a>

              <a
                href={siteConfig.contact.phone.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-base font-semibold shadow-lg transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{siteConfig.cta.quickQuote}</span>
              </a>

              <Link
                href="/contact"
                className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/15 transition-all"
              >
                <span>Online Request</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import {
  Phone,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Car,
  Users,
  Luggage,
  Sparkles,
  ChevronRight,
  Award,
  Clock,
  Star,
  Fuel,
  Info,
} from 'lucide-react';
import { Vehicle } from '@/lib/types';
import { siteConfig } from '@/lib/siteConfig';

export interface VehicleDetailTemplateProps {
  vehicle: Vehicle;
  h1: string;
  tagline: string;
  overview: string;
  idealFor: string[];
  galleryPlaceholders: {
    title: string;
    caption: string;
  }[];
  detailedSpecs?: {
    label: string;
    value: string;
  }[];
}

export default function VehicleDetailTemplate({
  vehicle,
  h1,
  tagline,
  overview,
  idealFor,
  galleryPlaceholders,
  detailedSpecs,
}: VehicleDetailTemplateProps) {
  const whatsappUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
    `Hello ${siteConfig.brand.name}, I am interested in renting the ${vehicle.name} in Bangalore. Please share tariff and availability.`
  )}`;

  return (
    <div className="flex flex-col min-h-screen bg-brand-offwhite">
      {/* Breadcrumb Bar */}
      <div className="bg-brand-navy-dark text-xs text-gray-400 py-3 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          <Link href="/vehicles" className="hover:text-white transition-colors">
            Vehicles
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-white font-medium truncate">{vehicle.name}</span>
        </div>
      </div>

      {/* Hero Header */}
      <section className="bg-brand-navy text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-brand-orange border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{vehicle.type}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              {h1}
            </h1>

            <p className="text-lg text-brand-orange font-medium">
              {tagline}
            </p>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              {overview}
            </p>

            {/* Quick CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3.5">
              <a
                href={siteConfig.contact.phone.tel}
                className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover active:scale-[0.99] text-white text-base font-bold shadow-lg shadow-brand-orange/25 transition-all"
              >
                <Phone className="w-5 h-5" />
                <span>{siteConfig.cta.instantBooking}</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-base font-semibold shadow-lg transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{siteConfig.cta.quickQuote}</span>
              </a>

              <Link
                href="/contact"
                className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/15 transition-all"
              >
                <span>Book Online</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Details Body */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Gallery Placeholder, Overview & Specifications */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Gallery Placeholder (Clean labeled boxes per rules) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-xl font-bold text-brand-navy flex items-center gap-2">
                  <Car className="w-5 h-5 text-brand-orange" />
                  <span>{vehicle.name} Photo Gallery</span>
                </h2>
                <span className="text-[11px] text-gray-400 font-medium">
                  Verified Fleet Placeholders
                </span>
              </div>

              {/* Main Featured Photo Placeholder */}
              <div className="bg-brand-navy/5 rounded-2xl h-64 sm:h-80 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gray-200">
                <Car className="w-16 h-16 text-brand-navy/30 mb-3" />
                <p className="text-sm font-bold text-brand-navy uppercase tracking-wider">
                  {galleryPlaceholders[0]?.title || `${vehicle.name} Exterior View`}
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                  {galleryPlaceholders[0]?.caption || '(Client vehicle photograph placeholder)'}
                </p>
              </div>

              {/* Secondary Thumbnails */}
              <div className="grid grid-cols-3 gap-3">
                {galleryPlaceholders.slice(1, 4).map((g, idx) => (
                  <div
                    key={idx}
                    className="bg-brand-navy/5 rounded-xl h-28 sm:h-36 flex flex-col items-center justify-center p-2 text-center border border-dashed border-gray-200"
                  >
                    <Car className="w-6 h-6 text-brand-navy/30 mb-1" />
                    <p className="text-[11px] font-semibold text-gray-700 truncate w-full px-1">
                      {g.title}
                    </p>
                    <p className="text-[9px] text-gray-400 truncate w-full">
                      Placeholder
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Features & Comfort Amenities */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-brand-navy">
                Key Features &amp; Cabin Amenities
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vehicle.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-brand-offwhite border border-gray-100 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {detailedSpecs && detailedSpecs.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                    Technical &amp; Cabin Specifications
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {detailedSpecs.map((spec, i) => (
                      <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <p className="text-[11px] text-gray-400 font-semibold">{spec.label}</p>
                        <p className="text-xs font-bold text-brand-navy mt-0.5">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ideal For Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-brand-navy">
                Ideal For Your Travel Needs
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Whether traveling across Bengaluru city hubs or taking a long-distance road trip, the {vehicle.name} delivers optimum comfort for:
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {idealFor.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-orange-light text-brand-orange border border-brand-orange/20"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Pricing & Reservation Card */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-lg space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  Rental Tariff
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-2xl sm:text-3xl font-black text-brand-navy">
                    {vehicle.baseFare !== null && vehicle.baseFare !== undefined
                      ? `₹${vehicle.baseFare}`
                      : 'Price on request'}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Customized per-km or package billing with zero surge pricing
                </p>
              </div>

              {/* Vehicle Capacity badges */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <Users className="w-5 h-5 text-brand-orange mx-auto mb-1" />
                  <p className="text-xs font-bold text-brand-navy">{vehicle.seats} Passengers</p>
                  <p className="text-[10px] text-gray-400">Comfort Seating</p>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <Luggage className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-brand-navy">{vehicle.luggage} Suitcases</p>
                  <p className="text-[10px] text-gray-400">Boot Space</p>
                </div>
              </div>

              {/* What's Included */}
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Experienced, background-verified chauffeur</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Sanitized, air-conditioned vehicle</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Doorstep pickup anywhere in Bangalore</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>24/7 dedicated dispatch support</span>
                </div>
              </div>

              {/* Primary Actions: Book & WhatsApp */}
              <div className="space-y-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Us for Quick Quote</span>
                </a>

                <Link
                  href="/contact"
                  className="min-h-[48px] w-full flex items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-brand-orange-hover active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all"
                >
                  <Car className="w-4 h-4" />
                  <span>Reserve {vehicle.name}</span>
                </Link>

                <a
                  href={siteConfig.contact.phone.tel}
                  className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-brand-navy font-semibold text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-orange" />
                  <span>Call {siteConfig.contact.phone.display}</span>
                </a>
              </div>

              <p className="text-[11px] text-gray-400 text-center">
                No advance payment needed. Submitting reserves your booking request.
              </p>
            </div>

            {/* NAP Office Card */}
            <div className="bg-brand-navy text-white rounded-3xl p-6 text-xs space-y-3 shadow-sm">
              <p className="font-bold text-white uppercase tracking-wider text-[11px] text-brand-orange">
                Head Dispatch Office
              </p>
              <p className="text-gray-300 leading-relaxed">
                {siteConfig.contact.address.full}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-gray-400">
                <span>Working Hours:</span>
                <span className="font-bold text-emerald-400">{siteConfig.contact.hours}</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

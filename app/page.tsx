import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck,
  Luggage,
  MessageCircle,
  Phone,
  ShieldCheck,
  Radar,
  BadgeIndianRupee,
  Star,
  Users,
} from 'lucide-react';
import QuickBookingWidget from '@/components/home/QuickBookingWidget';
import ServicesSection from '@/components/home/ServicesSection';
import BookingTimeline from '@/components/home/BookingTimeline';
import RouteSlider from '@/components/home/RouteSlider';
import FleetSection from '@/components/home/FleetSection';
import FaqAccordion from '@/components/home/FaqAccordion';
import BookButton from '@/components/home/BookButton';
import Reveal from '@/components/home/Reveal';
import FareResults from '@/components/FareResults';
import TrustInfoSection from '@/components/home/TrustInfoSection';
import { siteConfig } from '@/lib/siteConfig';
import { getVehicles, getRoutes, getLocalPackages } from '@/lib/dataService';
import {
  buildFleetCards,
  buildRouteCards,
  buildWidgetData,
  confirmedFleet,
  findAirportRoute,
  formatINR,
  minFare,
  routeFromFare,
} from '@/lib/storefrontData';
import { HeroBand, HeroLead, HeroPicture, HeroTitle } from '@/components/home/HeroScene';

export const revalidate = 60; // Revalidate dynamic Firestore data every minute

const whyChooseUs = [
  {
    icon: Users,
    title: 'Experienced Chauffeurs',
    desc: 'Courteous, background-verified drivers who know South Indian highways, ghat roads and Bangalore traffic.',
  },
  {
    icon: Luggage,
    title: 'Spacious Luggage Capacity',
    desc: 'Ample boot space for family suitcases, strollers and backpacks, with optional roof carriers.',
  },
  {
    icon: CalendarCheck,
    title: 'Flexible Rental Options',
    desc: 'Hourly city packages, airport transfers and multi-day outstation round trips.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent Pricing',
    desc: 'Driver allowance and night charges shared upfront; tolls paid by the customer. No surge pricing, ever.',
  },
  {
    icon: MessageCircle,
    title: 'Easy Booking by Call or WhatsApp',
    desc: 'No apps or logins. Reach our dispatch desk directly for instant reservations.',
  },
];

const homeFaqs = [
  {
    q: 'How do I book a cab with Innova Cab Rentals?',
    a: 'Enter your trip in the booking widget above and tap "See Fares & Available Innovas". Pick a car and send the details to us on WhatsApp, or submit a booking request — our dispatch team confirms with driver details. You can also call us directly.',
  },
  {
    q: 'Are tolls, driver allowance, and parking charges included?',
    a: 'Driver allowance is shown in your fare estimate. Toll fees, parking charges and state entry permits are paid by the customer at actuals.',
  },
  {
    q: 'Which cars can I choose from?',
    a: 'Toyota Innova (7/8 seater), Toyota Innova Crysta (luxury 7 seater with captain seats) and Maruti Suzuki Ertiga (compact 7 seater). Let us know your seating preference when booking.',
  },
  {
    q: 'Is advance payment required to book a cab?',
    a: 'No upfront payment or card details are required. Your booking is placed as a request (Status: PENDING) and confirmed directly with our team via a WhatsApp link or phone call.',
  },
  {
    q: 'Are your vehicles and drivers available 24/7 for late-night airport drops?',
    a: 'Yes, our fleet operates around the clock 24/7. We recommend booking a few hours in advance for early morning or late-night airport transfers to ensure priority vehicle dispatch.',
  },
];


export const metadata: Metadata = {
  alternates: { canonical: '/' },
};


export default async function HomePage() {
  const [vehicles, routes, localPackages] = await Promise.all([getVehicles(), getRoutes(), getLocalPackages()]);

  // Fleet: confirmed models only (Toyota Innova, Innova Crysta, Maruti Suzuki Ertiga)
  const fleet = confirmedFleet(vehicles);

  const airportRoute = findAirportRoute(routes);
  const outstationRoutes = routes.filter((r) => r !== airportRoute);

  // All prices come from the cars' admin-editable rates
  const airportFrom = minFare(fleet.map((v) => v.rates?.airportFare));
  const outstationFrom = minFare(outstationRoutes.map((r) => routeFromFare(r, fleet)));
  const localFrom = minFare(fleet.map((v) => v.rates?.local8h));

  const widgetData = buildWidgetData(routes, localPackages, fleet);
  const sliderRoutes = buildRouteCards(airportRoute ? [airportRoute, ...outstationRoutes] : outstationRoutes, fleet);
  const fleetCards = buildFleetCards(fleet);

  const stats = [
    { value: `${siteConfig.trustClaims.yearsExperience.value} yrs`, label: 'Of premium Innova rentals' },
    { value: '₹0', label: 'Advance payment' },
    { value: '4', label: 'Car models to choose from' },
    { value: '24/7', label: 'Booking & dispatch' },
  ];
  const testimonials = siteConfig.testimonials;


  // Hero trust strip (no ratings or customer counts — client request)
  const trustItems = (
    <>
      <li className="flex items-center justify-center gap-1.5 px-2">
        <ShieldCheck className="h-4 w-4 shrink-0 text-live-600" /> Verified drivers
      </li>
      <li className="flex items-center justify-center gap-1.5 px-2">
        <Radar className="h-4 w-4 shrink-0 text-brand-600" /> Flight tracking
      </li>
      <li className="flex items-center justify-center gap-1.5 px-2">
        <BadgeIndianRupee className="h-4 w-4 shrink-0 text-brand-600" /> Transparent price
      </li>
    </>
  );

  return (
    <div className="ds-scope bg-porcelain">
      {/* ================================================================ */}
      {/* 1. HERO + QUICK BOOKING WIDGET — light sky-blue & white theme    */}
      {/*    (no overflow-hidden: the calendar pop-up must extend past it) */}
      {/* ================================================================ */}
      <section className="relative isolate z-10 pb-4 pt-24 sm:pt-32 lg:pb-8">
        {/* Picture follows the selected service tab. Desktop: whole picture across the top, car on the right */}
        {/* Start loading the default (airport) picture before the page script runs */}
        <link rel="preload" as="image" href="/images/hero/hero-airport-1920.webp" />
        {/* Soft sky behind the whole hero (the form side on desktop) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[760px] bg-gradient-to-b from-sky-100 via-sky-50 to-porcelain" aria-hidden="true" />

        {/* Desktop: the picture spans the full hero width behind both columns */}
        <HeroBand flip plain className="inset-x-0 top-0 -z-10 hidden h-[clamp(640px,52vw,780px)] lg:block" />

        {/* Copy + picture on the left, booking form on the right (desktop) */}
        <div className="section grid items-start gap-6 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,450px)] lg:gap-10">
          <div className="relative min-w-0 pt-2 [text-shadow:0_1px_12px_rgba(255,255,255,0.95)] lg:col-start-1 lg:row-start-1 lg:pt-4">
            {/* Picture band sized to the copy, car bottom-right */}
            <div className="relative">
              <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-live-500/20 bg-white/80 px-3 py-1.5 text-xs font-bold text-live-600 shadow-sm backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-live-500" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-live-500" />
                </span>
                Booking open now · 24 hours
              </span>

              {/* Heading + subheading follow the selected tab (server HTML = Airport Taxi, the SEO default) */}
              <h1 className="text-balance mt-4 animate-fade-up text-[1.9rem] font-extrabold leading-[1.08] tracking-tight text-ink [animation-delay:80ms] sm:mt-6 sm:text-5xl lg:text-[3.25rem]">
                <HeroTitle />
              </h1>

              <p className="mt-3 max-w-xl animate-fade-up text-[15px] font-semibold leading-relaxed text-slate-700 [animation-delay:160ms] sm:mt-5 sm:text-lg">
                <HeroLead />
              </p>

              {/* Phones/tablets: the picture comes right after the text (never under it), trust strip on its bottom edge */}
              <HeroPicture className="-mx-4 mt-4 sm:-mx-6 sm:mt-6 lg:hidden">
                <ul className="relative z-10 mx-3 -mt-5 grid grid-cols-3 divide-x divide-amber-200/70 rounded-2xl border border-amber-200/70 bg-amber-50/95 py-2.5 text-[11px] font-semibold leading-tight text-slate-700 shadow-sm backdrop-blur [text-shadow:none] sm:mx-6 sm:text-sm">
                  {trustItems}
                </ul>
              </HeroPicture>

              {/* Desktop: room for the car in the full-width picture, then the trust strip */}
              <div className="hidden lg:block lg:h-[340px] xl:h-[380px]" aria-hidden="true" />
              <ul className="mt-2 hidden grid-cols-3 divide-x divide-amber-200/70 rounded-2xl border border-amber-200/70 bg-amber-50/95 py-3 text-sm font-semibold leading-tight text-slate-700 shadow-sm backdrop-blur [text-shadow:none] lg:grid">
                {trustItems}
              </ul>
            </div>

          </div>

          <div className="min-w-0 lg:col-start-2 lg:row-start-1 lg:pt-4">
            <QuickBookingWidget {...widgetData} />
          </div>
        </div>
      </section>

      {/* Available cars, prices & T&Cs (after "See Fares") */}
      <FareResults />

      {/* ================================================================ */}
      {/* 2. OUR SERVICES (design.md §3.3)                                 */}
      {/* ================================================================ */}
      <ServicesSection
        fares={{
          airport: airportFrom ? formatINR(airportFrom) : null,
          outstation: outstationFrom ? formatINR(outstationFrom) : null,
          local: localFrom ? formatINR(localFrom) : null,
        }}
      />

      {/* ================================================================ */}
      {/* 3. HOW BOOKING WORKS + URGENT BANNER (design.md §3.4)            */}
      {/* ================================================================ */}
      <BookingTimeline />

      {/* ================================================================ */}
      {/* 4. FEATURED ROUTES SLIDER                                        */}
      {/* ================================================================ */}
      <section id="routes" className="section scroll-mt-24 py-16 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="eyebrow">Featured routes</span>
            <h2 className="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Popular trips from Bangalore</h2>
            <p className="mt-3 text-slate-600">
              Fares shown for both models where available — otherwise get a quick quote on WhatsApp.
            </p>
          </div>
          <Link href="/routes" className="btn-ghost group shrink-0">
            All routes
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="mt-6">
          <RouteSlider routes={sliderRoutes} />
        </div>
      </section>

      {/* ================================================================ */}
      {/* 5. FEATURED VEHICLES (confirmed models only)                     */}
      {/* ================================================================ */}
      <FleetSection vehicles={fleetCards} />

      {/* ================================================================ */}
      {/* 6. TRUST — stats + why us (testimonials stay hidden until real   */}
      {/*    client reviews are supplied in siteConfig.testimonials)       */}
      {/* ================================================================ */}
      <section className="section py-16 sm:py-20">
        <Reveal>
          <div className="card-float overflow-hidden p-6 sm:p-10">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <span className="eyebrow">Why travellers choose us</span>
                <h2 className="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Comfortable cars. Reliable journeys.
                </h2>
                <p className="mt-3 text-slate-600">
                  {siteConfig.brand.closingLine} Fares are shared upfront and never change at the end of the trip.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5">
                      <p className="text-3xl font-extrabold tracking-tight text-brand-700">{stat.value}</p>
                      <p className="mt-1 text-sm font-medium text-slate-600">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {testimonials.length > 0
                  ? testimonials.slice(0, 3).map((t) => (
                      <figure key={t.id} className="rounded-2xl border border-slate-200/80 bg-white p-5">
                        <div className="flex gap-0.5 text-amber-400" aria-label={`${t.rating} out of 5 stars`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                        <blockquote className="mt-3 text-sm leading-relaxed text-slate-700">“{t.comment}”</blockquote>
                        <figcaption className="mt-3 text-xs font-semibold text-slate-500">
                          <span className="text-ink">{t.name}</span>
                          {t.source === 'google' && ' · Google review'}
                        </figcaption>
                      </figure>
                    ))
                  : whyChooseUs.map(({ icon: Icon, title, desc }) => (
                      <div key={title} className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="text-[15px] font-extrabold">{title}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">{desc}</p>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <TrustInfoSection />

      {/* ================================================================ */}
      {/* 7. FAQ                                                           */}
      {/* ================================================================ */}
      <section id="faq" className="section scroll-mt-24 pb-16 sm:pb-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="max-w-2xl">
            <span className="eyebrow">Good to know</span>
            <h2 className="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Frequently asked questions</h2>
            <p className="mt-3 text-slate-600">Clear answers on tariffs, booking steps and travel terms.</p>
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
          <FaqAccordion faqs={homeFaqs} />
        </div>
      </section>

      {/* ================================================================ */}
      {/* 8. CTA BAND (design.md §3.6)                                     */}
      {/* ================================================================ */}
      <section className="section pb-20">
        <div className="relative overflow-hidden rounded-4xl bg-ink p-8 text-white shadow-float-lg sm:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-60 w-60 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">Ready when you are — day or night.</h2>
              <p className="mt-2 text-slate-300">
                {siteConfig.cta.advanceBooking} — ₹0 advance and a verified chauffeur at your door.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <BookButton className="btn group bg-white text-ink hover:-translate-y-0.5">
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

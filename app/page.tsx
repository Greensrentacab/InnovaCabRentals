import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck,
  Luggage,
  Phone,
  ShieldCheck,
  Radar,
  BadgeIndianRupee,
  Star,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import WhatsAppIcon from '@/components/ds/WhatsAppIcon';
import QuickBookingWidget from '@/components/home/QuickBookingWidget';
import ServicesSection from '@/components/home/ServicesSection';
import BookingTimeline from '@/components/home/BookingTimeline';
import RouteSlider from '@/components/home/RouteSlider';
import FleetSection from '@/components/home/FleetSection';
import FaqAccordion from '@/components/home/FaqAccordion';
import BookButton from '@/components/home/BookButton';
import Reveal from '@/components/home/Reveal';
import TrustInfoSection from '@/components/home/TrustInfoSection';
import { siteConfig } from '@/lib/siteConfig';
import { withSeo } from '@/lib/seo';
import { getVehicles, getRoutes, getLocalPackages } from '@/lib/dataService';
import { getSiteImages } from '@/lib/siteContentStore';
import {
  airportFromFare,
  buildFleetCards,
  buildRouteCards,
  buildWidgetData,
  confirmedFleet,
  findAirportRoute,
  formatINR,
  minFare,
  routeFromFare,
} from '@/lib/storefrontData';
import { HeroCover, HeroLead, HeroTitle, HeroTrustList } from '@/components/home/HeroScene';

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
    icon: WhatsAppIcon,
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


export const metadata: Metadata = withSeo({
  title: siteConfig.seo.title,
  description: siteConfig.seo.metaDescription,
  alternates: { canonical: '/' },
});


export default async function HomePage() {
  const [vehicles, routes, localPackages, images] = await Promise.all([getVehicles(), getRoutes(), getLocalPackages(), getSiteImages()]);

  // Fleet: confirmed models only (Toyota Innova, Innova Crysta, Maruti Suzuki Ertiga)
  const fleet = confirmedFleet(vehicles);

  const airportRoute = findAirportRoute(routes);
  const outstationRoutes = routes.filter((r) => r !== airportRoute);

  // All prices come from the cars' admin-editable rates
  const airportFrom = minFare(fleet.map(airportFromFare));
  const outstationFrom = minFare(outstationRoutes.map((r) => routeFromFare(r, fleet)));
  const localFrom = minFare(fleet.map((v) => v.rates?.local8h));

  const widgetData = buildWidgetData(routes, localPackages, fleet, images);
  const sliderRoutes = buildRouteCards(airportRoute ? [airportRoute, ...outstationRoutes] : outstationRoutes, fleet, images);
  const fleetCards = buildFleetCards(fleet, images);
  const heroAirport = images.hero.airport;

  const stats = [
    { value: `${siteConfig.trustClaims.yearsExperience.value} yrs`, label: 'Of premium Innova rentals' },
    { value: '₹0', label: 'Advance payment' },
    { value: '4', label: 'Car models to choose from' },
    { value: '24/7', label: 'Booking & dispatch' },
  ];
  const testimonials = siteConfig.testimonials;



  return (
    <div className="ds-scope bg-porcelain">
      {/* ================================================================ */}
      {/* 1. HERO + QUICK BOOKING WIDGET — light sky-blue & white theme    */}
      {/*    (no overflow-hidden: the calendar pop-up must extend past it) */}
      {/* ================================================================ */}
      <section className="relative isolate z-10 pb-4 pt-0 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-14 lg:pt-28">
        {/* Picture follows the selected service tab. Desktop: whole picture across the top, car on the right */}
        {/* Start loading the default (airport) picture before the page script runs */}
        <link rel="preload" as="image" href={(heroAirport.mobile ?? heroAirport.desktop).src} media="(max-width: 1023px)" />
        <link rel="preload" as="image" href={heroAirport.desktop.large} media="(min-width: 1024px)" />
        {/* Desktop: full-bleed picture with a dark wash, same look as phones */}
        <HeroCover desktop images={images.hero} className="-z-10 hidden lg:block" />

        {/* Copy + picture on the left, booking form on the right (desktop) */}
        <div className="section grid w-full items-start gap-6 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-center lg:gap-12">
          <div className="relative min-w-0 lg:col-start-1 lg:row-start-1 lg:pt-4">
            {/* Phones/tablets: picture runs edge to edge from the top with the copy on it; desktop uses the band above */}
            <div className="relative -mx-4 px-4 pb-14 pt-[6rem] sm:-mx-6 sm:px-6 sm:pt-28 lg:mx-0 lg:overflow-visible lg:p-0">
              <HeroCover images={images.hero} className="lg:hidden" />
              <div className="relative [text-shadow:0_1px_3px_rgba(0,0,0,0.65),0_2px_18px_rgba(0,0,0,0.5)]">
                <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border max-sm:hidden border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white shadow-sm backdrop-blur-md [text-shadow:none]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-live-500" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Booking open now · 24 hours
                </span>

                {/* Heading + subheading follow the selected tab (server HTML = Airport Taxi, the SEO default) */}
                <h1 className="text-balance mt-0 animate-fade-up text-[2.15rem] font-extrabold leading-[1.02] tracking-tight text-white [animation-delay:80ms] sm:mt-6 sm:text-5xl lg:text-[3.25rem]">
                  <HeroTitle />
                </h1>

                <span className="mt-3 block h-1 w-12 rounded-full bg-sky-300 lg:hidden" aria-hidden="true" />
                <p className="mt-3 line-clamp-4 max-w-xl animate-fade-up text-[13px] font-medium leading-snug sm:line-clamp-none text-white [animation-delay:160ms] sm:mt-5 sm:text-lg">
                  <HeroLead />
                </p>

                {/* Phones/tablets: trust points in the hero, two per row */}
                <HeroTrustList
                  extraLabel={siteConfig.trustClaims.customersServed.label}
                  className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 whitespace-nowrap text-[12px] font-semibold text-white sm:max-w-md sm:gap-y-3 sm:text-sm lg:hidden [text-shadow:0_1px_3px_rgba(0,0,0,0.7),0_2px_12px_rgba(0,0,0,0.5)]"
                />

                {/* Phones/tablets: room for the car in the picture */}
                <div className="h-36 min-[420px]:h-44 sm:h-60 lg:hidden" aria-hidden="true" />

                {/* Desktop: room for the car in the full-width picture, then the trust points along the bottom */}
                <div className="hidden lg:block lg:h-[clamp(140px,26vh,300px)]" aria-hidden="true" />
                <HeroTrustList
                  extraLabel={siteConfig.trustClaims.customersServed.label}
                  className="hidden items-center gap-x-6 gap-y-2 whitespace-nowrap text-[13px] font-semibold text-white lg:flex xl:text-sm [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]"
                />
              </div>
            </div>
          </div>

          <div className="relative z-10 -mt-[100px] min-w-0 lg:col-start-2 lg:row-start-1 lg:mt-0 lg:pt-4">
            <QuickBookingWidget {...widgetData} />

          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 2. OUR SERVICES (design.md §3.3)                                 */}
      {/* ================================================================ */}
      <ServicesSection
        galleries={images.services}
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
      <section id="routes" className="section scroll-mt-24 pb-2 pt-10 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="eyebrow">Featured routes</span>
            <h2 className="section-title mt-3 sm:mt-4">Popular trips from Bangalore</h2>
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
      <section className="section py-6 sm:py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-ink p-4 text-white sm:rounded-3xl sm:p-10 lg:p-14">
            <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" aria-hidden="true" />

            <div className="relative">
              <div className="max-w-2xl">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-300">Why choose us</span>
                <h2 className="text-balance mt-2 text-[1.5rem] font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
                  Comfortable cars. Reliable journeys.
                </h2>
              </div>

              {/* Stats */}
              <dl className="mt-4 grid grid-cols-4 gap-1.5 sm:mt-10 sm:gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.05] px-2 py-2.5 backdrop-blur sm:rounded-2xl sm:p-6">
                    <dt className="text-lg font-extrabold leading-none tracking-tight text-sky-300 sm:text-5xl">{stat.value}</dt>
                    <dd className="mt-1 text-[10px] font-medium leading-tight text-slate-300 sm:mt-3 sm:text-sm">{stat.label}</dd>
                  </div>
                ))}
              </dl>

              {testimonials.length > 0 ? (
                <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-2">
                  {testimonials.slice(0, 2).map((t) => (
                    <figure key={t.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                      <blockquote className="text-sm leading-relaxed text-slate-200 sm:text-base">&ldquo;{t.comment}&rdquo;</blockquote>
                      <figcaption className="mt-3 text-xs font-semibold text-slate-400">
                        <span className="text-white">{t.name}</span>
                        {t.source === 'google' && ' · Google review'}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <ul className="mt-4 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-4 lg:grid-cols-6">
                  {whyChooseUs.map(({ title, desc, icon: WhyIcon }, i) => (
                    <li
                      key={title}
                      className={cn(
                        'group flex flex-row items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 transition-colors duration-200 hover:border-sky-300/40 hover:bg-white/[0.08] sm:items-start sm:gap-4 sm:rounded-2xl sm:p-6 lg:col-span-2',
                        i >= 3 && 'lg:col-span-3',
                        i === whyChooseUs.length - 1 && 'max-sm:hidden sm:max-lg:col-span-2'
                      )}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-400/15 text-sky-300 transition-transform duration-200 group-hover:scale-105 sm:h-12 sm:w-12">
                        <WhyIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-[12.5px] font-bold leading-tight sm:text-base">{title}</h3>
                        <p className="mt-1 hidden text-[11.5px] leading-snug text-slate-300 sm:mt-1.5 sm:block sm:text-sm sm:leading-relaxed">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      <TrustInfoSection />

      {/* ================================================================ */}
      {/* 7. FAQ                                                           */}
      {/* ================================================================ */}
      <section id="faq" className="section scroll-mt-24 pb-10 sm:pb-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="max-w-2xl">
            <span className="eyebrow">Good to know</span>
            <h2 className="section-title mt-3 sm:mt-4">Frequently asked questions</h2>
            <p className="mt-3 text-slate-600">Clear answers on tariffs, booking steps and travel terms.</p>
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
              <h2 className="section-title mt-3 sm:mt-4">Ready when you are — day or night.</h2>
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
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

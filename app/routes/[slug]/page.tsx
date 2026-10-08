import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Clock, IndianRupee, Luggage, MessageCircle, Phone, Route as RouteIcon, Users } from 'lucide-react';
import QuickBookingWidget from '@/components/home/QuickBookingWidget';
import FaqAccordion from '@/components/home/FaqAccordion';
import Reveal from '@/components/home/Reveal';
import PageHero from '@/components/ds/PageHero';
import SectionHeading, { Hairline } from '@/components/ds/SectionHeading';
import CtaBand from '@/components/ds/CtaBand';
import { PhotoCredit } from '@/components/ds/VehiclePhotoCard';
import { getLocalPackages, getRoutes, getVehicles } from '@/lib/dataService';
import { siteConfig } from '@/lib/siteConfig';
import { LocationData } from '@/lib/googlePlaces';
import { primaryPhoto } from '@/lib/fleetPhotos';
import { buildWidgetData, confirmedFleet, fareOrRequest, formatINR, routeFromFare, routeRoundTripFare } from '@/lib/storefrontData';
import FareResults from '@/components/FareResults';

interface RoutePageProps {
  params: {
    slug: string;
  };
}

// 8 Route Specific Custom Details & 3-Question FAQs
const routeDetailMap: Record<
  string,
  {
    h1: string;
    tagline: string;
    pickupData: LocationData;
    dropData: LocationData;
    highlights: string[];
    faqs: { q: string; a: string }[];
  }
> = {
  'bangalore-airport-to-city': {
    h1: 'Bangalore Airport to City Cab',
    tagline: 'Reliable 24/7 Kempegowda Airport Transfers with Flight Tracking',
    pickupData: {
      name: 'Kempegowda International Airport (BLR)',
      address: 'KIAL Rd, Devanahalli, Bengaluru, Karnataka 560300',
      lat: 13.1986,
      lng: 77.7066,
    },
    dropData: {
      name: 'Bangalore City Hubs',
      address: 'Bengaluru, Karnataka, India',
      lat: 12.9716,
      lng: 77.5946,
    },
    highlights: [
      '24/7 flight delay monitoring with zero waiting penalties',
      'Direct highway route via Bellary Road expressway',
      'Luggage boots accommodating 4-5 international bags',
      'Door-to-door drops across Whitefield, Indiranagar, HSR, and Electronic City',
    ],
    faqs: [
      {
        q: 'Where will my driver meet me at the airport terminal?',
        a: 'After you collect your luggage, our chauffeur will message you on WhatsApp and wait at the authorized cab pickup lane (Lane 1/2) with your vehicle number and name board.',
      },
      {
        q: 'Does the fare include the airport trumpet expressway toll?',
        a: 'No. The airport trumpet interchange toll, city tollway charges and airport parking are paid by the customer at actuals.',
      },
      {
        q: 'What if my incoming flight is delayed past midnight?',
        a: 'Our dispatch team tracks your flight number in real-time. Even if your flight is delayed past 2:00 AM or 3:00 AM, your assigned driver will be waiting at no extra charge.',
      },
    ],
  },
  'bangalore-to-mysore': {
    h1: 'Bangalore to Mysore Cab',
    tagline: 'Fast & Scenic Expressway Travel to the Heritage City of Palaces',
    pickupData: {
      name: 'Bangalore',
      address: 'Bengaluru, Karnataka, India',
      lat: 12.9716,
      lng: 77.5946,
    },
    dropData: {
      name: 'Mysore',
      address: 'Mysuru, Karnataka 570001',
      lat: 12.2958,
      lng: 76.6394,
    },
    highlights: [
      'Smooth 3-hour journey via the 10-lane Bangalore-Mysore Expressway (NH-275)',
      'Flexible breakfast and lunch stops at iconic Bidadi Thatte Idli or Maddur Vada eateries',
      'Same-day return packages covering Mysore Palace, Chamundi Hills, and Brindavan Gardens',
      'Spacious AC comfort for elderly family members and children',
    ],
    faqs: [
      {
        q: 'How long does the cab take to reach Mysore via the new expressway?',
        a: 'Travel time is typically around 2.5 to 3 hours depending on your pickup point in Bangalore. The 10-lane access-controlled expressway provides a super-smooth journey.',
      },
      {
        q: 'Can we stop for breakfast and sightseeing along the Bangalore-Mysore route?',
        a: 'Yes! Our drivers are happy to pause for authentic breakfast at Bidadi or Maddur, and can also stop at Srirangapatna (Ranganathittu Bird Sanctuary or Dariya Daulat Bagh).',
      },
      {
        q: 'Is it possible to complete Mysore sightseeing and return to Bangalore on the same day?',
        a: 'Yes, our 1-Day Same-Day Return package gives you 12–14 hours of vehicle disposal to tour Mysore Palace, Chamundeshwari Temple, and Brindavan musical fountains.',
      },
    ],
  },
  'bangalore-to-coorg': {
    h1: 'Bangalore to Coorg Cab',
    tagline: 'Chauffeur-Driven Road Trip to the Coffee Capital of South India',
    pickupData: {
      name: 'Bangalore',
      address: 'Bengaluru, Karnataka, India',
      lat: 12.9716,
      lng: 77.5946,
    },
    dropData: {
      name: 'Coorg (Madikeri)',
      address: 'Madikeri, Kodagu, Karnataka 571201',
      lat: 12.4244,
      lng: 75.7382,
    },
    highlights: [
      'Scenic Western Ghats highway drive via Mysore and Kushalnagar',
      'Drivers thoroughly experienced with winding hilly curves and mist conditions',
      'Direct doorstep drop to secluded coffee plantation homestays and luxury resorts',
      'Sightseeing coverage for Abbey Falls, Raja Seat, Dubare Elephant Camp, and Namdroling Monastery',
    ],
    faqs: [
      {
        q: 'What is the road condition between Bangalore and Coorg?',
        a: 'The route is excellent. You cruise on the Bangalore-Mysore Expressway, followed by a well-paved 2-lane scenic highway through Hunsur, Kushalnagar, and up to Madikeri.',
      },
      {
        q: 'Are your drivers trained for ghat road and hill station driving in Coorg?',
        a: 'Yes, all our outstation drivers have over 10 years of experience navigating Kodagu ghats, narrow estate roads, and hairpin turns with safe, smooth driving.',
      },
      {
        q: 'Can our Innova take us directly to remote homestays inside coffee estates?',
        a: 'Yes, Toyota Innova has high ground clearance (178mm) and superior suspension, making it ideal for accessing unpaved plantation paths and hillside homestays.',
      },
    ],
  },
  'bangalore-to-ooty': {
    h1: 'Bangalore to Ooty Cab',
    tagline: 'Scenic Journey Through Bandipur Reserve to the Queen of Hill Stations',
    pickupData: {
      name: 'Bangalore',
      address: 'Bengaluru, Karnataka, India',
      lat: 12.9716,
      lng: 77.5946,
    },
    dropData: {
      name: 'Ooty',
      address: 'Udhagamandalam, The Nilgiris, Tamil Nadu 643001',
      lat: 11.4102,
      lng: 76.6950,
    },
    highlights: [
      'Breathtaking safari drive through Bandipur and Mudumalai Tiger Reserves',
      'Expertise in navigating the 36 famous Kalhatty hairpin bends or relaxed Gudalur route',
      'Assistance with Tamil Nadu state border permit payments and entry checkposts',
      'Full disposal for Ooty Lake, Doddabetta Peak, Pykara Waterfalls, and Coonoor tea gardens',
    ],
    faqs: [
      {
        q: 'Does the Bangalore to Ooty route pass through Bandipur National Park?',
        a: 'Yes, the route passes directly through Bandipur (Karnataka) and Mudumalai (Tamil Nadu), where deer, peacocks, and elephants are frequently spotted along the highway.',
      },
      {
        q: 'Are there night travel restrictions in the Bandipur forest corridor?',
        a: 'Yes, the Bandipur forest gate closes nightly between 9:00 PM and 6:00 AM for wildlife safety. We plan your departure so you cross well before the curfew.',
      },
      {
        q: 'Which route does the driver take to climb up to Ooty?',
        a: 'Depending on passenger comfort and police checkpost advisories, our chauffeurs take either the steep 36-hairpin Kalhatty ghat road or the gentler Gudalur route.',
      },
    ],
  },
  'bangalore-to-wayanad': {
    h1: 'Bangalore to Wayanad Cab',
    tagline: 'Lush Rainforests, Spice Plantations & Wildlife Trails in God’s Own Country',
    pickupData: {
      name: 'Bangalore',
      address: 'Bengaluru, Karnataka, India',
      lat: 12.9716,
      lng: 77.5946,
    },
    dropData: {
      name: 'Wayanad',
      address: 'Kalpetta, Wayanad, Kerala 673121',
      lat: 11.6854,
      lng: 76.1320,
    },
    highlights: [
      'Scenic interstate road trip via Mysore, Gundlupet, and Sultan Bathery / Muthanga',
      'Assistance with Kerala entry tax and commercial permit documentation',
      'Ample luggage capacity for camping gear, trekking backpacks, and family suitcases',
      'Disposal for Banasura Sagar Dam, Edakkal Caves, Chembra Peak, and Pookode Lake',
    ],
    faqs: [
      {
        q: 'What time does the forest checkpost operate between Gundlupet and Wayanad?',
        a: 'The Muthanga wildlife forest route operates between 6:00 AM and 9:00 PM. Night driving inside the forest is restricted by the forest department.',
      },
      {
        q: 'Are Kerala state entry road taxes included in our quote?',
        a: 'Interstate vehicle entry tax for commercial tourist cabs is shared transparently upfront. Our driver handles the physical tax clearance at the border counter.',
      },
      {
        q: 'Is Toyota Innova comfortable for exploring steep slopes in Wayanad?',
        a: 'Yes, Innova Crysta is renowned for its high torque engine and comfortable captain seats, providing smooth power on steep Wayanad hill ascents.',
      },
    ],
  },
  'bangalore-to-chikmagalur': {
    h1: 'Bangalore to Chikmagalur Cab',
    tagline: 'Pristine Coffee Estates, Mist-Covered Peaks & Bababudangiri Range',
    pickupData: {
      name: 'Bangalore',
      address: 'Bengaluru, Karnataka, India',
      lat: 12.9716,
      lng: 77.5946,
    },
    dropData: {
      name: 'Chikmagalur',
      address: 'Chikkamagaluru, Karnataka 577101',
      lat: 13.3153,
      lng: 75.7754,
    },
    highlights: [
      'Quick 4.5-hour expressway drive along NH-75 via Kunigal, Channarayapatna, and Hassan',
      'Optional en-route cultural detours to Belur Chennakesava and Halebeedu Hoysala temples',
      'Drivers familiar with Mullayanagiri peak roads and secluded coffee estate homestays',
      'Flexible 2N/3D and 3N/4D round-trip holiday itineraries',
    ],
    faqs: [
      {
        q: 'Which is the best highway route from Bangalore to Chikmagalur?',
        a: 'The fastest and best route is via Nelamangala on NH-75 through Hassan, followed by the Hassan-Chikmagalur highway. Road conditions are 4-lane and smooth.',
      },
      {
        q: 'Can the Innova cab take us all the way up to Mullayanagiri peak?',
        a: 'Yes, our experienced drivers can navigate the narrow winding road leading up to the Mullayanagiri parking base safely.',
      },
      {
        q: 'Can we stop at Belur and Halebidu temples during our journey?',
        a: 'Yes! Belur and Halebidu are located just 25 km from Hassan en route to Chikmagalur. You can easily dedicate 2–3 hours to explore the UNESCO Hoysala architecture.',
      },
    ],
  },
  'bangalore-to-kodaikanal': {
    h1: 'Bangalore to Kodaikanal Cab',
    tagline: 'Princess of Hill Stations with Misty Pine Forests and Star-Shaped Lakes',
    pickupData: {
      name: 'Bangalore',
      address: 'Bengaluru, Karnataka, India',
      lat: 12.9716,
      lng: 77.5946,
    },
    dropData: {
      name: 'Kodaikanal',
      address: 'Kodaikanal, Dindigul, Tamil Nadu 624101',
      lat: 10.2381,
      lng: 77.4892,
    },
    highlights: [
      'Long-distance highway cruise through Hosur, Krishnagiri, Dharmapuri, Salem, and Dindigul',
      'Smooth 50-km scenic mountain climb from Batlagundu through misty pine forests',
      'Plush reclining seats and superior suspension minimizing fatigue on 9-hour journeys',
      'Local sightseeing coverage for Kodai Lake, Pillar Rocks, Bryant Park, and Coaker’s Walk',
    ],
    faqs: [
      {
        q: 'How long is the drive to Kodaikanal and when should we start?',
        a: 'The journey is approximately 465 km and takes around 9 hours. We recommend starting early at 5:00 AM or 6:00 AM from Bangalore to avoid city bottlenecks and reach Kodai by afternoon.',
      },
      {
        q: 'Is a 3-day or 4-day trip recommended for Bangalore to Kodaikanal?',
        a: 'A 3 Nights / 4 Days itinerary is ideal because of the 9-hour travel time each way, giving you two full relaxed days to explore the lake, pine forests, and viewpoints.',
      },
      {
        q: 'How are driver night charges and interstate entry permits handled?',
        a: 'Driver night allowance (if driving past 10:00 PM) and Tamil Nadu state entry permit taxes are detailed clearly in your advance quote with no hidden extras.',
      },
    ],
  },
  'bangalore-to-pondicherry': {
    h1: 'Bangalore to Pondicherry Cab',
    tagline: 'Coastal French Colony Retreat, Promenade Beaches & Auroville Getaways',
    pickupData: {
      name: 'Bangalore',
      address: 'Bengaluru, Karnataka, India',
      lat: 12.9716,
      lng: 77.5946,
    },
    dropData: {
      name: 'Pondicherry',
      address: 'Puducherry, 605001',
      lat: 11.9416,
      lng: 79.8083,
    },
    highlights: [
      'Scenic interstate road trip via Krishnagiri, Tiruvannamalai, and Tindivanam',
      'Optional spiritual stopover at the sacred Arunachaleswarar Temple in Tiruvannamalai',
      'Direct doorstep drops to French White Town heritage hotels and Paradise Beach resorts',
      'Spacious luggage accommodation for weekend shopping, surfing boards, and family bags',
    ],
    faqs: [
      {
        q: 'Which route is recommended between Bangalore and Pondicherry?',
        a: 'The route via Krishnagiri, Chengam, Tiruvannamalai, and Tindivanam is the most popular, offering good highway tarmac and roadside dining options.',
      },
      {
        q: 'Can we stop for darshan at Tiruvannamalai temple on the way?',
        a: 'Yes, our drivers are flexible and can accommodate a 2-hour stopover for darshan at the magnificent Arunachaleswarar temple in Tiruvannamalai.',
      },
      {
        q: 'Can we visit Auroville and the beaches during the trip?',
        a: 'Yes. Outstation trips are round trips with the car and chauffeur at your disposal, so you can cover Auroville, Promenade Beach and Paradise Beach before returning to Bangalore. Add them as stops when booking.',
      },
    ],
  },
};

export async function generateStaticParams() {
  const routes = await getRoutes();
  return routes.map((route) => ({
    slug: route.slug,
  }));
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const routes = await getRoutes();
  const route = routes.find((r) => r.slug === params.slug);
  const details = routeDetailMap[params.slug];

  if (!route) {
    return {
      title: `Outstation Cab | ${siteConfig.brand.name}`,
    };
  }

  const h1 = details?.h1 || `${route.name} Cab`;
  const destination = route.destination;

  return {
    title: `${h1} | Innova & Crysta Rental Bangalore | ${siteConfig.brand.name}`,
    description: `Book ${h1} with experienced driver. Clean Toyota Innova, Innova Crysta & Ertiga round-trip rental for travel between ${route.origin} and ${destination} (${route.distanceKm} km, ${route.durationText}). Zero surge, transparent pricing.`,
    keywords: [
      `${h1} Bangalore`,
      `Innova Cab Bangalore to ${destination}`,
      `Bangalore to ${destination} Innova Price`,
      `Book Innova Cab Bangalore to ${destination}`,
      'Innova Cabs Bangalore',
      'Innova Outstation Rental',
    ],
  };
}

export default async function RouteDetailPage({ params }: RoutePageProps) {
  const routes = await getRoutes();
  const route = routes.find((r) => r.slug === params.slug);

  if (!route) {
    notFound();
  }

  const [allVehicles, localPackages] = await Promise.all([getVehicles(), getLocalPackages()]);
  const vehicles = confirmedFleet(allVehicles);
  const widgetData = buildWidgetData(routes, localPackages, vehicles);
  const isAirportRoute = params.slug.includes('airport');
  const routeFrom = routeFromFare(route, vehicles);

  const customDetails = routeDetailMap[params.slug] || {
    h1: `${route.name} Cab`,
    tagline: 'Comfortable Cars. Experienced Drivers. Reliable Journeys.',
    pickupData: {
      name: 'Bangalore',
      address: 'Bengaluru, Karnataka, India',
      lat: null,
      lng: null,
    },
    dropData: {
      name: route.destination,
      address: `${route.destination}, India`,
      lat: null,
      lng: null,
    },
    highlights: [
      `Dedicated chauffeur-driven journey from ${route.origin} to ${route.destination}`,
      `Approximate driving distance of ${route.distanceKm} km each way, around ${route.durationText}`,
      'Round trip with the car and chauffeur at your disposal; add up to 3 stops on the way',
      'Sanitized, air-conditioned Innova, Crysta or Ertiga with ample luggage space',
      'Experienced highway driver with zero surge pricing and transparent billing',
    ],
    faqs: [
      {
        q: `How long does the journey take from ${route.origin} to ${route.destination}?`,
        a: `Under typical highway conditions, the ${route.distanceKm} km journey takes approximately ${route.durationText}.`,
      },
      {
        q: 'Can we take breaks for meals or photos along the way?',
        a: 'Yes, our chauffeurs are courteous and accommodate meal, tea, and restroom breaks at verified highway restaurants.',
      },
      {
        q: 'Are tolls and driver allowances included in the quote?',
        a: 'Driver allowance is included in your fare estimate. Toll fees, parking and interstate permits are paid by the customer at actuals.',
      },
    ],
  };

  const whatsappRouteUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
    `Hello ${siteConfig.brand.name}, I would like to book the ${customDetails.h1} (${route.distanceKm} km) in Toyota Innova. Please share current quote.`
  )}`;

  return (
    <div className="bg-porcelain">
      <PageHero
        breadcrumbs={[{ label: 'Outstation Routes', href: '/routes' }, { label: customDetails.h1 }]}
        eyebrow={`${route.origin} → ${route.destination}`}
        title={customDetails.h1}
        lead={
          <>
            <p className="font-bold text-brand-700">{customDetails.tagline}</p>
            <p className="mt-3">
              Travel in premium air-conditioned comfort with our verified chauffeurs. Fixed transparent billing, zero surge,
              and dependable 24/7 service.
            </p>
          </>
        }
        aside={
          <QuickBookingWidget
            {...widgetData}
            initialService={isAirportRoute ? 'airport' : 'outstation'}
            initialOutstation={
              isAirportRoute
                ? undefined
                : { pickup: customDetails.pickupData, drop: customDetails.dropData, routeSlug: params.slug }
            }
          />
        }
      >
        <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <a href={siteConfig.contact.phone.tel} className="btn-primary">
            <Phone className="h-4 w-4" /> {siteConfig.cta.instantBooking}
          </a>
          <a href={whatsappRouteUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            <MessageCircle className="h-4 w-4" /> {siteConfig.cta.quickQuote}
          </a>
        </div>

        {/* Distance / duration / fare (null fare = "Price on request") */}
        <dl className="mt-8 grid grid-cols-3 divide-x divide-slate-200/80 rounded-2xl border border-slate-200/80 bg-white text-center shadow-float">
          <div className="p-3 sm:p-4">
            <dt className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <RouteIcon className="h-3 w-3" /> Distance
            </dt>
            <dd className="mt-1 text-lg font-extrabold tabular-nums sm:text-xl">{route.distanceKm} km</dd>
            <dd className="text-[11px] text-slate-500">From Bangalore</dd>
          </div>
          <div className="p-3 sm:p-4">
            <dt className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <Clock className="h-3 w-3" /> Duration
            </dt>
            <dd className="mt-1 text-lg font-extrabold sm:text-xl">{route.durationText}</dd>
            <dd className="text-[11px] text-slate-500">Standard driving time</dd>
          </div>
          <div className="p-3 sm:p-4">
            <dt className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <IndianRupee className="h-3 w-3" /> Tariff
            </dt>
            <dd className="mt-1 text-lg font-extrabold text-brand-700 sm:text-xl">
              {routeFrom ? `from ${formatINR(routeFrom)}` : 'On request'}
            </dd>
            <dd className="text-[11px] text-slate-500">Round trip · tolls extra</dd>
          </div>
        </dl>
      </PageHero>

      {/* Available cars, prices & T&Cs (after "See Fares") */}
      <FareResults />

      {/* Why book this route */}
      <section className="section py-16 sm:py-20">
        <Reveal>
          <div className="card-float p-6 sm:p-10">
            <SectionHeading
              eyebrow="Highway excellence"
              title={`Why Book ${customDetails.h1} with Innova Cabs Bangalore`}
              subtitle="We ensure every kilometer of your highway trip is relaxing, punctual, and safe."
              centered={false}
            />
            <ul className="mt-8 grid gap-3 md:grid-cols-2">
              {customDetails.highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-sm font-medium text-slate-700"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-live-500/10 text-live-600">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Vehicle options for this route */}
      <section className="relative bg-white py-16 sm:py-20">
        <Hairline />
        <div className="section">
          <SectionHeading
            eyebrow="Fleet options"
            title="Available Cars for this Route"
            subtitle="Choose the Innova, luxury Crysta or compact Ertiga with verified highway chauffeurs."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v, i) => {
              const photo = primaryPhoto(v.id);
              const whatsappVehicleUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
                `Hello, I would like to book a ${v.name} for the ${customDetails.h1}. Please share tariff and availability.`
              )}`;
              return (
                <Reveal key={v.id} delay={i * 0.1} className="h-full">
                  <article className="card-float card-float-hover flex h-full flex-col overflow-hidden">
                    {photo && (
                      <div className="relative aspect-[16/9] overflow-hidden bg-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          width={photo.width}
                          height={photo.height}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-700 ease-premium hover:scale-[1.03]"
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950/60 to-transparent" />
                        <div className="absolute bottom-3 left-4 text-white">
                          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">{v.type}</p>
                          <h3 className="text-xl font-extrabold leading-tight">{v.name}</h3>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      {!photo && <h3 className="text-xl font-extrabold">{v.name}</h3>}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-medium text-slate-700">
                          <Users className="h-4 w-4 shrink-0 text-brand-600" /> {v.seats} seats
                        </span>
                        <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-medium text-slate-700">
                          <Luggage className="h-4 w-4 shrink-0 text-brand-600" /> {v.luggage} bags
                        </span>
                      </div>
                      <ul className="mt-4 grid gap-x-4 gap-y-2 sm:grid-cols-2">
                        {v.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm font-medium text-slate-700">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-live-600" strokeWidth={2.5} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                        <span>
                          <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Round trip from</span>
                          <span className="text-lg font-extrabold tabular-nums">{fareOrRequest(routeRoundTripFare(route, v))}</span>
                        </span>
                        <a href={whatsappVehicleUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-4 py-2.5">
                          <MessageCircle className="h-4 w-4" /> Quick Quote
                        </a>
                      </div>
                      {photo && <PhotoCredit photo={photo} className="mt-3 block" />}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Route FAQ */}
      <section className="section py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="max-w-2xl">
            <span className="eyebrow">Route information</span>
            <h2 className="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Frequently Asked Questions: {customDetails.h1}
            </h2>
            <p className="mt-3 text-slate-600">Essential tips and answers for your upcoming trip to {route.destination}.</p>
            <Link href="/routes" className="btn-ghost group mt-6">
              All routes
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <FaqAccordion faqs={customDetails.faqs} />
        </div>
      </section>

      <CtaBand
        title={`Reserve Your ${customDetails.h1} Today`}
        whatsappUrl={whatsappRouteUrl}
        service={isAirportRoute ? 'airport' : 'outstation'}
      />
    </div>
  );
}

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Compass,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Users,
  Luggage,
  HelpCircle,
  ArrowRight,
  Car,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import BookingWidget from '@/components/BookingWidget';
import { getRoutes, getVehicles } from '@/lib/dataService';
import { siteConfig } from '@/lib/siteConfig';
import { LocationData } from '@/lib/googlePlaces';

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
        a: 'The trumpet interchange toll and city tollway charges are billed transparently at actuals, or can be bundled into an all-inclusive single invoice upon prior request.',
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
        q: 'Do you offer one-way drops to Pondicherry resorts?',
        a: 'Yes, we provide both one-way drops to Pondicherry hotels/Auroville and round-trip holiday packages. Inquire on WhatsApp for customized one-way drop rates.',
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
    description: `Book ${h1} with experienced driver. Clean Toyota Innova & Innova Crysta rental for travel between ${route.origin} and ${destination} (${route.distanceKm} km, ${route.durationText}). Zero surge, transparent pricing.`,
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

  const allVehicles = await getVehicles();
  const vehicles = allVehicles.filter((v) => v.confirmed !== false);

  const customDetails = routeDetailMap[params.slug] || {
    h1: `${route.name} Cab`,
    tagline: 'Comfortable Cars. Experienced Drivers. Reliable Journeys.',
    pickupData: {
      name: route.origin,
      address: `${route.origin}, India`,
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
      `Total driving distance of ${route.distanceKm} km with approximate duration of ${route.durationText}`,
      'Sanitized, air-conditioned Toyota Innova MPV with ample luggage boot',
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
        a: 'Driver allowances, toll fees, and applicable interstate permits are detailed with full transparency upfront.',
      },
    ],
  };

  const whatsappRouteUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
    `Hello ${siteConfig.brand.name}, I would like to book the ${customDetails.h1} (${route.distanceKm} km) in Toyota Innova. Please share current quote.`
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
          <Link href="/routes" className="hover:text-white transition-colors">
            Outstation Routes
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-white font-medium truncate">{customDetails.h1}</span>
        </div>
      </div>

      {/* Hero Section with Prefilled Booking Widget */}
      <section className="bg-brand-navy text-white py-12 md:py-18 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Route Title & CTAs */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-brand-orange border border-white/10">
                <Compass className="w-3.5 h-3.5" />
                <span>
                  {route.origin} ➔ {route.destination}
                </span>
              </div>

              {/* Unique H1 */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
                {customDetails.h1}
              </h1>

              <p className="text-lg text-brand-orange font-medium">
                {customDetails.tagline}
              </p>

              <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
                Travel in premium air-conditioned comfort with our verified chauffeurs. Fixed transparent billing, zero surge, and dependable 24/7 service.
              </p>

              {/* Quick Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3.5 pt-2">
                <a
                  href={siteConfig.contact.phone.tel}
                  className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover active:scale-[0.99] text-white text-base font-bold shadow-lg shadow-brand-orange/25 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  <span>{siteConfig.cta.instantBooking}</span>
                </a>

                <a
                  href={whatsappRouteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-base font-semibold shadow-lg transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{siteConfig.cta.quickQuote}</span>
                </a>
              </div>
            </div>

            {/* Right Column: BookingWidget PRE-FILLED WITH ROUTE */}
            <div className="lg:col-span-5 w-full mt-6 lg:mt-0">
              <BookingWidget
                initialPickup={customDetails.pickupData}
                initialDrop={customDetails.dropData}
                serviceType="outstation"
                routeSlug={params.slug}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Distance / Duration / Fare Strip (Null fare = "Price on request") */}
      <section className="bg-brand-navy-light text-white py-6 border-y border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block mb-1">
              Driving Distance
            </span>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {route.distanceKm} <span className="text-sm font-normal text-brand-orange">Km</span>
            </p>
            <p className="text-[11px] text-gray-300 mt-0.5">One-Way Highway Corridor</p>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block mb-1">
              Estimated Duration
            </span>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {route.durationText}
            </p>
            <p className="text-[11px] text-gray-300 mt-0.5">Standard Driving Time</p>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block mb-1">
              Route Tariff
            </span>
            <p className="text-2xl sm:text-3xl font-black text-brand-orange">
              Price on request
            </p>
            <p className="text-[11px] text-gray-300 mt-0.5">All-Inclusive Transparent Billing</p>
          </div>
        </div>
      </section>

      {/* Main Details Body */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        
        {/* Why Book This Route With Innova Cabs Bangalore */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Highway Excellence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-1">
              Why Book {customDetails.h1} with Innova Cabs Bangalore
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              We ensure every kilometer of your highway trip is relaxing, punctual, and safe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customDetails.highlights.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-brand-offwhite border border-gray-100 flex items-start gap-3.5"
              >
                <CheckCircle2 className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Available Vehicle Options for this Route */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Fleet Options
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-1">
              Available Innova Models for this Route
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select standard Innova or luxury Crysta with verified highway chauffeurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((v) => {
              const whatsappVehicleUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
                `Hello, I would like to book a ${v.name} for the ${customDetails.h1}. Please share tariff and availability.`
              )}`;

              return (
                <div
                  key={v.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-brand-navy">{v.name}</h3>
                        <p className="text-xs text-gray-500">{v.type}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 font-semibold text-brand-navy">
                          <Users className="w-4 h-4 text-brand-orange" />
                          <span>{v.seats} Seats</span>
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-brand-navy">
                          <Luggage className="w-4 h-4 text-emerald-600" />
                          <span>{v.luggage} Bags</span>
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {v.features.map((f, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-100 mt-auto flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-gray-400 font-semibold block">Route Tariff</span>
                      <span className="text-sm font-extrabold text-brand-navy">Price on request</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={whatsappVehicleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Quick Quote</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3-Question Destination FAQ */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Route Information
            </span>
            <h2 className="text-2xl font-bold text-brand-navy mt-1">
              Frequently Asked Questions: {customDetails.h1}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Essential tips and answers for your upcoming trip to {route.destination}.
            </p>
          </div>

          <div className="space-y-4">
            {customDetails.faqs.map((faq, index) => (
              <div key={index} className="p-4 rounded-2xl bg-brand-offwhite border border-gray-100">
                <h3 className="text-sm sm:text-base font-bold text-brand-navy mb-1.5 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="bg-brand-navy text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange bg-white/10 px-3.5 py-1 rounded-full inline-block">
            Instant Chauffeur Assignment
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Reserve Your {customDetails.h1} Today
          </h2>
          <p className="text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
            &ldquo;{siteConfig.brand.closingLine}&rdquo;
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={siteConfig.contact.phone.tel}
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm shadow-md transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>{siteConfig.cta.instantBooking}</span>
            </a>

            <a
              href={whatsappRouteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{siteConfig.cta.quickQuote}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

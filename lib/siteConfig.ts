/**
 * siteConfig.ts - Single Source of Truth for Innova Cabs Bangalore.
 * 
 * Sourced directly from PROJECT_CONTEXT.md.
 * Every component across the application MUST import and consume contact info,
 * branding, locations, and copy from this file. Never hard-code these values elsewhere.
 */

export interface TrustClaim<T = number | string> {
  value: T;
  label: string;
  verified: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date?: string;
  source?: 'google' | 'direct';
}

export const siteConfig = {
  brand: {
    name: 'Innova Cabs Bangalore',
    tagline: 'Innova Cabs Bangalore | Innova Crysta and Hycross Rental',
    closingLine: 'Comfortable Cars. Experienced Drivers. Reliable Journeys.',
  },

  contact: {
    phone: {
      raw: '9686025999',
      display: '+91 9686025999',
      tel: 'tel:+919686025999',
      whatsappUrl: 'https://wa.me/919686025999',
    },
    email: 'greensrentacab@gmail.com',
    address: {
      street: '25, 2nd Cross St, Muniyappa Layout, Nagenahalli, Narayanapura',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560077',
      country: 'IN',
      full: '25, 2nd Cross St, Muniyappa Layout, Nagenahalli, Narayanapura, Bengaluru, Karnataka 560077',
    },
    hours: 'Open 24/7',
  },

  services: [
    {
      id: 'airport',
      name: 'Airport Pickup / Drop',
      description: 'Reliable, on-time airport transfers to and from Kempegowda International Airport (BLR).',
    },
    {
      id: 'local',
      name: 'Local City Rental',
      description: 'Chauffeur-driven Innova rentals for half-day or full-day city travel.',
    },
    {
      id: 'outstation',
      name: 'Outstation Trips',
      description: 'One-way drops and round-trip rentals for intercity journeys with zero stress.',
    },
    {
      id: 'tour-packages',
      name: 'Custom Tour Packages',
      description: 'Curated, enquiry-based holiday itineraries tailored to your schedule.',
    },
    {
      id: 'corporate-family',
      name: 'Corporate & Family Travel',
      description: 'Spacious, comfortable seating for executive delegations and family vacations.',
    },
  ],

  localAreas: [
    'Bangalore City & Airport',
    'Marathahalli',
    'Whitefield',
    'HSR Layout',
    'Koramangala',
    'Indiranagar',
    'Sarjapur Road',
    'JP Nagar',
    'Bannerghatta Road',
    'KR Puram',
    'MG Road',
  ] as const,

  outstationDestinations: [
    'Mysore',
    'Coorg',
    'Ooty',
    'Wayanad',
    'Chikmagalur',
    'Kodaikanal',
    'Pondicherry',
  ] as const,

  cta: {
    instantBooking: 'Call Now for Instant Booking',
    quickQuote: 'WhatsApp Us for a Quick Quote',
    advanceBooking: 'Reserve Your Innova in Advance',
  },

  trustClaims: {
    yearsExperience: {
      value: 15,
      label: '15 Years of Experience',
      verified: false,
    } as TrustClaim<number>,
    happyCustomers: {
      value: '5000+',
      label: '5000+ Happy Customers',
      verified: false,
    } as TrustClaim<string>,
    googleRating: {
      value: 5.0,
      label: '5 Star Google Rating',
      verified: false,
    } as TrustClaim<number>,
  },

  /**
   * Testimonials array:
   * Keep empty until real client reviews are verified and supplied.
   * Per PROJECT_CONTEXT.md rules, hide testimonial section when empty.
   */
  testimonials: [] as Testimonial[],

  seo: {
    title: 'Innova Cabs Bangalore | Innova & Innova Crysta Rental',
    h1: 'Innova Cabs Bangalore – Innova & Innova Crysta Rental',
    metaDescription:
      'Book Toyota Innova, Innova Crysta, and Hycross car rentals in Bangalore with experienced drivers. Airport transfers, local city use, and outstation trips available 24/7.',
    primaryKeywords: [
      'Innova Cabs Bangalore',
      'Innova Rental Bangalore',
      'Innova Crysta Rental Bangalore',
    ],
    secondaryKeywords: [
      'Innova Taxi Bangalore',
      'Innova with Driver Bangalore',
      'Innova Airport Taxi Bangalore',
    ],
    highIntentKeywords: [
      'Book Innova Cab Bangalore',
      'Innova Cab Bangalore Price',
      'Innova Cab Bangalore to Coorg',
    ],
  },
} as const;

export default siteConfig;

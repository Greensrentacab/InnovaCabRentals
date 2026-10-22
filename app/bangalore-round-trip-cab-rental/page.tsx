import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';
import OutstationLanding from '@/components/landing/OutstationLanding';

export const metadata: Metadata = withSeo({
  alternates: { canonical: '/bangalore-round-trip-cab-rental' },
  title: 'Round-Trip Cab Rental from Bangalore | Innova, Crysta, Ertiga',
  description:
    'Round-trip cab rental from Bangalore with a dedicated Innova, Innova Crysta or Ertiga and chauffeur. Add up to 3 stops, keep the car for the whole trip and return to Bangalore, with transparent per-km billing.',
});

/** The outstation page (all outstation trips are round trips), opened at its routes. */
export default function RoundTripCabRentalPage() {
  return (
    <OutstationLanding
      scrollToId="routes"
      overrides={{
        breadcrumb: 'Round-Trip Cab Rental',
        title: 'Round-Trip Cab Rental from Bangalore',
        subtitle:
          'Book a chauffeur-driven Innova, Innova Crysta or Ertiga for a round trip from Bangalore. The car and chauffeur stay with you for the whole trip, with up to 3 stops on the way, and bring you back home.',
      }}
    />
  );
}

import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';
import LocalLanding from '@/components/landing/LocalLanding';

export const metadata: Metadata = withSeo({
  alternates: { canonical: '/bangalore-hourly-cab-rental' },
  title: 'Hourly Cab Rental Bangalore | 8 Hr & 12 Hr Innova Packages',
  description:
    'Hourly cab rental in Bangalore with a chauffeur-driven Innova, Innova Crysta or Ertiga. Choose an 8 hr / 80 km or 12 hr / 120 km package, or ask for a custom duration.',
});

/** The local rental page, opened at its hourly packages. */
export default function HourlyCabRentalPage() {
  return (
    <LocalLanding
      scrollToId="packages"
      overrides={{
        breadcrumb: 'Hourly Cab Rental',
        title: 'Hourly Cab Rental in Bangalore',
        subtitle:
          'Hire a chauffeur-driven Innova, Innova Crysta or Ertiga by the hour in Bangalore. Pick an 8 hr / 80 km or 12 hr / 120 km package, or ask for a custom duration.',
      }}
    />
  );
}

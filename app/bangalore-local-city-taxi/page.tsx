import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';
import LocalLanding from '@/components/landing/LocalLanding';

export const metadata: Metadata = withSeo({
  alternates: { canonical: '/bangalore-local-city-taxi' },
  title: 'Local Innova Rental Bangalore | 8 Hr & 12 Hr Packages',
  description:
    'Rent Toyota Innova, Innova Crysta and Maruti Suzuki Ertiga in Bangalore for local city travel. 8 hr / 80 km and 12 hr / 120 km rental packages, custom durations on request, and point-to-point city transfers.',
});

export default function LocalCityTaxiPage() {
  return <LocalLanding />;
}

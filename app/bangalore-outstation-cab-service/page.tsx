import type { Metadata } from 'next';
import { withSeo } from '@/lib/seo';
import OutstationLanding from '@/components/landing/OutstationLanding';

export const metadata: Metadata = withSeo({
  alternates: { canonical: '/bangalore-outstation-cab-service' },
  title: 'Outstation Innova Cabs Bangalore | Mysore, Coorg, Ooty',
  description:
    'Book outstation round-trip Innova, Crysta and Ertiga cabs from Bangalore with up to 3 stops on the way. Seasoned highway drivers and transparent per-km billing; tolls paid by customer.',
});

export default function OutstationCabServicePage() {
  return <OutstationLanding />;
}

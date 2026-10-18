import type { Metadata } from 'next';
import PageHero from '@/components/ds/PageHero';
import CtaBand from '@/components/ds/CtaBand';
import { FareTermsList, IncludedExcluded, TermsBlocks } from '@/components/policies/PolicyViews';
import { getPublishedPolicies } from '@/lib/siteContentStore';
import { POLICY_SERVICE_LABEL, POLICY_SERVICES } from '@/lib/policies';
import { siteConfig } from '@/lib/siteConfig';

/**
 * /terms — Terms & Conditions plus what each service includes and excludes.
 * All copy is published from Admin → Terms & policies (no deployment needed);
 * publishing revalidates this page immediately.
 */

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: '/terms' },
  title: `Terms & Conditions | ${siteConfig.brand.name}`,
  description: `Booking, fare, payment and cancellation terms for ${siteConfig.brand.name}, plus what is included in airport, outstation and local cab fares.`,
};

export default async function TermsPage() {
  const policies = await getPublishedPolicies();

  return (
    <div className="ds-scope bg-porcelain">
      <PageHero
        breadcrumbs={[{ label: 'Terms & Conditions', href: '/terms' }]}
        eyebrow="Policies"
        title="Terms & Conditions"
        lead="How booking, fares, payment and cancellation work, and what each type of trip includes."
      />

      <section className="section pb-10 sm:pb-16">
        <div className="card-float p-5 sm:p-10">
          <TermsBlocks blocks={policies.terms} className="max-w-3xl" />
        </div>
      </section>

      <section className="section pb-16 sm:pb-24" aria-labelledby="included-heading">
        <h2 id="included-heading" className="text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">
          What your fare includes
        </h2>
        <div className="mt-6 space-y-8 sm:mt-8">
          {POLICY_SERVICES.map((s) => (
            <div key={s} id={s} className="scroll-mt-28">
              <h3 className="text-lg font-extrabold tracking-tight text-ink">{POLICY_SERVICE_LABEL[s]}</h3>
              <IncludedExcluded policy={policies.services[s]} className="mt-3" />
              <FareTermsList terms={policies.services[s].terms} className="mt-4" />
            </div>
          ))}
        </div>
      </section>

      <CtaBand />
    </div>
  );
}

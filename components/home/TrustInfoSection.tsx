/**
 * TrustInfoSection.tsx — "Trust and reliability" + "Booking and payment
 * information". Every statement comes from siteConfig (claims, payments,
 * policies) so the wording stays consistent across the site.
 */

import { BadgeCheck, CreditCard, ShieldCheck } from 'lucide-react';
import Reveal from '@/components/home/Reveal';
import { siteConfig } from '@/lib/siteConfig';

const trustPoints = [
  'Experienced, verified chauffeurs who know Bangalore and the highways',
  'Transparent pricing — no surge and no hidden charges',
  `Clear policy: ${siteConfig.policies.tolls.replace(/\.$/, '')}; outstation driver allowance is shown in your estimate`,
  `Registered business address: ${siteConfig.contact.address.full}`,
  'Flight tracking for airport pickups, so delays never cost you extra',
];

const bookingPoints = [
  `Payment methods: ${siteConfig.payments.methods.join(', ')}`,
  `₹0 advance — ${siteConfig.payments.advance.replace('No advance payment needed to book. ', '').toLowerCase()}`,
  siteConfig.policies.confirmation,
  siteConfig.policies.cancellation,
  'Fare includes the car, fuel and chauffeur; extra km / hours are billed at the rates shown before you confirm',
];

function Card({
  icon: Icon,
  tone,
  title,
  points,
}: {
  icon: typeof ShieldCheck;
  tone: string;
  title: string;
  points: string[];
}) {
  return (
    <div className="card-float h-full p-6 sm:p-7">
      <h3 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
        {title}
      </h3>
      <ul className="mt-5 space-y-3">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-sm font-medium leading-relaxed text-slate-700">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-live-600" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TrustInfoSection() {
  return (
    <section id="trust" className="section scroll-mt-24 py-16 sm:py-20">
      <div className="max-w-2xl">
        <span className="eyebrow">Why book with us</span>
        <h2 className="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Clear terms. Reliable rides.</h2>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Reveal className="h-full">
          <Card icon={ShieldCheck} tone="bg-live-500/10 text-live-600" title="Trust and reliability" points={trustPoints} />
        </Reveal>
        <Reveal delay={0.1} className="h-full">
          <Card icon={CreditCard} tone="bg-brand-50 text-brand-700" title="Booking and payment information" points={bookingPoints} />
        </Reveal>
      </div>
    </section>
  );
}

import Link from 'next/link';
import { ArrowRight, Check, Luggage, MessageCircle, Phone, Users } from 'lucide-react';
import { getVehicles } from '@/lib/dataService';
import { siteConfig } from '@/lib/siteConfig';
import { fleetPhotos } from '@/lib/fleetPhotos';
import PageHero from '@/components/ds/PageHero';
import CtaBand from '@/components/ds/CtaBand';
import VehiclePhotoCard from '@/components/ds/VehiclePhotoCard';
import RateList, { rateRows } from '@/components/ds/RateList';
import SectionHeading from '@/components/ds/SectionHeading';
import Reveal from '@/components/home/Reveal';
import { cn } from '@/lib/cn';

export const revalidate = 60;

export const metadata = {
  title: `Car Rental Fleet Bangalore | Innova, Crysta & Ertiga Cabs | ${siteConfig.brand.name}`,
  description:
    'Explore and compare our Toyota Innova, Innova Crysta and Maruti Suzuki Ertiga rental fleet in Bangalore. Clean, sanitized 7 and 8 seater AC MPVs with experienced drivers for outstation, local, and airport rides.',
  keywords: [
    'Innova Cabs Bangalore',
    'Innova Rental Bangalore',
    'Innova Crysta Rental Bangalore',
    'Innova Taxi Bangalore',
    'Innova with Driver Bangalore',
    'Book Innova Cab Bangalore',
  ],
};

export default async function VehiclesPage() {
  const allVehicles = await getVehicles();
  // CRITICAL RULE: If a vehicle has confirmed:false, hide its page and card.
  const confirmedVehicles = allVehicles.filter((v) => v.confirmed !== false);
  // (Hycross stays hidden until confirmed in Admin → Fleet)

  const vehicleIdealForMap: Record<string, string[]> = {
    innova: [
      'Family Holiday Vacations',
      'Outstation Road Trips',
      'Bangalore Airport Pickup & Drop',
      'Group Sightseeing Tours',
      'Wedding Entourage Transit',
    ],
    'innova-crysta': [
      'Executive Corporate Delegations',
      'VIP Airport Transfers',
      'Luxury Long-Distance Travel',
      'Hill Station Ghat Tours (Coorg, Ooty)',
      'Premium Family Journeys',
    ],
    ertiga: [
      'Small Families & Groups of 4–6',
      'Budget-Friendly Airport Transfers',
      'Local City Errands & Shopping',
      'Weekend Temple Trips',
    ],
    'innova-hycross': [
      'Top-Tier Corporate Executives',
      'Eco-Friendly Hybrid City Travel',
      'VIP Guest Protocol',
      'Whisper-Quiet Highway Cruising',
    ],
  };

  return (
    <div className="bg-porcelain">
      <PageHero
        breadcrumbs={[{ label: 'Vehicles' }]}
        eyebrow="Chauffeur-driven Toyota MPV fleet"
        title="Toyota Innova Rental Fleet in Bangalore"
        lead={
          <>
            <p className="font-bold text-brand-700">{siteConfig.brand.closingLine}</p>
            <p className="mt-3">
              Choose from the Toyota Innova, Innova Crysta and Maruti Suzuki Ertiga. Every car is thoroughly sanitized,
              air-conditioned, and driven by an experienced highway-tested chauffeur.
            </p>
          </>
        }
      >
        <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <a href={siteConfig.contact.phone.tel} className="btn-primary">
            <Phone className="h-4 w-4" /> {siteConfig.cta.instantBooking}
          </a>
          <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            <MessageCircle className="h-4 w-4" /> {siteConfig.cta.quickQuote}
          </a>
        </div>
      </PageHero>

      <section className="section space-y-10 py-12 sm:space-y-14 sm:py-16">
        {confirmedVehicles.map((vehicle, i) => {
          const idealForList = vehicleIdealForMap[vehicle.id] || ['Family Travel', 'Outstation', 'Airport Transfers'];
          const whatsappVehicleUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
            `Hello ${siteConfig.brand.name}, I would like to get a quote and check availability for ${vehicle.name}.`
          )}`;
          const photo = fleetPhotos[vehicle.id]?.[0];

          return (
            <Reveal key={vehicle.id}>
              <article className="grid items-center gap-6 lg:grid-cols-2 lg:gap-10">
                {photo && (
                  <VehiclePhotoCard
                    photo={photo}
                    eyebrow={vehicle.type}
                    title={vehicle.name}
                    badge={`${vehicle.seats} seats`}
                    priority={i === 0}
                    className={cn(i % 2 === 1 && 'lg:order-2')}
                  />
                )}

                <div className="card-float p-6 sm:p-8">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{vehicle.type}</p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{vehicle.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">Chauffeur-Driven • Sanitized Daily</p>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-medium text-slate-700">
                      <Users className="h-4 w-4 shrink-0 text-brand-600" /> {vehicle.seats} seats + driver
                    </span>
                    <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-medium text-slate-700">
                      <Luggage className="h-4 w-4 shrink-0 text-brand-600" /> {vehicle.luggage} large bags
                    </span>
                  </div>

                  <h3 className="mt-6 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Key features &amp; comfort</h3>
                  <ul className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
                    {vehicle.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm font-medium text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-live-600" strokeWidth={2.5} />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <h3 className="mt-6 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Recommended for</h3>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {idealForList.map((tag) => (
                      <li key={tag} className="pill">
                        {tag}
                      </li>
                    ))}
                  </ul>

                  <h3 className="mt-6 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Rental tariff</h3>
                  <RateList rates={vehicle.rates} className="mt-3" />
                  <a
                    href={whatsappVehicleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-live-600 hover:text-live-500"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp Quick Quote
                  </a>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Link href={`/${vehicle.id}-rental-bangalore`} className="btn-ghost group px-3">
                      Full details
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link href="/contact" className="btn-primary px-3">
                      Reserve Now
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </section>

      {/* Side-by-side comparison of the confirmed fleet */}
      <section id="compare" className="section scroll-mt-24 pb-16 sm:pb-20">
        <SectionHeading
          eyebrow="Compare fleet"
          title="Innova vs Crysta vs Ertiga"
          subtitle="Seats, luggage and current rates side by side. Tolls, parking and state permits are paid by the customer."
        />
        <div className="card-float mt-10 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Feature</th>
                {confirmedVehicles.map((v) => (
                  <th key={v.id} className="px-5 py-3 text-ink">
                    <Link href={`/${v.id}-rental-bangalore`} className="text-sm font-extrabold normal-case tracking-tight hover:text-brand-700">
                      {v.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <th className="px-5 py-3 font-medium text-slate-500">Type</th>
                {confirmedVehicles.map((v) => (
                  <td key={v.id} className="px-5 py-3 font-semibold">{v.type}</td>
                ))}
              </tr>
              <tr>
                <th className="px-5 py-3 font-medium text-slate-500">Passengers</th>
                {confirmedVehicles.map((v) => (
                  <td key={v.id} className="px-5 py-3 font-semibold tabular-nums">{v.seats} + driver</td>
                ))}
              </tr>
              <tr>
                <th className="px-5 py-3 font-medium text-slate-500">Luggage</th>
                {confirmedVehicles.map((v) => (
                  <td key={v.id} className="px-5 py-3 font-semibold tabular-nums">{v.luggage} bags</td>
                ))}
              </tr>
              {rateRows().map((row, i) => (
                <tr key={row.label}>
                  <th className="px-5 py-3 font-medium text-slate-500">{row.label}</th>
                  {confirmedVehicles.map((v) => (
                    <td key={v.id} className="px-5 py-3 font-extrabold tabular-nums">{rateRows(v.rates)[i].value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}

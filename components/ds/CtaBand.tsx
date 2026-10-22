/**
 * CtaBand.tsx — design.md §3.6 dark CTA band.
 */

import { ArrowRight, Phone } from 'lucide-react';
import WhatsAppIcon from '@/components/ds/WhatsAppIcon';
import BookButton from '@/components/home/BookButton';
import type { HomeService } from '@/components/home/scrollToBook';
import { siteConfig } from '@/lib/siteConfig';

export default function CtaBand({
  title = 'Ready when you are — day or night.',
  subtitle,
  service,
  whatsappUrl = siteConfig.contact.phone.whatsappUrl,
}: {
  title?: string;
  subtitle?: React.ReactNode;
  service?: HomeService;
  whatsappUrl?: string;
}) {
  return (
    <section className="section pb-12 sm:pb-20">
      <div className="relative overflow-hidden rounded-4xl bg-ink p-8 text-white shadow-float-lg sm:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-60 w-60 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
            <p className="mt-2 text-slate-300">{subtitle ?? <>&ldquo;{siteConfig.brand.closingLine}&rdquo;</>}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row md:grid md:w-[23rem] md:shrink-0 md:grid-cols-2 md:gap-3">
            <BookButton service={service} className="btn group whitespace-nowrap bg-white text-ink hover:-translate-y-0.5 md:col-span-2 md:h-14 md:text-base md:shadow-[0_12px_30px_-12px_rgba(255,255,255,0.45)]">
              Get instant fare
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </BookButton>
            <a href={siteConfig.contact.phone.tel} className="btn whitespace-nowrap border border-white/25 bg-white/10 text-white hover:bg-white/15 md:h-12">
              <Phone className="h-4 w-4" /> Call 24/7
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp whitespace-nowrap md:h-12">
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

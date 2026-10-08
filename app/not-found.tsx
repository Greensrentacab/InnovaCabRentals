import Link from 'next/link';
import { ArrowRight, Car, MessageCircle, Phone } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: `Page Not Found | ${siteConfig.brand.name}`,
  robots: 'noindex, nofollow',
};

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 pb-20 pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-slate [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,#000_30%,transparent_70%)]" />
        <div className="absolute -top-40 left-1/2 h-[480px] w-[860px] -translate-x-1/2 rounded-full bg-brand-400/20 blur-[120px]" />
      </div>

      <div className="card-float relative w-full max-w-lg animate-fade-up p-8 text-center shadow-float-lg sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <Car className="h-7 w-7" />
        </span>
        <span className="eyebrow mt-5">Error 404</span>
        <h1 className="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">This page isn&apos;t available</h1>
        <p className="mt-3 text-slate-600">
          The page you&apos;re looking for has moved or isn&apos;t live yet. Our fleet and dispatch desk are still a tap away.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/" className="btn-primary group">
            Back to Home
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/vehicles" className="btn-ghost">
            View our fleet
          </Link>
        </div>
        <div className="mt-3 flex flex-col justify-center gap-2 sm:flex-row">
          <a href={siteConfig.contact.phone.tel} className="btn-ghost">
            <Phone className="h-4 w-4" /> Call {siteConfig.contact.phone.display}
          </a>
          <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

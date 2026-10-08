import Link from 'next/link';
import { ArrowRight, Clock, MessageCircle, Phone } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: 'Coming Soon | Innova Cabs Bangalore',
  robots: 'noindex, nofollow',
};

export default function ComingSoonPage() {
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 pb-20 pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-slate [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,#000_30%,transparent_70%)]" />
        <div className="absolute -top-40 left-1/2 h-[480px] w-[860px] -translate-x-1/2 rounded-full bg-brand-400/20 blur-[120px]" />
      </div>

      <div className="card-float relative w-full max-w-lg animate-fade-up p-8 text-center shadow-float-lg sm:p-10">
        <span className="eyebrow">
          <Clock className="h-3.5 w-3.5" /> In Progress
        </span>
        <h1 className="text-balance mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">This page is being built</h1>
        <p className="mt-3 text-slate-600">
          We&apos;re still putting this section together. Check back soon, or reach out and we&apos;ll let you know exactly
          when it&apos;s ready.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/" className="btn-primary group">
            Back to Home
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a href={siteConfig.contact.phone.tel} className="btn-ghost">
            <Phone className="h-4 w-4" /> Call Us
          </a>
          <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

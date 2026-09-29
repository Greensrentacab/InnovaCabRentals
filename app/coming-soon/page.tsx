import Link from 'next/link';
import { Phone, MessageCircle, Clock } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: 'Coming Soon | Innova Cabs Bangalore',
  robots: 'noindex, nofollow',
};

export default function ComingSoonPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-brand-offwhite">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-orange-light text-brand-orange text-xs font-semibold border border-brand-orange/20">
          <Clock className="w-3.5 h-3.5" />
          <span>In Progress</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-navy">
          This page is being built
        </h1>

        <p className="text-base text-gray-600 leading-relaxed">
          We&apos;re still putting this section together. Check back soon, or reach out and
          we&apos;ll let you know exactly when it&apos;s ready.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white text-sm font-semibold transition-colors"
          >
            Back to Home
          </Link>
          <a
            href={siteConfig.contact.phone.tel}
            className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 hover:border-brand-navy/30 text-brand-navy text-sm font-semibold transition-colors"
          >
            <Phone className="w-4 h-4 text-brand-orange" />
            <span>Call Us</span>
          </a>
          <a
            href={siteConfig.contact.phone.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

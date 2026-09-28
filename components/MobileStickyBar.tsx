'use client';

import Link from 'next/link';
import { Phone, MessageCircle, CalendarCheck } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

export default function MobileStickyBar() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-navy/95 backdrop-blur-md border-t border-white/15 px-3 py-2 shadow-2xl">
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {/* Call CTA */}
        <a
          href={siteConfig.contact.phone.tel}
          className="min-h-[44px] flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-lg p-1.5 transition-all border border-white/10"
          aria-label="Call Now"
        >
          <Phone className="w-5 h-5 text-brand-orange" />
          <span className="text-[11px] font-bold mt-0.5 tracking-tight">Call</span>
        </a>

        {/* WhatsApp CTA */}
        <a
          href={siteConfig.contact.phone.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] flex flex-col items-center justify-center bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg p-1.5 transition-all shadow-md"
          aria-label="WhatsApp Us"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[11px] font-bold mt-0.5 tracking-tight">WhatsApp</span>
        </a>

        {/* Book Now CTA */}
        <Link
          href="/contact"
          className="min-h-[44px] flex flex-col items-center justify-center bg-brand-orange hover:bg-brand-orange-hover active:scale-95 text-white rounded-lg p-1.5 transition-all shadow-md"
          aria-label="Book Now"
        >
          <CalendarCheck className="w-5 h-5" />
          <span className="text-[11px] font-bold mt-0.5 tracking-tight">Book Now</span>
        </Link>
      </div>
    </div>
  );
}

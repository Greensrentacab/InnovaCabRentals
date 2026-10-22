'use client';

/**
 * HomeDock.tsx — mobile/tablet quick-action dock + desktop WhatsApp FAB
 * (design.md §3.5). The dock stays fixed at the bottom on phones/tablets at
 * all times except while the 4-step booking request is open (pop-ups keep
 * clear of it with bottom padding). Book Now opens the booking request when
 * the page's booking form already has pickup + drop, else scrolls to it.
 */

import { Phone, ReceiptText } from 'lucide-react';
import WhatsAppIcon from '@/components/ds/WhatsAppIcon';
import { siteConfig } from '@/lib/siteConfig';
import { cn } from '@/lib/cn';
import { useBookingFlow } from '@/context/BookingFlowContext';
import { BOOK_SUBMIT_EVENT, scrollToBook, scrollToId } from '@/components/home/scrollToBook';

const itemClass =
  'flex flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] font-bold text-slate-600 transition active:scale-95';

export default function HomeDock() {
  const { state } = useBookingFlow();
  // Always on screen except during the 4-step booking request
  const dockVisible = !state.isOpen;

  return (
    <div className="ds-scope">
      <nav
        aria-label="Quick actions"
        aria-hidden={!dockVisible}
        className={cn(
          'pb-safe fixed inset-x-0 bottom-0 z-[110] px-3 transition-all duration-500 ease-premium lg:hidden',
          dockVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-[120px] opacity-0'
        )}
      >
        <div className="glass-strong mx-auto flex max-w-lg items-center gap-1 rounded-[28px] p-1.5 shadow-float-lg">
          <a href={siteConfig.contact.phone.tel} className={itemClass} tabIndex={dockVisible ? 0 : -1}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <Phone className="h-4 w-4" />
            </span>
            Call
          </a>
          <a
            href={siteConfig.contact.phone.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={itemClass}
            tabIndex={dockVisible ? 0 : -1}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-whatsapp/15 text-[#128C4A]">
              <WhatsAppIcon className="h-4 w-4" />
            </span>
            WhatsApp
          </a>
          <button type="button" onClick={() => scrollToId('fleet') || (window.location.href = '/vehicles#compare')} className={itemClass} tabIndex={dockVisible ? 0 : -1}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <ReceiptText className="h-4 w-4" />
            </span>
            Rates
          </button>
          <button
            type="button"
            onClick={() => {
              // Trip already filled in on this page → open the 4-step booking request; otherwise go to the form
              const detail = { handled: false };
              window.dispatchEvent(new CustomEvent(BOOK_SUBMIT_EVENT, { detail }));
              if (!detail.handled) scrollToBook();
            }}
            className="btn-primary ml-auto flex-1 rounded-[22px] py-3.5 text-sm"
            tabIndex={dockVisible ? 0 : -1}
          >
            Book Now
          </button>
        </div>
      </nav>

      {/* Persistent WhatsApp floating button (desktop) */}
      {!state.isOpen && (
        <a
          href={siteConfig.contact.phone.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-float-lg transition hover:-translate-y-0.5 hover:brightness-95 lg:flex"
        >
          <WhatsAppIcon className="h-6 w-6" />
        </a>
      )}
    </div>
  );
}

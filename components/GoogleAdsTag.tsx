'use client';

/**
 * GoogleAdsTag.tsx
 *
 * Loads the Google Ads tag on customer pages (not /admin) and reports the
 * Call, WhatsApp and Book Now clicks site-wide with one delegated listener,
 * so individual links need no wiring. Booking submissions are reported from
 * the forms' success handlers via trackConversion().
 */

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { GOOGLE_ADS_ID, trackConversion } from '@/lib/gtag';

const BOOK_CTA = /^\s*book (now|a cab)\s*$/i;

export default function GoogleAdsTag() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    if (isAdminRoute) return;

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest('a, button');
      if (!el) return;

      const href = el.getAttribute('href') || '';
      if (href.startsWith('tel:')) return trackConversion('call_click');
      if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i.test(href)) {
        return trackConversion('whatsapp_click');
      }
      if (BOOK_CTA.test(el.getAttribute('aria-label') || el.textContent || '')) {
        trackConversion('booking_click');
      }
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [isAdminRoute]);

  if (isAdminRoute) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} strategy="afterInteractive" />
      <Script id="google-ads-tag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`}
      </Script>
    </>
  );
}

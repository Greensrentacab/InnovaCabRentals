/**
 * Google Ads tag helpers. The tag itself is loaded by components/GoogleAdsTag.tsx;
 * conversions in Google Ads are matched by these event names (Goals → Conversions).
 */
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17531271967';

export type ConversionEvent =
  | 'call_click'
  | 'whatsapp_click'
  | 'booking_click'
  | 'submit_booking_request';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackConversion(event: ConversionEvent) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', event);
}

/**
 * Google Ads tag helpers. The tag itself is loaded by components/GoogleAdsTag.tsx;
 * each conversion below reports to its own label from Google Ads (Goals → Conversions).
 */
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17531271967';

export type ConversionEvent =
  | 'call_click'
  | 'whatsapp_click'
  | 'booking_click'
  | 'submit_booking_request';

const CONVERSION_LABELS: Record<ConversionEvent, string> = {
  call_click: 'hxTRCMq0oK4dEJ_2x6dB',
  whatsapp_click: 'R5SJCMe0oK4dEJ_2x6dB',
  booking_click: 'RieNCM20oK4dEJ_2x6dB',
  submit_booking_request: 'qANMCL7AnK4dEJ_2x6dB',
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackConversion(event: ConversionEvent) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'conversion', { send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABELS[event]}` });
}

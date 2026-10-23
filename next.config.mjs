import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/**
 * `next dev` writes to .next-dev and `next build` to .next, so a production
 * build (e.g. from an IDE) can run while the dev server is up without the two
 * overwriting each other's chunks ("Cannot find module './1234.js'").
 * NEXT_DIST_DIR still overrides both. Vercel builds use the default .next.
 * @param {string} phase
 * @returns {import('next').NextConfig}
 */
/**
 * Service pages moved to descriptive, Bangalore-prefixed URLs, and the
 * company pages to their full names. The old paths redirect permanently so
 * existing links, bookmarks and search listings keep working (a #fragment on
 * an old link is kept by the browser across the redirect).
 * `permanent: true` answers 308; the company pages use an explicit 301.
 */
export const legacyRedirects = [
  { source: '/airport-taxi', destination: '/bangalore-airport-taxi', permanent: true },
  { source: '/outstation-cabs', destination: '/bangalore-outstation-cab-service', permanent: true },
  { source: '/local-rides', destination: '/bangalore-local-city-taxi', permanent: true },
  { source: '/tour-packages', destination: '/bangalore-tour-packages', permanent: true },
  { source: '/about', destination: '/about-us', statusCode: 301 },
  { source: '/faq', destination: '/frequently-asked-questions', statusCode: 301 },
  { source: '/terms', destination: '/terms-and-conditions', statusCode: 301 },
  { source: '/contact', destination: '/contact-and-booking', statusCode: 301 },
];

export default function nextConfig(phase) {
  const distDir = process.env.NEXT_DIST_DIR || (phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next');
  return {
    reactStrictMode: true,
    distDir,
    async redirects() {
      return legacyRedirects;
    },
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            // Other sites can't show these pages in a frame (clickjacking)
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            // Location only for "Use my current location" on this site
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=()' },
          ],
        },
      ];
    },
  };
}

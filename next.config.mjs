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
 * Service pages moved to descriptive, Bangalore-prefixed URLs. The old paths
 * redirect permanently so existing links, bookmarks and search listings keep
 * working (a #fragment on an old link is kept by the browser across the redirect).
 */
export const legacyRedirects = [
  { source: '/airport-taxi', destination: '/bangalore-airport-taxi', permanent: true },
  { source: '/outstation-cabs', destination: '/bangalore-outstation-cab-service', permanent: true },
  { source: '/local-rides', destination: '/bangalore-local-city-taxi', permanent: true },
  { source: '/tour-packages', destination: '/bangalore-tour-packages', permanent: true },
];

export default function nextConfig(phase) {
  const distDir = process.env.NEXT_DIST_DIR || (phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next');
  return {
    reactStrictMode: true,
    distDir,
    async redirects() {
      return legacyRedirects;
    },
  };
}

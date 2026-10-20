import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/**
 * `next dev` writes to .next-dev and `next build` to .next, so a production
 * build (e.g. from an IDE) can run while the dev server is up without the two
 * overwriting each other's chunks ("Cannot find module './1234.js'").
 * NEXT_DIST_DIR still overrides both. Vercel builds use the default .next.
 * @param {string} phase
 * @returns {import('next').NextConfig}
 */
export default function nextConfig(phase) {
  const distDir = process.env.NEXT_DIST_DIR || (phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next');
  return {
    reactStrictMode: true,
    distDir,
  };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optional local override (e.g. test a production build while `npm run dev`
  // is using .next). Vercel ignores this because NEXT_DIST_DIR is never set there.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
};

export default nextConfig;

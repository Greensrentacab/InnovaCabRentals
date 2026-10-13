/**
 * siteUrl.ts — absolute origin of the live site (canonical URLs, sitemap,
 * structured data). Set NEXT_PUBLIC_SITE_URL to the custom domain in production.
 */

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000')
).replace(/\/$/, '');

export const absoluteUrl = (path = '/') => `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;

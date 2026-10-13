import type { MetadataRoute } from 'next';
import { absoluteUrl, siteUrl } from '@/lib/siteUrl';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/booking/', '/coming-soon'] }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteUrl,
  };
}

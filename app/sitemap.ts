import type { MetadataRoute } from 'next';
import { getRoutes, getVehicles } from '@/lib/dataService';
import { getLiveDestinations } from '@/lib/destinationStore';
import { absoluteUrl } from '@/lib/siteUrl';

const STATIC_PAGES: { path: string; priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/bangalore-airport-taxi', priority: 0.9 },
  { path: '/bangalore-outstation-cab-service', priority: 0.9 },
  { path: '/bangalore-local-city-taxi', priority: 0.9 },
  { path: '/bangalore-round-trip-cab-rental', priority: 0.8 },
  { path: '/bangalore-hourly-cab-rental', priority: 0.8 },
  { path: '/vehicles', priority: 0.8 },
  { path: '/routes', priority: 0.8 },
  { path: '/bangalore-tour-packages', priority: 0.7 },
  { path: '/about-us', priority: 0.5 },
  { path: '/frequently-asked-questions', priority: 0.5 },
  { path: '/contact-and-booking', priority: 0.6 },
  { path: '/terms-and-conditions', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [vehicles, routes, destinations] = await Promise.all([getVehicles(), getRoutes(), getLiveDestinations()]);
  const routeSlugs = new Set(routes.map((r) => r.slug));
  const lastModified = new Date();

  return [
    ...STATIC_PAGES.map(({ path, priority }) => ({ url: absoluteUrl(path), lastModified, priority })),
    ...vehicles
      .filter((v) => v.confirmed !== false)
      .map((v) => ({ url: absoluteUrl(`/${v.id}-rental-bangalore`), lastModified, priority: 0.8 })),
    ...routes.map((r) => ({ url: absoluteUrl(`/routes/${r.slug}`), lastModified, priority: 0.6 })),
    // Admin → Footer destinations (a route with the same address wins, so skip those)
    ...destinations
      .filter((d) => !routeSlugs.has(d.content.slug))
      .map((d) => ({ url: absoluteUrl(`/routes/${d.content.slug}`), lastModified, priority: 0.6 })),
  ];
}

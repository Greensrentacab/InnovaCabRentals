import type { MetadataRoute } from 'next';
import { getRoutes, getVehicles } from '@/lib/dataService';
import { absoluteUrl } from '@/lib/siteUrl';

const STATIC_PAGES: { path: string; priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/airport-taxi', priority: 0.9 },
  { path: '/outstation-cabs', priority: 0.9 },
  { path: '/local-rides', priority: 0.9 },
  { path: '/vehicles', priority: 0.8 },
  { path: '/routes', priority: 0.8 },
  { path: '/tour-packages', priority: 0.7 },
  { path: '/about', priority: 0.5 },
  { path: '/faq', priority: 0.5 },
  { path: '/contact', priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [vehicles, routes] = await Promise.all([getVehicles(), getRoutes()]);
  const lastModified = new Date();

  return [
    ...STATIC_PAGES.map(({ path, priority }) => ({ url: absoluteUrl(path), lastModified, priority })),
    ...vehicles
      .filter((v) => v.confirmed !== false)
      .map((v) => ({ url: absoluteUrl(`/${v.id}-rental-bangalore`), lastModified, priority: 0.8 })),
    ...routes.map((r) => ({ url: absoluteUrl(`/routes/${r.slug}`), lastModified, priority: 0.6 })),
  ];
}

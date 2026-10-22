/**
 * footerColumns.ts — the three "Popular routes from Bangalore" footer columns
 * and their built-in route links.
 *
 * The built-in links are fixed (every catalogue route exactly once). Admin →
 * Footer destinations adds published destination links after them, in the
 * column the admin picks by `id`. Shared by the footer (client bundle) and the
 * admin, so keep it free of heavy imports.
 */

import { catalogRoutes } from '@/lib/routeCatalog';

export const FOOTER_COLUMN_IDS = ['hill-stations', 'karnataka', 'south-india'] as const;
export type FooterColumnId = (typeof FOOTER_COLUMN_IDS)[number];

export interface FooterLink {
  label: string;
  href: string;
}

const COLUMNS: { id: FooterColumnId; title: string; slugs: string[] }[] = [
  {
    id: 'hill-stations',
    title: 'Popular Hill Stations & Weekend Trips',
    slugs: ['coorg', 'ooty', 'mysore', 'wayanad', 'kodaikanal', 'chikmagalur', 'pondicherry', 'nandi-hills', 'yercaud', 'munnar', 'bandipur-kabini', 'adiyogi-chikkaballapur'],
  },
  {
    id: 'karnataka',
    title: 'Karnataka Destinations',
    slugs: ['gokarna', 'hampi', 'dandeli', 'udupi', 'murudeshwar', 'kukke-subramanya', 'dharmasthala', 'shivanasamudra', 'srirangapatna', 'sringeri', 'horanadu'],
  },
  {
    id: 'south-india',
    title: 'South India Pilgrimage & Long Trips',
    slugs: ['tirupati', 'guruvayur', 'kochi', 'mangalore', 'rameshwaram', 'alleppey', 'srirangam', 'kanyakumari', 'srikalahasti', 'mantralayam'],
  },
];

export const FOOTER_COLUMN_TITLE = Object.fromEntries(COLUMNS.map((c) => [c.id, c.title])) as Record<FooterColumnId, string>;

const routeBySlug = new Map(catalogRoutes.map((r) => [r.slug, r]));
const groupedSlugs = new Set(COLUMNS.flatMap((c) => c.slugs.map((s) => `bangalore-to-${s}`)));

/** Built-in route links per column, in display order. */
export const BUILT_IN_FOOTER_COLUMNS: { id: FooterColumnId; title: string; links: FooterLink[] }[] = (() => {
  const columns = COLUMNS.map((c) => ({
    id: c.id,
    title: c.title,
    links: c.slugs
      .map((s) => routeBySlug.get(`bangalore-to-${s}`))
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      .map((r) => ({ label: r.name, href: `/routes/${r.slug}` })),
  }));

  // Any route added to the catalogue later still appears, in whichever column is
  // shortest at that point, so the three columns stay balanced as routes grow
  for (const r of catalogRoutes) {
    if (r.category === 'airport' || groupedSlugs.has(r.slug)) continue;
    const shortest = columns.reduce((a, b) => (b.links.length < a.links.length ? b : a));
    shortest.links.push({ label: r.name, href: `/routes/${r.slug}` });
  }
  return columns;
})();

/** An admin-added destination link (published and set to show in the footer). */
export interface FooterDestinationLink extends FooterLink {
  column: FooterColumnId;
}

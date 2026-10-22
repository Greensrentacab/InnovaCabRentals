/**
 * SimpleHero.tsx — plain text-only page header: solid navy band with just the
 * heading and a short description (no picture, breadcrumb, label or icons).
 * Breadcrumb structured data is still emitted for SEO.
 */

import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import type { Crumb } from '@/components/ds/PageHero';

export default function SimpleHero({
  title,
  lead,
  breadcrumbs,
}: {
  title: React.ReactNode;
  lead?: React.ReactNode;
  breadcrumbs: Crumb[];
}) {
  return (
    <section className="ds-scope bg-ink pb-10 pt-28 text-white sm:pb-14 sm:pt-36">
      <BreadcrumbJsonLd items={breadcrumbs} />
      <div className="section">
        <h1 className="text-balance text-[2rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl">{title}</h1>
        {lead && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:mt-4 sm:text-lg">{lead}</p>}
      </div>
    </section>
  );
}

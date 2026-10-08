/**
 * PageHero.tsx — design.md §3.6 "Inner page hero": grid texture + ambient blue
 * glow, breadcrumb, eyebrow with dot, inner-page H1 and lead. Pass `aside`
 * for the two-column layout (§2.3 "Inner hero with aside").
 *
 * The section is not overflow-hidden (decor is clipped in its own layer) so
 * pop-ups inside `aside` — e.g. the booking widget calendar — can extend past it.
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface Crumb {
  label: string;
  href?: string;
}

interface PageHeroProps {
  breadcrumbs: Crumb[];
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}

export default function PageHero({ breadcrumbs, eyebrow, title, lead, children, aside, className }: PageHeroProps) {
  const copy = (
    <div className={cn(aside ? 'lg:pt-6' : 'max-w-3xl')}>
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-brand-700">
          Home
        </Link>
        {breadcrumbs.map((crumb, i) => (
          <span key={`${crumb.label}-${i}`} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            {crumb.href && i < breadcrumbs.length - 1 ? (
              <Link href={crumb.href} className="hover:text-brand-700">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-slate-700" aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}>
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <span className="eyebrow animate-fade-up">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
        {eyebrow}
      </span>

      <h1 className="text-balance mt-5 animate-fade-up text-[2.2rem] font-extrabold leading-[1.06] tracking-tight text-ink [animation-delay:80ms] sm:text-5xl">
        {title}
      </h1>

      {lead && (
        <div className="mt-5 max-w-xl animate-fade-up text-base leading-relaxed text-slate-600 [animation-delay:160ms] sm:text-lg">
          {lead}
        </div>
      )}

      {children && <div className="animate-fade-up [animation-delay:240ms]">{children}</div>}
    </div>
  );

  return (
    <section className={cn('relative isolate z-10 pb-12 pt-28 sm:pt-32', className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-slate [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,#000_30%,transparent_70%)]" />
        <div className="absolute -top-40 left-1/2 h-[480px] w-[860px] -translate-x-1/2 rounded-full bg-brand-400/20 blur-[120px]" />
      </div>

      {aside ? (
        <div className="section grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
          {copy}
          <div className="min-w-0">{aside}</div>
        </div>
      ) : (
        <div className="section">{copy}</div>
      )}
    </section>
  );
}

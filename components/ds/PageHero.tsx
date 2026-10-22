/**
 * PageHero.tsx — inner page hero with the same banner as the homepage: full-bleed
 * picture with a navy wash, white heading ("Bangalore" in sky blue), lead and
 * four blue round highlights. Pass `aside` for the two-column layout (form or
 * stats card on the right on desktop, below the banner on phones).
 *
 * The section is not overflow-hidden (the picture is clipped in its own layer) so
 * pop-ups inside `aside` — e.g. the booking widget calendar — can extend past it.
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { HeroCover, HeroFeatures, HeroHeading, type HeroFeatureSet } from '@/components/home/HeroScene';
import type { HomeService } from '@/components/home/scrollToBook';
import { getSiteImages } from '@/lib/siteContentStore';

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
  /** Banner picture (homepage scenes); defaults to the airport scene */
  scene?: HomeService;
  /** Highlight icons; defaults to the general set */
  features?: HeroFeatureSet;
}

export default async function PageHero({
  breadcrumbs,
  eyebrow,
  title,
  lead,
  children,
  aside,
  className,
  scene = 'airport',
  features = 'general',
}: PageHeroProps) {
  const images = await getSiteImages();

  return (
    <section className={cn('ds-scope relative isolate z-10 pb-8 pt-0 lg:pb-14 lg:pt-28', className)}>
      {/* Desktop: full-bleed picture with a dark wash, same look as the homepage */}
      <HeroCover desktop scene={scene} images={images.hero} className="-z-10 hidden lg:block" />

      <div
        className={cn(
          'section grid w-full items-start gap-6 sm:gap-10',
          Boolean(aside) && 'lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:items-center lg:gap-12'
        )}
      >
        <div className="relative min-w-0 lg:pt-4">
          {/* Phones/tablets: picture runs edge to edge from the top with the copy on it */}
          <div className="relative -mx-4 px-4 pb-10 pt-[6rem] sm:-mx-6 sm:px-6 sm:pt-28 lg:mx-0 lg:p-0 lg:pb-6">
            <HeroCover scene={scene} images={images.hero} className="lg:hidden" />
            <div className="relative max-w-3xl [text-shadow:0_1px_3px_rgba(0,0,0,0.65),0_2px_18px_rgba(0,0,0,0.5)]">
              <BreadcrumbJsonLd items={breadcrumbs} />
              <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs font-semibold text-white/80 [text-shadow:none]">
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
                {breadcrumbs.map((crumb, i) => (
                  <span key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" />
                    {crumb.href && i < breadcrumbs.length - 1 ? (
                      <Link href={crumb.href} className="hover:text-white">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-white" aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}>
                        {crumb.label}
                      </span>
                    )}
                  </span>
                ))}
              </nav>

              <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white shadow-sm backdrop-blur-md [text-shadow:none] max-sm:hidden">
                <span className="h-2 w-2 rounded-full bg-sky-300" />
                {eyebrow}
              </span>

              <h1 className="text-balance mt-0 animate-fade-up text-[2.15rem] font-extrabold leading-[1.02] tracking-tight text-white [animation-delay:80ms] sm:mt-6 sm:text-5xl lg:text-[3.25rem]">
                {typeof title === 'string' ? <HeroHeading text={title} /> : title}
              </h1>

              <span className="mt-3 block h-1 w-12 rounded-full bg-sky-300 lg:hidden" aria-hidden="true" />
              {lead && (
                <div className="mt-3 max-w-xl animate-fade-up text-[12.5px] font-medium leading-snug text-white/85 [animation-delay:160ms] sm:mt-5 sm:text-base [&_.text-brand-700]:text-[14px] [&_.text-brand-700]:font-semibold [&_.text-brand-700]:text-white sm:[&_.text-brand-700]:text-xl [&_p+p]:mt-1.5">
                  {lead}
                </div>
              )}

              <HeroFeatures set={features} className="mt-5 max-w-2xl [text-shadow:0_1px_3px_rgba(0,0,0,0.7)] lg:mt-8" />

              {children && <div className="animate-fade-up [text-shadow:none] [animation-delay:240ms]">{children}</div>}
            </div>
          </div>
        </div>

        {aside && <div className="relative z-10 min-w-0 lg:pt-4">{aside}</div>}
      </div>
    </section>
  );
}

/**
 * DestinationView.tsx — a destination page from Admin → Footer destinations,
 * in one of three templates:
 *   simple  large photo hero, a reading column of paragraphs, photo gallery
 *   split   light hero with the introduction, sections with the photo beside
 *           the text (alternating sides)
 *   travel  photo hero, introduction card, sections as cards (details,
 *           attractions, travel information…) with an "On this page" index
 *
 * Rendered by /routes/[slug] and by the admin preview (same markup, so the
 * preview is exactly what customers see). No server-only imports.
 */

import Link from 'next/link';
import { Check, ChevronRight, Compass, Landmark, Lightbulb, MapPin, Route as RouteIcon } from 'lucide-react';
import { HeroHeading } from '@/components/home/HeroScene';
import { cn } from '@/lib/cn';
import { cloudinaryUrl } from '@/lib/siteImages';
import { placeName, textBlocks, type DestinationContent, type DestinationImage } from '@/lib/destinations';

interface ViewProps {
  content: DestinationContent;
  /** Cloudinary cloud for photo URLs; null = photos cannot be shown */
  cloudName: string | null;
}

// ─── Building blocks ────────────────────────────────────────────────────────

function Photo({
  img,
  cloudName,
  sizes,
  widths,
  className,
  priority,
}: {
  img: DestinationImage;
  cloudName: string | null;
  sizes: string;
  widths: number[];
  className?: string;
  priority?: boolean;
}) {
  if (!cloudName) return null;
  const ws = Array.from(new Set(widths.map((w) => Math.min(w, img.width)))).sort((a, b) => a - b);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cloudinaryUrl(cloudName, img, ws[Math.min(1, ws.length - 1)])}
      srcSet={ws.length > 1 ? ws.map((w) => `${cloudinaryUrl(cloudName, img, w)} ${w}w`).join(', ') : undefined}
      sizes={sizes}
      alt={img.alt}
      width={img.width}
      height={img.height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
    />
  );
}

/** Paragraphs (line breaks kept) and "- " bullet lists. */
function Prose({ text, lead, className, tone = 'light' }: { text: string; lead?: boolean; className?: string; tone?: 'light' | 'dark' }) {
  const blocks = textBlocks(text);
  if (!blocks.length) return null;
  return (
    <div className={cn('space-y-4', className)}>
      {blocks.map((b, i) =>
        b.type === 'paragraph' ? (
          <p
            key={i}
            className={cn(
              'leading-relaxed',
              tone === 'dark' ? 'text-white/85' : 'text-slate-600',
              lead && i === 0 ? cn('text-lg font-medium sm:text-xl', tone === 'dark' ? 'text-white' : 'text-slate-700') : 'text-[15px] sm:text-base'
            )}
          >
            {b.lines.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {l}
              </span>
            ))}
          </p>
        ) : (
          <ul key={i} className="grid gap-2.5">
            {b.items.map((item, j) => (
              <li key={j} className="flex items-start gap-3 text-[15px] font-medium leading-relaxed text-slate-700 sm:text-base">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-live-500/10 text-live-600">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

function Breadcrumbs({ label, tone }: { label: string; tone: 'light' | 'dark' }) {
  const link = tone === 'dark' ? 'hover:text-white' : 'hover:text-brand-700';
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('mb-4 flex flex-wrap items-center gap-1 text-xs font-semibold', tone === 'dark' ? 'text-white/80' : 'text-slate-500')}
    >
      <Link href="/" className={link}>
        Home
      </Link>
      <ChevronRight className="h-3 w-3" />
      <Link href="/routes" className={link}>
        Outstation Routes
      </Link>
      <ChevronRight className="h-3 w-3" />
      <span aria-current="page" className={cn('min-w-0 [overflow-wrap:anywhere]', tone === 'dark' ? 'text-white' : 'text-ink')}>
        {label}
      </span>
    </nav>
  );
}

/** Dark hero: the destination photo with a navy wash (or a dark brand band without one), white heading. */
function PhotoHero({ content, cloudName, tall, overlapped }: ViewProps & { tall?: boolean; /** A card overlaps the bottom edge */ overlapped?: boolean }) {
  const img = content.heroImage;
  const hasPhoto = Boolean(img && cloudName);
  return (
    <section className="ds-scope relative isolate overflow-hidden bg-ink">
      {hasPhoto ? (
        <>
          <Photo
            img={img!}
            cloudName={cloudName}
            sizes="100vw"
            widths={[828, 1280, 1920, 2560]}
            priority
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/55" />
        </>
      ) : (
        <>
          <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-brand-600/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-10 -z-10 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
        </>
      )}
      <div
        className={cn(
          'section flex flex-col justify-end pt-[6.5rem] sm:pt-32',
          overlapped ? 'pb-16 sm:pb-24' : 'pb-10 sm:pb-14',
          hasPhoto ? (tall ? 'min-h-[min(80svh,760px)]' : 'min-h-[min(64svh,600px)]') : 'min-h-[300px] sm:min-h-[360px]'
        )}
      >
        <div className="max-w-3xl [text-shadow:0_1px_3px_rgba(0,0,0,0.6),0_2px_18px_rgba(0,0,0,0.45)]">
          <Breadcrumbs label={content.heading || content.linkText} tone="dark" />
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md [text-shadow:none]">
            <span className="h-2 w-2 rounded-full bg-sky-300" /> Chauffeur-driven trip from Bangalore
          </span>
          <h1 className="text-balance mt-4 text-[2.15rem] font-extrabold leading-[1.04] tracking-tight text-white [overflow-wrap:anywhere] sm:text-5xl lg:text-[3.5rem]">
            <HeroHeading text={content.heading || 'Page heading'} />
          </h1>
          <span className="mt-4 block h-1 w-12 rounded-full bg-sky-300" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

const SECTION_ICONS: [RegExp, typeof MapPin][] = [
  [/attraction|places|see|visit|sightseeing|temple/i, Landmark],
  [/travel|reach|route|road|how to|getting|distance|drive/i, RouteIcon],
  [/good to know|tip|note|know|advice|best time/i, Lightbulb],
  [/about|overview|detail/i, MapPin],
];
const sectionIcon = (heading: string) => SECTION_ICONS.find(([re]) => re.test(heading))?.[1] ?? Compass;

// ─── Templates ──────────────────────────────────────────────────────────────

function SimplePage({ content, cloudName }: ViewProps) {
  const gallery = cloudName ? content.gallery : [];
  return (
    <>
      <PhotoHero content={content} cloudName={cloudName} tall />
      <section className="section py-12 sm:py-20">
        <article className="mx-auto max-w-3xl">
          <Prose text={content.intro} lead />
          {content.sections.map((s) => (
            <div key={s.id} className="mt-10 sm:mt-12">
              {s.heading && <h2 className="text-balance text-2xl tracking-tight [overflow-wrap:anywhere] sm:text-3xl">{s.heading}</h2>}
              <Prose text={s.body} className={s.heading ? 'mt-4' : undefined} />
            </div>
          ))}
        </article>
      </section>

      {gallery.length > 0 && (
        <section className="relative bg-white py-12 sm:py-20">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <div className="section">
            <span className="eyebrow">Photos</span>
            <h2 className="section-title mt-4">More of {placeName(content.linkText || content.heading)}</h2>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {gallery.map((img, i) => (
                <figure
                  key={img.publicId}
                  className={cn('group relative overflow-hidden rounded-2xl bg-slate-200 shadow-float', i === 0 && gallery.length > 2 && 'col-span-2 row-span-2')}
                >
                  <Photo
                    img={img}
                    cloudName={cloudName}
                    sizes={i === 0 ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 1024px) 33vw, 50vw'}
                    widths={[480, 960, 1440]}
                    className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.03]"
                  />
                  {img.alt && (
                    <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-3 pb-2.5 pt-8 text-xs font-semibold text-white sm:text-sm">
                      {img.alt}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function SplitPage({ content, cloudName }: ViewProps) {
  return (
    <>
      <section className="ds-scope relative isolate overflow-hidden bg-gradient-to-b from-brand-50 via-brand-50/40 to-porcelain">
        <div className="pointer-events-none absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="section pb-10 pt-[6.5rem] sm:pb-16 sm:pt-36">
          <div className="max-w-3xl">
            <Breadcrumbs label={content.heading || content.linkText} tone="light" />
            <span className="eyebrow">Chauffeur-driven trip from Bangalore</span>
            <h1 className="text-balance mt-4 text-[2.15rem] font-extrabold leading-[1.04] tracking-tight text-ink [overflow-wrap:anywhere] sm:text-5xl lg:text-[3.5rem] [&_span]:text-brand-600">
              <HeroHeading text={content.heading || 'Page heading'} />
            </h1>
            <Prose text={content.intro} lead className="mt-6" />
          </div>
        </div>
      </section>

      <div className="section space-y-14 py-12 sm:space-y-24 sm:py-20">
        {content.sections.map((s, i) => {
          const img = cloudName ? s.images[0] : undefined;
          return (
            <section key={s.id} className={cn('grid items-center gap-6 sm:gap-10', img && 'lg:grid-cols-2 lg:gap-16')}>
              {img && (
                <div className={cn('relative', i % 2 === 1 && 'lg:order-2')}>
                  <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-100/70 to-transparent sm:-inset-4" />
                  <Photo
                    img={img}
                    cloudName={cloudName}
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    widths={[640, 960, 1440]}
                    className="aspect-[4/3] w-full rounded-3xl object-cover shadow-float-lg"
                  />
                </div>
              )}
              <div className={cn('min-w-0', !img && 'max-w-3xl')}>
                <span className="text-sm font-extrabold tabular-nums text-brand-600">{String(i + 1).padStart(2, '0')}</span>
                {s.heading && <h2 className="text-balance mt-2 text-2xl tracking-tight [overflow-wrap:anywhere] sm:text-[2rem]">{s.heading}</h2>}
                <span className="mt-4 block h-1 w-10 rounded-full bg-brand-600" aria-hidden="true" />
                <Prose text={s.body} className="mt-5" />
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function TravelPage({ content, cloudName }: ViewProps) {
  const sections = content.sections;
  const index = sections.filter((s) => s.heading);
  return (
    <>
      <PhotoHero content={content} cloudName={cloudName} overlapped />

      <section className="section relative z-10 -mt-8 sm:-mt-12">
        <div className="card-float p-6 sm:p-10">
          <Prose text={content.intro} lead />
          {index.length > 1 && (
            <nav aria-label="On this page" className="mt-6 border-t border-slate-100 pt-5 lg:hidden">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">On this page</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {index.map((s) => (
                  <li key={s.id}>
                    <a href={`#section-${s.id}`} className="pill hover:border-brand-300 hover:text-brand-700">
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>

      <section className="section py-10 sm:py-16">
        <div className={cn('grid gap-8', index.length > 1 && 'lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10')}>
          {index.length > 1 && (
            <nav aria-label="On this page" className="hidden lg:block">
              <div className="sticky top-28">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">On this page</p>
                <ol className="mt-4 space-y-1 border-l border-slate-200">
                  {index.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#section-${s.id}`}
                        className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm font-semibold text-slate-600 transition-colors [overflow-wrap:anywhere] hover:border-brand-600 hover:text-brand-700"
                      >
                        {s.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>
          )}

          <div className="min-w-0 space-y-5 sm:space-y-6">
            {sections.map((s) => {
              const Icon = sectionIcon(s.heading);
              const imgs = cloudName ? s.images : [];
              return (
                <section key={s.id} id={`section-${s.id}`} className="card-float scroll-mt-28 p-6 sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h2 className="min-w-0 text-balance text-xl tracking-tight [overflow-wrap:anywhere] sm:text-2xl">{s.heading || 'Section'}</h2>
                  </div>
                  <Prose text={s.body} className="mt-5" />
                  {imgs.length > 0 && (
                    <div className={cn('mt-6 grid gap-3', imgs.length > 1 && 'sm:grid-cols-2')}>
                      {imgs.map((img) => (
                        <figure key={img.publicId} className="overflow-hidden rounded-2xl bg-slate-100">
                          <Photo
                            img={img}
                            cloudName={cloudName}
                            sizes={imgs.length > 1 ? '(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw' : '(min-width: 1024px) 60vw, 100vw'}
                            widths={[480, 960, 1440]}
                            className={cn('w-full object-cover', imgs.length > 1 ? 'aspect-[4/3]' : 'aspect-[16/9]')}
                          />
                          {img.alt && <figcaption className="px-3 py-2 text-xs font-medium text-slate-500">{img.alt}</figcaption>}
                        </figure>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export default function DestinationView({ content, cloudName }: ViewProps) {
  const Template = content.template === 'split' ? SplitPage : content.template === 'travel' ? TravelPage : SimplePage;
  return (
    <div className="bg-porcelain">
      <Template content={content} cloudName={cloudName} />
    </div>
  );
}

/**
 * destinations.ts — Admin → Footer destinations: extra destination links in
 * the footer's route columns, each with its own page at /routes/<slug> built
 * from one of three templates. Stored in Firestore (siteDestinations, see
 * lib/destinationStore.ts) as a working draft plus the published ("live") copy.
 *
 * Shared by the admin editor (client) and the server (validation, storage,
 * pages). Content is plain text only — React escapes it on render, so no HTML
 * can be injected. Body text: an empty line starts a new paragraph, and lines
 * starting with "- " become bullet points.
 */

import { z } from 'zod';
import { IMAGE_RULES, isOwnPublicId, type CloudImage } from '@/lib/siteImages';
import { FOOTER_COLUMN_IDS, type FooterColumnId } from '@/lib/footerColumns';

export const DESTINATION_TEMPLATES = ['simple', 'split', 'travel'] as const;
export type DestinationTemplate = (typeof DESTINATION_TEMPLATES)[number];

export interface TemplateInfo {
  name: string;
  summary: string;
  /** Large photo at the top of the page */
  heroImage: boolean;
  /** Photos per section (0 = text only) */
  sectionImages: number;
  /** Extra photo gallery at the end */
  gallery: boolean;
  /** Each section needs a heading */
  sectionHeading: boolean;
  /** At least one section is needed */
  needsSections: boolean;
  /** Label of the introduction field in the editor */
  introLabel: string;
}

export const TEMPLATE_INFO: Record<DestinationTemplate, TemplateInfo> = {
  simple: {
    name: 'Simple destination page',
    summary: 'A heading, one large photo, a few paragraphs about the place and extra photos.',
    heroImage: true,
    sectionImages: 0,
    gallery: true,
    sectionHeading: false,
    needsSections: false,
    introLabel: 'Description',
  },
  split: {
    name: 'Image and text',
    summary: 'A heading and introduction, then sections with a photo beside the text.',
    heroImage: false,
    sectionImages: 1,
    gallery: false,
    sectionHeading: true,
    needsSections: true,
    introLabel: 'Introduction',
  },
  travel: {
    name: 'Travel information',
    summary: 'An intro photo, then sections for details, attractions, travel tips and more.',
    heroImage: true,
    sectionImages: 4,
    gallery: false,
    sectionHeading: true,
    needsSections: true,
    introLabel: 'Introduction',
  },
};

export const DESTINATION_LIMITS = {
  destinations: 100,
  linkTextChars: 80,
  headingChars: 120,
  slugChars: 80,
  introChars: 3000,
  sections: 12,
  sectionHeadingChars: 120,
  sectionBodyChars: 5000,
  /** Most photos any template shows per section */
  sectionImages: 4,
  galleryImages: 12,
};

/** Smallest photo accepted (keeps pictures sharp on large screens). */
export const DESTINATION_IMAGE_MIN = { w: 800, h: 450 };

export interface DestinationImage extends CloudImage {
  /** Short description (screen readers, Google) */
  alt: string;
}

export interface DestinationSection {
  id: string;
  heading: string;
  body: string;
  images: DestinationImage[];
}

export interface DestinationContent {
  /** Text of the footer link */
  linkText: string;
  /** Page address: /routes/<slug> */
  slug: string;
  column: FooterColumnId;
  /** false = the page is live but not linked from the footer */
  showInFooter: boolean;
  template: DestinationTemplate;
  /** Page heading (H1), independent of the footer link text */
  heading: string;
  intro: string;
  heroImage: DestinationImage | null;
  sections: DestinationSection[];
  gallery: DestinationImage[];
}

export interface DestinationRecord {
  id: string;
  /** Position among the added links of its footer column (ascending) */
  order: number;
  /** Working copy in the admin (may be incomplete) */
  draft: DestinationContent;
  draftSavedAt: string;
  /** What the website shows; null = not published */
  live: DestinationContent | null;
  publishedAt: string | null;
  createdAt: string;
  /** Increments on every content change (stops two admin tabs overwriting each other) */
  version: number;
}

export type DestinationStatus = 'draft' | 'live' | 'changed';

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const newSectionId = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** "Bangalore to Hyderabad" → "bangalore-to-hyderabad" */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, DESTINATION_LIMITS.slugChars)
    .replace(/-+$/g, '');
}

/** "Bangalore to Hyderabad" → "Hyderabad" (for starter section headings). */
export const placeName = (linkText: string) => linkText.replace(/^\s*(bangalore|bengaluru)\s+to\s+/i, '').trim() || linkText.trim();

/** Starter content for a new destination: suggested section headings per template, no text. */
export function newDestinationContent(input: { linkText: string; column: FooterColumnId; template: DestinationTemplate }): DestinationContent {
  const name = input.linkText.trim();
  const place = placeName(name);
  const headings: Record<DestinationTemplate, string[]> = {
    simple: [],
    split: [`Why visit ${place}`, 'Places to see', 'Plan your trip'],
    travel: [`About ${place}`, 'Top attractions', 'Travel information', 'Good to know'],
  };
  return {
    linkText: name,
    slug: slugify(name),
    column: input.column,
    showInFooter: true,
    template: input.template,
    heading: name,
    intro: '',
    heroImage: null,
    sections: headings[input.template].map((heading) => ({ id: newSectionId(), heading, body: '', images: [] })),
    gallery: [],
  };
}

// ─── Validation ─────────────────────────────────────────────────────────────

const L = DESTINATION_LIMITS;

const imageSchema = z.object({
  publicId: z.string().refine(isOwnPublicId),
  version: z.number().int().positive(),
  width: z.number().int().positive().max(20000),
  height: z.number().int().positive().max(20000),
  format: z.enum(IMAGE_RULES.formats),
  bytes: z.number().int().positive().max(IMAGE_RULES.maxBytes),
  alt: z.string().max(IMAGE_RULES.altChars * 2),
});

const contentSchema = z.object({
  linkText: z.string().max(L.linkTextChars * 2),
  slug: z.string().max(L.slugChars * 2),
  column: z.enum(FOOTER_COLUMN_IDS),
  showInFooter: z.boolean(),
  template: z.enum(DESTINATION_TEMPLATES),
  heading: z.string().max(L.headingChars * 2),
  intro: z.string().max(L.introChars * 2),
  heroImage: imageSchema.nullable(),
  sections: z
    .array(
      z.object({
        id: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/),
        heading: z.string().max(L.sectionHeadingChars * 2),
        body: z.string().max(L.sectionBodyChars * 2),
        images: z.array(imageSchema).max(L.sectionImages),
      })
    )
    .max(L.sections),
  gallery: z.array(imageSchema).max(L.galleryImages),
});

/** One line: trimmed, inner whitespace collapsed. */
const line = (s: string) => s.trim().replace(/\s+/g, ' ');
/** Multi-line text: Windows line ends, trailing spaces and runs of blank lines normalised. */
const block = (s: string) =>
  s
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const image = (i: z.infer<typeof imageSchema>): DestinationImage => ({ ...i, alt: line(i.alt).slice(0, IMAGE_RULES.altChars) });

/**
 * Validates untrusted content (admin save/publish, Firestore read) and
 * normalises its text. Returns null when it is malformed or far too long.
 * Drafts may be incomplete; checkPublishable() decides what can go live.
 */
export function parseDestinationContent(input: unknown): DestinationContent | null {
  const parsed = contentSchema.safeParse(input);
  if (!parsed.success) return null;
  const c = parsed.data;
  const ids = c.sections.map((s) => s.id);
  if (new Set(ids).size !== ids.length) return null;

  const out: DestinationContent = {
    linkText: line(c.linkText),
    slug: slugify(c.slug),
    column: c.column,
    showInFooter: c.showInFooter,
    template: c.template,
    heading: line(c.heading),
    intro: block(c.intro),
    heroImage: c.heroImage ? image(c.heroImage) : null,
    sections: c.sections.map((s) => ({ id: s.id, heading: line(s.heading), body: block(s.body), images: s.images.map(image) })),
    gallery: c.gallery.map(image),
  };
  const tooLong =
    out.linkText.length > L.linkTextChars ||
    out.heading.length > L.headingChars ||
    out.intro.length > L.introChars ||
    out.sections.some((s) => s.heading.length > L.sectionHeadingChars || s.body.length > L.sectionBodyChars);
  return tooLong ? null : out;
}

/** Only what the chosen template shows (unused photos are dropped when publishing). */
export function forTemplate(content: DestinationContent): DestinationContent {
  const t = TEMPLATE_INFO[content.template];
  return {
    ...content,
    heroImage: t.heroImage ? content.heroImage : null,
    sections: content.sections.map((s) => ({ ...s, images: s.images.slice(0, t.sectionImages) })),
    gallery: t.gallery ? content.gallery : [],
  };
}

/** Readable reasons the content cannot be published yet (empty = ready). */
export function checkPublishable(content: DestinationContent): string[] {
  const errors: string[] = [];
  const t = TEMPLATE_INFO[content.template];
  const c = forTemplate(content);

  if (!c.linkText) errors.push('Footer link text is empty.');
  if (!c.heading) errors.push('Page heading is empty.');
  if (c.slug.length < 3 || !SLUG_RE.test(c.slug)) errors.push('Page address: use at least 3 lowercase letters, numbers or dashes (for example bangalore-to-hyderabad).');
  if (!c.intro) errors.push(`${t.introLabel} is empty. Write a few lines about the destination.`);
  if (t.needsSections && c.sections.length === 0) errors.push('Add at least one section.');

  c.sections.forEach((s, i) => {
    const where = `Section ${i + 1}${s.heading ? ` (“${s.heading}”)` : ''}`;
    if (t.sectionHeading && !s.heading) errors.push(`Section ${i + 1} needs a heading.`);
    if (!s.body && s.images.length === 0) errors.push(`${where} is empty. Add some text${t.sectionImages ? ' or a photo' : ''}, or remove it.`);
  });

  const small = [c.heroImage, ...c.sections.flatMap((s) => s.images), ...c.gallery].filter(
    (i): i is DestinationImage => Boolean(i) && (i!.width < DESTINATION_IMAGE_MIN.w || i!.height < DESTINATION_IMAGE_MIN.h)
  );
  if (small.length) errors.push(`${small.length} photo${small.length > 1 ? 's are' : ' is'} smaller than ${DESTINATION_IMAGE_MIN.w}×${DESTINATION_IMAGE_MIN.h}px. Replace ${small.length > 1 ? 'them' : 'it'} with a larger picture.`);
  return errors;
}

/** Cloudinary ids of every photo in the content (including ones the template does not show). */
export function destinationImageIds(content: DestinationContent | null): string[] {
  if (!content) return [];
  return [content.heroImage, ...content.sections.flatMap((s) => s.images), ...content.gallery]
    .filter((i): i is DestinationImage => Boolean(i))
    .map((i) => i.publicId);
}

/** JSON with sorted keys — key order must not count as a change. */
const canon = (v: unknown) =>
  JSON.stringify(v ?? null, (_k, val) =>
    val && typeof val === 'object' && !Array.isArray(val)
      ? Object.fromEntries(Object.keys(val).sort().map((k) => [k, (val as Record<string, unknown>)[k]]))
      : val
  );

export const sameContent = (a: DestinationContent | null, b: DestinationContent | null) => canon(a) === canon(b);

/** draft = never published (or unpublished); live = website matches the draft; changed = live, with unpublished edits. */
export function destinationStatus(record: Pick<DestinationRecord, 'draft' | 'live'>): DestinationStatus {
  if (!record.live) return 'draft';
  return sameContent(forTemplate(record.draft), record.live) ? 'live' : 'changed';
}

// ─── Rendering helpers ──────────────────────────────────────────────────────

export type TextBlock = { type: 'paragraph'; lines: string[] } | { type: 'bullets'; items: string[] };

const BULLET_RE = /^\s*[-•*]\s+/;

/** Body text → paragraphs (single line breaks kept) and bullet lists ("- " lines). */
export function textBlocks(text: string): TextBlock[] {
  const blocks: TextBlock[] = [];
  for (const chunk of text.split(/\n\s*\n/)) {
    let para: string[] = [];
    let bullets: string[] = [];
    const flushPara = () => {
      if (para.length) blocks.push({ type: 'paragraph', lines: para });
      para = [];
    };
    const flushBullets = () => {
      if (bullets.length) blocks.push({ type: 'bullets', items: bullets });
      bullets = [];
    };
    for (const raw of chunk.split('\n')) {
      const l = raw.trim();
      if (!l) continue;
      if (BULLET_RE.test(l)) {
        flushPara();
        bullets.push(l.replace(BULLET_RE, ''));
      } else {
        flushBullets();
        para.push(l);
      }
    }
    flushPara();
    flushBullets();
  }
  return blocks;
}

/** Plain-text summary for the meta description (first paragraph, ~155 characters). */
export function pageDescription(content: DestinationContent): string {
  const first = textBlocks(content.intro)[0];
  const text = first ? (first.type === 'paragraph' ? first.lines.join(' ') : first.items.join(', ')) : content.heading;
  return text.length > 155 ? `${text.slice(0, 152).replace(/\s+\S*$/, '')}…` : text;
}

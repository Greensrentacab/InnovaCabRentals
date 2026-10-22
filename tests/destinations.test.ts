/**
 * Footer destinations (lib/destinations.ts, lib/footerColumns.ts): parsing
 * untrusted content, what blocks publishing per template, template
 * normalisation, status, slugs, the body text format and the footer columns.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkPublishable,
  destinationImageIds,
  destinationStatus,
  forTemplate,
  newDestinationContent,
  pageDescription,
  parseDestinationContent,
  slugify,
  textBlocks,
  type DestinationContent,
  type DestinationImage,
} from '@/lib/destinations';
import { BUILT_IN_FOOTER_COLUMNS } from '@/lib/footerColumns';
import { catalogRoutes } from '@/lib/routeCatalog';

const photo = (n: number, size = { width: 1600, height: 900 }): DestinationImage => ({
  publicId: `innova-cabs/site-images/destination-${String(n).padStart(16, '0')}`,
  version: 1,
  ...size,
  format: 'jpg',
  bytes: 200_000,
  alt: `Photo ${n}`,
});

/** A complete, publishable page for each template. */
function page(template: DestinationContent['template']): DestinationContent {
  const c = newDestinationContent({ linkText: 'Bangalore to Hyderabad', column: 'south-india', template });
  c.intro = 'Hyderabad is famous for its biryani.';
  c.sections = c.sections.map((s) => ({ ...s, body: 'Some text.' }));
  return c;
}

test('new destinations get an address, heading and starter sections from the link text', () => {
  const simple = newDestinationContent({ linkText: '  Bangalore to Hyderabad ', column: 'south-india', template: 'simple' });
  assert.equal(simple.slug, 'bangalore-to-hyderabad');
  assert.equal(simple.heading, 'Bangalore to Hyderabad');
  assert.equal(simple.showInFooter, true);
  assert.equal(simple.sections.length, 0);
  const travel = newDestinationContent({ linkText: 'Bangalore to Hyderabad', column: 'south-india', template: 'travel' });
  assert.deepEqual(
    travel.sections.map((s) => s.heading),
    ['About Hyderabad', 'Top attractions', 'Travel information', 'Good to know']
  );
});

test('slugify makes a clean lowercase address', () => {
  assert.equal(slugify('Bangalore to Hyderabad'), 'bangalore-to-hyderabad');
  assert.equal(slugify('  Coorg & Kabini — Weekend!! '), 'coorg-and-kabini-weekend');
  assert.equal(slugify('Mysuru Palace (Ambā Vilas)'), 'mysuru-palace-amba-vilas');
  assert.equal(slugify('---'), '');
});

test('malformed or foreign content is rejected', () => {
  assert.equal(parseDestinationContent(null), null);
  assert.equal(parseDestinationContent({}), null);
  assert.equal(parseDestinationContent({ ...page('simple'), column: 'nowhere' }), null);
  assert.equal(parseDestinationContent({ ...page('simple'), template: 'website-builder' }), null);
  // Photos must be our own Cloudinary uploads
  assert.equal(parseDestinationContent({ ...page('simple'), heroImage: { ...photo(1), publicId: 'someone-else/photo' } }), null);
  // Duplicate section ids
  const dup = page('travel');
  dup.sections[1].id = dup.sections[0].id;
  assert.equal(parseDestinationContent(dup), null);
});

test('text is trimmed and normalised', () => {
  const c = page('split');
  c.linkText = '  Bangalore   to Hyderabad ';
  c.slug = 'Bangalore To Hyderabad';
  c.intro = 'First line  \r\nsecond line\r\n\r\n\r\n\r\nNew paragraph  ';
  const parsed = parseDestinationContent(c)!;
  assert.equal(parsed.linkText, 'Bangalore to Hyderabad');
  assert.equal(parsed.slug, 'bangalore-to-hyderabad');
  assert.equal(parsed.intro, 'First line\nsecond line\n\nNew paragraph');
});

test('complete pages of every template are publishable', () => {
  for (const t of ['simple', 'split', 'travel'] as const) assert.deepEqual(checkPublishable(page(t)), [], t);
});

test('missing required parts block publishing', () => {
  const c = page('travel');
  c.linkText = '';
  c.heading = '';
  c.slug = 'x';
  c.intro = '';
  c.sections[0].heading = '';
  c.sections[1].body = '';
  const errors = checkPublishable(c);
  assert.ok(errors.some((e) => e.startsWith('Footer link text')));
  assert.ok(errors.some((e) => e.startsWith('Page heading')));
  assert.ok(errors.some((e) => e.startsWith('Page address')));
  assert.ok(errors.some((e) => e.startsWith('Introduction')));
  assert.ok(errors.includes('Section 1 needs a heading.'));
  assert.ok(errors.some((e) => e.startsWith('Section 2 (“Top attractions”) is empty')));

  const split = page('split');
  split.sections = [];
  assert.ok(checkPublishable(split).includes('Add at least one section.'));
  // A simple page needs no extra sections, and its sub-headings are optional
  const simple = page('simple');
  simple.sections = [{ id: 'a', heading: '', body: 'More text', images: [] }];
  assert.deepEqual(checkPublishable(simple), []);
});

test('a travel section with only photos is fine; small photos are not', () => {
  const c = page('travel');
  c.sections[0].body = '';
  c.sections[0].images = [photo(1)];
  assert.deepEqual(checkPublishable(c), []);
  c.heroImage = photo(2, { width: 640, height: 480 });
  assert.ok(checkPublishable(c).some((e) => e.includes('smaller than 800×450px')));
});

test('publishing keeps only what the template shows', () => {
  const c = page('split');
  c.heroImage = photo(1);
  c.gallery = [photo(2)];
  c.sections[0].images = [photo(3), photo(4)];
  const shown = forTemplate(c);
  assert.equal(shown.heroImage, null);
  assert.deepEqual(shown.gallery, []);
  assert.deepEqual(shown.sections[0].images.map((i) => i.publicId), [photo(3).publicId]);
  // The draft still knows every photo (so none is deleted before publishing)
  assert.equal(destinationImageIds(c).length, 4);
  assert.equal(destinationImageIds(shown).length, 1);
});

test('status: draft, live, or live with unpublished changes', () => {
  const c = page('simple');
  assert.equal(destinationStatus({ draft: c, live: null }), 'draft');
  assert.equal(destinationStatus({ draft: c, live: forTemplate(c) }), 'live');
  assert.equal(destinationStatus({ draft: { ...c, intro: 'Changed' }, live: forTemplate(c) }), 'changed');
  // Key order is not a change
  const reordered = Object.fromEntries(Object.entries(c).reverse()) as unknown as DestinationContent;
  assert.equal(destinationStatus({ draft: reordered, live: forTemplate(c) }), 'live');
});

test('body text becomes paragraphs and bullet lists', () => {
  assert.deepEqual(textBlocks('One\ntwo\n\n- a\n- b\nAfter\n\n• c'), [
    { type: 'paragraph', lines: ['One', 'two'] },
    { type: 'bullets', items: ['a', 'b'] },
    { type: 'paragraph', lines: ['After'] },
    { type: 'bullets', items: ['c'] },
  ]);
  assert.deepEqual(textBlocks('   \n\n  '), []);
});

test('meta description is the first paragraph, shortened at a word', () => {
  const c = page('simple');
  assert.equal(pageDescription(c), 'Hyderabad is famous for its biryani.');
  c.intro = `${'word '.repeat(60)}\n\nSecond paragraph`;
  const d = pageDescription(c);
  assert.ok(d.length <= 155 && d.endsWith('…') && !d.includes('Second'));
});

test('footer columns keep every built-in route exactly once', () => {
  const hrefs = BUILT_IN_FOOTER_COLUMNS.flatMap((c) => c.links.map((l) => l.href));
  const expected = catalogRoutes.filter((r) => r.category !== 'airport').map((r) => `/routes/${r.slug}`);
  assert.equal(new Set(hrefs).size, hrefs.length);
  assert.deepEqual([...hrefs].sort(), [...expected].sort());
  assert.deepEqual(
    BUILT_IN_FOOTER_COLUMNS.map((c) => c.title),
    ['Popular Hill Stations & Weekend Trips', 'Karnataka Destinations', 'South India Pilgrimage & Long Trips']
  );
});

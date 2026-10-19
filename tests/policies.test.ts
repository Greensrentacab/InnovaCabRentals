/**
 * Terms & policies content (lib/policies.ts): parsing untrusted input and the
 * checks that stop empty or malformed content from being published.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPublishable, defaultPolicyContent, parsePolicyContent, POLICY_LIMITS, type PolicyContent } from '@/lib/policies';

const content = (): PolicyContent => defaultPolicyContent();

test('the starting content is publishable', () => {
  assert.deepEqual(checkPublishable(content()), []);
  assert.deepEqual(parsePolicyContent(content()), content());
});

test('malformed input is rejected', () => {
  assert.equal(parsePolicyContent(null), null);
  assert.equal(parsePolicyContent({}), null);
  assert.equal(parsePolicyContent({ terms: 'x', services: {} }), null);
  const c = content() as unknown as { terms: { type: string }[] };
  c.terms[0].type = 'script';
  assert.equal(parsePolicyContent(c), null);
  const missing = content() as unknown as { services: Record<string, unknown> };
  delete missing.services.local;
  assert.equal(parsePolicyContent(missing), null);
});

test('text is trimmed and bullets/paragraph fields are normalised', () => {
  const c = content();
  c.terms = [
    { id: 'a', type: 'paragraph', text: '  Hello  ', items: ['stray'] },
    { id: 'b', type: 'bullets', text: 'stray', items: ['  one ', 'two'] },
  ];
  c.services.airport.inclusions = ['  Fuel  '];
  const parsed = parsePolicyContent(c)!;
  assert.deepEqual(parsed.terms[0], { id: 'a', type: 'paragraph', text: 'Hello', items: [] });
  assert.deepEqual(parsed.terms[1], { id: 'b', type: 'bullets', text: '', items: ['one', 'two'] });
  assert.deepEqual(parsed.services.airport.inclusions, ['Fuel']);
});

test('terms & conditions cannot be published empty', () => {
  const c = content();
  c.terms = [];
  assert.ok(checkPublishable(c).some((e) => /cannot be published empty/.test(e)));
  c.terms = [{ id: 'h', type: 'heading', text: 'Only a heading', items: [] }];
  assert.ok(checkPublishable(c).some((e) => /cannot be published empty/.test(e)));
});

test('empty clauses and bullets are reported with their position', () => {
  const c = content();
  c.terms.push({ id: 'p', type: 'paragraph', text: '', items: [] });
  c.terms.push({ id: 'l', type: 'bullets', text: '', items: ['ok', ''] });
  c.terms.push({ id: 'e', type: 'bullets', text: '', items: [] });
  const errors = checkPublishable(parsePolicyContent(c)!);
  const n = c.terms.length;
  assert.ok(errors.includes(`Terms & conditions → Paragraph ${n - 2} is empty. Type the text or remove it.`));
  assert.ok(errors.includes(`Terms & conditions → Bullet list ${n - 1}: bullet 2 is empty.`));
  assert.ok(errors.includes(`Terms & conditions → Bullet list ${n} has no bullet points. Add one or remove the list.`));
});

test('inclusions and exclusions are required per service; fare terms are optional', () => {
  const c = content();
  c.services.outstation.inclusions = [];
  c.services.local.exclusions = [];
  c.services.airport.terms = [];
  const errors = checkPublishable(c);
  assert.ok(errors.includes("Outstation trips → What's included cannot be published empty. Add at least one item."));
  assert.ok(errors.includes('Local & hourly rentals → Not included cannot be published empty. Add at least one item.'));
  assert.equal(errors.filter((e) => e.startsWith('Airport')).length, 0);
});

test('whitespace-only items count as empty', () => {
  const c = content();
  c.services.airport.exclusions = ['Tolls', '   '];
  const errors = checkPublishable(parsePolicyContent(c)!);
  assert.ok(errors.includes('Airport transfers → Not included: item 2 is empty. Type it or remove it.'));
});

test('length limits', () => {
  const c = content();
  c.services.airport.inclusions = ['x'.repeat(POLICY_LIMITS.itemChars + 1)];
  c.terms.push({ id: 'h', type: 'heading', text: 'h'.repeat(POLICY_LIMITS.headingChars + 1), items: [] });
  const errors = checkPublishable(parsePolicyContent(c)!);
  assert.ok(errors.some((e) => /item 1 is longer than 300 characters/.test(e)));
  assert.ok(errors.some((e) => /Heading \d+ is longer than 140 characters/.test(e)));
  // Grossly oversized payloads are refused outright
  c.services.airport.inclusions = ['x'.repeat(POLICY_LIMITS.itemChars * 2 + 1)];
  assert.equal(parsePolicyContent(c), null);
});

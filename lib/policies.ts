/**
 * policies.ts — Terms & Conditions plus per-service inclusions, exclusions
 * and fare terms, edited in Admin → Terms & policies and published to the
 * website without a deployment (stored in Firestore siteContent/policies).
 *
 * Shared by the admin editor (client) and the server (validation, storage,
 * fare calculator, /terms page). Content is plain text only — React escapes
 * it on render, so no HTML can be injected.
 *
 * The starting content is assembled only from statements already on the
 * site (siteConfig policies, fare terms, service bullets); the client
 * changes it in the admin.
 */

import { z } from 'zod';
import { siteConfig } from '@/lib/siteConfig';

export const POLICY_SERVICES = ['airport', 'outstation', 'local'] as const;
export type PolicyService = (typeof POLICY_SERVICES)[number];

export const POLICY_SERVICE_LABEL: Record<PolicyService, string> = {
  airport: 'Airport transfers',
  outstation: 'Outstation trips',
  local: 'Local & hourly rentals',
};

export type PolicyBlockType = 'heading' | 'paragraph' | 'bullets';

/** One clause of the Terms & Conditions page. Bullets use `items`; the others use `text`. */
export interface PolicyBlock {
  id: string;
  type: PolicyBlockType;
  text: string;
  items: string[];
}

export interface ServicePolicy {
  /** What the quoted fare includes */
  inclusions: string[];
  /** What is not included / charged separately */
  exclusions: string[];
  /** Service-specific terms shown with every fare (rate-based lines are added automatically) */
  terms: string[];
}

export interface PolicyContent {
  terms: PolicyBlock[];
  services: Record<PolicyService, ServicePolicy>;
}

export interface PolicyRevision {
  version: number;
  publishedAt: string;
  content: PolicyContent;
}

export const POLICY_LIMITS = {
  blocks: 80,
  headingChars: 140,
  textChars: 2000,
  items: 30,
  itemChars: 300,
};

/** Maps any service type (incl. 'tour') to the policy that applies. */
export const policyServiceFor = (serviceType: string): PolicyService =>
  serviceType === 'airport' || serviceType === 'local' ? serviceType : 'outstation';

export const newBlockId = () => `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const p = siteConfig.policies;
const FARE_ESTIMATE = 'Fare is an estimate; final fare is confirmed by our dispatch team before the trip.';

export function defaultPolicyContent(): PolicyContent {
  return {
    terms: [
      { id: 'd1', type: 'heading', text: 'Booking', items: [] },
      { id: 'd2', type: 'paragraph', text: p.confirmation, items: [] },
      { id: 'd3', type: 'heading', text: 'Fares', items: [] },
      { id: 'd4', type: 'paragraph', text: FARE_ESTIMATE, items: [] },
      { id: 'd5', type: 'paragraph', text: p.tolls, items: [] },
      { id: 'd6', type: 'heading', text: 'Payment', items: [] },
      { id: 'd7', type: 'paragraph', text: siteConfig.payments.advance, items: [] },
      { id: 'd8', type: 'bullets', text: '', items: [...siteConfig.payments.methods] },
      { id: 'd9', type: 'heading', text: 'Cancellation & rescheduling', items: [] },
      { id: 'd10', type: 'paragraph', text: p.cancellation, items: [] },
    ],
    services: {
      airport: {
        inclusions: ['Chauffeur-driven car with fuel', 'Meet-and-greet at arrivals', 'Live flight-delay monitoring — delays never cost extra'],
        exclusions: ['Toll charges', 'Airport parking fees'],
        terms: ['Airport parking and toll charges are paid by the customer.', FARE_ESTIMATE, 'No advance payment. Pay after the trip.', p.cancellation],
      },
      outstation: {
        inclusions: ['Chauffeur-driven car with fuel', 'Driver allowance (shown in your estimate)', 'Up to 3 stops on the way'],
        exclusions: ['Toll charges', 'Parking fees', 'State permits and entry taxes'],
        terms: ['Night driving allowance applies between 10:00 PM and 6:00 AM.', p.tolls, FARE_ESTIMATE, 'No advance payment. Pay after the trip.', p.cancellation],
      },
      local: {
        inclusions: ['Chauffeur-driven car with fuel', 'Package hours and kilometres as selected', 'Multiple stops, no re-booking'],
        exclusions: ['Toll charges', 'Parking fees'],
        terms: [p.tolls, FARE_ESTIMATE, 'No advance payment. Pay after the trip.', p.cancellation],
      },
    },
  };
}

// Structure only (generous caps stop oversized payloads); wording rules are in checkPublishable.
const listSchema = z.array(z.string().max(POLICY_LIMITS.itemChars * 2)).max(POLICY_LIMITS.items * 2);
const serviceSchema = z.object({ inclusions: listSchema, exclusions: listSchema, terms: listSchema });
const contentSchema = z.object({
  terms: z
    .array(
      z.object({
        id: z.string().min(1).max(64),
        type: z.enum(['heading', 'paragraph', 'bullets']),
        text: z.string().max(POLICY_LIMITS.textChars * 2),
        items: listSchema,
      })
    )
    .max(POLICY_LIMITS.blocks * 2),
  services: z.object({ airport: serviceSchema, outstation: serviceSchema, local: serviceSchema }),
});

const clean = (s: string) => s.replace(/\r\n?/g, '\n').trim();

/**
 * Parses untrusted input (server actions, Firestore) into PolicyContent with
 * trimmed text. Returns null when the shape is malformed.
 */
export function parsePolicyContent(input: unknown): PolicyContent | null {
  const parsed = contentSchema.safeParse(input);
  if (!parsed.success) return null;
  const c = parsed.data;
  const list = (items: string[]) => items.map(clean);
  return {
    terms: c.terms.map((b) => ({
      id: b.id,
      type: b.type,
      text: b.type === 'bullets' ? '' : clean(b.text),
      items: b.type === 'bullets' ? list(b.items) : [],
    })),
    services: Object.fromEntries(
      POLICY_SERVICES.map((s) => [
        s,
        { inclusions: list(c.services[s].inclusions), exclusions: list(c.services[s].exclusions), terms: list(c.services[s].terms) },
      ])
    ) as Record<PolicyService, ServicePolicy>,
  };
}

const BLOCK_NAME: Record<PolicyBlockType, string> = { heading: 'Heading', paragraph: 'Paragraph', bullets: 'Bullet list' };
const LIST_NAME: Record<keyof ServicePolicy, string> = {
  inclusions: "What's included",
  exclusions: 'Not included',
  terms: 'Fare terms',
};

/**
 * Everything that would stop the content from being published, as
 * admin-readable messages. Empty array = ready to publish.
 */
export function checkPublishable(content: PolicyContent): string[] {
  const errors: string[] = [];
  const L = POLICY_LIMITS;

  if (content.terms.length > L.blocks) errors.push(`Terms & conditions: keep it to ${L.blocks} clauses or fewer.`);
  content.terms.forEach((b, i) => {
    const where = `Terms & conditions → ${BLOCK_NAME[b.type]} ${i + 1}`;
    if (b.type === 'bullets') {
      if (b.items.length === 0) errors.push(`${where} has no bullet points. Add one or remove the list.`);
      if (b.items.length > L.items) errors.push(`${where}: keep it to ${L.items} bullet points or fewer.`);
      b.items.forEach((item, j) => {
        if (!item) errors.push(`${where}: bullet ${j + 1} is empty.`);
        else if (item.length > L.itemChars) errors.push(`${where}: bullet ${j + 1} is longer than ${L.itemChars} characters.`);
      });
    } else {
      const max = b.type === 'heading' ? L.headingChars : L.textChars;
      if (!b.text) errors.push(`${where} is empty. Type the text or remove it.`);
      else if (b.text.length > max) errors.push(`${where} is longer than ${max} characters.`);
    }
  });
  const hasBody = content.terms.some((b) => (b.type === 'bullets' ? b.items.some(Boolean) : b.type === 'paragraph' && b.text));
  if (!hasBody) errors.push('Terms & conditions cannot be published empty. Add at least one paragraph or bullet list.');

  for (const s of POLICY_SERVICES) {
    const policy = content.services[s];
    (Object.keys(LIST_NAME) as (keyof ServicePolicy)[]).forEach((key) => {
      const where = `${POLICY_SERVICE_LABEL[s]} → ${LIST_NAME[key]}`;
      const items = policy[key];
      if (key !== 'terms' && items.length === 0) errors.push(`${where} cannot be published empty. Add at least one item.`);
      if (items.length > L.items) errors.push(`${where}: keep it to ${L.items} items or fewer.`);
      items.forEach((item, j) => {
        if (!item) errors.push(`${where}: item ${j + 1} is empty. Type it or remove it.`);
        else if (item.length > L.itemChars) errors.push(`${where}: item ${j + 1} is longer than ${L.itemChars} characters.`);
      });
    });
  }
  return errors;
}

/** Stable comparison for dirty tracking. */
export const samePolicyContent = (a: PolicyContent | null, b: PolicyContent | null) => JSON.stringify(a) === JSON.stringify(b);

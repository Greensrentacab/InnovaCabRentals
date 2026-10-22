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
    // Client's Advance Payment & Cancellation Policy (Oct 2026)
    terms: [
      { id: 'd1', type: 'heading', text: 'Advance Payment & Cancellation Policy', items: [] },
      { id: 'd2', type: 'paragraph', text: 'Innova Cabs Bangalore — Your Travel Companion', items: [] },
      {
        id: 'd3',
        type: 'paragraph',
        text: 'At Innova Cabs Bangalore, we provide reliable airport transfers, local taxi services, outstation cab rentals, and chauffeur-driven car rental services. Please read our advance payment, cancellation, and refund policies carefully before confirming your booking.',
        items: [],
      },
      { id: 'd4', type: 'heading', text: '1. Cab Booking & Advance Payment Policy', items: [] },
      {
        id: 'd5',
        type: 'bullets',
        text: '',
        items: [
          'Booking Confirmation: An advance payment is required to confirm your cab booking.',
          'Initial Advance Payment: Customers must pay 20% of the total cab fare at the time of booking.',
          'Second Payment: 60% of the total cab fare must be paid when boarding the cab.',
          'Final Payment: The remaining 20% must be paid on or before completion of the trip.',
          'Short-Notice Bookings: For bookings made close to the travel date, the payment terms will be communicated at the time of confirmation.',
          'Booking Confirmation: All bookings are subject to vehicle availability and confirmation upon receipt of the required advance payment.',
        ],
      },
      { id: 'd6', type: 'heading', text: '2. Cab Booking Cancellation Policy', items: [] },
      {
        id: 'd7',
        type: 'paragraph',
        text: 'Cancellation charges are calculated based on the number of days remaining before the scheduled trip departure date.',
        items: [],
      },
      {
        id: 'd8',
        type: 'bullets',
        text: '',
        items: [
          '10 days or more before the trip: 10% of the total cab fare',
          '7–3 days before the trip: 25% of the total cab fare',
          'Less than 2 days before the trip: No refund',
        ],
      },
      {
        id: 'd9',
        type: 'paragraph',
        text: 'Important: The cancellation charge for bookings cancelled 8–9 days before departure and exactly 2 days before departure should be clarified at the time of booking to avoid misunderstandings.',
        items: [],
      },
      { id: 'd10', type: 'heading', text: '3. Refund Policy', items: [] },
      {
        id: 'd11',
        type: 'bullets',
        text: '',
        items: [
          'Eligible refunds will be processed after deducting the applicable cancellation charges.',
          'Any booking amount explicitly agreed upon as non-refundable will not be refunded.',
          'Refunds will be issued through the original payment method or another mutually agreed payment method.',
          'Refund processing time may vary depending on the bank or payment provider.',
          'Any additional expenses incurred for the booking may be deducted from the refundable amount where previously disclosed and agreed upon.',
        ],
      },
      { id: 'd12', type: 'heading', text: '4. Trip Changes & Rescheduling', items: [] },
      {
        id: 'd13',
        type: 'bullets',
        text: '',
        items: [
          'Customers must inform us in advance of any changes to the travel date, pickup location, drop location, or itinerary.',
          'All changes are subject to vehicle availability and may result in revised fares.',
          'Rescheduling requests made close to departure may be treated as cancellations if the originally booked vehicle cannot be reassigned.',
          'Additional kilometres, extra hours, route changes, waiting time, or additional stops may incur extra charges according to the confirmed fare terms.',
        ],
      },
      { id: 'd14', type: 'heading', text: '5. Important Terms & Conditions', items: [] },
      {
        id: 'd15',
        type: 'bullets',
        text: '',
        items: [
          'All cancellation requests must be submitted in writing through the official communication channel used for the booking.',
          'Cancellation charges will be calculated based on the date the written cancellation request is received.',
          'Toll charges, parking fees, state permits, check-post taxes, driver allowance, and other applicable trip expenses will be charged according to the confirmed quotation.',
          'If a customer fails to arrive at the agreed pickup location or cannot be contacted at the scheduled pickup time, the booking may be treated as a no-show in accordance with the terms communicated at confirmation.',
          'In the event of unforeseen circumstances, vehicle breakdowns, severe weather, or government restrictions, reasonable alternative arrangements will be discussed with the customer.',
          'All cancellations, refunds, and deductions will be handled according to the confirmed booking terms and applicable law.',
        ],
      },
      { id: 'd16', type: 'heading', text: '6. Customer Acknowledgement', items: [] },
      {
        id: 'd17',
        type: 'paragraph',
        text: 'By confirming a booking with Innova Cabs Bangalore, the customer acknowledges that they have read and understood the applicable cab booking, advance payment, cancellation, and refund policies.',
        items: [],
      },
      {
        id: 'd18',
        type: 'paragraph',
        text: 'For booking assistance, fare enquiries, or cancellation requests, please contact Innova Cabs Bangalore using the contact details provided on our official website.',
        items: [],
      },
      { id: 'd19', type: 'paragraph', text: 'Innova Cabs Bangalore — Your Travel Companion', items: [] },
    ],
    services: {
      airport: {
        inclusions: ['Chauffeur-driven car with fuel', 'Meet-and-greet at arrivals', 'Live flight-delay monitoring — delays never cost extra'],
        exclusions: ['Toll charges', 'Airport parking fees'],
        terms: ['Airport parking and toll charges are paid by the customer.', FARE_ESTIMATE, 'Pay by UPI or cash.', p.cancellation],
      },
      outstation: {
        inclusions: ['Chauffeur-driven car with fuel', 'Driver allowance (shown in your estimate)', 'Up to 3 stops on the way'],
        exclusions: ['Toll charges', 'Parking fees', 'State permits and entry taxes'],
        terms: ['Night driving allowance applies between 10:00 PM and 6:00 AM.', p.tolls, FARE_ESTIMATE, 'Pay by UPI or cash.', p.cancellation],
      },
      local: {
        inclusions: ['Chauffeur-driven car with fuel', 'Package hours and kilometres as selected', 'Multiple stops, no re-booking'],
        exclusions: ['Toll charges', 'Parking fees'],
        terms: [p.tolls, FARE_ESTIMATE, 'Pay by UPI or cash.', p.cancellation],
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

/**
 * pricing.ts — the minimum-kilometre fare rule (Admin → Pricing → Airport
 * transfer). Shared by the server fare calculator, the storefront "from"
 * prices and the admin fare preview, so every page applies the same maths.
 *
 *   Fare = base fare + extra km × rate per extra km
 *   extra km = distance − km covered by the base fare (never below 0),
 *              rounded UP to the next whole km — a part-kilometre is charged
 *              as a full km, the way ride apps bill.
 *
 * Distances are first rounded to 0.1 km (the precision customers see), so
 * 3.04 km counts as 3.0 km and 3.1 km already starts the 4th km.
 * Leaving "km covered" and "rate per extra km" empty keeps a flat fare.
 */

import type { VehicleRates } from '@/lib/types';

export interface DistanceTariff {
  /** Fixed fare charged for the first `includedKm` km (or the whole trip when flat) */
  baseFare: number | null;
  /** Km covered by the base fare; null = flat fare */
  includedKm: number | null;
  /** Rate per km beyond `includedKm`; null = flat fare */
  extraKmRate: number | null;
}

/** 'request' = no base fare ("Price on request"), 'flat' = fixed fare, 'distance' = minimum-km rule */
export type TariffMode = 'request' | 'flat' | 'distance';

export interface DistanceQuote {
  fare: number | null;
  /** Whole km charged beyond the included distance */
  extraKm: number;
  /** Customer-facing fare lines, e.g. "Extra 2 km × ₹20/km = ₹40" */
  lines: string[];
}

const isNumber = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);
const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const kmText = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)} km`;

/** Distance rounded to 0.1 km — the precision shown to customers. */
export const roundKm = (km: number) => Math.round(km * 10) / 10;

/** Whole kilometres charged beyond the included distance (part-km = full km). */
export function extraKmFor(distanceKm: number, includedKm: number): number {
  // Strip float noise (4.1 − 3 = 1.0999…) before rounding up
  const over = Math.round((roundKm(distanceKm) - includedKm) * 1000) / 1000;
  return over > 0 ? Math.ceil(over) : 0;
}

export function tariffMode(t: DistanceTariff): TariffMode {
  if (!isNumber(t.baseFare) || t.baseFare <= 0) return 'request';
  return isNumber(t.includedKm) && isNumber(t.extraKmRate) ? 'distance' : 'flat';
}

/**
 * Checks a tariff before it is saved. Returns null when it is complete and
 * consistent, otherwise a message that tells the admin what to fix.
 */
export function validateDistanceTariff(t: DistanceTariff): string | null {
  for (const v of [t.baseFare, t.includedKm, t.extraKmRate]) {
    if (v !== null && (!isNumber(v) || v < 0)) return 'Use numbers of 0 or more.';
  }
  const hasKm = t.includedKm !== null;
  const hasRate = t.extraKmRate !== null;
  if (hasKm && !hasRate) return 'Add the rate per extra km, or clear "Km covered by base fare" to keep a flat fare.';
  if (hasRate && !hasKm) return 'Add the km covered by the base fare, or clear "Rate per extra km" to keep a flat fare.';
  if (hasKm) {
    if (t.baseFare === null || t.baseFare <= 0) return 'Add the base fare charged for the first km of the trip.';
    if (t.includedKm! <= 0) return 'Km covered by the base fare must be more than 0.';
    if (t.extraKmRate! <= 0) return 'Rate per extra km must be more than ₹0.';
  }
  return null;
}

/**
 * Fare for one trip leg. `distanceKm` is the one-way road distance; when it
 * is unknown a distance-based tariff cannot be priced (fare null).
 */
export function quoteDistanceFare(t: DistanceTariff, distanceKm: number | null): DistanceQuote {
  const mode = tariffMode(t);
  if (mode === 'request') return { fare: null, extraKm: 0, lines: [] };
  const base = t.baseFare!;
  if (mode === 'flat') return { fare: Math.round(base), extraKm: 0, lines: [`Fixed fare ${inr(base)}`] };

  if (!isNumber(distanceKm) || distanceKm < 0) return { fare: null, extraKm: 0, lines: [] };
  const included = t.includedKm!;
  const rate = t.extraKmRate!;
  const extraKm = extraKmFor(distanceKm, included);
  const extra = extraKm * rate;
  const lines = [`Base fare (first ${kmText(included)}) ${inr(base)}`];
  if (extraKm > 0) lines.push(`Extra ${extraKm} km × ${inr(rate)}/km = ${inr(extra)}`);
  return { fare: Math.round(base + extra), extraKm, lines };
}

/** Airport transfer tariff stored on a car's rates. */
export const airportTariff = (rates?: Partial<VehicleRates> | null): DistanceTariff => ({
  baseFare: rates?.airportFare ?? null,
  includedKm: rates?.airportIncludedKm ?? null,
  extraKmRate: rates?.airportExtraKmRate ?? null,
});

/** Short tariff description, e.g. "₹100 for 3 km + ₹20/km" or "₹1,200". */
export function tariffSummary(t: DistanceTariff): string {
  const mode = tariffMode(t);
  if (mode === 'request') return 'On request';
  if (mode === 'flat') return inr(t.baseFare!);
  return `${inr(t.baseFare!)} for ${kmText(t.includedKm!)} + ${inr(t.extraKmRate!)}/km`;
}

/** First problem in a car's rates (shared by Admin → Pricing and the save action), or null. */
export function validateVehicleRates(rates: Partial<VehicleRates>): { field: keyof VehicleRates; message: string } | null {
  for (const [key, value] of Object.entries(rates) as [keyof VehicleRates, unknown][]) {
    if (value !== null && value !== undefined && (!isNumber(value) || value < 0)) {
      return { field: key, message: 'Use numbers of 0 or more.' };
    }
  }
  const airport = validateDistanceTariff(airportTariff(rates));
  if (airport) {
    const t = airportTariff(rates);
    const field: keyof VehicleRates =
      t.includedKm === null ? 'airportIncludedKm' : t.extraKmRate === null ? 'airportExtraKmRate' : t.baseFare === null || t.baseFare <= 0 ? 'airportFare' : t.includedKm <= 0 ? 'airportIncludedKm' : 'airportExtraKmRate';
    return { field, message: `Airport transfer: ${airport}` };
  }
  return null;
}

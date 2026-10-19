/**
 * Minimum-kilometre fare rule (lib/pricing.ts) — boundary conditions from the
 * client requirement: 3 km minimum, ₹100 base fare, ₹20 per extra km.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extraKmFor,
  quoteDistanceFare,
  tariffMode,
  tariffSummary,
  validateDistanceTariff,
  validateVehicleRates,
  type DistanceTariff,
} from '@/lib/pricing';
import { emptyRates } from '@/scripts/seed';

const RULE: DistanceTariff = { baseFare: 100, includedKm: 3, extraKmRate: 20 };

test('requirement table: 1–6 km', () => {
  const expected: [number, number][] = [
    [1, 100],
    [2, 100],
    [3, 100],
    [4, 120],
    [5, 140],
    [6, 160],
  ];
  for (const [km, fare] of expected) assert.equal(quoteDistanceFare(RULE, km).fare, fare, `${km} km`);
});

test('below, at and above the minimum distance', () => {
  assert.equal(quoteDistanceFare(RULE, 0).fare, 100);
  assert.equal(quoteDistanceFare(RULE, 0.4).fare, 100);
  assert.equal(quoteDistanceFare(RULE, 2.99).fare, 100);
  assert.equal(quoteDistanceFare(RULE, 3).fare, 100);
  assert.equal(quoteDistanceFare(RULE, 3).extraKm, 0);
});

test('a part-kilometre beyond the minimum is charged as a full km', () => {
  assert.equal(quoteDistanceFare(RULE, 3.5).fare, 120);
  assert.equal(quoteDistanceFare(RULE, 3.1).fare, 120);
  assert.equal(quoteDistanceFare(RULE, 4.1).fare, 140); // 4.1 − 3 = 1.0999… in floating point
  assert.equal(quoteDistanceFare(RULE, 5.99).fare, 160);
  // Distances are priced at 0.1 km precision: 3.04 km shows and bills as 3.0 km
  assert.equal(quoteDistanceFare(RULE, 3.04).fare, 100);
  assert.equal(extraKmFor(12.4, 3), 10);
});

test('fractional included distance', () => {
  const t = { baseFare: 150, includedKm: 2.5, extraKmRate: 10 };
  assert.equal(quoteDistanceFare(t, 2.5).fare, 150);
  assert.equal(quoteDistanceFare(t, 2.6).fare, 160);
  assert.equal(quoteDistanceFare(t, 4).fare, 170);
});

test('breakdown lines are shown to customers', () => {
  assert.deepEqual(quoteDistanceFare(RULE, 5).lines, ['Base fare (first 3 km) ₹100', 'Extra 2 km × ₹20/km = ₹40']);
  assert.deepEqual(quoteDistanceFare(RULE, 2).lines, ['Base fare (first 3 km) ₹100']);
});

test('flat fare when km/rate are empty; price on request without a base fare', () => {
  const flat = { baseFare: 1200, includedKm: null, extraKmRate: null };
  assert.equal(tariffMode(flat), 'flat');
  assert.equal(quoteDistanceFare(flat, 80).fare, 1200);
  assert.equal(quoteDistanceFare(flat, null).fare, 1200);
  assert.equal(tariffSummary(flat), '₹1,200');

  const none = { baseFare: null, includedKm: null, extraKmRate: null };
  assert.equal(tariffMode(none), 'request');
  assert.equal(quoteDistanceFare(none, 5).fare, null);
  assert.equal(tariffSummary(none), 'On request');
});

test('distance tariff without a known distance cannot be priced', () => {
  assert.equal(quoteDistanceFare(RULE, null).fare, null);
});

test('incomplete or invalid tariffs are rejected with a clear message', () => {
  assert.equal(validateDistanceTariff(RULE), null);
  assert.equal(validateDistanceTariff({ baseFare: 100, includedKm: null, extraKmRate: null }), null);
  assert.match(validateDistanceTariff({ baseFare: 100, includedKm: 3, extraKmRate: null })!, /rate per extra km/);
  assert.match(validateDistanceTariff({ baseFare: 100, includedKm: null, extraKmRate: 20 })!, /km covered/);
  assert.match(validateDistanceTariff({ baseFare: null, includedKm: 3, extraKmRate: 20 })!, /base fare/);
  assert.match(validateDistanceTariff({ baseFare: 100, includedKm: 0, extraKmRate: 20 })!, /more than 0/);
  assert.match(validateDistanceTariff({ baseFare: 100, includedKm: 3, extraKmRate: 0 })!, /more than ₹0/);
  assert.match(validateDistanceTariff({ baseFare: -5, includedKm: null, extraKmRate: null })!, /0 or more/);
});

test('validateVehicleRates points at the field to fix', () => {
  const base = emptyRates();
  assert.equal(validateVehicleRates(base), null);
  assert.equal(validateVehicleRates({ ...base, airportFare: 100, airportIncludedKm: 3, airportExtraKmRate: 20 }), null);
  assert.equal(validateVehicleRates({ ...base, airportFare: 100, airportIncludedKm: 3 })?.field, 'airportExtraKmRate');
  assert.equal(validateVehicleRates({ ...base, airportFare: 100, airportExtraKmRate: 20 })?.field, 'airportIncludedKm');
  assert.equal(validateVehicleRates({ ...base, airportIncludedKm: 3, airportExtraKmRate: 20 })?.field, 'airportFare');
  assert.equal(validateVehicleRates({ ...base, local8h: -1 })?.field, 'local8h');
});

/**
 * Car order in the booking popup (lib/fareSort.ts) and per-car price
 * independence in the admin save flow (lib/pricing.ts validation).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cheapestByFare, sortByFare } from '@/lib/fareSort';
import { validateVehicleRates } from '@/lib/pricing';
import { emptyRates } from '@/scripts/seed';
import * as fleetOrder from '@/lib/fleetOrder';

const car = (id: string, fare: number | null) => ({ id, fare });
const ids = (cars: { id: string }[]) => cars.map((c) => c.id);

test('cars are listed by calculated fare, lowest first', () => {
  const cars = [car('ertiga', 2800), car('innova', 2200), car('innova-crysta', 1900), car('innova-hycross', 3000)];
  assert.deepEqual(ids(sortByFare(cars)), ['innova-crysta', 'innova', 'ertiga', 'innova-hycross']);
});

test('order does not depend on the order the cars arrive in', () => {
  const cars = [car('innova-hycross', 3000), car('innova-crysta', 1900), car('ertiga', 2800), car('innova', 2200)];
  assert.deepEqual(ids(sortByFare(cars)), ['innova-crysta', 'innova', 'ertiga', 'innova-hycross']);
});

test('cars without a valid fare go last, and several of them do not break the sort', () => {
  const cars = [car('a', null), car('b', 3000), car('c', null), car('d', 1000), car('e', Number.NaN), car('f', 2000)];
  assert.deepEqual(ids(sortByFare(cars)), ['d', 'f', 'b', 'a', 'c', 'e']);
});

test('equal fares keep their incoming order (consistent tie-break)', () => {
  const cars = [car('x', 2000), car('y', 2000), car('z', 1500)];
  assert.deepEqual(ids(sortByFare(cars)), ['z', 'x', 'y']);
});

test('the cheapest car with a valid fare is the default; none when no car has one', () => {
  assert.equal(cheapestByFare([car('a', null), car('b', 2500), car('c', 2100)])?.id, 'c');
  assert.equal(cheapestByFare([car('a', null), car('b', null)]), undefined);
  assert.equal(cheapestByFare([]), undefined);
});

test('sorting does not mutate the input', () => {
  const cars = [car('a', 3), car('b', 1)];
  sortByFare(cars);
  assert.deepEqual(ids(cars), ['a', 'b']);
});

test('no cross-car price check exists any more', () => {
  assert.equal('checkTierOrder' in fleetOrder, false);
});

test('single-car validation still rejects incomplete tariffs', () => {
  const ok = { ...emptyRates, airportFare: 2500, airportIncludedKm: 40, airportExtraKmRate: 16 };
  assert.equal(validateVehicleRates(ok), null);
  assert.ok(validateVehicleRates({ ...ok, airportIncludedKm: null }));
});

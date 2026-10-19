/**
 * fleetOrder.ts — the fleet's premium order, used everywhere cars are listed
 * and priced: Ertiga → Innova → Innova Crysta → Innova Hycross.
 *
 * Prices must follow the same order. `checkTierOrder` is run when the admin
 * saves a car's tariff: every price/rate may not be below the cheaper car's
 * and not above the costlier car's, and the km a base fare covers may not
 * grow with the tier. With those rules every calculated fare (outstation,
 * airport, local) for the same trip comes out in display order.
 */

import type { VehicleRates } from '@/lib/types';

export const FLEET_ORDER = ['ertiga', 'innova', 'innova-crysta', 'innova-hycross'] as const;

/** Position in the premium order (unknown cars go last). */
export const fleetRank = (vehicleId: string) => {
  const i = (FLEET_ORDER as readonly string[]).indexOf(vehicleId);
  return i < 0 ? FLEET_ORDER.length : i;
};

export const byFleetOrder = <T extends { id?: string; vehicleId?: string }>(a: T, b: T) =>
  fleetRank(a.id ?? a.vehicleId ?? '') - fleetRank(b.id ?? b.vehicleId ?? '');

/** Rates that must rise (or stay equal) with each tier. */
const RISING: { key: keyof VehicleRates; label: string; money: boolean }[] = [
  { key: 'outstationPerKm', label: 'outstation rate per km', money: true },
  { key: 'driverAllowancePerDay', label: 'driver allowance per day', money: true },
  { key: 'outstationMinKmPerDay', label: 'minimum km per day', money: false },
  { key: 'airportFare', label: 'airport base fare', money: true },
  { key: 'airportExtraKmRate', label: 'airport rate per extra km', money: true },
  { key: 'local8h', label: '8 hr / 80 km package', money: true },
  { key: 'local12h', label: '12 hr / 120 km package', money: true },
  { key: 'extraKmRate', label: 'local extra km rate', money: true },
  { key: 'extraHourRate', label: 'local extra hour rate', money: true },
];

/** Km included in the airport base fare may only shrink (or stay) with the tier. */
const FALLING: { key: keyof VehicleRates; label: string }[] = [{ key: 'airportIncludedKm', label: 'km covered by the airport base fare' }];

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const show = (v: number, money: boolean) => (money ? `₹${Math.round(v).toLocaleString('en-IN')}` : `${v} km`);

interface CarRates {
  id: string;
  name: string;
  rates?: VehicleRates | null;
}

/**
 * Checks a car's new tariff against its neighbours in the premium order.
 * Returns null when the order holds, otherwise a message for the admin.
 */
export function checkTierOrder(vehicleId: string, rates: VehicleRates, fleet: CarRates[]): string | null {
  const rank = fleetRank(vehicleId);
  if (rank >= FLEET_ORDER.length) return null;
  const others = fleet.filter((v) => v.id !== vehicleId && fleetRank(v.id) < FLEET_ORDER.length);
  const cheaper = others.filter((v) => fleetRank(v.id) < rank).sort((a, b) => fleetRank(b.id) - fleetRank(a.id));
  const costlier = others.filter((v) => fleetRank(v.id) > rank).sort((a, b) => fleetRank(a.id) - fleetRank(b.id));
  const self = fleet.find((v) => v.id === vehicleId)?.name ?? vehicleId;
  const order = 'Prices must follow Ertiga → Innova → Innova Crysta → Innova Hycross.';

  const nearest = (list: CarRates[], key: keyof VehicleRates) => {
    for (const v of list) {
      const n = num(v.rates?.[key]);
      if (n !== null) return { name: v.name, value: n };
    }
    return null;
  };

  for (const { key, label, money } of RISING) {
    const mine = num(rates[key]);
    if (mine === null) continue;
    const low = nearest(cheaper, key);
    if (low && mine < low.value)
      return `${self} ${label} (${show(mine, money)}) can't be lower than ${low.name}'s (${show(low.value, money)}). ${order}`;
    const high = nearest(costlier, key);
    if (high && mine > high.value)
      return `${self} ${label} (${show(mine, money)}) can't be higher than ${high.name}'s (${show(high.value, money)}). ${order}`;
  }
  for (const { key, label } of FALLING) {
    const mine = num(rates[key]);
    if (mine === null) continue;
    const low = nearest(cheaper, key);
    if (low && mine > low.value) return `${self} ${label} (${mine} km) can't be more than ${low.name}'s (${low.value} km). ${order}`;
    const high = nearest(costlier, key);
    if (high && mine < high.value) return `${self} ${label} (${mine} km) can't be less than ${high.name}'s (${high.value} km). ${order}`;
  }
  return null;
}

/**
 * fleetOrder.ts — the fleet's display order for listings: Ertiga → Innova →
 * Innova Crysta → Innova Hycross. It is only a listing order. Each car's
 * prices are independent of the others', and the booking popup lists cars by
 * their calculated trip fare (lib/fareSort.ts).
 */

export const FLEET_ORDER = ['ertiga', 'innova', 'innova-crysta', 'innova-hycross'] as const;

/** Position in the premium order (unknown cars go last). */
export const fleetRank = (vehicleId: string) => {
  const i = (FLEET_ORDER as readonly string[]).indexOf(vehicleId);
  return i < 0 ? FLEET_ORDER.length : i;
};

export const byFleetOrder = <T extends { id?: string; vehicleId?: string }>(a: T, b: T) =>
  fleetRank(a.id ?? a.vehicleId ?? '') - fleetRank(b.id ?? b.vehicleId ?? '');

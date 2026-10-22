/**
 * fareSort.ts — ordering of the cars in the booking popup's car step.
 *
 * Cars are listed by the fare calculated for the customer's own trip, lowest
 * first. Cars with no valid fare for the trip go after those that have one.
 * Equal fares keep the order the cars arrived in (Array.prototype.sort is
 * stable), so ties always resolve the same way.
 */

interface HasFare {
  fare: number | null;
}

/** True when the car has a usable fare for the trip. */
export const hasValidFare = (c: HasFare): c is HasFare & { fare: number } =>
  typeof c.fare === 'number' && Number.isFinite(c.fare);

/** A copy of `cars`, cheapest calculated fare first; cars without a fare last. */
export function sortByFare<T extends HasFare>(cars: readonly T[]): T[] {
  return [...cars].sort((a, b) => {
    const av = hasValidFare(a);
    const bv = hasValidFare(b);
    if (av && bv) return a.fare - b.fare;
    if (av !== bv) return av ? -1 : 1;
    return 0;
  });
}

/** The car with the lowest valid fare, or undefined when none has one. */
export const cheapestByFare = <T extends HasFare>(cars: readonly T[]): T | undefined => sortByFare(cars).find(hasValidFare);

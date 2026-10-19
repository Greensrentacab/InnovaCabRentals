'use client';

/**
 * VehicleRatesEditor.tsx — Admin → Pricing. Edits one car's tariff; every
 * storefront page (fare results, fleet cards, route "from" prices, vehicle
 * pages, comparison table) reads these rates. Empty = "Price on request".
 *
 * Airport transfers use the minimum-km rule (lib/pricing.ts): a base fare
 * for the first N km plus a rate per extra km, previewed live below the
 * fields with the same function the server uses to price trips.
 *
 * Controlled: the Pricing panel owns the values and saves all cars at once.
 */

import type { Vehicle, VehicleRates } from '@/lib/types';
import { airportTariff, quoteDistanceFare, tariffMode, validateVehicleRates } from '@/lib/pricing';

export type FieldKey = keyof VehicleRates;
export type RateInputs = Record<FieldKey, string>;

const GROUPS: { title: string; hint: string; fields: { key: FieldKey; label: string; suffix?: string; wide?: boolean }[] }[] = [
  {
    title: 'Outstation (round trip)',
    hint: 'Fare = max(actual km, min km/day × days) × per-km + driver allowance × days',
    fields: [
      { key: 'outstationPerKm', label: 'Rate per km', suffix: '₹/km' },
      { key: 'outstationMinKmPerDay', label: 'Min km per day', suffix: 'km' },
      { key: 'driverAllowancePerDay', label: 'Driver allowance', suffix: '₹/day', wide: true },
    ],
  },
  {
    title: 'Airport transfer',
    hint: 'Fare = base fare + extra km × rate. A part-km is charged as a full km. Leave the last two empty for a flat fare. Round trip = 2 legs.',
    fields: [
      { key: 'airportFare', label: 'Base fare (each way)', suffix: '₹', wide: true },
      { key: 'airportIncludedKm', label: 'Km covered by base fare', suffix: 'km' },
      { key: 'airportExtraKmRate', label: 'Rate per extra km', suffix: '₹/km' },
    ],
  },
  {
    title: 'Local packages',
    hint: '8 hr and 12 hr packages plus overage rates; other durations are quoted on request',
    fields: [
      { key: 'local8h', label: '8 hr / 80 km', suffix: '₹' },
      { key: 'local12h', label: '12 hr / 120 km', suffix: '₹' },
      { key: 'extraKmRate', label: 'Extra km', suffix: '₹/km' },
      { key: 'extraHourRate', label: 'Extra hour', suffix: '₹/hr' },
    ],
  },
];

const ALL_FIELDS = GROUPS.flatMap((g) => g.fields);

/** Optional fields that don't count towards the "x of 7 rates set" meter. */
const NOT_COUNTED: FieldKey[] = ['outstationMinKmPerDay', 'airportIncludedKm', 'airportExtraKmRate'];
const COUNTED = ALL_FIELDS.filter((f) => !NOT_COUNTED.includes(f.key)).map((f) => f.key);

export const toInputs = (rates?: VehicleRates): RateInputs =>
  Object.fromEntries(ALL_FIELDS.map((f) => [f.key, rates?.[f.key] != null ? String(rates[f.key]) : ''])) as RateInputs;

export const ratesSetCount = (values: RateInputs) => COUNTED.filter((k) => values[k].trim() !== '').length;
export const RATES_TOTAL = COUNTED.length;

export function inputsToRates(values: RateInputs): VehicleRates {
  return Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, v.trim() === '' ? null : Number(v)])
  ) as unknown as VehicleRates;
}

/** First problem in a car's draft rates (blocks saving), or null. */
export const ratesProblem = (values: RateInputs) => validateVehicleRates(inputsToRates(values));

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/** Sample distances around the included km, e.g. 3 km → 1, 2, 3, 3.5, 4, 5, 6, 13 km. */
function sampleDistances(included: number): number[] {
  const raw = [1, included - 1, included, included + 0.5, included + 1, included + 2, included + 3, included + 10];
  return Array.from(new Set(raw.filter((d) => d > 0).map((d) => Math.round(d * 10) / 10))).sort((a, b) => a - b);
}

function AirportPreview({ values }: { values: RateInputs }) {
  const tariff = airportTariff(inputsToRates(values));
  const mode = tariffMode(tariff);
  if (ratesProblem(values)?.field.startsWith('airport') || mode === 'request') return null;

  if (mode === 'flat') {
    return (
      <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
        Flat fare: customers pay <strong className="text-ink">{inr(tariff.baseFare!)}</strong> each way for any distance.
      </p>
    );
  }

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
      <p className="bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Fare preview (one way)</p>
      <table className="w-full text-xs">
        <tbody className="divide-y divide-slate-100">
          {sampleDistances(tariff.includedKm!).map((km) => {
            const q = quoteDistanceFare(tariff, km);
            return (
              <tr key={km}>
                <td className="whitespace-nowrap px-3 py-1.5 font-semibold tabular-nums text-slate-700">{km} km</td>
                <td className="px-3 py-1.5 text-slate-500">
                  {q.extraKm > 0 ? `${inr(tariff.baseFare!)} + ${q.extraKm} × ${inr(tariff.extraKmRate!)}` : 'Base fare'}
                </td>
                <td className="whitespace-nowrap px-3 py-1.5 text-right font-extrabold tabular-nums text-ink">{q.fare !== null ? inr(q.fare) : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function VehicleRatesEditor({
  vehicle,
  values,
  onChange,
  dirty,
}: {
  vehicle: Vehicle;
  values: RateInputs;
  onChange: (next: RateInputs) => void;
  dirty?: boolean;
}) {
  const set = ratesSetCount(values);
  const pct = Math.round((set / RATES_TOTAL) * 100);
  const problem = ratesProblem(values);

  return (
    <section className="adm-card overflow-hidden">
      <div className="px-4 pb-4 pt-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold tracking-tight text-ink">{vehicle.name}</h3>
            <p className="text-xs text-slate-500">
              {vehicle.type} · {vehicle.seats} seats · {vehicle.luggage} bags
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
              vehicle.confirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${vehicle.confirmed ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {vehicle.confirmed ? 'Live on website' : 'Hidden (unconfirmed)'}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={set} aria-valuemin={0} aria-valuemax={RATES_TOTAL}>
            <div className="h-full rounded-full bg-brand-600 transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
          <p className="shrink-0 text-xs font-extrabold text-ink">
            {set} of {RATES_TOTAL} rates set
            {dirty && <span className="ml-1.5 text-amber-600">•</span>}
          </p>
        </div>
      </div>

      <div className="space-y-6 border-t border-slate-100 px-4 py-5 sm:px-6">
        {GROUPS.map((group) => {
          const groupKeys = group.fields.map((f) => f.key);
          const groupProblem = problem && groupKeys.includes(problem.field) ? problem : null;
          return (
            <fieldset key={group.title} className="min-w-0">
              <legend className="text-[15px] font-extrabold text-ink">{group.title}</legend>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{group.hint}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {group.fields.map((f) => {
                  const invalid = groupProblem?.field === f.key;
                  return (
                    <label key={f.key} className={`block min-w-0 ${f.wide ? 'col-span-2' : ''}`}>
                      <span className="adm-label">{f.label}</span>
                      <span className="relative block">
                        <input
                          type="number"
                          min={0}
                          step="any"
                          inputMode="decimal"
                          value={values[f.key]}
                          onChange={(e) => onChange({ ...values, [f.key]: e.target.value })}
                          placeholder={f.key === 'outstationMinKmPerDay' ? '300' : f.key === 'airportIncludedKm' || f.key === 'airportExtraKmRate' ? 'Flat fare' : 'On request'}
                          aria-invalid={invalid || undefined}
                          className={`adm-field pr-14 font-mono tabular-nums ${invalid ? '!border-rose-400 !ring-2 !ring-rose-200' : ''}`}
                        />
                        {f.suffix && (
                          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                            {f.suffix}
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
              {groupProblem && (
                <p role="alert" className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                  {groupProblem.message}
                </p>
              )}
              {group.title === 'Airport transfer' && <AirportPreview values={values} />}
            </fieldset>
          );
        })}
      </div>

      <p className="border-t border-slate-100 bg-amber-50/60 px-4 py-3 text-[11px] font-semibold text-amber-800 sm:px-6">
        Tolls, parking &amp; permits are always paid by the customer.
      </p>
    </section>
  );
}

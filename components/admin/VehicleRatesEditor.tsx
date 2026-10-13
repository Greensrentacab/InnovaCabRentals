'use client';

/**
 * VehicleRatesEditor.tsx — Admin → Pricing. Edits one car's tariff; every
 * storefront page (fare results, fleet cards, route "from" prices, vehicle
 * pages, comparison table) reads these rates. Empty = "Price on request".
 *
 * Controlled: the Pricing panel owns the values and saves all cars at once.
 */

import type { Vehicle, VehicleRates } from '@/lib/types';

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
    hint: 'Fixed fare each way (a round trip counts as 2 legs)',
    fields: [{ key: 'airportFare', label: 'Fare each way', suffix: '₹', wide: true }],
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

/** Fields that count towards the "x of 7 rates set" meter (min km/day has a default). */
const COUNTED = ALL_FIELDS.filter((f) => f.key !== 'outstationMinKmPerDay').map((f) => f.key);

export const toInputs = (rates?: VehicleRates): RateInputs =>
  Object.fromEntries(ALL_FIELDS.map((f) => [f.key, rates?.[f.key] != null ? String(rates[f.key]) : ''])) as RateInputs;

export const ratesSetCount = (values: RateInputs) => COUNTED.filter((k) => values[k].trim() !== '').length;
export const RATES_TOTAL = COUNTED.length;

export function inputsToRates(values: RateInputs): VehicleRates {
  return Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, v.trim() === '' ? null : Number(v)])
  ) as unknown as VehicleRates;
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
        {GROUPS.map((group) => (
          <fieldset key={group.title} className="min-w-0">
            <legend className="text-[15px] font-extrabold text-ink">{group.title}</legend>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{group.hint}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {group.fields.map((f) => (
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
                      placeholder={f.key === 'outstationMinKmPerDay' ? '300' : 'On request'}
                      className="adm-field pr-14 font-mono tabular-nums"
                    />
                    {f.suffix && (
                      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                        {f.suffix}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <p className="border-t border-slate-100 bg-amber-50/60 px-4 py-3 text-[11px] font-semibold text-amber-800 sm:px-6">
        Tolls, parking &amp; permits are always paid by the customer.
      </p>
    </section>
  );
}

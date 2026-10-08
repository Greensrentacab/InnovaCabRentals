'use client';

/**
 * VehicleRatesEditor.tsx — Admin → Pricing. Edits one car's tariff; every
 * storefront page (fare results, fleet cards, route "from" prices, vehicle
 * pages, comparison table) reads these rates. Empty = "Price on request".
 */

import { useState } from 'react';
import { Save } from 'lucide-react';
import type { Vehicle, VehicleRates } from '@/lib/types';
import { updateVehicleRates } from '@/app/actions/admin';

type FieldKey = keyof VehicleRates;

const GROUPS: { title: string; hint: string; fields: { key: FieldKey; label: string; suffix?: string }[] }[] = [
  {
    title: 'Outstation (round trip)',
    hint: 'Fare = max(actual km, min km/day × days) × per-km + driver allowance × days',
    fields: [
      { key: 'outstationPerKm', label: 'Rate per km', suffix: '₹/km' },
      { key: 'outstationMinKmPerDay', label: 'Min km per day', suffix: 'km' },
      { key: 'driverAllowancePerDay', label: 'Driver allowance', suffix: '₹/day' },
    ],
  },
  {
    title: 'Airport transfer',
    hint: 'Fixed fare each way (Round = 2 legs)',
    fields: [{ key: 'airportFare', label: 'Fare each way', suffix: '₹' }],
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

const toInputs = (rates?: VehicleRates) =>
  Object.fromEntries(
    GROUPS.flatMap((g) => g.fields).map((f) => [f.key, rates?.[f.key] != null ? String(rates[f.key]) : ''])
  ) as Record<FieldKey, string>;

export default function VehicleRatesEditor({
  vehicle,
  onSaved,
}: {
  vehicle: Vehicle;
  onSaved: (message: string) => void;
}) {
  const [values, setValues] = useState<Record<FieldKey, string>>(() => toInputs(vehicle.rates));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const rates = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v.trim() === '' ? null : Number(v)])
    ) as unknown as VehicleRates;
    const res = await updateVehicleRates(vehicle.id, rates);
    setSaving(false);
    if (res.success) onSaved(`Prices updated for ${vehicle.name} — live across the website`);
    else setError(res.error || 'Could not save prices');
  };

  return (
    <form onSubmit={save} className="card-float p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight">{vehicle.name}</h3>
          <p className="text-xs text-slate-500">
            {vehicle.type} · {vehicle.seats} seats · {vehicle.luggage} bags
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
            vehicle.confirmed ? 'bg-live-500/15 text-live-600' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {vehicle.confirmed ? 'Live on website' : 'Hidden (unconfirmed)'}
        </span>
      </div>

      <div className="mt-4 space-y-5">
        {GROUPS.map((group) => (
          <fieldset key={group.title}>
            <legend className="text-sm font-extrabold">{group.title}</legend>
            <p className="text-[11px] text-slate-500">{group.hint}</p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {group.fields.map((f) => (
                <label key={f.key} className="block">
                  <span className="label">{f.label}</span>
                  <span className="relative block">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      inputMode="decimal"
                      value={values[f.key]}
                      onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                      placeholder={f.key === 'outstationMinKmPerDay' ? '300' : 'On request'}
                      className="field py-2.5 pr-14 font-mono tabular-nums"
                    />
                    {f.suffix && (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
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

      {error && <p className="mt-4 text-xs font-medium text-rose-600">{error}</p>}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-[11px] font-semibold text-amber-700">Tolls, parking &amp; permits are always paid by the customer.</p>
        <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 text-xs">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save prices'}
        </button>
      </div>
    </form>
  );
}

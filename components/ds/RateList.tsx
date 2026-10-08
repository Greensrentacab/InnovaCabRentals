/**
 * RateList.tsx — a car's admin-editable tariff (Admin → Pricing).
 * Null values render as "On request" (never invent prices).
 */

import type { VehicleRates } from '@/lib/types';
import { fareOrRequest } from '@/lib/storefrontData';
import { cn } from '@/lib/cn';

export const rateRows = (rates?: VehicleRates) => [
  { label: 'Outstation (round trip)', value: rates?.outstationPerKm ? `${fareOrRequest(rates.outstationPerKm)}/km` : 'On request' },
  { label: 'Min. km per day', value: `${rates?.outstationMinKmPerDay ?? 300} km` },
  { label: 'Driver allowance', value: rates?.driverAllowancePerDay ? `${fareOrRequest(rates.driverAllowancePerDay)}/day` : 'On request' },
  { label: 'Airport transfer', value: fareOrRequest(rates?.airportFare) },
  { label: 'Local 8 hr / 80 km', value: fareOrRequest(rates?.local8h) },
  { label: 'Local 12 hr / 120 km', value: fareOrRequest(rates?.local12h) },
  { label: 'Local custom duration', value: 'On request' },
];

export default function RateList({ rates, className }: { rates?: VehicleRates; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-slate-200/80', className)}>
      <dl className="divide-y divide-slate-100 text-sm">
        {rateRows(rates).map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 px-3 py-2">
            <dt className="text-slate-500">{row.label}</dt>
            <dd className="font-extrabold tabular-nums text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="border-t border-slate-100 px-3 py-2 text-[11px] font-semibold text-amber-700">
        Tolls, parking &amp; state permits paid by customer.
      </p>
    </div>
  );
}

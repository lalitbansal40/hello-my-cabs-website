import type { RoundtripFare } from '@/lib/api';
import { cityTitle } from '@/lib/slug';
import { Icon } from '../site/Icons';

/** "₹1,234" — grouped the Indian way. */
const money = (rupees: number) => `₹${Math.round(rupees).toLocaleString('en-IN')}`;

/** What a round trip's price includes — the km, the hours, and what comes on top. */
export interface RoundTripTermsData {
  includedKm: number;
  includedHours: number | null;
  extraHourRupees: number;
  minKmPerDay: number;
  nightCharge: number;
  days: number;
}

/**
 * The terms, read out of a round-trip fare. A backend from before 10 Oct 2026 sends no
 * `includedKm` or hours — the km billed is the same number, and no hours are then claimed.
 */
export function roundTripTerms(fare: RoundtripFare): RoundTripTermsData {
  return {
    includedKm: fare.includedKm ?? fare.billedKm,
    includedHours: fare.includedHours ?? null,
    extraHourRupees: fare.extraHourRupees ?? 0,
    minKmPerDay: fare.minKmPerDay,
    nightCharge: fare.nightCharge,
    days: fare.days ?? 1,
  };
}

/** A car's rate past the included km — or null when the backend does not send one. */
export function extraPerKmOf(fare: RoundtripFare, vehicleKey?: string): number | null {
  const v = fare.vehicles.find((x) => x.key === vehicleKey);
  if (!v) return null;
  return v.extraPerKm ?? v.perKm ?? null;
}

/**
 * The round trip's terms on the page before money is asked for (owner, 10 Oct 2026): the km
 * there and back that the price covers, the hours for a same-day return, what each km and
 * hour after them costs in the chosen car, the daily minimum, the night allowance, and that
 * toll, parking and state tax are on top. A one-way trip has none of this, and never shows it.
 */
export function RoundTripTerms({
  pickup,
  drop,
  fare,
  vehicleKey,
  vehicleLabel,
}: {
  pickup: string;
  drop: string;
  fare: RoundtripFare;
  vehicleKey?: string;
  vehicleLabel?: string;
}) {
  const t = roundTripTerms(fare);
  const perKm = extraPerKmOf(fare, vehicleKey);
  const car = vehicleLabel ?? fare.vehicles.find((v) => v.key === vehicleKey)?.label;
  const km = t.includedKm.toLocaleString('en-IN');
  const night = fare.vehicles.find((v) => v.key === vehicleKey)?.nightCharge ?? t.nightCharge;
  const after = fare.nightAfterHour ?? 22;
  const afterText = after === 0 ? 'midnight' : after === 12 ? 'noon' : after > 12 ? `${after - 12} pm` : `${after} am`;

  const lines = [
    `${cityTitle(pickup)} to ${cityTitle(drop)} and back — ${km} km included${
      t.days > 1 ? ` over ${t.days} days` : ''
    }`,
    t.includedHours ? `Up to ${t.includedHours} hours, the same day` : null,
    perKm ? `After ${km} km: ${money(perKm)} a km${car ? ` for the ${car}` : ''}` : null,
    t.includedHours && t.extraHourRupees > 0
      ? `After ${t.includedHours} hours: ${money(t.extraHourRupees)} an hour`
      : null,
    `Every day is billed at least ${t.minKmPerDay} km`,
    night > 0 ? `Night allowance ${money(night)} a night after ${afterText}` : null,
    'Toll, parking and state tax are extra, paid as they come',
  ].filter((l): l is string => Boolean(l));

  return (
    <section className="mb-8 rounded-2xl border border-line bg-surface-raised p-5">
      <h2 className="text-body font-bold text-ink">What the round trip includes</h2>
      <ul className="mt-3 space-y-2 text-small text-ink-soft">
        {lines.map((l) => (
          <li key={l} className="flex gap-2">
            <Icon.check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{l}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

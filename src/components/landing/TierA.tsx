import Link from 'next/link';
import type { RoundtripFare } from '@/lib/api';
import { cityTitle, routePath } from '@/lib/slug';
import { rupees } from '@/lib/seo';

/**
 * Two blocks for the routes that carry the most traffic, built only from what is true of
 * every booking: the fare is city to city, and a round trip is billed by the day.
 */

/**
 * Where in the pickup city the driver comes to. The fare is set city to city, so this is a
 * list of places — named because somebody in Vaishali Nagar searches for Vaishali Nagar —
 * not a price per area. Places with a route of their own (the airport, Noida) link to it,
 * because a booking for them is that route, not this one.
 */
export function PickupAreas({
  A,
  B,
  areas,
  ownRoutes,
}: {
  A: string;
  B: string;
  areas: ReadonlyArray<string>;
  /** Only the ones that are listed routes — the caller filters out held ones. */
  ownRoutes: ReadonlyArray<readonly [string, string]>;
}) {
  if (areas.length === 0) return null;
  const list =
    areas.length > 1 ? `${areas.slice(0, -1).join(', ')} and ${areas[areas.length - 1]}` : areas[0];
  return (
    <section className="pt-24">
      <h2 className="font-display text-balance text-h2">Picking up in {A}</h2>
      <p className="mt-6 max-w-measure text-pretty text-body text-muted">
        The driver comes to the address you give, anywhere in {A} — {list} included — and the fare
        to {B} is the same from all of them. Name the area and a landmark when you book; for a
        station or airport pickup, add the train or flight number.
      </p>
      {ownRoutes.length > 0 ? (
        <>
          <p className="mt-4 max-w-measure text-pretty text-body text-muted">
            These have a route and a fare of their own — book them as that:
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {ownRoutes.map(([p, d]) => (
              <li key={`${p}-${d}`}>
                <Link
                  href={routePath(p, d)}
                  className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface-raised px-4 text-small font-semibold hover:border-forest hover:text-forest"
                >
                  {cityTitle(p)} → {cityTitle(d)}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

/**
 * What a round trip costs when the car stays with you — one, two and three days, from the
 * fare API (`/fare/roundtrip?days=`). Every day is billed at the daily minimum or the
 * distance there and back, whichever is more, so a stay costs more than a day out — and the
 * booking form prices whatever dates are given.
 */
export function MultiDayRoundTrip({
  A,
  B,
  byDays,
}: {
  A: string;
  B: string;
  /** [days, fare] for the same vehicle, 1 → 3. */
  byDays: ReadonlyArray<{ days: number; fare: RoundtripFare }>;
}) {
  const rows = byDays.flatMap(({ days, fare }) => {
    const cheapest = [...fare.vehicles].sort((a, b) => a.fare - b.fare)[0];
    return cheapest
      ? [{ days, billedKm: fare.billedKm, label: cheapest.label, rupees: cheapest.fare }]
      : [];
  });
  if (rows.length < 2) return null;
  const min = byDays[0]?.fare.minKmPerDay;
  const label = rows[0].label;
  return (
    <section className="pt-24">
      <h2 className="font-display text-balance text-h2">Staying a few days?</h2>
      <p className="mt-6 max-w-measure text-pretty text-body text-muted">
        A round trip keeps the car and driver with you, and each day it is out is billed at least{' '}
        {min} km, or the distance there and back if that is more. In a {label}, {A} to {B} and back:
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {rows.map((r) => (
          <div key={r.days} className="rounded-2xl border border-line bg-surface-raised px-5 py-4">
            <p className="text-small text-muted">
              {r.days === 1 ? 'Back the same day' : `${r.days} days`}
            </p>
            <p className="font-display mt-1 text-title font-black">{rupees(r.rupees)}</p>
            <p className="mt-0.5 text-small text-faint">{r.billedKm} km billed</p>
          </div>
        ))}
      </div>
      {rows[1] && rows[1].rupees === rows[0].rupees ? (
        <p className="mt-6 max-w-measure text-pretty text-body text-muted">
          Two days cost the same as one here: the distance there and back, {rows[0].billedKm} km, is
          already more than two days of the minimum, so staying the night adds only the night
          allowance.
        </p>
      ) : null}
      <p className="mt-6 max-w-measure text-pretty text-body text-muted">
        Put your return date into the booking form and it prices your exact dates the same way. A
        night allowance applies for nights the driver is out, and toll and parking are paid as they
        arise.
      </p>
    </section>
  );
}

import Link from 'next/link';
import type { OnewayFare, RoundtripFare, Vehicle } from '@/lib/api';
import { rupees } from '@/lib/seo';
import { Icon } from '../site/Icons';

/**
 * The parts of a route page that are about THIS route.
 *
 * A route page and its reverse used to be 97% the same text — the same sentences with two
 * city names swapped — and two routes out of the same city were 76% alike. That is the
 * shape search engines call a doorway page, and it is also just a worse page: somebody
 * comparing Jaipur → Delhi with Jaipur → Agra learned nothing from the difference.
 *
 * Everything below is worked out from the fares and distances the page already fetches, so
 * it is different wherever the journey is different, and it is never invented. No block
 * renders without the numbers behind it.
 */

/** Effective rate, for the cheapest vehicle — the figure people actually compare on. */
export function perKm(rupeesTotal: number, km: number) {
  return Math.round((rupeesTotal / km) * 10) / 10;
}

/**
 * Which car, for how many people — answered with the price and what that is each.
 *
 * The fare table lists eight vehicles by name. This is the question the table does not
 * answer: six of us are going, what does that cost, and is a bigger car actually dearer
 * per person.
 */
export function WhichVehicle({
  oneway,
  vehicles,
  A,
  B,
}: {
  oneway: OnewayFare | null;
  vehicles: Vehicle[];
  A: string;
  B: string;
}) {
  if (!oneway) return null;

  const priced = vehicles
    .map((v) => {
      const row = oneway.vehicles.find((x) => x.key === v.key);
      const price = row ? (row.total ?? row.fare) : null;
      return price && v.seats ? { label: v.label, seats: v.seats, price } : null;
    })
    .filter((x): x is { label: string; seats: number; price: number } => x !== null)
    .sort((a, b) => a.seats - b.seats || a.price - b.price);

  if (priced.length === 0) return null;

  // Group sizes people actually travel in, and the cheapest car that seats them.
  const groups = [2, 4, 6, 12].flatMap((people) => {
    const fit = priced.filter((v) => v.seats >= people).sort((a, b) => a.price - b.price)[0];
    return fit ? [{ people, ...fit }] : [];
  });
  // One row per vehicle, not one per group size: a hatchback that wins at both 2 and 4
  // should be said once.
  const rows = groups.filter(
    (g, i) => i === 0 || g.label !== groups[i - 1].label || g.price !== groups[i - 1].price,
  );

  return (
    <section className="pt-24">
      <h2 className="font-display text-balance text-h2">Which cab for how many people</h2>
      <p className="mt-5 max-w-measure text-pretty text-body text-muted">
        The cheapest vehicle that seats your group, {A} to {B}, one way. The figure in brackets is
        what it works out at per person — a bigger car is often less per head than two small ones.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {rows.map((g) => (
          <li
            key={`${g.people}-${g.label}`}
            className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface-raised px-5 py-4"
          >
            <span className="min-w-0">
              <span className="block text-body font-bold">
                {g.people} {g.people === 1 ? 'person' : 'people'}
              </span>
              <span className="mt-0.5 block text-small text-muted">
                {g.label} · {g.seats} seats
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="font-display block text-title font-black">{rupees(g.price)}</span>
              <span className="mt-0.5 block text-small text-muted">
                {rupees(Math.round(g.price / g.people))} each
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * One way or round trip, in money, for this route.
 *
 * Every cab site says a round trip is "better value". Nobody shows the subtraction. Both
 * figures are on this page already; the only thing missing was doing the arithmetic in
 * front of the reader — and the answer is genuinely different on every route, because the
 * round-trip minimum per day bites differently over 131 km than over 807.
 */
export function OneWayVsRound({
  oneway,
  roundtrip,
  vehicles,
  A,
  B,
}: {
  oneway: OnewayFare | null;
  roundtrip: RoundtripFare | null;
  vehicles: Vehicle[];
  A: string;
  B: string;
}) {
  if (!oneway || !roundtrip) return null;

  // The same vehicle on both sides, or the comparison means nothing.
  const both = vehicles.flatMap((v) => {
    const ow = oneway.vehicles.find((x) => x.key === v.key);
    const rt = roundtrip.vehicles.find((x) => x.key === v.key);
    if (!ow || !rt) return [];
    const one = ow.total ?? ow.fare;
    if (!one || !rt.fare) return [];
    return [{ label: v.label, one, round: rt.fare }];
  });
  if (both.length === 0) return null;

  const pick = both.sort((a, b) => a.one - b.one)[0];
  const twoSingles = pick.one * 2;
  const diff = pick.round - twoSingles;

  return (
    <section className="pt-24">
      <h2 className="font-display text-balance text-h2">One way, or there and back?</h2>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          [`${A} → ${B}`, rupees(pick.one), 'one way'],
          ['Both legs booked separately', rupees(twoSingles), 'two one-way fares'],
          ['Booked as a round trip', rupees(pick.round), 'one booking'],
        ].map(([label, figure, note]) => (
          <div key={label} className="rounded-2xl border border-line bg-surface-raised px-5 py-4">
            <p className="text-small text-muted">{label}</p>
            <p className="font-display mt-1 text-title font-black">{figure}</p>
            <p className="mt-0.5 text-small text-faint">{note}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 max-w-measure text-pretty text-body text-muted">
        {diff === 0
          ? `In a ${pick.label}, the two come to the same figure on this route — book whichever suits the trip.`
          : diff < 0
            ? `In a ${pick.label}, the round trip is ${rupees(Math.abs(diff))} less than two separate one-way fares on this route, because the return leg is priced for the whole journey rather than as a fresh trip.`
            : `In a ${pick.label}, two separate one-way fares come to ${rupees(diff)} less than the round trip on this route — a round trip is billed on a daily minimum, and over ${roundtrip.distanceKm ?? ''} km that floor is the larger number. Book one way if you are not coming straight back.`}
      </p>
    </section>
  );
}

/** "Coming back?" — the reverse journey, with its own price, which is often not the same. */
export function ReverseRoute({
  A,
  B,
  href,
  fromRupees,
  sameAsOutbound,
}: {
  A: string;
  B: string;
  href: string;
  fromRupees: number | null;
  sameAsOutbound: boolean;
}) {
  return (
    <section className="pt-24">
      <div className="rounded-[1.75rem] border border-line bg-surface-alt px-6 py-7 sm:px-8">
        <h2 className="font-display text-balance text-h3">Going the other way?</h2>
        <p className="mt-3 max-w-measure text-pretty text-body text-muted">
          {fromRupees
            ? sameAsOutbound
              ? `${B} to ${A} is priced the same, from ${rupees(fromRupees)} one way.`
              : `${B} to ${A} is a separate journey with its own price — from ${rupees(fromRupees)} one way.`
            : `${B} to ${A} is priced as its own journey.`}
        </p>
        <Link
          href={href}
          className="group mt-5 inline-flex min-h-11 items-center gap-2 text-body font-bold text-forest hover:text-accent"
        >
          {B} to {A} fares
          <Icon.arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

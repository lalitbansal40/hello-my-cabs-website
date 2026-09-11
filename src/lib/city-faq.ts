import type { LocalPackage, RouteSummary, Vehicle } from './api';
import { cityTitle } from './slug';
import { rupees } from './seo';

/**
 * The questions a city page answers, built from that city's own figures.
 *
 * The old set was four questions whose answers did not change from city to city — the same
 * "choose where you are going, pick a vehicle" on all ten pages. Every answer here carries
 * numbers that belong to this city: its cheapest route and the distance to it, its longest,
 * what it costs to come the other way, the hourly packages, the states its routes reach.
 *
 * The same rules as the route questions: an answer is only given where it is true of this
 * city, and a policy is only stated the way the policy is printed elsewhere on the site —
 * tolls, parking and state tax paid as they arise, a night allowance after 10 pm.
 */

type Q = { q: string; a: string };

export function buildCityFaq({
  label,
  state,
  fromHere,
  toHere,
  packages,
  vehicles,
  nightCharge,
  stateOf,
  airport,
}: {
  label: string;
  state?: string | null;
  fromHere: RouteSummary[];
  toHere: RouteSummary[];
  packages: LocalPackage[];
  vehicles: Vehicle[];
  /** From a real round-trip fare out of this city; absent if that call failed. */
  nightCharge?: number;
  /** City key → state name, for "do you go outside the state". */
  stateOf: (key: string) => string | undefined;
  airport: boolean;
}): Q[] {
  const out: Q[] = [];
  const A = label;

  const priced = fromHere.filter((r) => typeof r.fromRupees === 'number' && r.fromRupees > 0);
  const cheapest = [...priced].sort((x, y) => (x.fromRupees ?? 0) - (y.fromRupees ?? 0))[0];
  const withKm = priced.filter((r) => typeof r.distanceKm === 'number');
  const longest = [...withKm].sort((x, y) => (y.distanceKm ?? 0) - (x.distanceKm ?? 0))[0];
  const inbound = toHere
    .filter((r) => typeof r.fromRupees === 'number' && r.fromRupees > 0)
    .sort((x, y) => (x.fromRupees ?? 0) - (y.fromRupees ?? 0))[0];

  // ── What does it cost ──────────────────────────────────────────────────────
  if (cheapest) {
    out.push({
      q: airport ? `How much is a taxi from ${A}?` : `How much is a cab from ${A}?`,
      a: `The lowest published fare out of ${A} is ${rupees(cheapest.fromRupees ?? 0)}, for ${cityTitle(
        cheapest.drop,
      )}${cheapest.distanceKm ? ` — ${cheapest.distanceKm} km away` : ''}, one way in the smallest car. Every route here is priced for the whole journey with the driver, fuel and GST in it; toll, parking and state tax are paid as they arise.`,
    });
  }

  if (priced.length > 0) {
    const named = [...priced]
      .sort((x, y) => (x.distanceKm ?? 0) - (y.distanceKm ?? 0))
      .slice(0, 3)
      .map((r) => `${cityTitle(r.drop)} (${rupees(r.fromRupees ?? 0)})`);
    out.push({
      q: `Which routes from ${A} have a fixed fare?`,
      a: `${priced.length} routes out of ${A} carry a fare published on this site, among them ${named.join(
        ', ',
      )}. The number shown is the number you pay for the journey — it does not move with the hour or the traffic.`,
    });
  }

  if (longest) {
    out.push({
      q: `How far can I go from ${A}?`,
      a: `The longest run we price from ${A} is ${cityTitle(longest.drop)}, ${longest.distanceKm} km, from ${rupees(
        longest.fromRupees ?? 0,
      )} one way. Beyond the published routes, other journeys are quoted on distance when you ask for them.`,
    });
  }

  if (inbound) {
    out.push({
      q: airport ? `What does a taxi to ${A} cost?` : `What does a cab to ${A} cost?`,
      a: `Coming the other way, the lowest published fare into ${A} is ${rupees(
        inbound.fromRupees ?? 0,
      )}, from ${cityTitle(inbound.pickup)}. A journey and its reverse are priced separately, so the two are not always the same figure.`,
    });
  }

  // ── By the hour ────────────────────────────────────────────────────────────
  const byPrice = [...packages].sort((x, y) => x.baseFareRupees - y.baseFareRupees);
  const small = byPrice[0];
  const large = byPrice[byPrice.length - 1];
  if (small) {
    const ten = small.examples.find((e) => e.hours === 10)?.fareRupees;
    out.push({
      q: airport
        ? `Can I hire a car by the hour from ${A}?`
        : `Can I hire a car by the hour in ${A}?`,
      a: `Yes. The package is ${small.includedHours} hours and ${small.includedKm} km, from ${rupees(
        small.baseFareRupees,
      )} in a ${small.label.toLowerCase()}${
        large && large !== small
          ? ` up to ${rupees(large.baseFareRupees)} in ${/^[aeiou]/i.test(large.label) ? 'an' : 'a'} ${large.label}`
          : ''
      }. Each extra hour is ${rupees(small.extraPerHour)} in the smallest car${
        ten ? `, so ten hours comes to ${rupees(ten)}` : ''
      }. ${airport ? 'Useful when a meeting or a family visit starts straight from the flight.' : 'It suits a wedding, a day of errands, or seeing the city without planning a route.'}`,
    });
  }

  // ── Which car ──────────────────────────────────────────────────────────────
  const seated = vehicles.filter((v) => v.seats);
  if (seated.length > 0) {
    const bySeats = [...seated].sort((x, y) => (x.seats ?? 0) - (y.seats ?? 0));
    const smallest = bySeats[0];
    const biggest = bySeats[bySeats.length - 1];
    const rented = vehicles.filter((v) => v.tripTypes.length === 1).length;
    out.push({
      q: airport ? `Which vehicles can I book at ${A}?` : `Which vehicles can I book in ${A}?`,
      a: `${vehicles.length} types, from ${
        /^[aeiou]/i.test(smallest.label) ? 'an' : 'a'
      } ${smallest.label} for ${smallest.seats} to ${
        /^[aeiou]/i.test(biggest.label) ? 'an' : 'a'
      } ${biggest.label} for ${biggest.seats}.${
        rented > 0
          ? ` The ${rented} largest run on round trips only — sending one out empty for the return would cost more than the trip is worth to you.`
          : ''
      }`,
    });
  }

  // ── Where to ───────────────────────────────────────────────────────────────
  const states = [
    ...new Set(fromHere.map((r) => stateOf(r.drop)).filter((s): s is string => Boolean(s))),
  ];
  const elsewhere = states.filter((s) => s !== state);
  if (state && elsewhere.length > 0) {
    out.push({
      q: `Do cabs from ${A} go outside ${state}?`,
      a: `Yes — routes from ${A} run into ${elsewhere.join(', ')}. Crossing a state border adds that state's entry tax, which is paid at the border as it arises rather than being built into the fare.`,
    });
  }

  // ── What else ──────────────────────────────────────────────────────────────
  if (nightCharge) {
    out.push({
      q: airport
        ? 'Is there a night charge on an airport run?'
        : `Is there a night charge in ${A}?`,
      a: `A night allowance of ${rupees(
        nightCharge,
      )} applies after 10 pm, and it is listed with the fare before you book rather than added at the end.`,
    });
  }

  // ── Airport only ───────────────────────────────────────────────────────────
  if (airport) {
    out.push({
      q: 'Which terminal will the driver come to?',
      a: 'The one you give us. Terminals are far enough apart that the wrong one costs real time, and airlines move between them — check the terminal on your ticket and send it with the flight number when you book.',
    });
    out.push({
      q: 'What if my flight is late?',
      a: 'Tell us as soon as you know. A pickup is planned around when you land, so the driver needs to hear if that moves.',
    });
    out.push({
      q: 'Is airport parking included?',
      a: 'No. Airport parking is paid as it arises, the same as tolls — it belongs to the airport rather than to the fare.',
    });
  }

  // ── Booking ────────────────────────────────────────────────────────────────
  out.push({
    q: airport
      ? `How early should I book an airport taxi?`
      : `How early should I book a cab in ${A}?`,
    a: airport
      ? 'As soon as the flight is booked. For a departure, work back from the check-in time and allow for the queue at the terminal door; for an arrival, book before you fly so the pickup is planned around the landing.'
      : 'At least two hours before pickup on a normal day. For an early-morning start, book the night before so the driver can plan the run; on a festival weekend, earlier again.',
  });

  out.push({
    q: 'Do I have to pay when I book?',
    a: 'No. You can pay the driver in cash at the end of the trip, and a cash booking costs nothing to cancel before the trip starts.',
  });

  return out;
}

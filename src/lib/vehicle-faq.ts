import type { LocalPackage, Vehicle } from './api';
import { rupees } from './seo';

/**
 * The questions a vehicle page answers, built from that vehicle's own figures.
 *
 * The old set was three questions, and one of them promised something nobody had agreed to:
 * "tell us and we will send a vehicle with a carrier". The rest were the same on all eight
 * pages. Every answer here is either this vehicle's number — its seats, its fare range, its
 * per-km rate, its package — or the site's policy stated the way it is printed elsewhere.
 *
 * The per-km, hill and night-halt questions exist only for the vehicles the API sends those
 * figures for, which are the four rented ones. For the four cars the API does not send a
 * per-km rate, and a page that quoted one anyway would be quoting a number it made up.
 */

type Q = { q: string; a: string };

const an = (label: string) => (/^[aeiou]/i.test(label) ? `an ${label}` : `a ${label}`);

export function buildVehicleFaq({
  v,
  roundOnly,
  routeFares,
  neighbour,
  pkg,
  luggage,
  roundTrip,
}: {
  v: Vehicle;
  roundOnly: boolean;
  /** This vehicle's fare on each route the page prices, cheapest first. */
  routeFares: Array<{ from: string; to: string; rupees: number }>;
  /** The next size up (or down), on one shared route, for the comparison question. */
  neighbour?: {
    label: string;
    seats: number;
    rupees: number;
    ownRupees: number;
    route: string;
  };
  /** The hourly package for this vehicle, if it has one. */
  pkg?: LocalPackage;
  /** Bags that fit, once somebody has measured it — never guessed. */
  luggage?: string;
  /** For a car: the benchmark route there and back, with its one-way figure. */
  roundTrip?: { route: string; rupees: number; oneWay?: number };
}): Q[] {
  const out: Q[] = [];
  const low = routeFares[0];
  const high = routeFares[routeFares.length - 1];

  if (v.seats) {
    out.push({
      q: `How many people fit in ${an(v.label)}?`,
      a: `${v.seats} passengers, plus the driver.${
        luggage ? ` ${luggage}` : ''
      } If your group is at the limit and carrying a lot, book the next size up — it is usually less per head than you expect.`,
    });
  }

  if (low && high) {
    out.push({
      q: `What does ${an(v.label)} cost?`,
      a:
        low.rupees === high.rupees
          ? `${rupees(low.rupees)} on ${low.from} to ${low.to}, ${roundOnly ? 'round trip' : 'one way'}.`
          : `On our published routes it runs from ${rupees(low.rupees)} (${low.from} to ${low.to}) to ${rupees(
              high.rupees,
            )} (${high.from} to ${high.to}), ${roundOnly ? 'round trip' : 'one way'}. The fare is fixed for the journey, with the driver and fuel in it; toll, parking and state tax are paid as they arise.`,
    });
  }

  if (v.perKm) {
    out.push({
      q: `What is the per-kilometre rate for ${an(v.label)}?`,
      a: `₹${v.perKm} a km on the plains, charged for the whole journey out and back. There is a minimum distance billed per day, which is what lets the driver take a long return leg without it being priced as two separate trips.`,
    });
  }

  if (v.hillPerKm) {
    out.push({
      q: `Is it dearer on hill routes?`,
      a: `Yes — ₹${v.hillPerKm} a km where the route climbs, against ₹${v.perKm ?? '—'} on the plains. Hill driving is slower, harder on a vehicle this size and uses more fuel, so it is priced in rather than added afterwards.`,
    });
  }

  if (v.nightCharge) {
    out.push({
      q: `Is there a night halt charge?`,
      a: `${rupees(v.nightCharge)} for each night the trip keeps the driver and vehicle out. It is shown before you book.`,
    });
  }

  out.push(
    roundOnly
      ? {
          q: `Can I book ${an(v.label)} one way?`,
          a: `No — it runs on round trips only. On a one-way booking the vehicle would come back empty, and pricing that honestly costs more than the trip is worth to you, so we do not offer it rather than quote a number nobody wants.`,
        }
      : {
          q: `Can I book ${an(v.label)} one way?`,
          a: `Yes — one way, round trip, or by the hour. On a one-way trip you pay for the distance you travel${
            low
              ? `; the shortest we publish is ${low.from} to ${low.to} at ${rupees(low.rupees)}`
              : ''
          }.`,
        },
  );

  if (roundTrip) {
    const two = roundTrip.oneWay ? roundTrip.oneWay * 2 : null;
    out.push({
      q: `What does a round trip in ${an(v.label)} cost?`,
      a: `On ${roundTrip.route}, ${rupees(roundTrip.rupees)} there and back${
        two
          ? two > roundTrip.rupees
            ? ` — ${rupees(two - roundTrip.rupees)} less than two one-way fares (${rupees(two)})`
            : two < roundTrip.rupees
              ? `, against ${rupees(two)} for two separate one-way fares, because a round trip bills a minimum distance per day`
              : ', the same as two one-way fares'
          : ''
      }. The return leg is priced as part of one journey, with the same driver.`,
    });
  }

  if (neighbour) {
    const mine = Math.round(neighbour.ownRupees / (v.seats ?? 1));
    const theirs = Math.round(neighbour.rupees / neighbour.seats);
    out.push({
      q: `${v.label} or ${neighbour.label}?`,
      a: `On ${neighbour.route}, ${an(v.label)} is ${rupees(neighbour.ownRupees)}${
        v.seats ? ` (${rupees(mine)} a seat)` : ''
      } and ${an(neighbour.label)} is ${rupees(neighbour.rupees)} (${rupees(theirs)} a seat, ${
        neighbour.seats
      } seats). ${
        theirs < mine
          ? `If you can fill it, the ${neighbour.label} is less per person.`
          : `The ${v.label} is less per person, so it is the better value unless you need the extra room.`
      }`,
    });
  }

  if (pkg) {
    const ten = pkg.examples.find((e) => e.hours === 10)?.fareRupees;
    out.push({
      q: `Can I hire ${an(v.label)} by the hour?`,
      a: `Yes — ${pkg.includedHours} hours and ${pkg.includedKm} km for ${rupees(pkg.baseFareRupees)}, then ${rupees(
        pkg.extraPerHour,
      )} for each extra hour${ten ? `, so a ten-hour day is ${rupees(ten)}` : ''}.`,
    });
  } else if (roundOnly) {
    out.push({
      q: `Can I hire ${an(v.label)} by the hour?`,
      a: `Not on an hourly package — it is booked as a round trip, priced by the kilometre. For a day around one city, a car on an hourly package is usually the better fit.`,
    });
  }

  if (routeFares.length > 0) {
    out.push({
      q: `Which routes can I book ${an(v.label)} on?`,
      a: `It is priced on every published route${
        roundOnly ? ' as a round trip' : ''
      } — among them ${routeFares
        .slice(0, 3)
        .map((r) => `${r.from} to ${r.to}`)
        .join(', ')}. Journeys off the list are quoted on distance when you ask.`,
    });
  }

  out.push({
    q: 'What does the fare include?',
    a: 'The vehicle, the driver and the fuel, with GST. Toll, parking and state entry tax are paid as they arise, and a night allowance applies after 10 pm.',
  });

  return out;
}

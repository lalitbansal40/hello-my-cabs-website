import type { OnewayFare, RoundtripFare, Vehicle } from './api';
import type { RouteContent } from '../content/routes';
import { hoursFor, rupees } from './seo';

/**
 * The questions a route page answers, built from that route's own figures.
 *
 * The old set was five questions whose answers were the same sentences on all ninety pages
 * with two city names swapped — which is both the duplication search engines punish and a
 * page that answers nothing. Every answer here contains numbers that belong to this
 * journey: its fares, its distance, its night charge, its daily minimum.
 *
 * Questions appear only when their answer is true of this route. A hill question on a flat
 * route, or an airport question on a route with no airport surcharge, would be filler —
 * and filler is what makes ninety pages look like one page.
 *
 * Ordered the way somebody asks them: what does it cost, how long, which car, what else
 * might I be charged, how do I book.
 */

export interface RouteFaqInput {
  A: string;
  B: string;
  km?: number;
  oneway: OnewayFare | null;
  roundtrip: RoundtripFare | null;
  vehicles: Vehicle[];
  /** Anything hand-written for this route, appended at the end. */
  extra?: ReadonlyArray<{ q: string; a: string }>;
  /**
   * What approved drivers agree on about the road (content/routes/driver.generated.ts). The
   * road questions below exist only when this does — never answered from a map or a guess.
   */
  driver?: RouteContent['driver'];
  /** The state each end is in, from the city catalogue — for the answers that turn on it. */
  states?: { from?: string | null; to?: string | null };
  /**
   * What people search for about this route (content/queries.json). Each kind of search
   * below adds its question only when it really occurs for this route — the busiest routes
   * get the questions their searchers ask, and no route gets one nobody asked.
   */
  queries?: ReadonlyArray<string>;
}

type Q = { q: string; a: string };

export function buildRouteFaq({
  A,
  B,
  km,
  oneway,
  roundtrip,
  vehicles,
  extra = [],
  driver,
  states,
  queries = [],
}: RouteFaqInput): Q[] {
  const out: Q[] = [];
  // Whether the road leaves the state — the one fact that changes what "state entry tax"
  // means on this route, and a sentence each answer can carry that is true of this route only.
  const fromState = states?.from || null;
  const toState = states?.to || null;
  const crossesState = Boolean(fromState && toState && fromState !== toState);

  const priced = vehicles.flatMap((v) => {
    const ow = oneway?.vehicles.find((x) => x.key === v.key);
    const rt = roundtrip?.vehicles.find((x) => x.key === v.key);
    const one = ow ? (ow.total ?? ow.fare) : null;
    return [{ label: v.label, seats: v.seats, one, round: rt?.fare ?? null }];
  });
  const withOne = priced.filter((p): p is typeof p & { one: number } => Boolean(p.one));
  const cheapest = withOne.sort((a, b) => a.one - b.one)[0];
  const biggest = priced
    .filter((p) => p.seats && (p.one || p.round))
    .sort((a, b) => (b.seats ?? 0) - (a.seats ?? 0))[0];

  // ── What does it cost ──────────────────────────────────────────────────────
  if (cheapest) {
    out.push({
      q: `How much does a taxi from ${A} to ${B} cost?`,
      a: `A ${A} to ${B} taxi starts at ${rupees(cheapest.one)} one way in ${
        cheapest.label === 'Hatchback' ? 'a hatchback' : `a ${cheapest.label}`
      }${km ? `, for the full ${km} km` : ''}, with the driver and fuel in it, plus 5% GST.`,
    });
  }

  const sedan = withOne.find((p) => p.label === 'Dzire') ?? withOne[1];
  const suv =
    withOne.find((p) => p.label === 'Innova Crysta') ?? withOne.find((p) => (p.seats ?? 0) >= 6);
  if (sedan && suv && sedan.label !== suv.label) {
    out.push({
      q: `What is the fare for a sedan or an SUV from ${A} to ${B}?`,
      a: `A ${sedan.label} is ${rupees(sedan.one)} one way and ${
        suv.label === 'Innova Crysta' ? 'an Innova Crysta' : `a ${suv.label}`
      } is ${rupees(suv.one)}. The difference is ${rupees(
        Math.abs(suv.one - sedan.one),
      )} for the journey.`,
    });
  }

  if (km && cheapest) {
    out.push({
      q: `What is the per-kilometre rate from ${A} to ${B}?`,
      a: `The lowest one-way fare works out at about ₹${
        Math.round((cheapest.one / km) * 10) / 10
      } a kilometre over ${km} km.`,
    });
  }

  // ── How long ───────────────────────────────────────────────────────────────
  if (km) {
    out.push({
      q: `How long does the ${A} to ${B} drive take?`,
      a: `About ${km} km, which is ${hoursFor(
        km,
      )} of driving depending on traffic and how many stops you make.${
        crossesState
          ? ` The road runs from ${fromState} into ${toState}, and the state border is part of that time.`
          : fromState
            ? ` It is a run within ${fromState}, with no state border to cross.`
            : ''
      }`,
    });
    if (km >= 500) {
      out.push({
        q: `Is ${A} to ${B} too far for one day?`,
        a: `At ${km} km it is a long day — ${hoursFor(
          km,
        )} at the wheel before any stops. Most people leave early and break the journey once. If you would rather split it over two days, tell us when you book and the driver plans the run around it.`,
      });
    }
    if (km <= 150) {
      out.push({
        q: `Is there a minimum fare for a short trip like ${A} to ${B}?`,
        a: `The fare you see is the fare — ${
          cheapest ? `${rupees(cheapest.one)} one way` : 'fixed'
        } over ${km} km. On a short run the driver's return still has to be covered, which is why a ${km} km trip is not simply the per-km rate multiplied out.`,
      });
    }
  }

  // ── The road — only from what drivers told us ──────────────────────────────
  if (driver?.stops?.length) {
    const named = driver.stops
      .slice(0, 3)
      .map((s) => `${s.name}${s.aboutKm ? ` (about ${s.aboutKm} km from ${A})` : ''}`);
    const list =
      named.length > 1
        ? `${named.slice(0, -1).join(', ')} and ${named[named.length - 1]}`
        : named[0];
    out.push({
      q: `Where do people stop to eat between ${A} and ${B}?`,
      a: `Drivers who run this route stop at ${list}.`,
    });
  }
  if (driver?.tolls?.count) {
    out.push({
      q: `How many tolls are there between ${A} and ${B}?`,
      a: `Drivers on this route count about ${driver.tolls.count} toll plazas${
        driver.tolls.approxRupees
          ? `, around ${rupees(driver.tolls.approxRupees)} in all for a car`
          : ''
      }. Tolls are not part of the fare — they are paid as they come.`,
    });
  }
  if (driver?.bestTime) {
    out.push({
      q: `When is the best time to leave for ${B}?`,
      a: driver.bestTime,
    });
  }

  // ── Which car ──────────────────────────────────────────────────────────────
  if (biggest?.seats && (biggest.one || biggest.round)) {
    out.push({
      q: `Which vehicle should I book from ${A} to ${B} for a group?`,
      a: `The largest we run on this route is ${
        /^[aeiou]/i.test(biggest.label) ? 'an' : 'a'
      } ${biggest.label}, which seats ${biggest.seats}${
        biggest.one
          ? ` at ${rupees(biggest.one)} one way`
          : biggest.round
            ? ` at ${rupees(biggest.round)} for the round trip`
            : ''
      }.${(() => {
        const six = withOne.filter((p) => (p.seats ?? 0) >= 6).sort((a, b) => a.one - b.one)[0];
        return six
          ? ` For six, ${/^[aeiou]/i.test(six.label) ? 'an' : 'a'} ${six.label} is ${rupees(six.one)} one way.`
          : '';
      })()}`,
    });
  }

  const roundOnlyLabels = vehicles
    .filter((v) => v.tripTypes.length === 1 && roundtrip?.vehicles.some((x) => x.key === v.key))
    .map((v) => v.label);
  if (roundOnlyLabels.length > 0) {
    out.push({
      q: `Can I book a tempo traveller one way from ${A} to ${B}?`,
      a: `No — ${roundOnlyLabels
        .slice(0, 2)
        .join(
          ' and ',
        )} run on round trips only.${(() => {
        const tt = vehicles
          .filter((v) => v.tripTypes.length === 1)
          .map((v) => ({ v, fare: roundtrip?.vehicles.find((x) => x.key === v.key)?.fare }))
          .filter((x): x is { v: Vehicle; fare: number } => Boolean(x.fare))
          .sort((a, b) => a.fare - b.fare)[0];
        return tt
          ? ` The ${tt.v.label} is ${rupees(tt.fare)} for the ${A} to ${B} round trip.`
          : '';
      })()}`,
    });
  }

  // ── One way or round trip ──────────────────────────────────────────────────
  if (cheapest && roundtrip) {
    const rt = priced.find((p) => p.label === cheapest.label)?.round;
    if (rt) {
      const diff = rt - cheapest.one * 2;
      out.push({
        q: `Is a round trip cheaper than two one-way fares from ${A} to ${B}?`,
        a:
          diff < 0
            ? `Yes. In ${
                cheapest.label === 'Hatchback' ? 'a hatchback' : `a ${cheapest.label}`
              }, the round trip is ${rupees(rt)} against ${rupees(
                cheapest.one * 2,
              )} for two separate one-way fares — ${rupees(
                Math.abs(diff),
              )} less, because the return leg is priced as part of one journey.`
            : diff === 0
              ? `They come to the same figure on this route: ${rupees(
                  rt,
                )} either way in ${cheapest.label}. Book whichever suits your plans.`
              : `Not on this route. Two one-way fares come to ${rupees(
                  cheapest.one * 2,
                )} against ${rupees(
                  rt,
                )} for the round trip, because a round trip bills a minimum number of kilometres per day. If you are not coming straight back, book one way.`,
      });
    }
  }

  if (roundtrip?.minKmPerDay) {
    out.push({
      q: `How is a round trip to ${B} billed?`,
      // The rule itself is on /fares-explained#round-trip; the answer is this route's figure.
      a: roundtrip.billedKm
        ? `A same-day return to ${B} is billed as ${roundtrip.billedKm} km — the whole journey out and back, with a floor of ${roundtrip.minKmPerDay} km a day.`
        : `By the kilometre for the whole journey, out and back, with a floor of ${roundtrip.minKmPerDay} km a day.`,
    });
  }

  // ── What else might I be charged ───────────────────────────────────────────
  // The night charge is the same on every route: it lives on /fares-explained#night, linked
  // under the questions (20 Nov 2026 — a question repeated word for word on 140 pages made
  // them read as one page to a search engine).
  if (oneway?.airportSurcharge) {
    out.push({
      q: `Is there an airport charge on this route?`,
      a: `${rupees(
        oneway.airportSurcharge,
      )} applies on this route as an airport surcharge, and the one-way fares on this page already include it. Parking is separate and paid as it arises.`,
    });
  }

  if (roundtrip?.hill) {
    out.push({
      q: `Why does the ${A} to ${B} route cost more per kilometre?`,
      a: `Part of this route is hill driving. It is slower, harder on the vehicle and uses more fuel, so it is priced into the fare rather than added afterwards.`,
    });
  }

  // Toll and parking are the same rule everywhere (/fares-explained#tolls). Asked here only
  // where the answer is this route's own: the road crosses a state line.
  if (crossesState) {
    out.push({
      q: `Is there a state entry tax from ${A} to ${B}?`,
      a: `Yes, where the road crosses from ${fromState} into ${toState} — paid at the border as it arises, like toll and parking. ${
        cheapest
          ? `The ${rupees(cheapest.one)} fare covers what is ours — the car, the driver and the fuel; 5% GST is added on top.`
          : 'The fare covers what is ours — the car, the driver and the fuel; 5% GST is added on top.'
      }`,
    });
  }

  // ── Booking ────────────────────────────────────────────────────────────────
  // The advance, when to book, adding a stop and cancelling are one rule for every route —
  // on /fares-explained (#advance, #booking, #stops, #cancelling), linked under the questions
  // on the route page (20 Nov 2026).

  // ── What people searching this route ask ────────────────────────────────────
  const asked = (re: RegExp) => queries.some((q) => re.test(q.toLowerCase()));
  const article = (label: string) => (label === 'Hatchback' ? 'a hatchback' : /^[aeiou]/i.test(label) ? `an ${label}` : `a ${label}`);
  if (km && asked(/distance|kitna|kitni|doori|duri|kilomet/)) {
    out.push({
      q: `How far is ${B} from ${A} by road?`,
      a: `${km} km, ${hoursFor(km)} at the wheel. The fare is for that distance, door to door.`,
    });
  }
  if (cheapest && asked(/one way/)) {
    out.push({
      q: `Is there a one-way taxi from ${A} to ${B}?`,
      a: `Yes. One way starts at ${rupees(cheapest.one)} in ${article(cheapest.label)}, and you pay for the trip you take — there is no return fare to add.`,
    });
  }
  if (cheapest && asked(/sharing|share/)) {
    const each = Math.round(cheapest.one / Math.max(2, Math.min(cheapest.seats ?? 4, 4)));
    out.push({
      q: `Is there a shared cab from ${A} to ${B}?`,
      a: `No — the car is booked for you, and nobody else is picked up on the way. Split between ${Math.max(2, Math.min(cheapest.seats ?? 4, 4))}, ${article(cheapest.label)} at ${rupees(cheapest.one)} comes to ${rupees(each)} each.`,
    });
  }
  if (cheapest && asked(/train|bus|flight/)) {
    out.push({
      q: `Should I take a cab or the train from ${A} to ${B}?`,
      a: `A cab collects you at your door at the time you choose and drops you at the address in ${B}; a train or bus runs to its own timetable between stations. For four people, ${article(cheapest.label)} is ${rupees(Math.round(cheapest.one / 4))} each one way, with the luggage in the boot.`,
    });
  }
  const crysta = priced.find((p) => p.label === 'Innova Crysta');
  if (crysta && (crysta.one || crysta.round) && asked(/innova|crysta/)) {
    out.push({
      q: `What does an Innova Crysta cost from ${A} to ${B}?`,
      a: `${crysta.one ? `${rupees(crysta.one)} one way` : ''}${crysta.one && crysta.round ? ' and ' : ''}${crysta.round ? `${rupees(crysta.round)} for a same-day round trip` : ''}${crysta.seats ? `, seating ${crysta.seats}` : ''}.`,
    });
  }

  return pickFaq(out, extra);
}

/**
 * At most 8 questions a page (27 Nov 2026, docs/seo/PROMPT_INDEX_RANK_27NOV.md Step 3.10): 20
 * built questions made every route page a long run of the same sentence shapes. The written
 * questions of the route (content/routes `extra`) come first — they are this route's only —
 * then the built ones in the order people search them: fare, time, tolls, cars, one way,
 * round trip, group, stops, airport, best time.
 */
export const FAQ_MAX = 8;
const FAQ_ORDER: ReadonlyArray<RegExp> = [
  /^How much does a taxi/,
  /^How long does the/,
  /^How many tolls/,
  /^What is the fare for a sedan/,
  /^Is there a one-way taxi/,
  /^Is a round trip cheaper/,
  /^Which vehicle should I book/,
  /^Where do people stop/,
  /^Is there an airport charge/,
  /^When is the best time/,
  /^What does an Innova Crysta cost/,
  /^How far is/,
  /^Is there a state entry tax/,
  /^Is .* too far for one day/,
  /^Can I book a tempo traveller/,
  /^How is a round trip/,
  /^What is the per-kilometre rate/,
];
export function pickFaq(built: ReadonlyArray<Q>, written: ReadonlyArray<Q> = [], max = FAQ_MAX): Q[] {
  const rank = (q: Q) => {
    const i = FAQ_ORDER.findIndex((re) => re.test(q.q));
    return i === -1 ? FAQ_ORDER.length : i;
  };
  const ordered = built
    .map((q, i) => ({ q, i, r: rank(q) }))
    .sort((x, y) => x.r - y.r || x.i - y.i)
    .map((x) => x.q);
  const seen = new Set<string>();
  return [...written, ...ordered]
    .filter((x) => (seen.has(x.q) ? false : (seen.add(x.q), true)))
    .slice(0, max);
}

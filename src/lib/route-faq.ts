import type { OnewayFare, RoundtripFare, Vehicle } from './api';
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
}: RouteFaqInput): Q[] {
  const out: Q[] = [];

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
      }${km ? `, for the full ${km} km` : ''}. That is the whole fare — driver, fuel and GST are in it. Toll, parking and state entry taxes are paid as they arise on the road.`,
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
      )} for the journey — about ${rupees(Math.round(Math.abs(suv.one - sedan.one) / 4))} a head if four of you are travelling.`,
    });
  }

  if (km && cheapest) {
    out.push({
      q: `What is the per-kilometre rate from ${A} to ${B}?`,
      a: `The lowest one-way fare works out at about ₹${
        Math.round((cheapest.one / km) * 10) / 10
      } a kilometre over ${km} km. We quote the whole journey rather than a rate, because a per-km number without the distance, the driver's return and the night charge in it is not the figure you end up paying.`,
    });
  }

  // ── How long ───────────────────────────────────────────────────────────────
  if (km) {
    out.push({
      q: `How long does the ${A} to ${B} drive take?`,
      a: `About ${km} km, which is ${hoursFor(
        km,
      )} of driving depending on traffic, the state border and how many stops you make. The estimate allows for real road speeds rather than an empty highway.`,
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
      }. For six or fewer, an Ertiga or an Innova Crysta is usually the better value once you divide the fare by the people in the car.`,
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
        )} run on round trips only. On a one-way booking the driver has to bring an empty vehicle back, and pricing that honestly costs more than the trip is worth to you, so we do not offer it rather than quote a number nobody wants.`,
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
      a: `By the kilometre for the whole journey, out and back, with a floor of ${
        roundtrip.minKmPerDay
      } km a day${
        roundtrip.billedKm ? ` — on this route that comes to ${roundtrip.billedKm} km billed` : ''
      }. The floor is what lets a driver take a long return leg without it being priced as two separate trips.`,
    });
  }

  // ── What else might I be charged ───────────────────────────────────────────
  if (roundtrip?.nightCharge) {
    out.push({
      q: `Is there a night charge on the ${A} to ${B} route?`,
      a: `${rupees(
        roundtrip.nightCharge,
      )} for a night halt, where the trip keeps the driver out overnight. It is shown before you book rather than added at the end.`,
    });
  }

  if (oneway?.airportSurcharge) {
    out.push({
      q: `Is there an airport charge on this route?`,
      a: `${rupees(
        oneway.airportSurcharge,
      )} is added for the airport entry and parking, and it is already included in the fares on this page.`,
    });
  }

  if (roundtrip?.hill) {
    out.push({
      q: `Why does the ${A} to ${B} route cost more per kilometre?`,
      a: `Part of this route is hill driving. It is slower, harder on the vehicle and uses more fuel, so it is priced into the fare rather than added afterwards.`,
    });
  }

  out.push({
    q: `Are toll and state tax included in the ${A} to ${B} fare?`,
    a: `No, and nothing on this page pretends otherwise: toll, parking and state entry tax belong to the road rather than to us, and they are paid as they arise. Everything that is ours — the car, the driver, the fuel, GST — is in the fare you see.`,
  });

  // ── Booking ────────────────────────────────────────────────────────────────
  out.push({
    q: `Do I have to pay in advance?`,
    a: `No. You can pay the driver in cash at the end of the trip. There is nothing to pay when you book, and the fare does not change between the two.`,
  });

  out.push({
    q: `How far in advance should I book a ${A} to ${B} cab?`,
    a: `At least two hours before pickup on a normal day. For an early-morning departure, book the night before so the driver can plan the run; on a festival weekend, earlier again, because cars go first on the busy routes.`,
  });

  out.push({
    q: `Can I cancel a ${A} to ${B} booking?`,
    a: `A cash booking costs nothing to cancel, any time before the trip starts. If you paid an advance online, the cancellation terms set out what is kept and what is returned.`,
  });

  return [...out, ...extra];
}

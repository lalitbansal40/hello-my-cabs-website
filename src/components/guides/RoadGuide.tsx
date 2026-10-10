import Link from 'next/link';
import { api } from '@/lib/api';
import { citiesWithPages } from '@/lib/city-pages';
import { JsonLd, faqSchema } from '@/lib/schema';
import { hoursFor, rupees } from '@/lib/seo';
import { cityPageName, cityPath, cityTitle, routePath } from '@/lib/slug';
import { publishedVariants } from '@/lib/variant-pages';
import type { RoadGuide as Road } from '@/content/guides/roads';

/**
 * "A to B by road" — the road from content/guides/roads.ts, every figure from the fare API.
 *
 * What it adds to the route page is the road: the highway, the towns in order, what is on
 * the way, and both directions' fares side by side. What it does not do is restate the route
 * page — the booking, the pickup areas and the reviews stay there, linked at the end.
 */
export async function RoadGuideBody({ road }: { road: Road }) {
  const { a, b } = road;
  const [vehicles, there, back, round, two, three, all] = await Promise.all([
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
    api.onewayFare(a, b).catch(() => null),
    api.onewayFare(b, a).catch(() => null),
    api.roundtripFare(a, b).catch(() => null),
    api.roundtripFare(a, b, { days: 2 }).catch(() => null),
    api.roundtripFare(a, b, { days: 3 }).catch(() => null),
    api.listedRoutes().catch(() => ({ count: 0, fixedCount: 0, routes: [] })),
  ]);

  // The same rule as the route pages: a guide about fares is not published without them.
  if (process.env.NEXT_PHASE === 'phase-production-build' && (!there || !round)) {
    throw new Error(`No fares for ${a} → ${b} at build time — refusing to publish ${road.slug}`);
  }
  if (!there || !round) return null;

  const A = cityTitle(a);
  const B = cityTitle(b);
  // The route's printed distance — measured when the backend has it (see RoutePage).
  const listedRow = all.routes.find((r) => r.pickup === a && r.drop === b);
  const km = (listedRow?.fixed ? listedRow.distanceKm : null) || round.distanceKm || there.distanceKm || 0;
  const hours = km ? hoursFor(km) : null;
  const seats = new Map(
    [...vehicles.intercity, ...vehicles.roundTripOnly].map((v) => [v.key, v.seats]),
  );
  const single = (v: { fare: number; total: number }) => v.total ?? v.fare;

  // Every car on either fare, in the order the round trip lists them (smallest first).
  const keys = [
    ...new Set([...there.vehicles.map((v) => v.key), ...round.vehicles.map((v) => v.key)]),
  ];
  const rows = keys.map((key) => {
    const label =
      there.vehicles.find((v) => v.key === key)?.label ??
      round.vehicles.find((v) => v.key === key)?.label ??
      key;
    const t = there.vehicles.find((v) => v.key === key);
    const bk = back?.vehicles.find((v) => v.key === key);
    return {
      key,
      label,
      seats: seats.get(key),
      there: t ? single(t) : null,
      back: bk ? single(bk) : null,
      day1: round.vehicles.find((v) => v.key === key)?.fare ?? null,
      day2: two?.vehicles.find((v) => v.key === key)?.fare ?? null,
      day3: three?.vehicles.find((v) => v.key === key)?.fare ?? null,
    };
  });
  const cheapest = rows.find((r) => r.there !== null);
  const backCheapest = rows.find((r) => r.back !== null);
  const sameBothWays = rows.every((r) => r.there === r.back);
  const multiDay = rows.some((r) => r.day2 !== null || r.day3 !== null);

  const towns = road.via.filter((t) => t !== A && t !== B);
  const townList =
    towns.length > 1 ? `${towns.slice(0, -1).join(', ')} and ${towns[towns.length - 1]}` : towns[0];
  const variants = (await publishedVariants(all.routes).catch(() => [])).filter(
    (v) => (v.pickup === a && v.drop === b) || (v.pickup === b && v.drop === a),
  );
  const listed = (p: string, d: string) => all.routes.some((r) => r.pickup === p && r.drop === d);
  const withPages = citiesWithPages(all.routes);
  const vehicleLabel = (key: string) => rows.find((r) => r.key === key)?.label ?? key;

  const faq: Array<{ q: string; a: string }> = [
    ...(km
      ? [
          {
            q: `How far is ${B} from ${A} by road?`,
            a: `About ${km} km by road, door to door between the two city centres. The distance to your own address can be a little more or less.`,
          },
          {
            q: `How long does ${A} to ${B} take by car?`,
            a: `${hours![0].toUpperCase()}${hours!.slice(1)} for ${km} km. That counts town crossings, toll queues and a short stop — the time a maps app shows is the empty-road best case.`,
          },
        ]
      : []),
    {
      q: `Which road goes from ${A} to ${B}?`,
      a: `Most trips take ${road.highway}, through ${townList}.${
        road.alternative ? ` Some drivers take ${road.alternative}.` : ''
      } The driver may choose another road for traffic or roadworks; tell them if you want a particular one.`,
    },
    ...(cheapest
      ? [
          {
            q: `What is the taxi fare from ${A} to ${B}?`,
            a: `One way, from ${rupees(cheapest.there!)} in a ${cheapest.label} — a fixed fare with the driver and fuel in it, plus 5% GST. Toll, parking and state entry tax are paid on the road as they come.`,
          },
        ]
      : []),
    ...(backCheapest
      ? [
          {
            q: `What is the taxi fare from ${B} to ${A}?`,
            a: `One way, from ${rupees(backCheapest.back!)} in a ${backCheapest.label}.${
              sameBothWays ? ' The fare is the same in both directions.' : ''
            }`,
          },
        ]
      : []),
    ...(rows[0]?.day1
      ? [
          {
            q: `How much is a round trip from ${A} to ${B}?`,
            a: `Going and coming back the same day, from ${rupees(rows[0].day1)} in a ${rows[0].label}, for ${round.billedKm} km billed. The same driver and car wait while you are there.`,
          },
        ]
      : []),
    {
      q: `Can the taxi stop on the way?`,
      a: `Yes — say which places when you book${
        road.onTheWay[0] ? `, for example ${road.onTheWay[0].name}` : ''
      }. The fare shown is for the direct trip; the desk confirms by phone what a stop adds before you travel.`,
    },
    {
      q: 'Is the fare fixed?',
      a: 'Yes. The fare shown when you book is the fare. A small advance is paid online when you book, and the rest to the driver at the end of the trip.',
    },
  ];

  return (
    <>
      <JsonLd data={faqSchema(faq)} />

      <p className="lead">
        {km ? `${A} to ${B} is about ${km} km by road — ${hours} in a car` : `${A} to ${B} by road`}
        , most of it on {road.highway}.{' '}
        {cheapest
          ? `A one-way taxi costs from ${rupees(cheapest.there!)} with us, fixed before you leave. `
          : ''}
        {road.why}
      </p>

      <h2>
        How far is {B} from {A}?
      </h2>
      {km ? (
        <p>
          <strong>About {km} km</strong>, measured door to door between the two city centres — the
          distance the fares below are worked out on. Starting from the edge of either city, or
          going on to a suburb, changes it by a few kilometres either way.
        </p>
      ) : null}
      {hours ? (
        <p>
          In a car it takes <strong>{hours}</strong>. That is worked out at 42 to 55 km an hour,
          which is what these roads really average once the town crossings, toll queues and a tea
          stop are counted. A maps app will show less; it is quoting an empty road.
        </p>
      ) : null}

      <h2>The road from {A} to {B}</h2>
      <p>
        Most trips take <strong>{road.highway}</strong>. Leaving {A}, it runs through:
      </p>
      <ol className="road-towns">
        <li>{A}</li>
        {towns.map((t) => (
          <li key={t}>{t}</li>
        ))}
        <li>{B}</li>
      </ol>
      <p>
        Coming back from {B}, it is the same road with the towns the other way round.
        {road.alternative ? ` Some drivers go by ${road.alternative} instead.` : ''} The driver
        picks the road on the day — traffic and roadworks decide it more than the map does — and
        if you want a particular one, say so when you set off.
      </p>

      <h2>On the way</h2>
      <ul>
        {road.onTheWay.map((p) => (
          <li key={p.name}>
            <strong>{p.name}</strong> — {p.note}.
          </li>
        ))}
      </ul>
      <p>
        To stop at any of them, add it as a stop when you book. The fare shown is for the direct
        trip; the desk calls to confirm what a stop adds before you travel. With a round trip the
        same driver waits while you are there.
      </p>

      <h2>
        Taxi fare, {A} to {B} and back
      </h2>
      <p>
        Every car, both directions one way, and a round trip with the return on the same day. The
        one-way fares include the driver and fuel, with 5% GST on top. Toll, parking and state entry tax are not in
        any column — they are paid on the road as they come.
        {round.nightCharge
          ? ` Driving after 10 pm adds a night allowance of ${rupees(round.nightCharge)}.`
          : ''}
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Car</th>
              <th scope="col">
                {A} → {B}
              </th>
              <th scope="col">
                {B} → {A}
              </th>
              <th scope="col">Round trip, same day</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <th scope="row">
                  {r.label}
                  {r.seats ? <span className="sub">{r.seats} seats</span> : null}
                </th>
                <td>{r.there !== null ? rupees(r.there) : 'Round trip only'}</td>
                <td>{r.back !== null ? rupees(r.back) : 'Round trip only'}</td>
                <td>{r.day1 !== null ? rupees(r.day1) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        {sameBothWays
          ? 'The one-way fare is the same whichever city you start from.'
          : 'The one-way fare is not quite the same in each direction — each is set for the city the trip starts from.'}{' '}
        The round trip is billed on {round.billedKm} km for the day there and back
        {round.minKmPerDay ? `, with at least ${round.minKmPerDay} km billed for each day the car is out` : ''}
        .
      </p>

      {multiDay ? (
        <>
          <h2>Staying a night or two</h2>
          <p>
            A round trip keeps the same car and driver with you for every day you are away, so it is
            priced for every day. These are the fares for coming back on the same day, the next
            day, and the day after, with the return date put into the booking form.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Car</th>
                  <th scope="col">Same day</th>
                  <th scope="col">2 days</th>
                  <th scope="col">3 days</th>
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter((r) => r.day1 !== null)
                  .map((r) => (
                    <tr key={r.key}>
                      <th scope="row">{r.label}</th>
                      <td>{rupees(r.day1!)}</td>
                      <td>{r.day2 !== null ? rupees(r.day2) : '—'}</td>
                      <td>{r.day3 !== null ? rupees(r.day3) : '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p>
            Driver&rsquo;s night allowance is added for each night away and is not part of these
            fares. If the stay is long and the car would sit idle, two one-way bookings can come out
            cheaper — the <Link href="/guides/one-way-or-round-trip">one way or round trip</Link>{' '}
            guide works through when.
          </p>
        </>
      ) : null}

      <h2>Questions people ask</h2>
      {faq.map((f) => (
        <p key={f.q}>
          <strong>{f.q}</strong>
          <br />
          {f.a}
        </p>
      ))}

      <h2>Book it</h2>
      <ul>
        {listed(a, b) ? (
          <li>
            <Link href={routePath(a, b)}>
              {A} to {B} taxi
            </Link>{' '}
            — fares, pickup areas and booking
          </li>
        ) : null}
        {listed(b, a) ? (
          <li>
            <Link href={routePath(b, a)}>
              {B} to {A} taxi
            </Link>{' '}
            — the other way
          </li>
        ) : null}
        {variants.map((v) => (
          <li key={v.path}>
            <Link href={v.path}>
              {cityTitle(v.pickup)} to {cityTitle(v.drop)}{' '}
              {v.vehicle ? `by ${vehicleLabel(v.vehicle)}` : 'round trip'}
            </Link>
          </li>
        ))}
        {[a, b]
          .filter((c) => withPages.has(c))
          .map((c) => (
            <li key={c}>
              <Link href={cityPath(c)}>{cityPageName(c)}</Link>
            </li>
          ))}
      </ul>
    </>
  );
}

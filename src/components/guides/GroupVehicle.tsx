import Link from 'next/link';
import { api } from '@/lib/api';
import type { RoundtripFare, Vehicle } from '@/lib/api';
import { cityTitle, routePath, vehiclePath } from '@/lib/slug';
import { rupees } from '@/lib/seo';

/**
 * "Which vehicle for a group?", worked out rather than asserted.
 *
 * For each group size, every combination of up to three vehicles that seats the group is
 * priced from the real round-trip fares and the cheapest one is shown. Nothing about which
 * option wins is written into the prose by hand — the prose says what the table says,
 * because the table is computed from the same fares the route pages print.
 *
 * Round trips throughout, because the vans are only booked that way: a comparison against a
 * one-way car fare would compare two things nobody could actually book side by side.
 */
const ROUTES: Array<[string, string]> = [
  ['JAIPUR', 'DELHI'],
  ['DELHI', 'HARIDWAR'],
];
// 20 as well as the sizes a single vehicle can take: a wedding party or a school trip is
// past sixteen, and "which two vehicles" is the question it actually has.
const GROUPS = [6, 8, 10, 12, 14, 16, 20];
const ONE_WAY_GROUPS = [6, 8, 10, 12];

type Pick = { labels: string[]; keys: string[]; seats: number; total: number };

/** The cheapest set of up to three vehicles with at least `people` seats between them. */
function cheapest(
  people: number,
  fleet: Array<{ key: string; label: string; seats: number; fare: number }>,
) {
  let best: Pick | null = null;
  const n = fleet.length;
  for (let i = 0; i < n; i++)
    for (let j = i; j <= n; j++)
      for (let k = j; k <= n; k++) {
        const set = [fleet[i], j < n ? fleet[j] : null, k < n && j < n ? fleet[k] : null].filter(
          (x): x is (typeof fleet)[number] => x !== null,
        );
        const seats = set.reduce((s, v) => s + v.seats, 0);
        if (seats < people) continue;
        const total = set.reduce((s, v) => s + v.fare, 0);
        if (!best || total < best.total || (total === best.total && set.length < best.keys.length))
          best = { labels: set.map((v) => v.label), keys: set.map((v) => v.key), seats, total };
      }
  return best;
}

/** The smallest single vehicle that seats the whole group, for comparison. */
function oneVehicle(
  people: number,
  fleet: Array<{ key: string; label: string; seats: number; fare: number }>,
) {
  return fleet.filter((v) => v.seats >= people).sort((a, b) => a.fare - b.fare)[0] ?? null;
}

const describe = (labels: string[]) => {
  const counts = new Map<string, number>();
  labels.forEach((l) => counts.set(l, (counts.get(l) ?? 0) + 1));
  return [...counts.entries()].map(([l, c]) => (c > 1 ? `${c} × ${l}` : l)).join(' + ');
};

function tableFor(fare: RoundtripFare, vehicles: Vehicle[]) {
  const fleet = vehicles.flatMap((v) => {
    const f = fare.vehicles.find((x) => x.key === v.key)?.fare;
    return f && v.seats ? [{ key: v.key, label: v.label, seats: v.seats, fare: f }] : [];
  });
  return GROUPS.map((people) => ({
    people,
    best: cheapest(people, fleet),
    single: oneVehicle(people, fleet),
  }));
}

export async function GroupVehicle() {
  const vehicles = await api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] }));
  const all = [...vehicles.intercity, ...vehicles.roundTripOnly];
  // One way, only the cars can go — so for a group that is not coming back, the question is
  // which cars, and this is the table for it.
  const oneWay = await api.onewayFare(ROUTES[0][0], ROUTES[0][1]).catch(() => null);
  const carFleet = oneWay
    ? vehicles.intercity.flatMap((v) => {
        const row = oneWay.vehicles.find((x) => x.key === v.key);
        const fare = row ? (row.total ?? row.fare) : 0;
        return fare && v.seats ? [{ key: v.key, label: v.label, seats: v.seats, fare }] : [];
      })
    : [];
  const oneWayRows = ONE_WAY_GROUPS.map((people) => ({ people, best: cheapest(people, carFleet) }));
  // What fourteen people cost one way in cars — the honest answer to "past twelve".
  const fourteen = cheapest(14, carFleet);
  const fares = await Promise.all(
    ROUTES.map(([a, b]) => api.roundtripFare(a, b).catch(() => null)),
  );
  const tables = ROUTES.flatMap(([a, b], i) => {
    const f = fares[i];
    return f ? [{ a, b, km: f.distanceKm, rows: tableFor(f, all) }] : [];
  });
  if (tables.length === 0) return null;

  const main = tables[0];
  const vans = all.filter((v) => v.tripTypes.length === 1);
  const cars = all.filter((v) => v.tripTypes.length > 1);
  // Where the answer changes from "cars" to "one van" on the main route, read off the table.
  const firstVan = main.rows.find(
    (r) => r.best && r.best.keys.length === 1 && vans.some((v) => v.key === r.best!.keys[0]),
  );
  const carsWin = main.rows.filter(
    (r) => r.best && r.best.keys.every((k) => cars.some((c) => c.key === k)),
  );
  const nightHalt = vans.find((v) => v.nightCharge)?.nightCharge;

  return (
    <>
      <p className="lead">
        For a group, the cheapest option is not always the biggest vehicle — and not always two cars
        either. On a {cityTitle(main.a)} to {cityTitle(main.b)} round trip,
        {carsWin.length > 0
          ? ` up to ${carsWin[carsWin.length - 1].people} people travel for less in cars`
          : ' no pair of cars beats a van'}
        {firstVan
          ? `, and from ${firstVan.people} a single ${firstVan.best!.labels[0]} is the cheaper way`
          : ''}
        . The tables below show where the line falls, with the price per head.
      </p>

      <h2>What seats how many</h2>
      <p>
        The seat count is passengers, not counting the driver. The four cars can be booked one way,
        round trip or by the hour; the four vans are booked as round trips only.
      </p>
      <ul>
        {all
          .filter((v) => v.seats)
          .sort((a, b) => (a.seats ?? 0) - (b.seats ?? 0))
          .map((v) => (
            <li key={v.key}>
              <Link href={vehiclePath(v.key)}>{v.label}</Link> — {v.seats} seats
              {v.tripTypes.length === 1 ? ', round trips only' : ''}
            </li>
          ))}
      </ul>

      {tables.map((t) => (
        <section key={`${t.a}-${t.b}`}>
          <h2>
            The cheapest way to seat a group, {cityTitle(t.a)} to {cityTitle(t.b)}
          </h2>
          <p>
            Round trip, {t.km} km each way, returning the same day. Every combination of up to three
            vehicles was priced; this is the cheapest that seats everyone, beside the cheapest
            single vehicle that does.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">People</th>
                  <th scope="col">Cheapest way</th>
                  <th scope="col">Total</th>
                  <th scope="col">Per head</th>
                  <th scope="col">One vehicle</th>
                </tr>
              </thead>
              <tbody>
                {t.rows.map((r) => (
                  <tr key={r.people}>
                    <th scope="row">{r.people}</th>
                    <td>{r.best ? describe(r.best.labels) : '—'}</td>
                    <td>{r.best ? rupees(r.best.total) : '—'}</td>
                    <td>{r.best ? rupees(Math.round(r.best.total / r.people)) : '—'}</td>
                    <td>
                      {r.single ? (
                        <>
                          {r.single.label}, {rupees(r.single.fare)}
                        </>
                      ) : (
                        'none seats this many'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="sub">
            Fares are for the{' '}
            <Link href={routePath(t.a, t.b)}>
              {cityTitle(t.a)} to {cityTitle(t.b)}
            </Link>{' '}
            round trip, from the same fare table that page prints.
          </p>
        </section>
      ))}

      {oneWayRows.some((r) => r.best) ? (
        <>
          <h2>If the group is not coming back</h2>
          <p>
            One way, only the cars can go — the vans are booked as round trips. So a group
            travelling one way is choosing between combinations of cars. {cityTitle(ROUTES[0][0])}{' '}
            to {cityTitle(ROUTES[0][1])}, one way:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">People</th>
                  <th scope="col">Cheapest cars</th>
                  <th scope="col">Total</th>
                  <th scope="col">Per head</th>
                </tr>
              </thead>
              <tbody>
                {oneWayRows.map((r) => (
                  <tr key={r.people}>
                    <th scope="row">{r.people}</th>
                    <td>{r.best ? describe(r.best.labels) : '—'}</td>
                    <td>{r.best ? rupees(r.best.total) : '—'}</td>
                    <td>{r.best ? rupees(Math.round(r.best.total / r.people)) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Past twelve, one way means three cars or more
            {fourteen
              ? ` — for fourteen people, ${describe(fourteen.labels)} at ${rupees(fourteen.total)}: three drivers, three departures and three arrivals to coordinate`
              : ''}
            . For a group that size, a van only makes sense if the group is coming back with it.
          </p>
        </>
      ) : null}

      <h2>One vehicle or two</h2>
      <p>
        The price is not the only difference. Two cars are two drivers, two departure times to
        coordinate and two arrivals — they will not stay together on the road. One vehicle is one
        booking, one driver, and everybody arriving at once, which on a wedding or a family trip is
        often worth more than the difference in the table.
      </p>
      <p>
        Two cars do have one advantage: they can split. If part of the group needs to leave early or
        go somewhere else, two separate bookings allow it and a single van does not.
      </p>

      <h2>Seats are not luggage</h2>
      <p>
        A vehicle filled to its seat count has the least room for bags it will ever have. A
        three-row car with every seat taken has only a small space behind the last row, and a van
        with every seat taken has less room at the back than one carrying a few fewer people. If the
        group is at a vehicle&rsquo;s limit and travelling with full luggage, the next size up is
        usually the right booking — the table shows what that costs.
      </p>

      <h2>Why the vans are round trips only</h2>
      <p>
        A van booked one way would have to come back empty, and pricing that honestly costs more
        than the trip is worth to anybody. So they are priced by the kilometre for the whole journey
        out and back —{' '}
        {vans
          .filter((v) => v.perKm)
          .map((v) => `${v.label} ₹${v.perKm}`)
          .join(', ')}{' '}
        a kilometre on the plains, more on hill routes
        {nightHalt ? `, with ${rupees(nightHalt)} for each night the trip keeps the van out` : ''}.
        Toll, parking and state entry tax are paid as they arise, as they are for the cars.
      </p>

      <h2>Booking a group</h2>
      <p>
        Each vehicle is its own booking on this site: book the van, or book the two cars one after
        the other. For three vehicles or more, several stops, or a group that needs to travel
        together at an odd hour, call — it is quicker for a person to arrange than for a form. Every
        vehicle&rsquo;s own page has its fares on the published routes.
      </p>
    </>
  );
}

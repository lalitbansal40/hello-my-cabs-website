import Link from 'next/link';
import { api } from '@/lib/api';
import { cityTitle, routePath } from '@/lib/slug';
import { rupees } from '@/lib/seo';

/**
 * "One way or round trip?", answered with this site's own fares.
 *
 * Every figure below is fetched when the page is built, so the guide cannot drift from what
 * the route pages charge. The six routes run from 131 km to 807 km on purpose: the answer
 * changes with distance, and a guide that showed one route would be showing one answer.
 *
 * Delhi → Chandigarh was left out while its one-way row was a copy of Jaipur → Chandigarh's
 * (567 km of fare on a 312 km road), which made its round trip cheaper than a single one-way
 * fare. The backend fixed that row on 13 Sep 2026, so the route could go in now; the six
 * below stay because they already span the distances the answer turns on.
 */
const ROUTES: Array<[string, string]> = [
  ['JAIPUR', 'SIKAR'],
  ['JAIPUR', 'AJMER'],
  ['DELHI', 'AGRA'],
  ['JAIPUR', 'DELHI'],
  ['JAIPUR', 'HARIDWAR'],
  ['CHANDIGARH', 'KOTA'],
];

const VEHICLE = 'hatchback';

/** The larger cars on one route, so the reader can see whether the saving holds. */
const BY_VEHICLE_ROUTE: [string, string] = ['JAIPUR', 'DELHI'];

export async function OneWayOrRoundTrip() {
  const [vehiclesAll, bvOne, bvRound] = await Promise.all([
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
    api.onewayFare(...BY_VEHICLE_ROUTE).catch(() => null),
    api.roundtripFare(...BY_VEHICLE_ROUTE).catch(() => null),
  ]);
  const byVehicle = vehiclesAll.intercity.flatMap((v) => {
    const o = bvOne?.vehicles.find((x) => x.key === v.key);
    const r = bvRound?.vehicles.find((x) => x.key === v.key);
    if (!o || !r) return [];
    const single = o.total ?? o.fare;
    return [{ key: v.key, label: v.label, single, two: single * 2, round: r.fare }];
  });
  const rows = (
    await Promise.all(
      ROUTES.map(async ([a, b]) => {
        const [ow, rt] = await Promise.all([
          api.onewayFare(a, b).catch(() => null),
          api.roundtripFare(a, b).catch(() => null),
        ]);
        const one = ow?.vehicles.find((v) => v.key === VEHICLE);
        const round = rt?.vehicles.find((v) => v.key === VEHICLE);
        if (!one || !round || !rt) return null;
        const single = one.total ?? one.fare;
        return {
          a,
          b,
          km: rt.distanceKm,
          billed: rt.billedKm,
          minPerDay: rt.minKmPerDay,
          night: rt.nightCharge,
          single,
          two: single * 2,
          round: round.fare,
        };
      }),
    )
  ).filter((r): r is NonNullable<typeof r> => r !== null);

  if (rows.length === 0) return null;

  const cheaper = rows.filter((r) => r.round < r.two);
  const biggest = [...rows].sort((x, y) => y.two - y.round - (x.two - x.round))[0];
  const short = rows[0];
  const minPerDay = rows[0].minPerDay;
  const night = rows.find((r) => r.night)?.night;

  return (
    <>
      <p className="lead">
        Coming back the same day, a round trip costs less than two one-way fares on every one of the{' '}
        {rows.length} routes below — by {rupees(biggest.two - biggest.round)} on{' '}
        {cityTitle(biggest.a)} to {cityTitle(biggest.b)}. Staying away for several days is where
        that turns round, and it is the part most people are not told.
      </p>

      <h2>How each one is priced</h2>
      <p>
        A <strong>one-way</strong> fare is a fixed price for a single journey, from your door in one
        city to your door in the other. The driver and the car still have to get home afterwards,
        and that empty return is part of what a one-way fare pays for — which is why a one-way trip
        is not simply half of a round trip.
      </p>
      <p>
        A <strong>round trip</strong> is priced by the kilometre for the whole journey, out and
        back, with the same driver and car throughout. There is a floor: at least {minPerDay} km is
        billed for each day the car is with you. For a same-day return, the distance there and back
        is almost always more than that, so the floor never comes into it.
      </p>

      <h2>The figures on six routes</h2>
      <p>
        In a hatchback — the smallest car, and the fare most people compare — with the return on the
        same day. Tolls, parking and state tax are left out of all three columns, because they are
        paid the same way on either kind of booking.
      </p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Route</th>
              <th scope="col">One way</th>
              <th scope="col">Two one-way fares</th>
              <th scope="col">Round trip</th>
              <th scope="col">Difference</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.a}-${r.b}`}>
                <th scope="row">
                  <Link href={routePath(r.a, r.b)}>
                    {cityTitle(r.a)} → {cityTitle(r.b)}
                  </Link>
                  <span className="sub">{r.km} km</span>
                </th>
                <td>{rupees(r.single)}</td>
                <td>{rupees(r.two)}</td>
                <td>{rupees(r.round)}</td>
                <td>
                  {r.round < r.two
                    ? `${rupees(r.two - r.round)} less`
                    : r.round > r.two
                      ? `${rupees(r.round - r.two)} more`
                      : 'the same'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>
        {cheaper.length === rows.length
          ? 'On every route here the round trip wins for a same-day return.'
          : `On ${cheaper.length} of the ${rows.length} routes here the round trip wins for a same-day return.`}{' '}
        The size of the saving does not follow the distance neatly, because the one-way fares are
        set route by route while a round trip is a rate multiplied out. That is also why it is worth
        checking the route you actually want rather than assuming from one you have seen.
      </p>

      {byVehicle.length > 1 && bvRound ? (
        <>
          <h2>Does the saving hold in a bigger car?</h2>
          <p>
            The same comparison on {cityTitle(BY_VEHICLE_ROUTE[0])} to{' '}
            {cityTitle(BY_VEHICLE_ROUTE[1])}, in each of the four cars. The vans are left out
            because they are only booked as round trips, so there is nothing to compare them with.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Car</th>
                  <th scope="col">One way</th>
                  <th scope="col">Two one-way fares</th>
                  <th scope="col">Round trip</th>
                  <th scope="col">Difference</th>
                </tr>
              </thead>
              <tbody>
                {byVehicle.map((v) => (
                  <tr key={v.key}>
                    <th scope="row">{v.label}</th>
                    <td>{rupees(v.single)}</td>
                    <td>{rupees(v.two)}</td>
                    <td>{rupees(v.round)}</td>
                    <td>
                      {v.round < v.two
                        ? `${rupees(v.two - v.round)} less`
                        : v.round > v.two
                          ? `${rupees(v.round - v.two)} more`
                          : 'the same'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            {byVehicle.every((v) => v.round < v.two)
              ? `In every car the round trip is the cheaper booking for a same-day return — by between ${rupees(
                  Math.min(...byVehicle.map((v) => v.two - v.round)),
                )} and ${rupees(Math.max(...byVehicle.map((v) => v.two - v.round)))} on this route. The saving is not the same in each, which is the reason to look at the car you will actually book rather than the smallest one.`
              : 'The saving is not the same in every car — which is the reason to look at the vehicle you will actually book rather than the smallest one.'}
          </p>
        </>
      ) : null}

      <h2>When one way is the better booking</h2>
      <p>
        <strong>When you are staying.</strong> The daily floor is the thing to watch. A round trip
        to {cityTitle(short.b)} and back on the same day bills {short.billed} km. Keep the car for
        two days and at least {minPerDay * 2} km is billed, whether or not it is driven — the driver
        and the car are yours for both days and cannot take anyone else. On a short route, a stay of
        two or three days is enough for two separate one-way fares to come out cheaper. Ask for the
        figure for your dates before you book; it is quoted in full, not estimated.
      </p>
      <p>
        The floor works the other way on a long route. {cityTitle(BY_VEHICLE_ROUTE[0])} to{' '}
        {cityTitle(BY_VEHICLE_ROUTE[1])} and back is{' '}
        {bvRound ? `${bvRound.billedKm} km` : 'more than two days of the minimum'} — already more
        than two days of the {minPerDay} km minimum — so staying one night does not raise the
        kilometres billed. What a night away adds is the night allowance; ask for the figure for
        your dates and it is quoted in full.
      </p>
      <p>
        <strong>When you are not coming back by road.</strong> If the return is by train or by air,
        there is nothing to share between the two legs, and a one-way booking is simply the right
        one.
      </p>
      <p>
        <strong>When the return date is unknown.</strong> A round trip is booked with its return in
        it. If you do not yet know when you are coming back, book the outward journey one way and
        the return when you know.
      </p>

      <h2>When the round trip is the better booking</h2>
      <p>
        <strong>A day out.</strong> Out in the morning, back in the evening: this is what a round
        trip is priced for, and the table shows what it saves.
      </p>
      <p>
        <strong>Stops along the way.</strong> The same driver waits while you are somewhere and
        carries on when you are ready, which two separate one-way bookings cannot do.
      </p>
      <p>
        <strong>Anything that needs the same car.</strong> Luggage left in the boot, your own child
        seat fitted once, a driver who knows where you are staying.
      </p>

      <h2>What is the same either way</h2>
      <p>
        Both are fixed before you travel: the fare shown when you book is the fare. Both include the
        driver, the fuel and GST. Neither includes toll, parking or state entry tax, which are paid
        as they arise on the road.
        {night ? ` A night allowance of ${rupees(night)} applies after 10 pm.` : ''} And both can be
        paid in cash to the driver at the end of the trip.
      </p>

      <h2>How to book each</h2>
      <p>
        The booking form on every route page has three tabs — one way, round trip and hourly. Choose
        round trip and it asks for the return date and time as well. The round-trip fare it shows is
        for coming back on the same trip; for a stay of more than a day, call for the figure,
        because the daily minimum applies and the form does not work that out. The{' '}
        <Link href="/routes">route list</Link> has every route with a published fare; journeys that
        are not on it are quoted on distance when you call.
      </p>
    </>
  );
}

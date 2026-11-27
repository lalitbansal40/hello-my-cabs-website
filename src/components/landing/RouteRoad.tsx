import type { RouteContent } from '@/content/routes';
import { Icon } from '../site/Icons';

/**
 * The road itself, and the city at the end of it.
 *
 * This is the part of a route page that cannot be generated from the fare API, and it is
 * also the part the sites ranking above us are winning on: where to stop and eat, how many
 * tolls, when to leave, what to expect on arrival.
 *
 * Every block here is absent until somebody who knows the answer has written it down. The
 * stops and tolls come from our own drivers, who run these roads every week — first-hand,
 * which is the one thing an aggregator cannot copy from another website. An invented dhaba
 * or a guessed toll count would be the opposite: the reader finds out on the road that this
 * page does not know what it is talking about.
 */
export function RouteRoad({
  A,
  B,
  km,
  driver,
  arrival,
  arrivalNote,
  dropAreas = [],
  dropPoints = [],
}: {
  A: string;
  B: string;
  km?: number;
  driver?: RouteContent['driver'];
  arrival?: string;
  /** One more line about the drop, when the city has one. */
  arrivalNote?: string;
  /** Parts of B people are dropped in, and its stations/airport (content/cities, cityPickup). */
  dropAreas?: ReadonlyArray<string>;
  dropPoints?: ReadonlyArray<string>;
}) {
  const hasRoad = Boolean(
    driver?.stops?.length ||
      driver?.tolls ||
      driver?.bestTime ||
      driver?.roadNote ||
      driver?.pickupAreas?.length ||
      driver?.dropAreas?.length,
  );
  if (!hasRoad && !arrival) return null;

  return (
    <>
      {hasRoad ? (
        <section className="reveal section-gap">
          <h2 className="font-display text-balance text-h2">
            The {A} to {B} road
          </h2>
          <p className="mt-4 max-w-measure text-pretty text-body text-hmc-secondary">
            From the drivers who run this route, not from a map.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {driver?.stops?.length ? (
              <div className="rounded-2xl border border-hmc-line bg-hmc-card px-5 py-5 sm:col-span-2">
                <p className="flex items-center gap-2 text-label font-bold uppercase text-hmc-label">
                  <Icon.clock className="h-4 w-4 text-hmc-link" />
                  Where to stop
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {driver.stops.map((s) => (
                    <li key={s.name} className="text-body">
                      <span className="font-bold">{s.name}</span>
                      {typeof s.aboutKm === 'number' ? (
                        <span className="text-hmc-secondary"> · about {s.aboutKm} km in</span>
                      ) : null}
                      {s.note ? (
                        <span className="block text-small text-hmc-secondary">{s.note}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {driver?.tolls ? (
              <div className="rounded-2xl border border-hmc-line bg-hmc-card px-5 py-5">
                <p className="text-label font-bold uppercase text-hmc-label">Tolls</p>
                <p className="font-display mt-2 text-title font-black">
                  {driver.tolls.count ? `${driver.tolls.count} on the way` : 'On the way'}
                </p>
                <p className="mt-1 text-small text-hmc-secondary">
                  {driver.tolls.approxRupees
                    ? `About ₹${driver.tolls.approxRupees.toLocaleString('en-IN')} in total. `
                    : ''}
                  {driver.tolls.note ??
                    'One way, the toll is added to your bill; on a round trip it is paid as it comes.'}
                </p>
              </div>
            ) : null}

            {driver?.bestTime ? (
              <div className="rounded-2xl border border-hmc-line bg-hmc-card px-5 py-5">
                <p className="text-label font-bold uppercase text-hmc-label">When to leave</p>
                <p className="mt-2 text-pretty text-body">{driver.bestTime}</p>
              </div>
            ) : null}

            {driver?.pickupAreas?.length || driver?.dropAreas?.length ? (
              <div className="rounded-2xl border border-hmc-line bg-hmc-card px-5 py-5 sm:col-span-2">
                <p className="text-label font-bold uppercase text-hmc-label">Where trips start and end</p>
                {driver.pickupAreas?.length ? (
                  <p className="mt-2 max-w-measure text-pretty text-body">
                    Most pickups in {A}: {joinAnd(driver.pickupAreas)}.
                  </p>
                ) : null}
                {driver.dropAreas?.length ? (
                  <p className="mt-2 max-w-measure text-pretty text-body">
                    Most drops in {B}: {joinAnd(driver.dropAreas)}.
                  </p>
                ) : null}
                <p className="mt-1 text-small text-hmc-secondary">
                  The driver comes to any address in {A}; the fare is the same.
                </p>
              </div>
            ) : null}

            {driver?.roadNote ? (
              <div className="rounded-2xl border border-hmc-line bg-hmc-card px-5 py-5 sm:col-span-2">
                <p className="text-label font-bold uppercase text-hmc-label">The road</p>
                <p className="mt-2 max-w-measure text-pretty text-body">
                  {driver.roadNote}
                  {driver.realHours ? ` It usually takes ${driver.realHours}.` : ''}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {arrival ? (
        <section className="reveal section-gap">
          <h2 className="font-display text-balance text-h2">Arriving in {B}</h2>
          <p className="mt-6 max-w-measure text-pretty text-body text-hmc-secondary">{arrival}</p>
          {arrivalNote ? (
            <p className="mt-4 max-w-measure text-pretty text-body text-hmc-secondary">{arrivalNote}</p>
          ) : null}
          {dropAreas.length > 0 || dropPoints.length > 0 ? (
            <p className="mt-4 max-w-measure text-pretty text-body text-hmc-secondary">
              {dropAreas.length > 0
                ? `Drops in ${B} are made to the address you give — ${joinAnd(dropAreas.slice(0, 6))} among them`
                : `Drops in ${B} are made to the address you give`}
              {dropPoints.length > 0 ? `, and to ${joinAnd(dropPoints)} for an onward train, bus or flight` : ''}.
            </p>
          ) : null}
          {km && !hasRoad ? (
            <p className="mt-4 max-w-measure text-pretty text-body text-hmc-secondary">
              The drive is {km} km from {A}, and the driver takes you to the address you give rather
              than to a stand.
            </p>
          ) : null}
        </section>
      ) : null}
    </>
  );
}

/** "a, b and c" */
function joinAnd(xs: ReadonlyArray<string>): string {
  return xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : (xs[0] ?? '');
}

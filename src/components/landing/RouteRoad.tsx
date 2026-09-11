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
}: {
  A: string;
  B: string;
  km?: number;
  driver?: RouteContent['driver'];
  arrival?: string;
  /** One more line about the drop, when the city has one. */
  arrivalNote?: string;
}) {
  const hasRoad = Boolean(
    driver?.stops?.length || driver?.tolls || driver?.bestTime || driver?.roadNote,
  );
  if (!hasRoad && !arrival) return null;

  return (
    <>
      {hasRoad ? (
        <section className="pt-24">
          <h2 className="font-display text-balance text-h2">
            The {A} to {B} road
          </h2>
          <p className="mt-4 max-w-measure text-pretty text-body text-muted">
            From the drivers who run this route, not from a map.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {driver?.stops?.length ? (
              <div className="rounded-2xl border border-line bg-surface-raised px-5 py-5 sm:col-span-2">
                <p className="flex items-center gap-2 text-label font-bold uppercase text-faint">
                  <Icon.clock className="h-4 w-4 text-accent" />
                  Where to stop
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {driver.stops.map((s) => (
                    <li key={s.name} className="text-body">
                      <span className="font-bold">{s.name}</span>
                      {typeof s.aboutKm === 'number' ? (
                        <span className="text-muted"> · about {s.aboutKm} km in</span>
                      ) : null}
                      {s.note ? (
                        <span className="block text-small text-muted">{s.note}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {driver?.tolls ? (
              <div className="rounded-2xl border border-line bg-surface-raised px-5 py-5">
                <p className="text-label font-bold uppercase text-faint">Tolls</p>
                <p className="font-display mt-2 text-title font-black">
                  {driver.tolls.count ? `${driver.tolls.count} on the way` : 'On the way'}
                </p>
                <p className="mt-1 text-small text-muted">
                  {driver.tolls.approxRupees
                    ? `About ₹${driver.tolls.approxRupees.toLocaleString('en-IN')} in total, paid as they come. `
                    : ''}
                  {driver.tolls.note ?? 'Tolls are not part of the fare — they belong to the road.'}
                </p>
              </div>
            ) : null}

            {driver?.bestTime ? (
              <div className="rounded-2xl border border-line bg-surface-raised px-5 py-5">
                <p className="text-label font-bold uppercase text-faint">When to leave</p>
                <p className="mt-2 text-pretty text-body">{driver.bestTime}</p>
              </div>
            ) : null}

            {driver?.roadNote ? (
              <div className="rounded-2xl border border-line bg-surface-raised px-5 py-5 sm:col-span-2">
                <p className="text-label font-bold uppercase text-faint">The road</p>
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
        <section className="pt-24">
          <h2 className="font-display text-balance text-h2">Arriving in {B}</h2>
          <p className="mt-6 max-w-measure text-pretty text-body text-ink-soft">{arrival}</p>
          {arrivalNote ? (
            <p className="mt-4 max-w-measure text-pretty text-body text-muted">{arrivalNote}</p>
          ) : null}
          {km && !hasRoad ? (
            <p className="mt-4 max-w-measure text-pretty text-body text-muted">
              The drive is {km} km from {A}, and the driver takes you to the address you give rather
              than to a stand.
            </p>
          ) : null}
        </section>
      ) : null}
    </>
  );
}

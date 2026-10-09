import Link from 'next/link';
import type { RoundtripFare } from '@/lib/api';
import { cityTitle, routePath } from '@/lib/slug';
import { rupees } from '@/lib/seo';
import type { Place } from '@/content/routes';

/**
 * Two blocks for the routes that carry the most traffic, built only from what is true of
 * every booking: the fare is city to city, and a round trip is billed by the day.
 */

/**
 * Where in the pickup city the driver comes to. The fare is set city to city, so this is a
 * list of places — named because somebody in Vaishali Nagar searches for Vaishali Nagar —
 * not a price per area. Places with a route of their own (the airport, Noida) link to it,
 * because a booking for them is that route, not this one.
 */
export function PickupAreas({
  A,
  B,
  areas,
  ownRoutes,
  about,
  points = [],
  places = [],
}: {
  A: string;
  B: string;
  areas: ReadonlyArray<string>;
  /** Written up one by one (content/routes `pickupPlaces`) — shown as cards, not a list. */
  places?: ReadonlyArray<Place>;
  /** Only the ones that are listed routes — the caller filters out held ones. */
  ownRoutes: ReadonlyArray<readonly [string, string]>;
  /** What being collected in this city is like (content/cities, cityPickup). */
  about?: string;
  /** Stations, airport, bus stands people are collected from. */
  points?: ReadonlyArray<string>;
}) {
  if (areas.length === 0 && !about) return null;
  const list =
    areas.length > 1 ? `${areas.slice(0, -1).join(', ')} and ${areas[areas.length - 1]}` : areas[0];
  return (
    <section className="pt-24">
      <h2 className="font-display text-balance text-h2">Picking up in {A}</h2>
      {about ? (
        <p className="mt-6 max-w-measure text-pretty text-body text-muted">{about}</p>
      ) : null}
      {places.length > 0 ? (
        <>
          <p className="mt-4 max-w-measure text-pretty text-body text-muted">
            The driver comes to the address you give, anywhere in {A}, and the fare to {B} is the
            same from every part of the city. Name the area and a landmark when you book; for a
            station or airport pickup, add the train or flight number.
          </p>
          <PlaceGrid places={places} />
        </>
      ) : areas.length > 0 ? (
        <p className="mt-4 max-w-measure text-pretty text-body text-muted">
          The driver comes to the address you give, anywhere in {A} — {list} included — and the
          fare to {B} is the same from all of them. Name the area and a landmark when you book;
          for a station or airport pickup, add the train or flight number.
        </p>
      ) : null}
      {points.length > 0 ? (
        <>
          <h3 className="mt-8 font-display text-h3">Where people are usually collected in {A}</h3>
          <ul className="mt-4 grid max-w-measure gap-2 text-body text-muted sm:grid-cols-2">
            {points.map((pt) => (
              <li key={pt} className="flex gap-2">
                <span aria-hidden className="text-accent">•</span>
                {pt}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {ownRoutes.length > 0 ? (
        <>
          <p className="mt-4 max-w-measure text-pretty text-body text-muted">
            These have a route and a fare of their own — book them as that:
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {ownRoutes.map(([p, d]) => (
              <li key={`${p}-${d}`}>
                <Link
                  href={routePath(p, d)}
                  className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface-raised px-4 text-small font-semibold hover:border-forest hover:text-forest"
                >
                  {cityTitle(p)} → {cityTitle(d)}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

/**
 * Where in the drop city people on this route are going (content/routes `dropPlaces`) — the
 * neighbourhoods, stations and landmarks, each with where it is and what to tell the driver.
 */
export function DropPlaces({ B, places }: { B: string; places: ReadonlyArray<Place> }) {
  if (places.length === 0) return null;
  return (
    <section className="pt-24">
      <h2 className="font-display text-balance text-h2">Where in {B} you are going</h2>
      <p className="mt-6 max-w-measure text-pretty text-body text-muted">
        The drop is at the address you give in {B}. These are the places people on this route ask
        for most — tell the driver the area and a landmark, and for a station, which one.
      </p>
      <PlaceGrid places={places} />
    </section>
  );
}

/** One card a place: its name, where it is, the landmarks people give, one line of use. */
function PlaceGrid({ places }: { places: ReadonlyArray<Place> }) {
  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {places.map((p) => (
        <li key={p.name} className="rounded-2xl border border-line bg-surface-raised px-5 py-4">
          <h3 className="text-body font-bold text-ink">{p.name}</h3>
          <p className="mt-0.5 text-small text-faint">{p.where}</p>
          {p.landmarks?.length ? (
            <p className="mt-2 text-small text-muted">
              <span className="font-semibold text-ink-soft">Landmarks:</span> {p.landmarks.join(', ')}
            </p>
          ) : null}
          {p.note ? <p className="mt-2 text-small text-muted">{p.note}</p> : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * What a round trip costs when the car stays with you — one, two and three days, from the
 * fare API (`/fare/roundtrip?days=`). Every day is billed at the daily minimum or the
 * distance there and back, whichever is more, so a stay costs more than a day out — and the
 * booking form prices whatever dates are given.
 */
export function MultiDayRoundTrip({
  A,
  B,
  byDays,
}: {
  A: string;
  B: string;
  /** [days, fare] for the same vehicle, 1 → 3. */
  byDays: ReadonlyArray<{ days: number; fare: RoundtripFare }>;
}) {
  const rows = byDays.flatMap(({ days, fare }) => {
    const cheapest = [...fare.vehicles].sort((a, b) => a.fare - b.fare)[0];
    return cheapest
      ? [{ days, billedKm: fare.billedKm, label: cheapest.label, rupees: cheapest.fare }]
      : [];
  });
  if (rows.length < 2) return null;
  const min = byDays[0]?.fare.minKmPerDay;
  const label = rows[0].label;
  return (
    <section className="pt-24">
      <h2 className="font-display text-balance text-h2">Staying a few days?</h2>
      <p className="mt-6 max-w-measure text-pretty text-body text-muted">
        A round trip keeps the car and driver with you, and each day it is out is billed at least{' '}
        {min} km, or the distance there and back if that is more. In a {label}, {A} to {B} and back:
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {rows.map((r) => (
          <div key={r.days} className="rounded-2xl border border-line bg-surface-raised px-5 py-4">
            <p className="text-small text-muted">
              {r.days === 1 ? 'Back the same day' : `${r.days} days`}
            </p>
            <p className="font-display mt-1 text-title font-black">{rupees(r.rupees)}</p>
            <p className="mt-0.5 text-small text-faint">{r.billedKm} km billed</p>
          </div>
        ))}
      </div>
      {rows[1] && rows[1].rupees === rows[0].rupees ? (
        <p className="mt-6 max-w-measure text-pretty text-body text-muted">
          Two days cost the same as one here: the distance there and back, {rows[0].billedKm} km, is
          already more than two days of the minimum, so staying the night adds only the night
          allowance.
        </p>
      ) : null}
      <p className="mt-6 max-w-measure text-pretty text-body text-muted">
        Put your return date into the booking form and it prices your exact dates the same way. A
        night allowance applies for nights the driver is out, and toll and parking are paid as they
        arise.
      </p>
    </section>
  );
}

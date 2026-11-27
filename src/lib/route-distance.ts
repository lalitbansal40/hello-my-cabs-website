import { hoursFor } from './seo';

/**
 * One distance for a route, used everywhere the route is described — title, description,
 * page, FAQ, schema, map (21 Nov 2026, docs/seo/PROMPT_RANK_21NOV.md Step 3.5).
 *
 * Before this the title said "306 km" (the catalogue's estimate) while our own router had
 * measured the road at 295. Order of trust:
 *   1. a fixed-fare route with a road distance measured by the routing provider (backend
 *      route-insights `distance`) — its price does not depend on km, so the true km is shown;
 *   2. the catalogue row's own distance (measured when `distanceMeasured`);
 *   3. the fare API's km (a per-km route's price is made of it, so it stays that number).
 * A per-km route never takes the insights km: the page must show the km its price is made of.
 */
export interface RouteDistance {
  km: number;
  measured: boolean;
  /** The measured drive time, minutes — only with a provider-measured distance. */
  minutes: number | null;
}

export function routeDistance({
  row,
  insights,
  fareKm,
}: {
  row?: { fixed?: boolean; distanceKm?: number | null; distanceMeasured?: boolean } | null;
  insights?: { distance?: { distanceKm: number; durationMin: number } | null } | null;
  fareKm?: number | null;
}): RouteDistance | null {
  const measured = insights?.distance;
  if (row?.fixed && measured?.distanceKm) {
    return { km: measured.distanceKm, measured: true, minutes: measured.durationMin || null };
  }
  if (row?.fixed && row.distanceKm) {
    return { km: row.distanceKm, measured: row.distanceMeasured === true, minutes: null };
  }
  const km = fareKm ?? row?.distanceKm ?? null;
  if (!km) return null;
  return { km, measured: row?.distanceMeasured === true && row?.distanceKm === km, minutes: null };
}

/** "about 5 hours" / "4–5 hours" — from the measured time when there is one, else from km. */
export function driveTime(d: RouteDistance): string {
  if (d.minutes) {
    const h = d.minutes / 60;
    const low = Math.floor(h * 2) / 2;
    const high = Math.ceil(h * 2) / 2;
    const fmt = (x: number) => (Number.isInteger(x) ? `${x}` : `${Math.floor(x)}½`);
    return low === high ? `about ${fmt(low)} hours` : `${fmt(low)}–${fmt(high)} hours`;
  }
  return hoursFor(d.km);
}

import { api } from './api';
import { routeCarPath, routeRoundPath } from './slug';
import { CAR_ROUTES, CAR_VARIANT_VEHICLES, ROUND_TRIP_ROUTES } from './route-variants';

/**
 * The variant pages that are actually built — one list for the page builder and the
 * sitemap, so the sitemap can never advertise a variant that 404s.
 *
 * A round-trip page needs the route priced with round-trip fares; a car page needs the
 * route priced with that car on its fares.
 */
export async function publishedVariants(
  routes: ReadonlyArray<{ pickup: string; drop: string }>,
): Promise<Array<{ path: string; pickup: string; drop: string; vehicle?: string }>> {
  const priced = new Set(routes.map((r) => `${r.pickup}>${r.drop}`));
  const out: Array<{ path: string; pickup: string; drop: string; vehicle?: string }> = [];
  for (const [p, d] of ROUND_TRIP_ROUTES) {
    if (!priced.has(`${p}>${d}`)) continue;
    const rt = await api.roundtripFare(p, d).catch(() => null);
    if (rt?.vehicles.length) out.push({ path: routeRoundPath(p, d), pickup: p, drop: d });
  }
  for (const [p, d] of CAR_ROUTES) {
    if (!priced.has(`${p}>${d}`)) continue;
    const [ow, rt] = await Promise.all([
      api.onewayFare(p, d).catch(() => null),
      api.roundtripFare(p, d).catch(() => null),
    ]);
    for (const v of CAR_VARIANT_VEHICLES) {
      if ([...(ow?.vehicles ?? []), ...(rt?.vehicles ?? [])].some((x) => x.key === v)) {
        out.push({ path: routeCarPath(p, d, v), pickup: p, drop: d, vehicle: v });
      }
    }
  }
  return out;
}

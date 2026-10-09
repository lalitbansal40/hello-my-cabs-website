import { api, type ReviewSummary } from './api';
import { MIN_REVIEWS } from './review-rules';

export { MIN_REVIEWS };

/**
 * A summary worth showing, in the shape the page reads — or null. Fills in what a backend
 * from before 9 Oct 2026 does not send (driver/car counts, tags), so an old response can
 * never break a page.
 */
function worthShowing(s?: Partial<ReviewSummary> | null): ReviewSummary | null {
  if (!s || (s.count ?? 0) < MIN_REVIEWS || s.average == null) return null;
  return {
    count: s.count!,
    average: s.average,
    driverCount: s.driverCount ?? 0,
    driverAverage: s.driverAverage ?? null,
    cabCount: s.cabCount ?? 0,
    cabAverage: s.cabAverage ?? null,
    tags: s.tags ?? [],
  };
}

/** The route's rating, or null when there is not enough to show. Never throws. */
export async function routeReviews(pickup: string, drop: string): Promise<ReviewSummary | null> {
  const all = await api.reviews().catch(() => null);
  return worthShowing(all?.routes.find((r) => r.pickup === pickup && r.drop === drop));
}

/** A city's rating — trips starting or ending there — or null. Never throws. */
export async function cityReviews(city: string): Promise<ReviewSummary | null> {
  const all = await api.reviews().catch(() => null);
  return worthShowing(all?.cities.find((c) => c.city === city));
}

/** Every customer rating across the site, or null below MIN_REVIEWS. Never throws. */
export async function siteReviews(): Promise<ReviewSummary | null> {
  const all = await api.reviews().catch(() => null);
  return worthShowing(all?.site);
}

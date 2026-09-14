import { api, type ReviewSummary } from './api';

/**
 * Fewer than this and there is no reviews block, and no rating in the structured data.
 *
 * One review at 5.0 reads as invented, and two or three swing on a single bad day — neither
 * tells a visitor anything true about the service. Five is where the average starts to mean
 * something.
 */
export const MIN_REVIEWS = 5;

const worthShowing = (s?: ReviewSummary | null) =>
  s && s.count >= MIN_REVIEWS && s.average != null ? s : null;

/** The route's reviews, or null when there are not enough to show. Never throws. */
export async function routeReviews(pickup: string, drop: string): Promise<ReviewSummary | null> {
  const all = await api.reviews().catch(() => null);
  return worthShowing(all?.routes.find((r) => r.pickup === pickup && r.drop === drop));
}

/** A city's reviews — trips starting or ending there — or null. Never throws. */
export async function cityReviews(city: string): Promise<ReviewSummary | null> {
  const all = await api.reviews().catch(() => null);
  return worthShowing(all?.cities.find((c) => c.city === city));
}

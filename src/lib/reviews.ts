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

/**
 * Every customer rating across the site, or null below MIN_REVIEWS. Never throws.
 *
 * Built from the per-route summaries — every rated trip belongs to exactly one route, so
 * nothing is counted twice (the city summaries would count a trip at both of its ends).
 * The average is weighted by each route's count; the quotes are the busiest routes' newest,
 * at most six, each a customer who agreed to be shown.
 */
export async function siteReviews(): Promise<ReviewSummary | null> {
  const all = await api.reviews().catch(() => null);
  const routes = (all?.routes ?? []).filter((r) => r.count > 0 && r.average != null);
  const count = routes.reduce((n, r) => n + r.count, 0);
  if (count < MIN_REVIEWS) return null;
  const average =
    Math.round((routes.reduce((n, r) => n + (r.average ?? 0) * r.count, 0) / count) * 10) / 10;
  const recent = [...routes]
    .sort((a, b) => b.count - a.count)
    .flatMap((r) => r.recent)
    .slice(0, 6);
  return { count, average, recent };
}

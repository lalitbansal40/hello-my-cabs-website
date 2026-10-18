import { api, type ReviewSummary } from './api';
import { MIN_REVIEWS, routeRatingEligible, worthShowing } from './review-rules';

export { MIN_REVIEWS };

/** The route's rating, or null when there is not enough to show. Never throws. */
export async function routeReviews(pickup: string, drop: string): Promise<ReviewSummary | null> {
  const all = await api.reviews().catch(() => null);
  if (all?.isSyntheticTestData === true) return null;
  const summary = worthShowing(Array.isArray(all?.routes)
    ? all.routes.find((r) => r?.pickup === pickup && r?.drop === drop)
    : null);
  return summary ? { ...summary, eligibleForSchema: routeRatingEligible(all, pickup, drop) } : null;
}

/** A city's rating — trips starting or ending there — or null. Never throws. */
export async function cityReviews(city: string): Promise<ReviewSummary | null> {
  const all = await api.reviews().catch(() => null);
  if (all?.isSyntheticTestData === true) return null;
  return worthShowing(Array.isArray(all?.cities) ? all.cities.find((c) => c?.city === city) : null);
}

/** Every customer rating across the site, or null below MIN_REVIEWS. Never throws. */
export async function siteReviews(): Promise<ReviewSummary | null> {
  const all = await api.reviews().catch(() => null);
  if (all?.isSyntheticTestData === true) return null;
  return worthShowing(all?.site);
}

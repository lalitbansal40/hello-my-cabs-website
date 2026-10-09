import { api, type ReviewSummary } from './api';
import { MIN_REVIEWS, worthShowing } from './review-rules';

export { MIN_REVIEWS };

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

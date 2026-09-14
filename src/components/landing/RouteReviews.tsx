import type { ReviewSummary } from '@/lib/api';

/**
 * What customers who took this trip said.
 *
 * Rendered only with enough ratings to mean something (lib/reviews.ts, MIN_REVIEWS) — the
 * caller passes null otherwise and nothing appears. The number and the average are every
 * customer rating on the route; the quotes are only the customers who ticked "Show my
 * review on the website", with their first name, as they wrote them.
 */
export function RouteReviews({
  title,
  reviews,
  showTripStart = false,
}: {
  title: string;
  reviews: ReviewSummary | null;
  /**
   * On a city page the reviews come from trips starting in different places, so each says
   * where its trip began. On a route page they all began in the same city — saying so on
   * every card is noise, and "from Jaipur" reads as where the person lives.
   */
  showTripStart?: boolean;
}) {
  if (!reviews || reviews.average == null) return null;
  const { count, average, recent } = reviews;

  return (
    <section className="pt-24">
      <h2 className="font-display text-balance text-h2">{title}</h2>
      <p className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-title-lg font-black">{average.toFixed(1)}</span>
        <Stars value={average} />
        <span className="text-body text-muted">
          from {count} customer {count === 1 ? 'rating' : 'ratings'} in the app
        </span>
      </p>

      {recent.length > 0 ? (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {recent.map((r, i) => (
            <li key={i} className="rounded-2xl border border-line bg-surface-raised px-5 py-5">
              <Stars value={r.stars} />
              <blockquote className="mt-2 text-pretty text-body">“{r.comment}”</blockquote>
              <p className="mt-3 text-small text-muted">
                {[r.name, showTripStart && r.city ? `trip from ${r.city}` : null, r.month]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span
      aria-label={`${value} out of 5`}
      role="img"
      className="text-body tracking-wide text-accent"
    >
      {'★'.repeat(full)}
      <span className="text-line">{'★'.repeat(5 - full)}</span>
    </span>
  );
}

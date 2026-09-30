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
    <section className="reveal pt-24">
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
          {recent.map((r, i) => {
            // Only a customer who gave a name gets a circle. Without one it would be an
            // empty disc — there is no person icon in Icons.tsx to put in it, and a name
            // is not ours to invent.
            const initial = (r.name ?? '').trim().charAt(0).toUpperCase();
            const meta = [showTripStart && r.city ? `trip from ${r.city}` : null, r.month]
              .filter(Boolean)
              .join(' · ');
            return (
              <li key={i} className="rounded-2xl border border-line bg-surface-raised p-6">
                <Stars value={r.stars} />
                {/* Italic: it separates the customer's words from ours without leaving
                    the quotation marks to do all the work. */}
                <blockquote className="mt-3 text-pretty text-body italic">
                  “{r.comment}”
                </blockquote>
                <div className="mt-5 flex items-center gap-3">
                  {initial ? (
                    <span
                      aria-hidden
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold-soft text-small font-bold text-gold"
                    >
                      {initial}
                    </span>
                  ) : null}
                  <div>
                    {r.name ? (
                      <p className="text-small font-bold text-ink">{r.name}</p>
                    ) : null}
                    {/* `tracking-normal` on purpose: --text-label carries an eyebrow's
                        0.12em, which on a sentence reads as a mistake. */}
                    {meta ? (
                      <p className="text-label tracking-normal text-muted">{meta}</p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

/**
 * Gold, not the brand green. On this site green means booking, available, confirmed — a
 * rating painted in it borrows a meaning it does not have. The colour is for the eye
 * only; `aria-label` is what carries the number.
 */
function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span
      aria-label={`${value} out of 5`}
      role="img"
      className="text-body tracking-wide text-gold"
    >
      {'★'.repeat(full)}
      <span className="text-line">{'★'.repeat(5 - full)}</span>
    </span>
  );
}

import type { ReviewSummary } from '@/lib/api';
import { MIN_REVIEWS } from '@/lib/review-rules';
import { Icon } from '@/components/site/Icons';

/**
 * How the customers who took this trip rated it — one summary, and nothing about who said
 * what (owner, 9 Oct 2026).
 *
 * Score first, as the travel sites people already know lay it out: the average large, five
 * stars filled to it (4.8 is four full and one four-fifths), the word for it and how many
 * rated. Then the driver and the car, each a bar of five segments — one per star, so the bar
 * and the stars above read the same way. Then the tags, each with the share of raters who
 * ticked it, which says more than a chip.
 *
 * Every figure is the backend's running count of real customer ratings (models/reviewStats).
 * The caller passes null below MIN_REVIEWS and then nothing appears — and the page's
 * structured data carries no rating either.
 */
export function RatingSummary({
  title,
  reviews,
  ratedBy,
}: {
  title: string;
  reviews: ReviewSummary | null;
  /** "who booked a Jaipur to Delhi cab" — the end of the "Rated by N travellers" line. */
  ratedBy: string;
}) {
  if (!reviews || reviews.average == null) return null;
  const { average, count, driverAverage, driverCount, cabAverage, cabCount } = reviews;
  const bars = [
    driverAverage != null && driverCount >= MIN_REVIEWS
      ? { label: 'Driver rating', value: driverAverage }
      : null,
    cabAverage != null && cabCount >= MIN_REVIEWS ? { label: 'Cab rating', value: cabAverage } : null,
  ].filter((b): b is { label: string; value: number } => b !== null);
  // A tag ticked once or twice is one or two people, not something "people are saying".
  const chips = reviews.tags.filter((t) => t.count >= 3).slice(0, 6);

  return (
    <section className="reveal section-gap" aria-labelledby="rating-summary">
      <h2 id="rating-summary" className="font-display text-balance text-h2">
        {title}
      </h2>

      <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-surface-raised">
        <div
          className={`grid gap-8 p-6 sm:p-8 md:gap-12 ${bars.length > 0 ? 'md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' : ''}`}
        >
          {/* The score. */}
          <div>
            <p className="flex items-end gap-2">
              <span className="font-display text-[clamp(3.75rem,3rem+3.5vw,5.75rem)] font-black leading-[0.85] tabular-nums text-ink">
                {average.toFixed(1)}
              </span>
              <span className="text-title font-bold text-faint">/ 5</span>
            </p>
            <Stars value={average} className="mt-4" />
            <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="rounded-full bg-accent px-3.5 py-1 text-small font-bold text-white">
                {ratingWord(average)}
              </span>
              <span className="text-body text-muted">
                Rated by <span className="font-semibold text-ink">{travellers(count)}</span>{' '}
                {ratedBy}
              </span>
            </p>
            <p className="mt-4 flex items-center gap-2 text-small text-faint">
              <Icon.check className="h-4 w-4 shrink-0 text-success" />
              Only a customer whose trip is complete can rate it
            </p>
          </div>

          {/* The driver and the car: five segments each, one per star. */}
          {bars.length > 0 ? (
            <div className="md:border-l md:border-line md:pl-12">
              <h3 className="text-label font-bold uppercase text-faint">By category</h3>
              <dl className="mt-5 grid gap-6">
                {bars.map((b) => (
                  <div key={b.label}>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-body font-semibold text-ink">{b.label}</dt>
                      <dd className="font-display text-title font-bold tabular-nums text-ink">
                        {b.value.toFixed(1)}
                        <span className="text-small font-semibold text-faint"> / 5</span>
                      </dd>
                    </div>
                    <dd className="mt-2.5 grid grid-cols-5 gap-1.5" aria-hidden>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span key={i} className="h-2.5 overflow-hidden rounded-full bg-line">
                          <span
                            className="block h-full rounded-full bg-accent"
                            style={{ width: `${Math.round(part(b.value, i) * 100)}%` }}
                          />
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>

        {/* What they ticked, with the share of raters who ticked it. */}
        {chips.length > 0 ? (
          <div className="border-t border-line bg-surface-alt p-6 sm:p-8">
            <h3 className="font-display text-title font-bold">What travellers say most</h3>
            <ul className="mt-5 grid gap-x-12 gap-y-5 sm:grid-cols-2">
              {chips.map((t) => {
                const pct = share(t.count, count);
                return (
                  <li key={t.key}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-body font-semibold text-ink">{t.label}</span>
                      <span className="text-small font-bold tabular-nums text-muted">{pct}%</span>
                    </div>
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
                      <span className="block h-full rounded-full bg-ink-soft" style={{ width: `${pct}%` }} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** Five stars, each filled as far as the average reaches into it. */
function Stars({ value, className = '' }: { value: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
      className={`flex items-center ${className}`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="relative h-9 w-9 sm:h-10 sm:w-10">
          <Icon.star className="absolute inset-0 h-full w-full text-line" />
          <span
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${starFill(part(value, i))}%` }}
          >
            <Icon.star className="h-9 w-9 max-w-none text-sun sm:h-10 sm:w-10" />
          </span>
        </span>
      ))}
    </span>
  );
}

/** How much of star (or segment) `i` an average fills: 0 to 1. */
export function part(value: number, i: number): number {
  return Math.max(0, Math.min(1, value - i));
}

/**
 * How wide to draw a star's gold, in percent of its box, for a fill of 0 to 1. The star's
 * points span x 3.5 to 20.5 of the 24-wide icon, so 0.8 must cover 80% of the star, not
 * of the box — or a 4.8 looks like a 5.
 */
export function starFill(fill: number): number {
  return fill <= 0 ? 0 : Math.round(((3.5 + 17 * fill) / 24) * 1000) / 10;
}

/** The share of raters who ticked a tag, in whole percent — never over 100. */
export function share(tagCount: number, raters: number): number {
  return raters > 0 ? Math.min(100, Math.round((tagCount / raters) * 100)) : 0;
}

/** The word under the score — the same bands the results above ours use. */
export function ratingWord(avg: number): string {
  if (avg >= 4.5) return 'Excellent';
  if (avg >= 4) return 'Very Good';
  if (avg >= 3.5) return 'Good';
  return 'Average';
}

/**
 * "37 travellers", "600+ travellers", "2,000+ travellers" — exact below a hundred, then
 * rounded DOWN (never more than the real count), with "+" only when there are more.
 */
export function travellers(count: number): string {
  const step = count >= 1000 ? 1000 : count >= 100 ? 100 : 1;
  const floored = Math.floor(count / step) * step;
  const n = floored.toLocaleString('en-IN');
  return `${n}${floored < count ? '+' : ''} ${count === 1 ? 'traveller' : 'travellers'}`;
}

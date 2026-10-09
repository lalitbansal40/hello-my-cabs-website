import type { ReviewSummary } from '@/lib/api';
import { MIN_REVIEWS } from '@/lib/review-rules';
import { Icon } from '@/components/site/Icons';

/**
 * How the customers who took this trip rated it — one summary, and nothing about who said
 * what (owner, 9 Oct 2026): the average with a word for it, the driver and car marks, how
 * many rated, and what they ticked most.
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

      <div className="mt-8 grid overflow-hidden rounded-3xl border border-line bg-surface-raised md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch">
            {/* The score. Red is the brand's; the number is the customers'. */}
            <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl bg-accent px-7 py-5 text-white">
              <span className="font-display text-title-lg font-black tabular-nums leading-none">
                {average.toFixed(1)}
              </span>
              <span className="mt-2 text-small font-bold">{ratingWord(average)}</span>
            </div>

            {bars.length > 0 ? (
              <dl className="grid flex-1 content-center gap-4">
                {bars.map((b) => (
                  <div key={b.label} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3">
                    <dt className="text-body font-semibold text-ink">{b.label}</dt>
                    <dd className="h-2 overflow-hidden rounded-full bg-line" aria-hidden>
                      <span
                        className="block h-full rounded-full bg-accent"
                        style={{ width: `${Math.max(0, Math.min(100, (b.value / 5) * 100))}%` }}
                      />
                    </dd>
                    <dd className="text-right text-body font-bold tabular-nums text-ink">
                      {b.value.toFixed(1)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          <p className="mt-6 flex items-center gap-2 text-body text-muted">
            <Icon.star className="h-5 w-5 shrink-0 text-gold" />
            <span>
              Rated by{' '}
              <span className="font-semibold text-ink">{travellers(count)}</span> {ratedBy}
            </span>
          </p>
        </div>

        {chips.length > 0 ? (
          <div className="border-t border-line p-6 sm:p-8 md:border-l md:border-t-0">
            <h3 className="font-display text-title font-bold">What travellers say most</h3>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {chips.map((t) => (
                <li
                  key={t.key}
                  className="rounded-full border border-line px-4 py-2 text-small font-semibold text-ink"
                >
                  {t.label}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
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

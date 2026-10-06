import { company } from '@/lib/company';

/**
 * "Rate us on Google" — for every completed trip, good or bad (7 Oct 2026).
 *
 * Shown on the booking page only once the trip is COMPLETED, to every customer: asking only
 * the happy ones is review gating, which Google forbids, and nothing is offered for a review.
 * Renders nothing until `company.reviewUrl` (the Business Profile's "Ask for reviews" link)
 * is set.
 */
export function RateUs({ status }: { status?: string }) {
  if (!company.reviewUrl) return null;
  if (status !== undefined && status !== 'COMPLETED') return null;
  return (
    <p className="text-body">
      How was the trip?{' '}
      <a
        href={company.reviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center font-semibold text-accent hover:underline"
      >
        Rate us on Google
      </a>
    </p>
  );
}

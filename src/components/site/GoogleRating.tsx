import { company } from '@/lib/company';

/**
 * "4.7 on Google · 156 reviews · October 2026" — the Business Profile's rating as dated text
 * with a link to the profile (7 Oct 2026). Renders nothing while `company.googleRating` is
 * null, which it is until the owner says to show it.
 */
export function GoogleRating({ className = '' }: { className?: string }) {
  const r = company.googleRating;
  if (!r) return null;
  return (
    <p className={`text-small ${className}`}>
      <a
        href={company.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center font-semibold hover:underline"
      >
        {r.value.toFixed(1)} on Google · {r.count.toLocaleString('en-IN')} reviews · {r.asOf}
      </a>
    </p>
  );
}

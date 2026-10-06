/**
 * "Fares checked 7 Oct 2026" (7 Oct 2026).
 *
 * The date the fares on the page were fetched — the moment the page was rendered, at build
 * for the busiest pages and on revalidation (once a day) for the rest. A page that says when
 * its prices were last read is one a visitor and a search engine can trust to be current;
 * the same date is the page's `dateModified` (lib/schema.tsx webPageSchema).
 */
export function faresCheckedAt(): Date {
  return new Date();
}

/** "7 Oct 2026", in India's time. */
export const istDate = (d: Date) =>
  d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

export function FaresChecked({ at, className = '' }: { at: Date; className?: string }) {
  return (
    <p className={`text-small ${className}`}>
      Fares checked <time dateTime={at.toISOString()}>{istDate(at)}</time>
    </p>
  );
}

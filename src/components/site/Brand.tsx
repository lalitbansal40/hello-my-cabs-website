/**
 * The wordmark and the motif that goes with it.
 *
 * A letter in a coloured square is not a logo — it is what a site has before anyone has
 * drawn one. The mark here is the route itself: two points and the line between them,
 * which is the whole business in one shape. It repeats as a divider, in the footer, and
 * as the favicon, so it becomes recognisable rather than decorative.
 */
export function RouteMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      {/* A solid line, not a dotted one. At 28px the dashes read as specks rather than
          as a road, and the mark stopped meaning anything. */}
      <path
        d="M7 25C7 17 11 14 16 14s9-3 9-11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="7" cy="25" r="3.6" fill="currentColor" />
      <circle cx="25" cy="4.5" r="3.2" fill="none" stroke="currentColor" strokeWidth="2.6" />
    </svg>
  );
}

export function Wordmark({
  className = '',
  tone = 'light',
}: {
  className?: string;
  tone?: 'light' | 'dark';
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <RouteMark className={`h-7 w-7 ${tone === 'light' ? 'text-accent' : 'text-forest'}`} />
      <span className="font-display text-title font-semibold">
        Hello My Cab
      </span>
    </span>
  );
}

/**
 * The divider between sections. A hairline with the mark sitting on it — enough to stop
 * two sections reading as one long scroll, without another full-width band.
 */
export function MarkDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-5 ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-line" />
      <RouteMark className="h-5 w-5 text-faint" />
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

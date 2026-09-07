import type { City } from '@/lib/api';

/**
 * The reach of the network, said by showing it.
 *
 * "2,000+ cities" is a claim. Two rows of actual city names drifting past is the same
 * claim with evidence attached, and it costs one line of data we already have.
 */
export function CityMarquee({ cities }: { cities: City[] }) {
  const half = Math.ceil(cities.length / 2);
  const rows = [cities.slice(0, half), cities.slice(half)];

  return (
    <div className="relative overflow-hidden py-3">
      {rows.map((row, i) => (
        <div
          key={i}
          className="marquee-track flex w-max gap-3 py-2"
          style={i === 1 ? { animationDirection: 'reverse', animationDuration: '58s' } : undefined}
        >
          {[...row, ...row].map((c, j) => (
            <span
              key={`${c.name}-${j}`}
              className="whitespace-nowrap rounded-full border border-line bg-surface-raised px-5 py-2.5 text-[14px] font-medium text-muted"
            >
              {c.label}
            </span>
          ))}
        </div>
      ))}
      {/* Fade the ends so the rows run off the page instead of stopping at a hard edge. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-surface to-transparent" />
    </div>
  );
}

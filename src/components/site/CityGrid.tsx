import Link from 'next/link';
import type { City } from '@/lib/api';
import { Icon } from './Icons';

/**
 * The reach of the network, said by showing it — as a still grid.
 *
 * This was a second pair of rows drifting sideways (CityMarquee). With the route ticker
 * under the hero that made two moving strips on one page, and a page that keeps moving is
 * a page that is tiring to read. The names are the evidence; they do not need to move.
 */
export function CityGrid({
  cities,
  total,
  phoneShows = cities.length,
}: {
  cities: City[];
  total: number;
  /** Fewer on a phone, where two dozen chips are a screen of their own. */
  phoneShows?: number;
}) {
  return (
    <div>
      <ul className="flex flex-wrap gap-2.5">
        {cities.map((c, i) => (
          <li
            key={c.name}
            className={`${i >= phoneShows ? 'max-sm:hidden ' : ''}whitespace-nowrap rounded-full border border-line bg-surface-raised px-4 py-2 text-small font-medium text-muted`}
          >
            {c.label}
          </li>
        ))}
      </ul>
      <Link
        href="/routes"
        className="group mt-6 inline-flex min-h-11 items-center gap-2 text-small font-bold text-accent hover:underline"
      >
        And {Math.max(0, total - cities.length).toLocaleString('en-IN')} more — see the routes
        <Icon.arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

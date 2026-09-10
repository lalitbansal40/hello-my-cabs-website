import Link from 'next/link';
import type { RouteSummary } from '@/lib/api';
import { Icon } from './Icons';
import { routePath } from '@/lib/slug';

const title = (key: string) =>
  key.toLowerCase().split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

/**
 * Routes as an editorial list, not a grid of cards.
 *
 * Six identical white boxes is what every page on this site had become — the eye skims
 * them and stops nowhere. A numbered list with rules between the rows reads like a
 * timetable, which is what this actually is, and the price can be set large enough to be
 * the thing you notice.
 */
export function RouteList({ routes }: { routes: RouteSummary[] }) {
  return (
    <ul className="mt-14 border-t border-line">
      {routes.map((r, i) => (
        <li key={`${r.pickup}-${r.drop}`}>
          <Link
            // The route's own page, not straight into /booking. /booking is noindex, so
            // every one of these rows was pouring the site's internal linking into a page
            // search engines are told to ignore — and leaving the route pages orphaned.
            // The route page carries the widget already filled in, so the trip is one
            // click further, not lost.
            href={routePath(r.pickup, r.drop)}
            className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-line py-6 sm:gap-10 sm:py-7 lg:py-9"
          >
            {/* A bar that grows from the left on hover — the row is a link, and it should
                behave like one without needing a button drawn on it. */}
            <span className="absolute inset-y-0 left-0 w-0 bg-surface-alt transition-all duration-500 ease-out group-hover:w-full" />
            <span className="font-display text-small relative tabular-nums text-faint transition-colors duration-300 group-hover:text-accent">
              {String(i + 1).padStart(2, '0')}
            </span>

            <span className="relative min-w-0">
              {/* The arrow belongs to the city it points at. Left to itself the line broke
                  after it — "Jaipur →" on one line, "Delhi Airport" on the next, an arrow
                  pointing at the end of a line — and a two-word city broke in half as well.
                  Each city holds together; <wbr/> puts the one break where it belongs. */}
              <span className="font-display text-title-lg block">
                <span className="whitespace-nowrap">{title(r.pickup)}</span>
                <wbr />
                <span className="whitespace-nowrap">
                  <span className="mx-2.5 inline-block align-middle text-accent sm:mx-4">
                    <Icon.arrow className="inline h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 sm:h-7 sm:w-7" />
                  </span>
                  {title(r.drop)}
                </span>
              </span>
              <span className="mt-2 text-label block font-medium uppercase text-faint">
                {r.distanceKm ? `${r.distanceKm} km · one way` : 'Fixed fare'}
              </span>
            </span>

            <span className="relative text-right">
              <span className="block text-label font-bold uppercase text-faint">
                from
              </span>
              <span className="font-display text-title-lg block transition-transform duration-300 group-hover:-translate-y-0.5">
                ₹{r.fromRupees?.toLocaleString('en-IN')}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

import Link from 'next/link';
import type { RouteSummary } from '@/lib/api';
import { Icon } from './Icons';

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
            href={`/booking?tripType=one_way&pickup=${r.pickup}&drop=${r.drop}`}
            className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-line py-7 sm:gap-10 sm:py-9"
          >
            {/* A bar that grows from the left on hover — the row is a link, and it should
                behave like one without needing a button drawn on it. */}
            <span className="absolute inset-y-0 left-0 w-0 bg-surface-alt transition-all duration-500 ease-out group-hover:w-full" />
            <span className="font-display relative text-[15px] tabular-nums text-faint transition-colors duration-300 group-hover:text-accent sm:text-[17px]">
              {String(i + 1).padStart(2, '0')}
            </span>

            <span className="relative min-w-0">
              <span className="font-display block text-[1.6rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.6rem]">
                {title(r.pickup)}
                <span className="mx-2.5 inline-block align-middle text-accent sm:mx-4">
                  <Icon.arrow className="inline h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 sm:h-7 sm:w-7" />
                </span>
                {title(r.drop)}
              </span>
              <span className="mt-2 block text-[13px] font-medium uppercase tracking-[0.1em] text-faint">
                {r.distanceKm ? `${r.distanceKm} km · one way` : 'Fixed fare'}
              </span>
            </span>

            <span className="relative text-right">
              <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-faint">
                from
              </span>
              <span className="font-display block text-[1.5rem] leading-[1.1] tracking-tight transition-transform duration-300 group-hover:-translate-y-0.5 sm:text-[2rem]">
                ₹{r.fromRupees?.toLocaleString('en-IN')}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

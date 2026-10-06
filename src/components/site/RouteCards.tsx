import Link from 'next/link';
import type { RouteSummary } from '@/lib/api';
import { Icon } from './Icons';
import { routePath } from '@/lib/slug';

const title = (key: string) =>
  key.toLowerCase().split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

/**
 * Popular routes as ticket stubs — the home page's, where a visitor scans for their own trip.
 * The journey on the left (From over To, on a short road), a tear down the middle, the
 * fare on the stub.
 * (City pages keep the numbered list, RouteList, where routes are read as a timetable.)
 *
 * Each goes to the route's own page, not straight into /booking: /booking is noindex, and
 * these links are how the route pages get found. The route page carries the ticket already
 * filled in, so the trip is one tap further, not lost.
 */
export function RouteCards({ routes }: { routes: RouteSummary[] }) {
  return (
    <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {routes.map((r, i) => (
        // Four on a phone: six tickets stacked were 1,100px of a 10,000px page, and "All
        // routes" is right under them. Two rows of three from a tablet up.
        <li key={`${r.pickup}-${r.drop}`} className={`ticket-shadow ${i >= 4 ? 'max-sm:hidden' : ''}`}>
          <Link
            href={routePath(r.pickup, r.drop)}
            // The card shows the two names on two lines; said whole, it is the route's own
            // phrase — for a screen reader, and as the link's name.
            aria-label={`${title(r.pickup)} to ${title(r.drop)} taxi${
              r.distanceKm ? `, ${r.distanceKm} km one way` : ''
            }${r.fromRupees ? `, from ₹${r.fromRupees.toLocaleString('en-IN')}` : ''}`}
            // The stub is 6.5rem wide; the bites sit on the tear, at its left edge.
            style={{ ['--notch-x' as string]: 'calc(100% - 6.5rem)' }}
            className="ticket-v group flex min-h-[6.5rem] items-stretch transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            {/* From over To, joined by a short upright road — two lines so that "Delhi
                Airport" and "Chandigarh" are never cut to "Delhi Air…". */}
            <span className="flex min-w-0 flex-1 items-stretch gap-3 px-5 py-4">
              <span aria-hidden className="flex flex-col items-center py-1.5">
                <span className="size-2.5 shrink-0 rounded-full bg-road" />
                <span className="w-0.5 flex-1 rounded-full bg-road" />
                <span className="size-2.5 shrink-0 rounded-full border-2 border-road" />
              </span>
              <span className="flex min-w-0 flex-col justify-between gap-1">
                <span className="font-display text-title leading-tight">{title(r.pickup)}</span>
                <span className="font-display text-title leading-tight">{title(r.drop)}</span>
                <span className="text-small text-muted">
                  {r.distanceKm ? `${r.distanceKm} km · one way` : 'Fixed fare'}
                </span>
              </span>
            </span>
            <span className="flex w-[6.5rem] shrink-0 flex-col items-center justify-center border-l-2 border-dashed border-line px-2 text-center">
              <span className="text-label font-bold uppercase text-faint">from</span>
              <span className="font-display text-title text-accent">
                ₹{r.fromRupees?.toLocaleString('en-IN')}
              </span>
              <Icon.arrow className="mt-1 h-4 w-4 text-accent transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

import Link from 'next/link';
import type { RouteSummary } from '@/lib/api';
import { Icon } from './Icons';
import { routePath } from '@/lib/slug';

const title = (key: string) =>
  key.toLowerCase().split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

/**
 * Popular routes as cards — the home page's, where a visitor scans for their own trip.
 * (City pages keep the numbered list, RouteList, where the routes are read as a timetable.)
 *
 * Each card goes to the route's own page, not straight into /booking: /booking is noindex,
 * and these links are how the route pages get found. The route page carries the booking
 * card already filled in, so the trip is one tap further, not lost.
 */
export function RouteCards({ routes }: { routes: RouteSummary[] }) {
  return (
    <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {routes.map((r) => (
        <li key={`${r.pickup}-${r.drop}`}>
          <Link
            href={routePath(r.pickup, r.drop)}
            className="group flex h-full flex-col justify-between gap-5 rounded-2xl border border-line bg-surface-raised p-5 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[var(--shadow-lift)] motion-reduce:hover:translate-y-0"
          >
            <span className="flex items-start gap-3">
              <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                <Icon.route className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-title">
                  {title(r.pickup)}
                  <Icon.arrow className="mx-1.5 inline h-4 w-4 align-[-0.1em] text-accent" />
                  {title(r.drop)}
                </span>
                <span className="mt-1 block text-small text-muted">
                  {r.distanceKm ? `${r.distanceKm} km · one way` : 'Fixed fare'}
                </span>
              </span>
            </span>
            <span className="flex items-end justify-between gap-3 border-t border-line pt-4">
              <span>
                <span className="block text-label font-bold uppercase text-faint">from</span>
                <span className="block font-display text-title-lg">
                  ₹{r.fromRupees?.toLocaleString('en-IN')}
                </span>
              </span>
              <span className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-accent px-4 text-small font-bold text-white transition-colors group-hover:bg-accent-dark">
                Book
                <Icon.arrow className="h-4 w-4" />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

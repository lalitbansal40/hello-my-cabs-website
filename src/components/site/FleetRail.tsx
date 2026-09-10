import type { Vehicle } from '@/lib/api';
import { Icon } from './Icons';

/**
 * The fleet as a rail you push sideways.
 *
 * A four-column grid puts every vehicle at the same weight and stops the section having
 * any shape. Scrolling horizontally is also how people expect to browse a fleet on a
 * phone, and it lets the cards be tall enough to say something.
 */
export function FleetRail({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="-mx-5 mt-14 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ul className="stagger flex w-max gap-5">
        {vehicles.map((v) => (
          <li
            key={v.key}
            className="group relative flex w-[15.5rem] flex-col overflow-hidden rounded-[1.75rem] border border-line bg-surface-raised p-6 shadow-[var(--shadow-soft)] sm:w-[16.5rem] sm:p-7 transition-all duration-300 hover:-translate-y-2 hover:border-forest/20 hover:shadow-[var(--shadow-deep)]"
          >
            {/* A wash that rises on hover, so the card lights up rather than just moving. */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-accent/10 to-transparent transition-all duration-500 group-hover:h-32" />
            <div className="relative">
              <Icon.car className="h-9 w-9 text-forest transition-transform duration-500 group-hover:-translate-x-1" />
              <p className="font-display mt-6 text-title">
                {v.label}
              </p>
              {v.seats ? <p className="mt-1.5 text-small text-muted">{v.seats} seats</p> : null}
            </div>
            {/* The chip follows the text it belongs to. Pinned to the bottom of a fixed card it
                left a hand's width of nothing in the middle of every card in the rail. */}
            <p className="relative mt-6 inline-flex w-fit rounded-full bg-surface-alt px-3 py-1.5 text-label font-bold uppercase text-muted">
              {v.tripTypes.length === 1 ? 'Round trip only' : 'All trip types'}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

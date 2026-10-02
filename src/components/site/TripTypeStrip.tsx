'use client';

import { Icon } from './Icons';
import { selectTrip, type TripType } from '@/lib/trip-select';

/**
 * The three ways to hire a cab here, as a strip under the booking card: tap one and the
 * card above switches to it and comes into view.
 *
 * Three, not four — no airport transfers (owner's decision, 2 Oct 2026). Buttons, not
 * links: they change the card on this page, they do not go anywhere.
 */
const KINDS: [TripType, string, string, typeof Icon.pin][] = [
  ['one_way', 'One way', 'Drop-off only', Icon.route],
  ['round_trip', 'Round trip', 'Same cab, there and back', Icon.loop],
  ['local', 'Local', 'City rides, by the hour', Icon.clock],
];

export function TripTypeStrip({ className = '' }: { className?: string }) {
  return (
    // A row that scrolls sideways on a phone, three equal columns from `sm` up.
    <ul
      className={`-mx-gutter flex snap-x snap-mandatory gap-3 overflow-x-auto px-gutter pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-line sm:overflow-visible sm:rounded-3xl sm:border sm:border-line sm:bg-surface-raised sm:px-0 sm:pb-0 sm:shadow-[var(--shadow-soft)] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {KINDS.map(([kind, title, sub, I]) => (
        <li key={kind} className="shrink-0 snap-start sm:shrink">
          <button
            type="button"
            onClick={() => selectTrip(kind)}
            className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-line bg-surface-raised px-4 py-3 text-left transition-colors hover:bg-surface-alt sm:justify-center sm:rounded-none sm:border-0 sm:bg-transparent sm:py-5"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
              <I className="h-6 w-6" />
            </span>
            <span>
              <span className="block whitespace-nowrap text-small font-black uppercase tracking-wide text-ink">
                {title}
              </span>
              <span className="block whitespace-nowrap text-small text-muted">{sub}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

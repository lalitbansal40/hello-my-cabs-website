'use client';

import { selectTrip, type TripType } from '@/lib/trip-select';

/**
 * Three ways to ride — each with a little road drawn the way that trip goes, and a line on
 * what it costs. Tap one and the ticket at the top switches to it and comes into view.
 *
 * It replaced a strip of trip-type icons under the booking card that was a competitor's, and
 * that repeated the ticket's own tabs right under them. Down here it explains rather than
 * repeats.
 */
const KINDS: { kind: TripType; title: string; body: string; road: React.ReactNode }[] = [
  {
    kind: 'one_way',
    title: 'One way',
    body: 'You pay for the distance you travel — the drop is where the trip ends.',
    road: (
      <>
        <path d="M8 22H72" />
        <path d="m64 15 8 7-8 7" />
        <circle cx="8" cy="22" r="4" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    kind: 'round_trip',
    title: 'Round trip',
    body: 'The same car there and back, priced per kilometre for the whole journey.',
    road: (
      <>
        <path d="M10 15H66" />
        <path d="m60 9 6 6-6 6" />
        <path d="M70 29H14" />
        <path d="m20 23-6 6 6 6" />
      </>
    ),
  },
  {
    kind: 'local',
    title: 'Local',
    body: 'A car and driver by the hour, for errands and weddings in one city.',
    road: (
      <>
        <ellipse cx="40" cy="22" rx="28" ry="14" />
        <circle cx="68" cy="22" r="4" fill="currentColor" stroke="none" />
      </>
    ),
  },
];

export function TripKinds({ className = '' }: { className?: string }) {
  return (
    <ul className={`grid gap-4 sm:grid-cols-3 ${className}`}>
      {KINDS.map(({ kind, title, body, road }) => (
        <li key={kind}>
          <button
            type="button"
            onClick={() => selectTrip(kind)}
            className="flex h-full w-full flex-col items-start gap-3 rounded-3xl bg-surface-raised p-5 text-left ring-1 ring-line transition-all hover:ring-accent/50 hover:shadow-[var(--shadow-soft)]"
          >
            <svg
              aria-hidden
              viewBox="0 0 80 44"
              className="h-11 w-20 text-accent"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {road}
            </svg>
            <span className="font-display text-title">{title}</span>
            <span className="text-small text-muted">{body}</span>
            <span className="mt-auto text-small font-bold text-accent">Book a {title.toLowerCase()} →</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

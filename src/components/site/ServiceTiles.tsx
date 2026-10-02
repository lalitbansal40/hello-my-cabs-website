import Link from 'next/link';
import { Icon } from './Icons';
import { vehiclePath } from '@/lib/slug';

/**
 * The four things this company does, as four coloured tiles across the top of the home
 * page — the first thing a visitor reads, so they know in one glance whether they are in
 * the right place.
 *
 * Only what we actually run: cabs, Char Dham, the premium cars, the tempo travellers. No
 * hotels and no self-drive rentals (owner's decision, 2 Oct 2026) — a tile for a service we
 * do not offer is a dead end with our name on it.
 *
 * Colours are tokens (globals.css), and white text on both ends of every gradient was
 * measured at 4.5 or more.
 */
const TILES = [
  {
    title: 'Cab booking',
    sub: 'Outstation & local',
    href: '/#book',
    icon: Icon.taxi,
    tone: 'from-tile-cab-from to-tile-cab-to',
  },
  {
    title: 'Char Dham',
    sub: 'Yatra packages',
    href: '/char-dham-yatra',
    icon: Icon.temple,
    tone: 'from-tile-dham-from to-tile-dham-to',
  },
  {
    title: 'Luxury car',
    sub: 'Premium experience',
    href: '/luxury-car',
    icon: Icon.diamond,
    // The black one gets a hairline of gold: on black, the gold is what says "premium".
    tone: 'from-tile-lux-from to-tile-lux-to ring-1 ring-inset ring-gold/60',
  },
  {
    title: 'Tempo Traveller',
    sub: 'Group travel',
    href: vehiclePath('tt_12'),
    icon: Icon.van,
    tone: 'from-tile-tempo-from to-tile-tempo-to',
  },
] as const;

export function ServiceTiles({ className = '' }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 ${className}`}>
      {TILES.map(({ title, sub, href, icon: I, tone }) => (
        <li key={title}>
          <Link
            href={href}
            aria-label={`${title} — ${sub}`}
            className={`group flex h-full min-h-[4.75rem] flex-col items-start gap-2 rounded-2xl bg-gradient-to-br px-3.5 py-3 text-white shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-4 ${tone}`}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 sm:size-12">
              <I className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <span className="min-w-0">
              {/* On a phone the icon sits above the words and the name may take two lines:
                  at 320 a tile is about 140px wide, and "TEMPO TRAVELLER" on one line was
                  cut to "TEMPO TRA". From `sm` up the icon is beside it and it fits on one. */}
              <span className="block text-small font-black uppercase leading-tight tracking-wide sm:whitespace-nowrap sm:text-body">
                {title}
              </span>
              <span className="mt-0.5 block text-label font-medium tracking-normal text-white">
                {sub}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

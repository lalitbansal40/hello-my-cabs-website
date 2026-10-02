import Link from 'next/link';
import { Icon } from './Icons';
import { Wordmark } from './Brand';
import { AccountMenu } from './AccountMenu';
import { MobileMenu } from './MobileMenu';
import { HeaderShell } from './HeaderShell';
import { company } from '@/lib/company';

/**
 * White, with the logo in its own colours — the way the owner's logo is drawn, red and
 * black on white.
 *
 * The bar's own background is in HeaderShell, which is where the scroll position is known.
 * This stays a server component: it reads nothing, so every page that carries it is still
 * prerendered.
 */
export function Header() {
  return (
    <HeaderShell>
      {/* A gap, not just justify-between: once the bar is full at tablet width there is
          nothing left to space out, and "How it works" ran straight into "Sign in". */}
      <div
        // The side padding takes the notch into account: held in landscape, the rounded
        // corner and the camera cut into the bar, and the wordmark sat under them.
        className="mx-auto flex max-w-6xl 2xl:max-w-7xl items-center justify-between gap-x-2 py-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:gap-x-6 sm:pl-[max(1.25rem,env(safe-area-inset-left))] sm:pr-[max(1.25rem,env(safe-area-inset-right))] flat:py-1.5"
      >
        <Link href="/" aria-label="Hello My Cab — home" className="flex min-h-11 shrink-0 items-center whitespace-nowrap">
          <Wordmark />
        </Link>

        {/* The bar appears at 1024, which is an iPad in landscape — a finger, not a
            mouse. The rows are the height of a tap even though they read as plain text. */}
        {/* "How it works" moved to the footer to make room: the two new pages are things
            people come looking for, the explainer is something they scroll past. */}
        <nav className="hidden text-small items-center gap-7 font-semibold text-ink-soft lg:flex">
          {[
            ['Routes', '/routes'],
            ['Char Dham', '/char-dham-yatra'],
            ['Luxury', '/luxury-car'],
            ['Fleet', '/#fleet'],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="flex min-h-11 items-center transition-colors hover:text-accent">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Client-side on purpose — see AccountMenu. The header itself must never read
              the session, or all 105 prerendered pages stop being prerendered. */}
          <AccountMenu />
          <a
            href={company.phoneHref}
            className="hidden text-small items-center gap-2 font-bold tabular-nums text-ink transition-colors hover:text-accent lg:flex min-h-11"
          >
            <Icon.phone className="h-4 w-4 text-accent" />
            {company.phone}
          </a>
          <Link
            href="/#book"
            // Nowrap and tighter padding on the narrowest phones: at 360 this broke onto two
            // lines, and so did the wordmark beside it, leaving the bar looking collapsed.
            className="ticket-stub whitespace-nowrap text-small rounded-xl bg-accent px-3 py-2.5 pl-4 font-bold text-white transition-all hover:bg-accent-dark sm:px-5 sm:pl-6 inline-flex min-h-11 items-center"
          >
            Book now
          </Link>
          {/* Below `sm` the header had a logo and a button and nothing else — no links, no
              number, no way to your trips. Most of the traffic is here. */}
          <MobileMenu />
        </div>
      </div>
    </HeaderShell>
  );
}

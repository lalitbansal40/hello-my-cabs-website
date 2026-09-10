import Link from 'next/link';
import { Icon } from './Icons';
import { Wordmark } from './Brand';
import { AccountMenu } from './AccountMenu';
import { MobileMenu } from './MobileMenu';

/**
 * Dark to match the hero it sits on, and translucent so the page moves under it. A white
 * bar over a dark hero cuts the page in two before the visitor has read a word.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0b2c22]/80 backdrop-blur-2xl">
      {/* A gap, not just justify-between: once the bar is full at tablet width there is
          nothing left to space out, and "How it works" ran straight into "Sign in". */}
      <div
        // The side padding takes the notch into account: held in landscape, the rounded
        // corner and the camera cut into the bar, and the wordmark sat under them.
        className="mx-auto flex max-w-6xl items-center justify-between gap-x-2 py-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:gap-x-6 sm:pl-[max(1.25rem,env(safe-area-inset-left))] sm:pr-[max(1.25rem,env(safe-area-inset-right))] flat:py-1.5"
      >
        <Link href="/" className="flex min-h-11 shrink-0 items-center whitespace-nowrap text-white">
          <Wordmark />
        </Link>

        {/* The bar appears at 1024, which is an iPad in landscape — a finger, not a
            mouse. The rows are the height of a tap even though they read as plain text. */}
        <nav className="hidden text-small items-center gap-8 font-medium text-white/55 lg:flex">
          <Link href="/routes" className="flex min-h-11 items-center transition-colors hover:text-white">Routes</Link>
          <Link href="/#fleet" className="flex min-h-11 items-center transition-colors hover:text-white">Fleet</Link>
          <Link href="/#how" className="flex min-h-11 items-center transition-colors hover:text-white">How it works</Link>
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Client-side on purpose — see AccountMenu. The header itself must never read
              the session, or all 105 prerendered pages stop being prerendered. */}
          <AccountMenu />
          <a
            href="tel:+919667111921"
            className="hidden text-small items-center gap-2 font-semibold tabular-nums text-white/65 transition-colors hover:text-white lg:flex min-h-11"
          >
            <Icon.headset className="h-4 w-4" />
            +91 96671 11921
          </a>
          <Link
            href="/#book"
            // Nowrap and tighter padding on the narrowest phones: at 360 this broke onto two
            // lines, and so did the wordmark beside it, leaving the bar looking collapsed.
            className="whitespace-nowrap text-small rounded-full bg-accent px-3 py-2.5 font-bold text-forest transition-all hover:bg-white sm:px-5 inline-flex min-h-11 items-center"
          >
            Book now
          </Link>
          {/* Below `sm` the header had a logo and a button and nothing else — no links, no
              number, no way to your trips. Most of the traffic is here. */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-x-6 px-5 py-3">
        <Link href="/" className="text-white">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-8 text-[14px] font-medium text-white/55 lg:flex">
          <Link href="/routes" className="transition-colors hover:text-white">Routes</Link>
          <Link href="/#fleet" className="transition-colors hover:text-white">Fleet</Link>
          <Link href="/#how" className="transition-colors hover:text-white">How it works</Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Client-side on purpose — see AccountMenu. The header itself must never read
              the session, or all 105 prerendered pages stop being prerendered. */}
          <AccountMenu />
          <a
            href="tel:+919667111921"
            className="hidden items-center gap-2 text-[14px] font-semibold tabular-nums text-white/65 transition-colors hover:text-white lg:flex"
          >
            <Icon.headset className="h-4 w-4" />
            +91 96671 11921
          </a>
          <Link
            href="/#book"
            className="rounded-full bg-accent px-5 py-2.5 text-[13px] font-bold text-forest transition-all hover:bg-white"
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

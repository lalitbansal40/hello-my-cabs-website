import Link from 'next/link';
import { Icon } from './Icons';
import { CharDhamBanner } from './CharDhamBanner';
import { PromiseCard } from './PromiseCard';
import { SupportCard } from './SupportCard';
import { vehiclePath } from '@/lib/slug';

/**
 * What we run, beside the booking ticket — boxes of different sizes (a bento), white on the
 * cream, with red line drawings.
 *
 * It replaced a row of four equal, solid-colour tiles that was a competitor's first screen
 * with our colours in it. There is no "Cab booking" box: the ticket beside this is that.
 *
 *   Char Dham — the big one (a postcard)
 *   Luxury · Tempo Traveller — two small ones
 *
 * Our promise and the desk are their own block (BentoExtras): on a laptop they go under the
 * ticket, which otherwise left half the first screen empty; on a phone they follow these.
 *
 * Only what the company runs: no hotels, no self-drive rentals, no airport transfers.
 */
const SMALL = [
  {
    title: 'Luxury cars',
    sub: 'Innova Crysta, Force Urbania',
    href: '/luxury-car',
    icon: Icon.diamond,
  },
  {
    title: 'Tempo Traveller',
    sub: '12 to 16 seats, for groups',
    href: vehiclePath('tt_12'),
    icon: Icon.van,
  },
] as const;

export function ServiceBento({ className = '' }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${className}`}>
      <CharDhamBanner className="col-span-2" />

      {SMALL.map(({ title, sub, href, icon: I }) => (
        <Link
          key={title}
          href={href}
          className="group flex min-h-[7.5rem] flex-col justify-between gap-3 rounded-3xl bg-surface-raised p-4 ring-1 ring-line transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] hover:ring-accent/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5"
        >
          {/* A line drawing in the brand red, large and at the corner — not a white icon in
              a coloured circle, which is what the tiles this replaced had. */}
          <I className="h-10 w-10 text-accent sm:h-12 sm:w-12" />
          <span>
            <span className="flex items-center gap-1.5 font-display text-title leading-tight">
              {title}
              <Icon.arrow className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="mt-0.5 block text-small text-muted">{sub}</span>
          </span>
        </Link>
      ))}

    </div>
  );
}

/**
 * Our promise and the desk: side by side on a tablet (the page is one column there and they
 * have its width), one above the other under the ticket on a laptop, where half the column
 * each made them tall and narrow.
 */
export function BentoExtras({ className = '' }: { className?: string }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 sm:items-end lg:grid-cols-1 ${className}`}>
      <PromiseCard />
      <SupportCard />
    </div>
  );
}

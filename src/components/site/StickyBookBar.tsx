import Link from 'next/link';
import { BookBarShell } from './BookBarShell';

/**
 * The one action a page exists for, kept within reach on a phone.
 *
 * Once somebody has scrolled past the hero the booking form is far above them. The home
 * page had this bar; the route, city and vehicle pages — which are where people land from
 * a search — did not, so the visitor with the clearest intent had the longest way back.
 *
 * It renders its own spacer after itself, so whatever page it is placed on, the last line
 * of that page clears it. Hidden from a laptop up, and on a phone turned sideways, where
 * a fixed bar would take a fifth of a 390px screen — and while the booking ticket itself is
 * on screen (BookBarShell), where it only covered the ticket's own button.
 */
export function StickyBookBar({
  from,
  href = '#book',
  onDistance = false,
  title,
}: {
  from?: number | null;
  href?: string;
  /** A route priced on distance rather than from the fixed table — never "Fixed fare". */
  onDistance?: boolean;
  /**
   * The trip this page is about ("Jaipur → Delhi"). Given, a laptop gets it too — a small
   * pill at the bottom centre once the booking card has scrolled away, so a long route page
   * never leaves the reader without a way to book it. (A box at the side was the plan; at
   * 1280px the side margin is 64px and it would have sat on the text.)
   */
  title?: string;
}) {
  return (
    <>
      <BookBarShell className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-gutter pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_-12px_rgba(20,19,15,0.18)] backdrop-blur-xl transition-transform duration-300 motion-reduce:transition-none lg:hidden flat:hidden">
        <div className="mx-auto flex max-w-6xl 2xl:max-w-7xl items-center justify-between gap-4">
          <div className="min-w-0">
            {from ? (
              <p className="text-label font-bold uppercase text-faint">
                From ₹{from.toLocaleString('en-IN')}
              </p>
            ) : null}
            <p className="truncate text-small font-semibold text-ink">
              {onDistance ? 'Priced on distance, no surge' : 'Fixed fare, no surge'}
            </p>
          </div>
          <Link
            href={href}
            className="ticket-stub inline-flex min-h-11 shrink-0 items-center rounded-xl bg-accent pl-6 pr-5 text-small font-bold text-white transition-colors hover:bg-accent-dark"
          >
            Book a cab
          </Link>
        </div>
      </BookBarShell>
      <div
        className="h-[calc(4.5rem+env(safe-area-inset-bottom))] lg:hidden flat:hidden"
        aria-hidden
      />
      {/* After the phone bar: the audit reads the first [data-sticky-book] as the bar. */}
      {title ? (
        <BookBarShell className="fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 transition-[opacity,transform] duration-300 motion-reduce:transition-none lg:block [&[inert]]:pointer-events-none [&[inert]]:translate-y-4 [&[inert]]:opacity-0">
          <Link
            href={href}
            className="flex items-center gap-4 rounded-full bg-ink py-2 pl-6 pr-2 text-white shadow-[var(--shadow-deep)] transition-colors hover:bg-ink-soft"
          >
            <span className="text-small font-semibold">
              {title}
              {from ? <span className="text-white/60"> · from ₹{from.toLocaleString('en-IN')}</span> : null}
            </span>
            <span className="inline-flex min-h-10 items-center rounded-full bg-accent px-5 text-small font-bold">
              Book
            </span>
          </Link>
        </BookBarShell>
      ) : null}
    </>
  );
}

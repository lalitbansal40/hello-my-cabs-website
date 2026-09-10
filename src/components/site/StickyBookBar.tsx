import Link from 'next/link';

/**
 * The one action a page exists for, kept within reach on a phone.
 *
 * Once somebody has scrolled past the hero the booking form is far above them. The home
 * page had this bar; the route, city and vehicle pages — which are where people land from
 * a search — did not, so the visitor with the clearest intent had the longest way back.
 *
 * It renders its own spacer after itself, so whatever page it is placed on, the last line
 * of that page clears it. Hidden from a laptop up, and on a phone turned sideways, where
 * a fixed bar would take a fifth of a 390px screen.
 */
export function StickyBookBar({ from, href = '#book' }: { from?: number | null; href?: string }) {
  return (
    <>
      <div
        data-sticky-book
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-gutter pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_-12px_rgba(20,19,15,0.18)] backdrop-blur-xl lg:hidden flat:hidden"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="min-w-0">
            {from ? (
              <p className="text-label font-bold uppercase text-faint">
                From ₹{from.toLocaleString('en-IN')}
              </p>
            ) : null}
            <p className="truncate text-small font-semibold text-ink">Fixed fare, no surge</p>
          </div>
          <Link
            href={href}
            className="inline-flex min-h-11 shrink-0 items-center rounded-xl bg-forest px-5 text-small font-bold text-white"
          >
            Book a cab
          </Link>
        </div>
      </div>
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom))] lg:hidden flat:hidden" aria-hidden />
    </>
  );
}

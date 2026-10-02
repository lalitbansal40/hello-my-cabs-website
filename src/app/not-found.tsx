import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { api } from '@/lib/api';
import { routePath, cityTitle } from '@/lib/slug';
import { company } from '@/lib/company';
import { RoadLine } from '@/components/site/RoadLine';
import { VehicleArt } from '@/components/site/VehicleArt';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

/**
 * A wrong link, inside the site rather than outside it.
 *
 * This used to be a heading in the default sans on a blank page — no header, no footer,
 * nothing to show it was even the same company. Somebody who lands here followed a link
 * that meant to bring them somewhere, so the page offers the places people usually mean:
 * the most asked-for routes, all of them, a way to book, and a number to ring. The car on
 * the road is the site's own drawing, so even the wrong turn looks like the same company.
 */
export default async function NotFound() {
  const { routes } = await api.listedRoutes().catch(() => ({ routes: [] }));
  const popular = routes.slice(0, 6);

  return (
    <>
      <Header />

      <section className="hero-ground grain relative isolate overflow-hidden text-white">
        {/* The road runs under the words, not through them, and the car is on it. */}
        <RoadLine className="top-1/2" />
        <div className="relative mx-auto max-w-3xl px-gutter pb-28 pt-12 sm:pb-32">
          <VehicleArt
            vehicleKey="sedan"
            label=""
            tone="dark"
            className="pointer-events-none absolute bottom-6 right-gutter w-32 sm:w-44"
          />
          <p className="text-label font-bold uppercase text-accent">404</p>
          <h1 className="font-display mt-4 text-h1 text-balance">This page is not here</h1>
          <p className="mt-5 max-w-measure text-lead text-pretty text-white/75">
            The link may be old, or the route may have a different name now. Here is where most
            people are heading.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-gutter py-section-sm">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/#book"
            className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-small font-bold text-white transition-colors hover:bg-accent-dark"
          >
            Book a cab
          </Link>
          <a
            href={company.phoneHref}
            className="inline-flex min-h-11 items-center rounded-full border border-line px-6 text-small font-bold transition-colors hover:border-faint"
          >
            Call us · {company.phone}
          </a>
          <Link
            href="/routes"
            className="inline-flex min-h-11 items-center rounded-full border border-line px-6 text-small font-bold transition-colors hover:border-faint"
          >
            See every route
          </Link>
        </div>
        {popular.length ? (
          <>
            <h2 className="font-display mt-12 text-h3">Popular routes</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {popular.map((r) => (
                <li key={`${r.pickup}-${r.drop}`}>
                  <Link
                    href={routePath(r.pickup, r.drop)}
                    className="flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-line bg-surface-raised px-5 transition-colors hover:border-faint"
                  >
                    <span className="text-body font-medium">
                      {cityTitle(r.pickup)} → {cityTitle(r.drop)}
                    </span>
                    {r.fromRupees ? (
                      <span className="shrink-0 text-small text-muted">
                        ₹{r.fromRupees.toLocaleString('en-IN')}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}

      </main>

      <Footer />
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cityPath, cityTitle, routePath } from '@/lib/slug';
import { JsonLd, breadcrumbSchema } from '@/lib/schema';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { Icon } from '@/components/site/Icons';

export const revalidate = 86_400;

export const metadata: Metadata = {
  title: 'All routes with a fixed fare',
  description:
    'Every intercity route we price in advance, grouped by pickup city. One-way and round-trip fares, fixed before you travel.',
  alternates: { canonical: '/routes' },
};

/**
 * The index that makes the rest findable.
 *
 * A sitemap tells a crawler a URL exists; a link tells it the URL matters, and pages
 * reachable only from a sitemap tend to sit unindexed for months. This page, plus the
 * footer, means every route is linked from at least two places.
 */
export default async function RoutesIndex() {
  const { routes, count } = await api.routes().catch(() => ({ count: 0, routes: [] }));

  const byCity = new Map<string, typeof routes>();
  for (const r of routes) {
    byCity.set(r.pickup, [...(byCity.get(r.pickup) ?? []), r]);
  }

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Routes', path: '/routes' },
      ])} />
      <Header />

      <section className="hero-ground grain relative overflow-hidden text-white">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16">
          <nav aria-label="Breadcrumb" className="text-white/45 text-small [&_a]:inline-block [&_a]:py-3 [&_a]:-my-3">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white/70">Routes</span>
          </nav>
          <h1 className="font-display text-h1 mt-6 text-balance">
            Every priced route
          </h1>
          <p className="mt-6 text-lead max-w-lg text-white/75 text-pretty">
            {count} routes carry a fare we set in advance — grouped by where the trip starts.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5 py-20">
        {[...byCity.entries()].map(([city, rows]) => (
          <section key={city} className="border-b border-line py-10 first:pt-0 last:border-0">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-title-lg">
                From {cityTitle(city)}
              </h2>
              <Link
                href={cityPath(city)}
                className="group text-small inline-flex items-center gap-1.5 font-semibold text-forest hover:text-accent min-h-11"
              >
                Cab service in {cityTitle(city)}
                <Icon.arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {rows.map((r) => (
                <li key={r.drop}>
                  <Link
                    href={routePath(r.pickup, r.drop)}
                    className="group flex items-center justify-between rounded-xl border border-line bg-surface-raised px-4 py-3 transition-colors hover:border-forest/25"
                  >
                    <span className="font-medium text-body">
                      {cityTitle(r.pickup)} → {cityTitle(r.drop)}
                    </span>
                    <span className="text-muted text-small">
                      ₹{r.fromRupees?.toLocaleString('en-IN')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <Footer />
    </>
  );
}

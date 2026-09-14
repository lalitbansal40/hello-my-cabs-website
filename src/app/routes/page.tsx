import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cityPageName, cityPath, cityTitle, routePath } from '@/lib/slug';
import { citiesWithPages } from '@/lib/city-pages';
import { JsonLd, breadcrumbSchema, faqSchema } from '@/lib/schema';
import { rupees } from '@/lib/seo';
import { Faq } from '@/components/site/Faq';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { Icon } from '@/components/site/Icons';

export const revalidate = 86_400;

// The number in the title is the number on the page — counted, not typed, so it follows the
// list when routes are added or held back.
export async function generateMetadata(): Promise<Metadata> {
  const { count } = await api.listedRoutes().catch(() => ({ count: 0 }));
  return {
    title: {
      absolute: count
        ? `Taxi Fares for ${count} Routes — Hello My Cab`
        : 'Taxi Fares by Route — Hello My Cab',
    },
    description:
      'Every intercity route we price in advance, grouped by pickup city. One-way and round-trip fares, fixed before you travel.',
    alternates: { canonical: '/routes' },
  };
}

/**
 * The index that makes the rest findable.
 *
 * A sitemap tells a crawler a URL exists; a link tells it the URL matters, and pages
 * reachable only from a sitemap tend to sit unindexed for months. This page, plus the
 * footer, means every route is linked from at least two places.
 */
export default async function RoutesIndex() {
  const { routes, fixedCount } = await api
    .listedRoutes()
    .catch(() => ({ count: 0, fixedCount: 0, routes: [] }));
  const withPages = citiesWithPages(routes);
  const onDistance = routes.length - fixedCount;

  const byCity = new Map<string, typeof routes>();
  for (const r of routes) {
    byCity.set(r.pickup, [...(byCity.get(r.pickup) ?? []), r]);
  }

  // Counted from the catalogue, so the introduction cannot drift from the list below it.
  const priced = routes.filter((r) => (r.fromRupees ?? 0) > 0);
  const cheapest = [...priced].sort((x, y) => (x.fromRupees ?? 0) - (y.fromRupees ?? 0))[0];
  const longest = [...priced]
    .filter((r) => r.distanceKm)
    .sort((x, y) => (y.distanceKm ?? 0) - (x.distanceKm ?? 0))[0];
  const asymmetric = routes.filter((r) => {
    const back = routes.find((x) => x.pickup === r.drop && x.drop === r.pickup);
    return back && back.fromRupees !== r.fromRupees;
  }).length / 2;

  const faq = [
    {
      q: 'Are these the only routes you run?',
      a: `No — ${fixedCount} of the routes listed here carry a fare set in advance${onDistance ? `, and ${onDistance} more are priced on distance because people book them often` : ''}. Other journeys are quoted on distance when you ask for them, and the fare is fixed at booking in the same way.`,
    },
    ...(cheapest && longest
      ? [
          {
            q: 'What is the cheapest and the longest route here?',
            a: `The lowest one-way fare is ${cityTitle(cheapest.pickup)} to ${cityTitle(cheapest.drop)}, from ${rupees(cheapest.fromRupees ?? 0)}. The longest run is ${cityTitle(longest.pickup)} to ${cityTitle(longest.drop)}, ${longest.distanceKm} km, from ${rupees(longest.fromRupees ?? 0)}.`,
          },
        ]
      : []),
    {
      q: 'Is a route the same price in both directions?',
      a:
        asymmetric > 0
          ? `Not always. A journey and its reverse are priced separately, and on ${asymmetric} of the pairs listed here the two directions differ — each route's own page shows its own fare, and links to the way back.`
          : 'On the routes listed here, yes — but each direction is priced as its own journey, and its page shows its own fare.',
    },
    {
      q: 'Why is the fare fixed?',
      a: 'Because it is set before you travel, for the whole journey, rather than counted up by a meter or a surge rule on the day. Toll, parking and state entry tax are the only things paid on the road, and each route page lists them.',
    },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Routes', path: '/routes' },
      ])} />
      <JsonLd data={faqSchema(faq)} />
      <Header />

      <section className="hero-ground grain relative overflow-hidden text-white">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl 2xl:max-w-7xl px-5 pb-20 pt-16">
          <nav aria-label="Breadcrumb" className="text-white/45 text-small [&_a]:inline-block [&_a]:py-3 [&_a]:-my-3">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white/70">Routes</span>
          </nav>
          <h1 className="font-display text-h1 mt-6 text-balance">
            Every priced route
          </h1>
          <p className="mt-6 text-lead max-w-lg text-white/75 text-pretty">
            {fixedCount} routes carry a fare we set in advance{onDistance ? ` and ${onDistance} more are priced on distance` : ''}, out of {byCity.size} pickup cities
            {cheapest ? ` — from ${rupees(cheapest.fromRupees ?? 0)}` : ''}
            {longest ? ` and up to ${longest.distanceKm} km` : ''}. Grouped by where the trip
            starts.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl 2xl:max-w-7xl px-5 py-20">
        {[...byCity.entries()].map(([city, rows]) => (
          <section key={city} className="border-b border-line py-10 first:pt-0 last:border-0">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-title-lg">
                From {cityTitle(city)}
              </h2>
              {withPages.has(city) ? (
                <Link
                  href={cityPath(city)}
                  className="group text-small inline-flex items-center gap-1.5 font-semibold text-forest hover:text-accent min-h-11"
                >
                  {cityPageName(city)}
                  <Icon.arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : null}
            </div>

            <p className="mt-3 text-small text-muted">
              {rows.length} routes, from{' '}
              {rupees(Math.min(...rows.map((r) => r.fromRupees ?? Infinity)))}
            </p>

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

        <section className="pt-16">
          <h2 className="font-display text-balance text-h2">About these fares</h2>
          <Faq items={faq} />
        </section>
      </main>

      <Footer />
    </>
  );
}

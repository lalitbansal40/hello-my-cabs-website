import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { isHeldRoute, listed } from '@/lib/held-routes';
import { citiesWithPages } from '@/lib/city-pages';
import { cityPath, cityTitle, isAirport, readSlug, routePath, vehiclePath } from '@/lib/slug';
import { fitDescription, fitTitle, hoursFor, rupees } from '@/lib/seo';
import { RoutePage } from './RoutePage';
import { CityPage } from './CityPage';
import { VehiclePage } from './VehiclePage';

/**
 * Every landing page the site publishes lives at the root, and two dynamic segments cannot
 * sit side by side there — so this one segment takes them all and hands off by shape.
 */
export const revalidate = 86_400;

/**
 * ONLY the slugs listed below exist.
 *
 * Without this, anyone could request /anywhere-to-anywhere-cab and the site would render a
 * page for it — thousands of near-identical URLs with nothing on them, which is precisely
 * what search engines demote an entire domain for. The list is the whitelist.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const { routes } = await api.routes().catch(() => ({ routes: [] }));

  // Only cities that ORIGINATE at least three priced routes get a page — ten of them today.
  // The catalog holds over six thousand, and a page for a city with nothing to list is the
  // empty template this whole approach is trying to avoid (lib/city-pages.ts).
  const origins = [...citiesWithPages(routes)];

  const { intercity, roundTripOnly } = await api
    .vehicles()
    .catch(() => ({ intercity: [], roundTripOnly: [] }));

  return [
    ...routes.map((r) => ({ slug: routePath(r.pickup, r.drop).slice(1) })),
    ...origins.map((c) => ({ slug: cityPath(c).slice(1) })),
    ...[...intercity, ...roundTripOnly].map((v) => ({ slug: vehiclePath(v.key).slice(1) })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const landing = readSlug(slug);
  if (!landing) return {};

  const { routes } = await api.routes().catch(() => ({ routes: [] }));
  // What the city and vehicle pages list — the counts in their descriptions are of these.
  const shown = listed(routes);
  const fixedShown = shown.filter((r) => r.fixed).length;

  if (landing.kind === 'city') {
    const A = cityTitle(landing.city);
    const from = shown.filter((r) => r.pickup === landing.city);
    // "at a fixed fare" is said of the fixed ones only; the others are priced on distance.
    const fixedFrom = from.filter((r) => r.fixed).length;
    const cheapest = Math.min(...from.map((r) => r.fromRupees ?? Infinity));
    const price = Number.isFinite(cheapest) ? ` from ${rupees(cheapest)}` : '';
    // An airport is a pickup and a drop, not a place to be driven around in — "Delhi
    // Airport Cab Service" and "a taxi in Delhi Airport" read as a machine wrote them.
    if (isAirport(landing.city)) {
      const title = fitTitle(`${A} Taxi${price}`, [' — Pickup & Drop Fares', ' — Fares']);
      return {
        title: { absolute: title },
        description: fitDescription(
          `Taxi to and from ${A} with a driver — ${fixedFrom} routes at a fixed fare, from the terminal or for a departure.`,
          'Send the flight number when you book.',
          'Pay cash.',
        ),
        alternates: { canonical: `/${slug}` },
        openGraph: { title, url: `/${slug}` },
      };
    }
    const title = fitTitle(`${A} Cab Service${price}`, [
      ' — Outstation & Local Taxi',
      ' — Outstation Taxi',
      ' — Taxi',
    ]);
    return {
      // `absolute` because the layout appends "| Hello My Cab" to anything else, and these
      // titles are already at the width a result page will show.
      title: { absolute: title },
      description: fitDescription(
        `Book a taxi in ${A} with a driver — ${fixedFrom} outstation routes at a fixed fare, plus 8 h / 80 km local packages.`,
        'No surge, pay cash.',
      ),
      alternates: { canonical: `/${slug}` },
      openGraph: { title, url: `/${slug}` },
    };
  }

  if (landing.kind === 'vehicle') {
    const { intercity, roundTripOnly } = await api
      .vehicles()
      .catch(() => ({ intercity: [], roundTripOnly: [] }));
    const v = [...intercity, ...roundTripOnly].find((x) => x.key === landing.vehicle);
    if (!v) return {};
    const roundOnly = v.tripTypes.length === 1;
    // The big ones are rented, the cars are taxis — the same distinction the URL makes.
    const noun = roundOnly ? 'on Rent' : 'Taxi';
    const title = fitTitle(`${v.label} ${noun}`, [
      ' — Fare, Seats & Booking',
      ' — Fare & Booking',
      ' — Fare',
    ]);
    return {
      title: { absolute: title },
      description: fitDescription(
        // "on rent with a driver" is how the cars are searched for as often as "taxi".
        `Book ${/^[aeiou]/i.test(v.label) ? 'an' : 'a'} ${v.label} on rent with a driver${v.seats ? `, seats ${v.seats}` : ''}.`,
        roundOnly
          ? 'Round trips only, priced per kilometre for the whole journey.'
          : `One way, round trip or by the hour${fixedShown ? `, on ${fixedShown} routes with a published fare` : ''}.`,
        'The fare is fixed before you leave.',
        'No surge, pay cash.',
      ),
      alternates: { canonical: `/${slug}` },
      openGraph: { title, url: `/${slug}` },
    };
  }

  if (landing.kind !== 'route') return {};

  const row = routes.find((r) => r.pickup === landing.pickup && r.drop === landing.drop);
  const A = cityTitle(landing.pickup);
  const B = cityTitle(landing.drop);

  // The price in the title is the same figure the page shows. A number here that a visitor
  // cannot actually get is the kind of thing that earns a manual penalty, not just a lost
  // click.
  const price = row?.fromRupees ? ` ${rupees(row.fromRupees)}` : '';
  // "Taxi" as well as "cab": both words are typed in India, and the old title used only
  // one of them.
  const title = fitTitle(`${A} to ${B} Cab${price}`, [
    ' — Taxi Fare & Booking',
    ' — Taxi Fare',
    ' — Fare',
  ]);

  return {
    title: { absolute: title },
    description: fitDescription(
      row?.distanceKm
        ? `${row.distanceKm} km, ${hoursFor(row.distanceKm)} of driving.`
        : `A ${A} to ${B} taxi with a driver.`,
      row?.fromRupees
        ? row.fixed
          ? `A ${A} to ${B} taxi is ${rupees(row.fromRupees)} one way, fixed before you leave.`
          : `A ${A} to ${B} taxi is from ${rupees(row.fromRupees)} one way, priced on distance and fixed when you book.`
        : 'The fare is fixed before you leave.',
      'One-way and round-trip prices for every vehicle.',
      'No surge, pay cash.',
      'Verified driver, 24×7 support.',
    ),
    alternates: { canonical: `/${slug}` },
    openGraph: { title, url: `/${slug}` },
    // Held until its fare is decided (lib/held-routes.ts): the page opens, search leaves it out.
    ...(isHeldRoute(landing.pickup, landing.drop)
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const landing = readSlug(slug);
  if (!landing) notFound();

  if (landing.kind === 'route') {
    return <RoutePage pickup={landing.pickup} drop={landing.drop} />;
  }
  if (landing.kind === 'city') {
    return <CityPage city={landing.city} />;
  }

  return <VehiclePage vehicleKey={landing.vehicle} />;
}

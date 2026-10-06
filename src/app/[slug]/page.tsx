import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { isHeldRoute, listed } from '@/lib/held-routes';
import { citiesWithPages } from '@/lib/city-pages';
import { cityPath, cityTitle, isAirport, readSlug, routePath, vehiclePath } from '@/lib/slug';
import { hasCarPage, hasRoundTripPage } from '@/lib/route-variants';
import { routeTitle } from '@/content/routes/titles';
import { publishedVariants } from '@/lib/variant-pages';
import { isBusiestRoute } from '@/lib/route-tiers';
import { fitDescription, fitTitle, hoursFor, rupees } from '@/lib/seo';
import { RoutePage } from './RoutePage';
import { CityPage } from './CityPage';
import { VehiclePage } from './VehiclePage';
import { RouteVariantPage } from './RouteVariantPage';

/**
 * Every landing page the site publishes lives at the root, and two dynamic segments cannot
 * sit side by side there — so this one segment takes them all and hands off by shape.
 */
export const revalidate = 86_400;

/**
 * ONLY the slugs in allLandingSlugs() exist.
 *
 * Without this, anyone could request /anywhere-to-anywhere-cab and the site would render a
 * page for it — thousands of near-identical URLs with nothing on them, which is precisely
 * what search engines demote an entire domain for. The list is the whitelist, checked on
 * every request (LandingPage below) — not by `dynamicParams`, because since 3 Oct 2026 not
 * every page on it is built ahead of time.
 */
export const dynamicParams = true;

/** Every landing page the site has: each priced route, its variants, the cities, the cars. */
async function allLandingSlugs(): Promise<Array<{ slug: string; prebuild: boolean }>> {
  const { routes } = await api.routes().catch(() => ({ routes: [] }));

  // Only cities that ORIGINATE at least three priced routes get a page — ten of them today.
  // The catalog holds over six thousand, and a page for a city with nothing to list is the
  // empty template this whole approach is trying to avoid (lib/city-pages.ts).
  const origins = [...citiesWithPages(routes)];

  const { intercity, roundTripOnly } = await api
    .vehicles()
    .catch(() => ({ intercity: [], roundTripOnly: [] }));

  // The route variants (lib/route-variants.ts), only the ones that are really built.
  const variants = (await publishedVariants(routes)).map((v) => v.path.slice(1));

  return [
    // The busiest routes are built ahead; the rest are rendered on their first visit and
    // kept for a day (`revalidate`). Building all of them put the deploy over Amplify's
    // 220 MB once the stylesheet was inlined again (see next.config.ts, inlineCss).
    ...routes.map((r) => ({
      slug: routePath(r.pickup, r.drop).slice(1),
      prebuild: isBusiestRoute(r.pickup, r.drop),
    })),
    ...variants.map((slug) => ({ slug, prebuild: true })),
    ...origins.map((c) => ({ slug: cityPath(c).slice(1), prebuild: true })),
    ...[...intercity, ...roundTripOnly].map((v) => ({
      slug: vehiclePath(v.key).slice(1),
      prebuild: true,
    })),
  ];
}

export async function generateStaticParams() {
  return (await allLandingSlugs()).filter((x) => x.prebuild).map(({ slug }) => ({ slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const m = await landingMetadata(props);
  // A page's own openGraph replaces the layout's whole, so what a share card says is filled
  // in here once, for every kind of page: the same title and description as the result.
  if (!m.openGraph) return m;
  return {
    ...m,
    openGraph: {
      type: 'website',
      siteName: 'Hello My Cab',
      locale: 'en_IN',
      ...(typeof m.description === 'string' ? { description: m.description } : {}),
      ...m.openGraph,
    },
  };
}

async function landingMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const landing = readSlug(slug);
  // Not on the whitelist → a real 404 from here, before anything is sent. Left to the page
  // alone, a page rendered on request had already sent 200 by the time it said "not found".
  if (!landing || !(await allLandingSlugs()).some((x) => x.slug === slug)) notFound();

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
          'Small advance online.',
        ),
        alternates: { canonical: `/${slug}` },
        openGraph: { title, url: `/${slug}` },
      };
    }
    // "Taxi service in Jaipur" is the wording people search (Search Console, 6 Oct 2026:
    // "taxi service jaipur" was the site's top query) — so it leads, in that order.
    const title = fitTitle(`Taxi Service in ${A}${price}`, [
      ' — Outstation & Local Cab',
      ' — Outstation Cab',
      ' — Cab',
    ]);
    // The three cheapest routes from here, by name and fare — what someone choosing a
    // result wants to see before clicking. Every figure is the routes list's.
    const top = [...from]
      .filter((r) => r.fromRupees)
      .sort((x, y) => (x.fromRupees ?? 0) - (y.fromRupees ?? 0))
      .slice(0, 3)
      .map((r) => `${cityTitle(r.drop)} ${rupees(r.fromRupees!)}`);
    return {
      // `absolute` because the layout appends "| Hello My Cab" to anything else, and these
      // titles are already at the width a result page will show.
      title: { absolute: title },
      description: fitDescription(
        top.length
          ? `Taxi service in ${A} with a driver — one way to ${top.join(', ')}, fixed before you leave.`
          : `Book a taxi in ${A} with a driver — outstation routes at a fixed fare.`,
        `${fixedFrom} outstation routes and 8 h / 80 km local packages.`,
        'No return fare.',
        'Small advance online.',
      ),
      alternates: { canonical: `/${slug}` },
      openGraph: { title, url: `/${slug}` },
    };
  }

  if (landing.kind === 'routeRound' || landing.kind === 'routeCar') {
    const A = cityTitle(landing.pickup);
    const B = cityTitle(landing.drop);
    const [ow, rt, veh] = await Promise.all([
      api.onewayFare(landing.pickup, landing.drop).catch(() => null),
      api.roundtripFare(landing.pickup, landing.drop).catch(() => null),
      api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
    ]);
    if (landing.kind === 'routeRound') {
      if (!hasRoundTripPage(landing.pickup, landing.drop) || !rt?.vehicles.length) return {};
      const low = Math.min(...rt.vehicles.map((v) => v.fare));
      const title = fitTitle(`${A} to ${B} Round Trip Taxi ${rupees(low)}`, [
        ' — Same Day, Driver Incl.',
        ' — Same Day Return',
        ' — Fare',
      ]);
      return {
        title: { absolute: title },
        description: fitDescription(
          `${A} to ${B} round trip cab from ${rupees(low)} for the same day, ${rt.billedKm} km billed, + toll.`,
          'Two and three days priced for every car, driver included.',
          'Book in a minute, no OTP.',
          'Small advance online.',
        ),
        alternates: { canonical: `/${slug}` },
        openGraph: { title, url: `/${slug}` },
      };
    }
    if (!hasCarPage(landing.pickup, landing.drop, landing.vehicle)) return {};
    const car = [...veh.intercity, ...veh.roundTripOnly].find((v) => v.key === landing.vehicle);
    const one = ow?.vehicles.find((v) => v.key === landing.vehicle);
    const round = rt?.vehicles.find((v) => v.key === landing.vehicle);
    if (!car || (!one && !round)) return {};
    const from = one ? (one.total ?? one.fare) : round!.fare;
    const title = fitTitle(`${A} to ${B} ${car.label} Taxi ${rupees(from)}`, [
      one ? ' — One Way, Driver Incl.' : ' — Round Trip, Driver Incl.',
      one ? ' — One Way' : ' — Round Trip',
      ' — Fare',
    ]);
    return {
      title: { absolute: title },
      description: fitDescription(
        `${car.label} from ${A} to ${B}${car.seats ? `, ${car.seats} seats` : ''}: ${
          one ? `${rupees(one.total ?? one.fare)} one way` : 'round trips only'
        }${round ? `, ${rupees(round.fare)} for a same-day round trip` : ''}, + toll.`,
        'Fixed before you leave, driver included.',
        'Book in a minute, no OTP.',
        'Small advance online.',
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
    const title = fitTitle(`${v.label} ${noun} with Driver`, [
      ' — Fare, Seats & Booking',
      ' — Fare & Seats',
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
        'No surge, small advance.',
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
  // "One Way Taxi" first (3 Oct 2026): across the searches recorded for these routes
  // (content/queries.json) "taxi" is typed half again as often as "cab", and "one way" more
  // than a hundred times — it is how the results above ours are titled. "Cab", "fare" and
  // "booking" stay in the tail where the length allows.
  const own = routeTitle(landing.pickup, landing.drop);
  const title = own?.title
    ? own.title
        .replace('{price}', row?.fromRupees ? rupees(row.fromRupees) : '')
        .replace(/\s+/g, ' ')
        .trim()
    : // The tail is the reason to click (6 Oct 2026 — 0 clicks at position ~7): what a
      // one way fare means here, said in the words of the results around it.
      fitTitle(`${A} to ${B} One Way Taxi${price}`, [
        ' — No Return Fare',
        ' — Cab Fare',
        ' — Fare',
      ]);

  return {
    title: { absolute: title },
    description:
      own?.description ??
      fitDescription(
        ...[
          // "cab" here, "taxi" in the title: the searches use both.
          row?.fromRupees
            ? row.fixed
              ? `${A} to ${B} cab from ${rupees(row.fromRupees)} one way + toll — no return fare.`
              : `${A} to ${B} cab from ${rupees(row.fromRupees)} one way + toll, priced on distance, no return fare.`
            : `A ${A} to ${B} cab with a driver, the fare fixed before you leave.`,
          row?.distanceKm ? `${row.distanceKm} km, ${hoursFor(row.distanceKm)} of driving.` : '',
          'Book in a minute, no OTP.',
          'Small advance online.',
          'Driver included.',
        ].filter(Boolean),
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
  // The whitelist, on every request: a slug that reads as a route but is not one we price
  // (or a variant, city or car we do not publish) is a 404, not a page.
  if (!(await allLandingSlugs()).some((x) => x.slug === slug)) notFound();

  if (landing.kind === 'route') {
    return <RoutePage pickup={landing.pickup} drop={landing.drop} />;
  }
  if (landing.kind === 'routeRound') {
    if (!hasRoundTripPage(landing.pickup, landing.drop)) notFound();
    return <RouteVariantPage pickup={landing.pickup} drop={landing.drop} />;
  }
  if (landing.kind === 'routeCar') {
    if (!hasCarPage(landing.pickup, landing.drop, landing.vehicle)) notFound();
    return (
      <RouteVariantPage pickup={landing.pickup} drop={landing.drop} vehicle={landing.vehicle} />
    );
  }
  if (landing.kind === 'city') {
    return <CityPage city={landing.city} />;
  }

  return <VehiclePage vehicleKey={landing.vehicle} />;
}

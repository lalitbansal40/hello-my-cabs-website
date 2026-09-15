import Link from 'next/link';
import { api } from '@/lib/api';
import { listed } from '@/lib/held-routes';
import { citiesWithPages } from '@/lib/city-pages';
import { cityPageName, cityPath, cityTitle, routePath } from '@/lib/slug';
import { JsonLd, breadcrumbSchema, faqSchema, serviceSchema } from '@/lib/schema';
import { directionFrom } from '@/lib/geo';
import { hoursFor, rupees } from '@/lib/seo';
import {
  AtTheOtherEnd,
  JourneyContext,
  OneWayVsRound,
  ReverseRoute,
  WhichVehicle,
  perKm,
} from '@/components/landing/RouteDetail';
import { RouteRoad } from '@/components/landing/RouteRoad';
import { RouteReviews } from '@/components/landing/RouteReviews';
import { routeReviews } from '@/lib/reviews';
import { buildRouteFaq } from '@/lib/route-faq';
import { routeContent } from '@/content/routes';
import { cityNote } from '@/content/cities';
import { BookingWidget } from '@/components/BookingWidget';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { StickyBookBar } from '@/components/site/StickyBookBar';
import { Icon } from '@/components/site/Icons';
import { Faq } from '@/components/site/Faq';
import { FareTable } from '@/components/landing/FareTable';
import { Included } from '@/components/landing/Included';

export async function RoutePage({ pickup, drop }: { pickup: string; drop: string }) {
  const [cities, vehicles, oneway, roundtrip, all, packages, reviews] = await Promise.all([
    api.cities().catch(() => []),
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
    api.onewayFare(pickup, drop).catch(() => null),
    api.roundtripFare(pickup, drop).catch(() => null),
    api.routes().catch(() => ({ count: 0, routes: [] })),
    api.localPackages().catch(() => []),
    routeReviews(pickup, drop),
  ]);

  // A route page without its fares is what went live 72 times on 14 Sep 2026: the build ran
  // into the API's rate limit and every page it was refused rendered an empty fare table.
  // Refuse to build one instead — the deploy fails and the complete previous version stays
  // live. Only at build time: a failed revalidation later keeps serving the page it has.
  if (process.env.NEXT_PHASE === 'phase-production-build' && (!oneway || !roundtrip)) {
    throw new Error(
      `No fares for ${pickup} → ${drop} at build time — refusing to publish the page without them`,
    );
  }

  const from = cities.find((c) => c.name === pickup);
  const to = cities.find((c) => c.name === drop);
  const A = from?.label ?? cityTitle(pickup);
  const B = to?.label ?? cityTitle(drop);
  const km = roundtrip?.distanceKm ?? oneway?.distanceKm;
  const cheapest = Math.min(
    ...[...(oneway?.vehicles ?? []).map((v) => v.total ?? v.fare)].filter((n) => n > 0),
  );
  const fromRupees = Number.isFinite(cheapest) ? cheapest : 0;
  const content = routeContent(pickup, drop);
  // Arriving in B is the thing that is genuinely different in each direction — everything
  // else about a symmetric route (the fare table, the policies) is identical both ways and
  // legitimately so. A note written for the route wins over the city's own.
  const note = cityNote(drop);
  const arrival = content.arrival ?? note?.arrival;
  const arrivalNote = content.arrival ? undefined : note?.drop;
  const faq = buildRouteFaq({
    A,
    B,
    km,
    oneway,
    roundtrip,
    vehicles: [...vehicles.intercity, ...vehicles.roundTripOnly],
    extra: content.faq,
  });
  const path = routePath(pickup, drop);

  // Routes this page may link to. The held ones (lib/held-routes.ts) still have pages, but
  // nothing on the site points at them until they are priced.
  const linkable = listed(all.routes);

  // Other routes out of the same city — the internal links that get these pages found.
  const related = linkable.filter((r) => r.pickup === pickup && r.drop !== drop);

  // Where B is from A. The one fact about a journey that is genuinely opposite in each
  // direction, and the reason this page and its reverse are no longer the same text.
  const direction = directionFrom(from, to);
  const allVehicles = [...vehicles.intercity, ...vehicles.roundTripOnly];
  const back = linkable.find((r) => r.pickup === drop && r.drop === pickup);
  // A route people book that is not in the fixed table: priced on distance. The page says so
  // and never calls it a published fixed fare.
  const onDistance = all.routes.find((r) => r.pickup === pickup && r.drop === drop)?.fixed === false;
  // Only cities with three routes or more have a page — Jodhpur, with one, is not linked.
  const withPages = citiesWithPages(all.routes);
  const pickupHasPage = withPages.has(pickup);

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', path: '/' },
        pickupHasPage
          ? { name: cityPageName(pickup, A), path: cityPath(pickup) }
          : { name: 'Routes', path: '/routes' },
        { name: `${A} to ${B}`, path },
      ])} />
      {fromRupees > 0 ? (
        <JsonLd
          data={serviceSchema({
            name: `${A} to ${B} taxi`,
            description: `One-way and round-trip taxi from ${A} to ${B}${km ? `, about ${km} km` : ''}. ${onDistance ? 'Priced on distance, fixed when you book' : 'Fixed fare'}, driver included.`,
            path,
            serviceType: 'Outstation taxi service',
            areaServed: [A, B],
            rating: reviews,
            // Every vehicle the fare table prints, at the price it prints — the one-way
            // total where there is one, the round-trip fare for the vehicles that only run
            // those. A price in the markup that is not on the page is a penalty.
            offers: [
              ...(oneway?.vehicles ?? []).map((v) => ({
                name: `${v.label} — one way`,
                price: v.total ?? v.fare,
              })),
              ...(roundtrip?.vehicles ?? []).map((v) => ({
                name: `${v.label} — round trip`,
                price: v.fare,
              })),
            ],
          })}
        />
      ) : null}
      <JsonLd data={faqSchema(faq)} />

      <Header />

      <section
        id="book"
        // The sticky bar jumps here; the margin keeps the form clear of the sticky header.
        className="hero-ground grain vignette relative scroll-mt-16 overflow-hidden text-white"
      >
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl 2xl:max-w-7xl items-center gap-14 px-5 pb-24 pt-14 md:grid-cols-[1fr_minmax(330px,380px)] lg:grid-cols-[1.15fr_minmax(400px,452px)] lg:gap-16 lg:pb-32 lg:pt-20">
          <div>
            <nav aria-label="Breadcrumb" className="text-small text-white/45 [&_a]:inline-block [&_a]:py-3 [&_a]:-my-3">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              {pickupHasPage ? (
                <Link href={cityPath(pickup)} className="hover:text-white">{A}</Link>
              ) : (
                <Link href="/routes" className="hover:text-white">Routes</Link>
              )}
              <span className="mx-2">/</span>
              <span className="text-white/70">{B}</span>
            </nav>

            <h1 className="font-display mt-6 text-balance text-h1">
              {A} to {B} cab
            </h1>

            {/* The first sentence is the answer, with the numbers in it: this is the line
                an AI summary lifts, and the one a reader checks before anything else. */}
            <p className="mt-6 max-w-md text-pretty text-lead text-white/75">
              {fromRupees > 0 ? `A ${A} to ${B} taxi starts at ${rupees(fromRupees)} one way. ` : ''}
              {km
                ? `${B} is ${km} km ${direction ? `${direction} of ` : 'from '}${A}, ${hoursFor(km)} of driving. `
                : ''}
              {onDistance
                ? 'The fare is worked out on the distance and fixed when you book, and the driver is included.'
                : 'The fare is fixed when you book, and the driver is included.'}
            </p>

            <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6 border-t border-white/10 pt-8">
              {[
                fromRupees > 0 ? [`₹${fromRupees.toLocaleString('en-IN')}`, 'from'] : null,
                km ? [`${km} km`, 'distance'] : null,
                roundtrip?.hill ? ['Hill', 'terrain'] : null,
              ]
                .filter(Boolean)
                .map((pair) => {
                  const [big, small] = pair as [string, string];
                  return (
                    <div key={small}>
                      <dt className="font-display text-stat">{big}</dt>
                      <dd className="mt-1.5 text-label font-medium uppercase text-white/40">
                        {small}
                      </dd>
                    </div>
                  );
                })}
            </dl>
          </div>

          {/* Both cities already filled in — the visitor arrived asking this exact question. */}
          <div className="lg:-mb-44">
            <BookingWidget defaultPickup={from} defaultDrop={to} />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl 2xl:max-w-7xl px-5">
        <section className="pt-20 lg:pt-52">
          <h2 className="font-display text-balance text-h2">
            Fares for this route
          </h2>
          <FareTable oneway={oneway} roundtrip={roundtrip} vehicles={allVehicles} />
          {/* What the fare works out at per kilometre. Every competitor quotes a per-km
              rate and no total; this page has the total, so it can show both and let the
              two be compared. */}
          {km && fromRupees > 0 ? (
            <p className="mt-6 max-w-measure text-pretty text-body text-muted">
              At {rupees(fromRupees)} over {km} km, the lowest one-way fare on this route
              works out at about ₹{perKm(fromRupees, km)} a kilometre — with the driver,
              fuel and GST in it.
            </p>
          ) : null}
          <Included
            nightCharge={roundtrip?.nightCharge}
            airportSurcharge={oneway?.airportSurcharge}
          />
          {roundtrip?.minKmPerDay ? (
            <p className="mt-8 max-w-measure text-pretty text-body text-muted">
              Round trips are billed at a minimum of {roundtrip.minKmPerDay} km a day
              {roundtrip.billedKm ? `, and this route bills ${roundtrip.billedKm} km` : ''}. That
              floor is what lets a driver take a long return leg without pricing it as two
              separate journeys.
            </p>
          ) : null}
        </section>

        <RouteRoad
          A={A}
          B={B}
          km={km}
          driver={content.driver}
          arrival={arrival}
          arrivalNote={arrivalNote}
        />

        <JourneyContext
          A={A}
          B={B}
          km={km}
          fromHere={all.routes.filter((r) => r.pickup === pickup)}
          intoThere={linkable
            .filter((r) => r.drop === drop && r.pickup !== pickup)
            .map((r) => ({
              pickup: r.pickup,
              label: cityTitle(r.pickup),
              fromRupees: r.fromRupees,
              href: routePath(r.pickup, r.drop),
            }))}
          dropState={to?.state}
        />

        <AtTheOtherEnd
          B={B}
          // Only where the drop city has a page of its own to send them to.
          cityHref={withPages.has(drop) ? cityPath(drop) : undefined}
          packageFrom={packages[0]?.baseFareRupees}
          includedHours={packages[0]?.includedHours}
          includedKm={packages[0]?.includedKm}
          arrivingAtAirport={drop.includes('AIRPORT')}
          leavingFromAirport={pickup.includes('AIRPORT')}
        />

        <WhichVehicle oneway={oneway} vehicles={allVehicles} A={A} B={B} />

        <OneWayVsRound
          oneway={oneway}
          roundtrip={roundtrip}
          vehicles={allVehicles}
          A={A}
          B={B}
        />

        {back ? (
          <ReverseRoute
            A={A}
            B={B}
            href={routePath(drop, pickup)}
            fromRupees={back.fromRupees ?? null}
            sameAsOutbound={back.fromRupees === all.routes.find((r) => r.pickup === pickup && r.drop === drop)?.fromRupees}
          />
        ) : null}

        {related.length > 0 ? (
          <section className="pt-24">
            <h2 className="font-display text-balance text-h2">
              Other routes from {A}
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.drop}>
                  <Link
                    href={routePath(r.pickup, r.drop)}
                    className="group flex items-center justify-between rounded-2xl border border-line bg-surface-raised px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
                  >
                    <span className="font-medium">{cityTitle(r.drop)}</span>
                    <span className="flex items-baseline gap-2 text-small text-muted">
                      ₹{r.fromRupees?.toLocaleString('en-IN')}
                      <Icon.arrow className="h-4 w-4 self-center transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <RouteReviews title={`What customers said about ${A} to ${B}`} reviews={reviews} />

        <section className="pt-24">
          <h2 className="font-display text-balance text-h2">
            {A} to {B}, answered
          </h2>
          <Faq items={faq} />
        </section>
      </main>

      <Footer />
      <StickyBookBar from={fromRupees || null} onDistance={onDistance} />
    </>
  );
}

import Link from 'next/link';
import { api } from '@/lib/api';
import { publishedVariants } from '@/lib/variant-pages';
import { cityPageName, cityPath, cityTitle, isAirport, routePath, vehiclePath } from '@/lib/slug';
import { buildCityFaq } from '@/lib/city-faq';
import { cityNote, cityPickup } from '@/content/cities';
import { company } from '@/lib/company';
import searchQueries from '@/content/queries.json';
import { rupees } from '@/lib/seo';
import { JsonLd, breadcrumbSchema, faqSchema, taxiServiceSchema, webPageSchema } from '@/lib/schema';
import { FaresChecked, faresCheckedAt } from '@/components/site/FaresChecked';
import { GoogleRating } from '@/components/site/GoogleRating';
import { env } from '@/lib/env';
import { BookingWidget } from '@/components/BookingWidget';
import { Counter } from '@/components/site/Counter';
import { WhatsAppFab } from '@/components/site/WhatsAppFab';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { StickyBookBar } from '@/components/site/StickyBookBar';
import { Icon } from '@/components/site/Icons';
import { Faq } from '@/components/site/Faq';
import { RouteList } from '@/components/site/RouteList';
import { LiveRatingSummary } from '@/components/landing/LiveRatingSummary';
import { cityReviews } from '@/lib/reviews';
import { OnThisPage } from '@/components/site/OnThisPage';

export async function CityPage({ city }: { city: string }) {
  const [cities, all, packages, vehicles, reviews] = await Promise.all([
    api.cities().catch(() => []),
    api.listedRoutes().catch(() => ({ count: 0, routes: [] })),
    api.localPackages().catch(() => []),
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
    cityReviews(city),
  ]);

  const info = cities.find((c) => c.name === city);
  const A = info?.label ?? cityTitle(city);
  const airport = isAirport(city);
  const fromHere = all.routes.filter((r) => r.pickup === city);
  const variantsHere = (await publishedVariants(all.routes).catch(() => [])).filter(
    (v) => v.pickup === city,
  );
  // Every route that ARRIVES here, not a sample of six. These links are how the quieter
  // routes get crawled: Ajmer → Sikar had three inbound links on the whole site.
  const toHere = all.routes.filter((r) => r.drop === city);
  const cheapest = Math.min(...fromHere.map((r) => r.fromRupees ?? Infinity));
  const fixedHere = fromHere.filter((r) => r.fixed).length;
  const allVehicles = [...vehicles.intercity, ...vehicles.roundTripOnly];
  const note = cityNote(city);

  // One real fare out of this city, for two figures the city page otherwise cannot know:
  // the night allowance, and what each vehicle costs on the cheapest run from here.
  const cheapestRoute = [...fromHere]
    .filter((r) => typeof r.fromRupees === 'number')
    .sort((x, y) => (x.fromRupees ?? 0) - (y.fromRupees ?? 0))[0];
  const [sampleOneway, sampleRound] = cheapestRoute
    ? await Promise.all([
        api.onewayFare(cheapestRoute.pickup, cheapestRoute.drop).catch(() => null),
        api.roundtripFare(cheapestRoute.pickup, cheapestRoute.drop).catch(() => null),
      ])
    : [null, null];

  const faq = buildCityFaq({
    label: A,
    state: info?.state,
    fromHere,
    toHere,
    packages,
    vehicles: allVehicles,
    nightCharge: sampleRound?.nightCharge,
    stateOf: (key) => cities.find((c) => c.name === key)?.state,
    airport,
    // What people type about taxis in this city (scripts/seo/queries.mjs) — a question is
    // added only for a kind of search that exists for it (7 Oct 2026).
    queries: (searchQueries as Record<string, string[]>)[`city:${city}`],
  });
  const pickup = cityPickup(city);
  // The company's own city: the Business Profile is here (lib/company.ts).
  const homeCity = city === 'JAIPUR';
  // The route map (lib/city-map.ts) — only when there are routes to draw.
  const mapPath = fromHere.length > 0 ? `${cityPath(city)}/map.svg` : null;
  const checkedAt = faresCheckedAt();

  // The facts that are true of THIS city and no other: the nearest thing we price, the
  // longest run, and where the cars go most. Two city pages used to be 69% the same text
  // because everything on them was said about "cabs" in general.
  const byDistance = [...fromHere]
    .filter((r) => typeof r.distanceKm === 'number')
    .sort((x, y) => (x.distanceKm ?? 0) - (y.distanceKm ?? 0));
  const nearest = byDistance[0];
  const longest = byDistance[byDistance.length - 1];
  const dearest = Math.max(...fromHere.map((r) => r.fromRupees ?? 0));
  const states = [...new Set(
    fromHere
      .map((r) => cities.find((c) => c.name === r.drop)?.state)
      .filter((x): x is string => Boolean(x)),
  )];

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: cityPageName(city, A), path: cityPath(city) },
      ])} />
      <JsonLd
        data={taxiServiceSchema({
          city: A,
          path: cityPath(city),
          fromRupees: Number.isFinite(cheapest) ? cheapest : undefined,
          rating: reviews,
          ...(mapPath ? { image: mapPath } : {}),
        })}
      />
      <JsonLd data={faqSchema(faq)} />
      <JsonLd
        data={webPageSchema({
          path: cityPath(city),
          name: cityPageName(city, A),
          modified: checkedAt,
          about: `${env.siteUrl}${cityPath(city)}#service`,
        })}
      />

      <Header />

      <section
        id="book"
        // The sticky bar jumps here; the margin keeps the form clear of the sticky header.
        className="hero-ground grain vignette relative scroll-mt-16 overflow-hidden text-white"
      >
        {/* No photograph in this hero, on purpose.
            A road picture was tried here on 29 Sep 2026 and measured: on a phone it became
            the Largest Contentful Paint and took the route pages from 0.84 s to 2.11 s,
            the city pages to 2.23 s and the vehicle pages to 2.10 s — past the 1.5 s
            budget, on the pages that carry this site's traffic. Eager loading only moves
            the cost earlier. The texture here is the grain, the vignette and the grid,
            which cost nothing to paint. */
        }
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl 2xl:max-w-7xl items-center gap-14 px-5 pb-24 pt-14 md:grid-cols-[1fr_minmax(330px,380px)] lg:grid-cols-[1.15fr_minmax(400px,452px)] lg:gap-16 lg:pb-32 lg:pt-20">
          <div>
            <nav aria-label="Breadcrumb" className="rise rise-1 text-small text-white/60 [&_a]:inline-block [&_a]:py-3 [&_a]:-my-3">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white/70">{A}</span>
            </nav>

            {/* The cheapest fare from here in the heading (9 Oct 2026), as in the title. */}
            <h1 className="rise rise-2 font-display mt-6 text-balance text-h1">
              {cityPageName(city, A)}
              {Number.isFinite(cheapest) ? ` @ ${rupees(cheapest)}` : ''}
            </h1>
            {info?.state ? (
              <p className="rise rise-2 mt-3 text-label font-bold uppercase text-white/60">{info.state}</p>
            ) : null}

            {/* The numbers first, because they are the answer: how many routes, from what,
                and how far they reach. All three are counted from the catalogue. */}
            <p className="rise rise-3 mt-6 max-w-md text-pretty text-lead text-white/75">
              {fixedHere > 0 && Number.isFinite(cheapest)
                ? `${fixedHere} routes out of ${A} carry a published fare${fromHere.length > fixedHere ? ` and ${fromHere.length - fixedHere} more are priced on distance` : ''}, from ${rupees(cheapest)}${nearest ? ` for ${cityTitle(nearest.drop)}, ${nearest.distanceKm} km away` : ''}. `
                : ''}
              {airport
                ? 'Pickups from the terminal and drops for a departure, with a driver, at a fare fixed when you book. Send the flight number and terminal with the booking.'
                : 'Outstation cabs with a driver — one way, round trip, or by the hour. Every fare is fixed before you leave.'}
            </p>

            <FaresChecked at={checkedAt} className="rise rise-3 mt-3 text-white/55" />
            <GoogleRating className="rise rise-3 text-white/75" />

            <dl className="rise rise-4 mt-10 flex flex-wrap gap-x-12 gap-y-6 border-t border-white/10 pt-8">
              {/* Counted up from the catalogue's own figures — the finished numbers are
                  what the server rendered, so nothing here depends on a script. */}
              {[
                [<Counter key="r" to={fromHere.length} />, 'priced routes'],
                Number.isFinite(cheapest)
                  ? [<Counter key="c" to={cheapest} prefix="₹" />, 'from']
                  : null,
              ]
                .filter(Boolean)
                .map((pair) => {
                  const [big, small] = pair as [React.ReactNode, string];
                  return (
                    <div key={small}>
                      <dt className="font-display text-stat">{big}</dt>
                      <dd className="mt-1.5 text-label font-medium uppercase text-white/55">
                        {small}
                      </dd>
                    </div>
                  );
                })}
            </dl>
          </div>

          {/* Pickup already set — a visitor on this page has told us where they are. */}
          {/* Inside the hero, not hanging below it: the hero clips what leaves it, and the
              card grew (trip lines, stops, the swap) until its button was cut off. */}
          <div className="rise rise-5">
            <BookingWidget defaultPickup={info} />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl 2xl:max-w-7xl px-5">
        <div className="pt-8">
          <OnThisPage />
        </div>
        {fromHere.length > 0 ? (
          <section className="reveal pt-12">
            <h2 className="font-display text-balance text-h2">
              Routes from {A}
            </h2>
            <RouteList routes={fromHere} />
            {/* This city's round-trip and by-car pages (lib/route-variants.ts). */}
            {variantsHere.length > 0 ? (
              <ul className="mt-6 flex flex-wrap gap-2">
                {variantsHere.map((v) => (
                  <li key={v.path}>
                    <Link
                      href={v.path}
                      className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface-raised px-4 text-small font-semibold hover:border-accent hover:text-accent"
                    >
                      {A} to {cityTitle(v.drop)}{' '}
                      {v.vehicle
                        ? `by ${[...vehicles.intercity, ...vehicles.roundTripOnly].find((x) => x.key === v.vehicle)?.label ?? v.vehicle}`
                        : 'round trip'}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        {/* Every route from here on one map (lib/city-map.ts) — the page's picture, and a
            true one: the cities where they are, a line to each. */}
        {mapPath ? (
          <figure className="reveal pt-16">
            {/* eslint-disable-next-line @next/next/no-img-element -- an SVG map of our own, drawn at its display size; nothing for the optimiser to do. */}
            <img
              src={mapPath}
              alt={`Map of the taxi routes from ${A} — ${[...fromHere]
                .sort((x, y) => (x.distanceKm ?? 0) - (y.distanceKm ?? 0))
                .slice(0, 6)
                .map((r) => `${cityTitle(r.drop)}${r.distanceKm ? ` ${r.distanceKm} km` : ''}`)
                .join(', ')}`}
              width={720}
              height={480}
              loading="lazy"
              decoding="async"
              className="h-auto w-full max-w-3xl rounded-3xl border border-line"
            />
            <figcaption className="mt-3 max-w-3xl text-small text-muted">
              The {fromHere.length} places we drive to from {A}. The lines join the cities; the
              roads are longer — each route&rsquo;s page gives its distance and time.
            </figcaption>
          </figure>
        ) : null}

        {nearest && longest && nearest.drop !== longest.drop ? (
          <section className="reveal section-gap">
            <h2 className="font-display text-balance text-h2">How far the cars go from {A}</h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              <li className="rounded-2xl border border-line bg-surface-raised px-5 py-4">
                <p className="text-small text-muted">Shortest run we price</p>
                <p className="font-display mt-1 text-title font-black">
                  {cityTitle(nearest.drop)}
                </p>
                <p className="mt-0.5 text-small text-muted">
                  {nearest.distanceKm} km · from {rupees(nearest.fromRupees ?? 0)}
                </p>
              </li>
              <li className="rounded-2xl border border-line bg-surface-raised px-5 py-4">
                <p className="text-small text-muted">Longest</p>
                <p className="font-display mt-1 text-title font-black">
                  {cityTitle(longest.drop)}
                </p>
                <p className="mt-0.5 text-small text-muted">
                  {longest.distanceKm} km · from {rupees(longest.fromRupees ?? 0)}
                </p>
              </li>
              <li className="rounded-2xl border border-line bg-surface-raised px-5 py-4">
                <p className="text-small text-muted">Fares from here</p>
                <p className="font-display mt-1 text-title font-black">
                  {rupees(Number.isFinite(cheapest) ? cheapest : 0)}–{rupees(dearest)}
                </p>
                <p className="mt-0.5 text-small text-muted">
                  one way, {states.length > 1 ? `across ${states.length} states` : 'fixed before you leave'}
                </p>
              </li>
            </ul>
          </section>
        ) : null}

        {/* Where the driver collects you — the stations, airport and areas by name (content/
            cities PICKUPS), and what to send with the booking. */}
        {pickup ? (
          <section className="reveal section-gap">
            <h2 className="font-display text-balance text-h2">
              {airport ? `Pickup at ${A}` : `Pickup in ${A}`}
            </h2>
            <p className="mt-5 max-w-measure text-pretty text-body text-muted">{pickup.about}</p>
            {pickup.points.length > 0 ? (
              <>
                <h3 className="mt-8 text-label font-bold uppercase text-faint">
                  Stations{pickup.points.some((p) => /airport/i.test(p)) ? ', airport' : ''} and bus stands
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {pickup.points.map((p) => (
                    <li
                      key={p}
                      className="rounded-full border border-line bg-surface-raised px-4 py-2 text-small"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {pickup.areas.length > 0 ? (
              <>
                <h3 className="mt-8 text-label font-bold uppercase text-faint">Areas we collect from</h3>
                <p className="mt-3 max-w-measure text-pretty text-body text-ink-soft">
                  {pickup.areas.join(' · ')} — and anywhere else in {A}.
                </p>
              </>
            ) : null}
            <p className="mt-6 max-w-measure text-pretty text-body text-muted">
              Put the address and a landmark in the pickup box when you book. For a station or
              the airport, add the train or flight number, so the pickup is planned around the
              arrival.
            </p>
            {homeCity ? (
              <p className="mt-4 text-small">
                <a
                  className="font-semibold text-accent hover:underline"
                  href={company.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Our office in {A} on Google Maps
                </a>
              </p>
            ) : null}
          </section>
        ) : null}

        {note ? (
          <section className="reveal section-gap">
            <h2 className="font-display text-balance text-h2">
              {airport ? `At ${A}` : `Getting around ${A}`}
            </h2>
            <p className="mt-6 max-w-measure text-pretty text-body text-ink-soft">{note.arrival}</p>
            {note.drop ? (
              <p className="mt-4 max-w-measure text-pretty text-body text-muted">{note.drop}</p>
            ) : null}
          </section>
        ) : null}

        {/* What each vehicle costs on the cheapest run out of this city — the question the
            fleet list below cannot answer on its own. */}
        {sampleOneway && cheapestRoute ? (
          <section className="reveal section-gap">
            <h2 className="font-display text-balance text-h2">Every vehicle, on one route</h2>
            <p className="mt-4 max-w-measure text-pretty text-body text-muted">
              {A} to {cityTitle(cheapestRoute.drop)}
              {cheapestRoute.distanceKm ? `, ${cheapestRoute.distanceKm} km` : ''}, one way — so
              the figures can be compared against each other.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {allVehicles.flatMap((v) => {
                const row = sampleOneway.vehicles.find((x) => x.key === v.key);
                const price = row ? (row.total ?? row.fare) : null;
                return price
                  ? [
                      <li
                        key={v.key}
                        className="rounded-2xl border border-line bg-surface-raised px-5 py-4"
                      >
                        <p className="text-body font-bold">{v.label}</p>
                        <p className="mt-0.5 text-small text-muted">
                          {v.seats ? `${v.seats} seats` : ''}
                        </p>
                        <p className="font-display mt-2 text-title font-black">{rupees(price)}</p>
                      </li>,
                    ]
                  : [];
              })}
            </ul>
          </section>
        ) : null}

        <section className="reveal section-gap">
          <h2 className="font-display text-balance text-h2">
            {airport ? `By the hour from ${A}` : `By the hour in ${A}`}
          </h2>
          <p className="mt-4 max-w-lg text-pretty text-body text-muted">
            For a day of errands or a wedding run, take the car by the hour instead of by the
            kilometre.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            {packages.map((p) => (
              <li key={p.vehicle} className="rounded-[1.5rem] border border-line bg-surface-raised p-6">
                <p className="font-display text-title">
                  {p.label}
                </p>
                <p className="mt-1.5 text-small text-muted">
                  {p.includedHours} h / {p.includedKm} km included
                </p>
                <p className="font-display mt-5 text-title-lg">
                  ₹{p.baseFareRupees.toLocaleString('en-IN')}
                </p>
                <p className="mt-1.5 text-small text-faint">
                  ₹{p.extraPerHour} per extra hour
                </p>
                {/* The two figures people actually ask for — a ten-hour and a twelve-hour day
                    — from the package's own worked examples rather than left to arithmetic. */}
                {p.examples.filter((e) => e.hours > p.includedHours).length > 0 ? (
                  <dl className="mt-4 flex gap-5 border-t border-line pt-4 text-small">
                    {p.examples
                      .filter((e) => e.hours > p.includedHours)
                      .map((e) => (
                        <div key={e.hours}>
                          <dt className="text-faint">{e.hours} hours</dt>
                          <dd className="font-bold">{rupees(e.fareRupees)}</dd>
                        </div>
                      ))}
                  </dl>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        {toHere.length > 0 ? (
          <section className="reveal section-gap">
            <h2 className="font-display text-balance text-h2">
              {airport ? `Coming to ${A}` : `Coming into ${A}`}
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {toHere.map((r) => (
                <li key={r.pickup}>
                  <Link
                    href={routePath(r.pickup, r.drop)}
                    className="row-lift group flex items-center justify-between rounded-2xl border border-line bg-surface-raised px-5 py-4"
                  >
                    <span className="font-medium">From {cityTitle(r.pickup)}</span>
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

        <section className="reveal section-gap">
          <h2 className="font-display text-balance text-h2">
            {airport ? `The fleet at ${A}` : `The fleet in ${A}`}
          </h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {[...vehicles.intercity, ...vehicles.roundTripOnly].map((v) => (
              <li key={v.key}>
                <Link
                  href={vehiclePath(v.key)}
                  className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line bg-surface-raised px-5 py-2.5 text-small font-medium transition-colors hover:border-forest/25"
                >
                  <Icon.car className="h-4 w-4 text-forest" />
                  {v.label}
                  {v.seats ? <span className="text-faint">{v.seats} seats</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <LiveRatingSummary
          of={{ city }}
          title={`What travellers say about cabs in ${A}`}
          initial={reviews}
          ratedBy={`who took a cab to or from ${A}`}
        />

        <section className="reveal section-gap">
          <h2 className="font-display text-balance text-h2">
            {airport ? `${A} taxi, answered` : `Booking in ${A}, answered`}
          </h2>
          <Faq items={faq} />
        </section>
      </main>

      <Footer />
      <WhatsAppFab />
      <StickyBookBar from={Number.isFinite(cheapest) ? cheapest : null} title={`Cabs from ${A}`} />
    </>
  );
}

import Link from 'next/link';
import { api } from '@/lib/api';
import { cityPageName, cityPath, cityTitle, isAirport, routePath, vehiclePath } from '@/lib/slug';
import { buildCityFaq } from '@/lib/city-faq';
import { cityNote } from '@/content/cities';
import { rupees } from '@/lib/seo';
import { JsonLd, breadcrumbSchema, faqSchema, taxiServiceSchema } from '@/lib/schema';
import { BookingWidget } from '@/components/BookingWidget';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { StickyBookBar } from '@/components/site/StickyBookBar';
import { Icon } from '@/components/site/Icons';
import { Faq } from '@/components/site/Faq';
import { RouteList } from '@/components/site/RouteList';

export async function CityPage({ city }: { city: string }) {
  const [cities, all, packages, vehicles] = await Promise.all([
    api.cities().catch(() => []),
    api.routes().catch(() => ({ count: 0, routes: [] })),
    api.localPackages().catch(() => []),
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
  ]);

  const info = cities.find((c) => c.name === city);
  const A = info?.label ?? cityTitle(city);
  const airport = isAirport(city);
  const fromHere = all.routes.filter((r) => r.pickup === city);
  // Every route that ARRIVES here, not a sample of six. These links are how the quieter
  // routes get crawled: Ajmer → Sikar had three inbound links on the whole site.
  const toHere = all.routes.filter((r) => r.drop === city);
  const cheapest = Math.min(...fromHere.map((r) => r.fromRupees ?? Infinity));
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
  });

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
        })}
      />
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
              <span className="text-white/70">{A}</span>
            </nav>

            <h1 className="font-display mt-6 text-balance text-h1">
              {cityPageName(city, A)}
            </h1>
            {info?.state ? (
              <p className="mt-3 text-label font-bold uppercase text-white/45">{info.state}</p>
            ) : null}

            {/* The numbers first, because they are the answer: how many routes, from what,
                and how far they reach. All three are counted from the catalogue. */}
            <p className="mt-6 max-w-md text-pretty text-lead text-white/75">
              {fromHere.length > 0 && Number.isFinite(cheapest)
                ? `${fromHere.length} routes out of ${A} carry a published fare, from ${rupees(cheapest)}${nearest ? ` for ${cityTitle(nearest.drop)}, ${nearest.distanceKm} km away` : ''}. `
                : ''}
              {airport
                ? 'Pickups from the terminal and drops for a departure, with a driver, at a fare fixed when you book. Send the flight number and terminal with the booking.'
                : 'Outstation cabs with a driver — one way, round trip, or by the hour. Every fare is fixed before you leave.'}
            </p>

            <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6 border-t border-white/10 pt-8">
              {[
                [String(fromHere.length), 'priced routes'],
                Number.isFinite(cheapest) ? [`₹${cheapest.toLocaleString('en-IN')}`, 'from'] : null,
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

          {/* Pickup already set — a visitor on this page has told us where they are. */}
          <div className="lg:-mb-44">
            <BookingWidget defaultPickup={info} />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl 2xl:max-w-7xl px-5">
        {fromHere.length > 0 ? (
          <section className="pt-20 lg:pt-52">
            <h2 className="font-display text-balance text-h2">
              Routes from {A}
            </h2>
            <RouteList routes={fromHere} />
          </section>
        ) : null}

        {nearest && longest && nearest.drop !== longest.drop ? (
          <section className="pt-24">
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

        {note ? (
          <section className="pt-24">
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
          <section className="pt-24">
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

        <section className="pt-24">
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
          <section className="pt-24">
            <h2 className="font-display text-balance text-h2">
              {airport ? `Coming to ${A}` : `Coming into ${A}`}
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {toHere.map((r) => (
                <li key={r.pickup}>
                  <Link
                    href={routePath(r.pickup, r.drop)}
                    className="group flex items-center justify-between rounded-2xl border border-line bg-surface-raised px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
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

        <section className="pt-24">
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

        <section className="pt-24">
          <h2 className="font-display text-balance text-h2">
            {airport ? `${A} taxi, answered` : `Booking in ${A}, answered`}
          </h2>
          <Faq items={faq} />
        </section>
      </main>

      <Footer />
      <StickyBookBar from={Number.isFinite(cheapest) ? cheapest : null} />
    </>
  );
}

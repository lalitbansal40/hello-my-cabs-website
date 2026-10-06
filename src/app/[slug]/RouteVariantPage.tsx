import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api, type RoundtripFare, type Vehicle } from '@/lib/api';
import { cityTitle, routeCarPath, routePath, routeRoundPath, vehiclePath } from '@/lib/slug';
import { roadGuideFor } from '@/content/guides/roads';
import { guidePath } from '@/content/guides';
import { JsonLd, breadcrumbSchema, faqSchema, serviceSchema, webPageSchema } from '@/lib/schema';
import { FaresChecked, faresCheckedAt } from '@/components/site/FaresChecked';
import { env } from '@/lib/env';
import { hoursFor, rupees } from '@/lib/seo';
import { CAR_VARIANT_VEHICLES, hasCarPage, hasRoundTripPage } from '@/lib/route-variants';
import { BookingWidget } from '@/components/BookingWidget';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { WhatsAppFab } from '@/components/site/WhatsAppFab';
import { StickyBookBar } from '@/components/site/StickyBookBar';
import { Faq } from '@/components/site/Faq';
import { OnThisPage } from '@/components/site/OnThisPage';
import { VehicleArt } from '@/components/site/VehicleArt';
import { cityNote, cityPickup } from '@/content/cities';
import { routeContent } from '@/content/routes';

/**
 * A route's round trip (/jaipur-to-delhi-round-trip-cab) or a route in one car
 * (/jaipur-to-delhi-innova-crysta) — lib/route-variants.ts says which exist.
 *
 * Deliberately NOT the route page again with a new heading: everything here is what the
 * route page does not say — the round trip over one, two and three days and how it is
 * billed; or one car's fares, its cost a head and how it compares on this road. The route
 * page is one link away for everything else. Every figure is the fare API's, the same
 * figures the route page and the funnel use.
 */
export async function RouteVariantPage({
  pickup,
  drop,
  vehicle,
}: {
  pickup: string;
  drop: string;
  /** Set for a route-by-car page; absent for the round-trip page. */
  vehicle?: string;
}) {
  const [cities, vehicles, oneway, day1, day2, day3, packages, backOneway] = await Promise.all([
    api.cities().catch(() => []),
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
    api.onewayFare(pickup, drop).catch(() => null),
    api.roundtripFare(pickup, drop).catch(() => null),
    api.roundtripFare(pickup, drop, { days: 2 }).catch(() => null),
    api.roundtripFare(pickup, drop, { days: 3 }).catch(() => null),
    api.localPackages().catch(() => []),
    // The way back, for the car page's "and home again" answer — only when it is priced.
    vehicle ? api.onewayFare(drop, pickup).catch(() => null) : Promise.resolve(null),
  ]);
  // The same refusal as the route page: no page without its fares at build time.
  if (process.env.NEXT_PHASE === 'phase-production-build' && (!oneway || !day1)) {
    throw new Error(`No fares for ${pickup} → ${drop} at build time — refusing to publish the variant`);
  }
  if (!day1) notFound();

  const from = cities.find((c) => c.name === pickup);
  const to = cities.find((c) => c.name === drop);
  const A = from?.label ?? cityTitle(pickup);
  const B = to?.label ?? cityTitle(drop);
  const km = day1.distanceKm ?? oneway?.distanceKm;
  const all: Vehicle[] = [...vehicles.intercity, ...vehicles.roundTripOnly];
  const byDays = [day1, day2, day3].filter((x): x is RoundtripFare => Boolean(x));
  const oneOf = (key: string) => {
    const v = oneway?.vehicles.find((x) => x.key === key);
    return v ? (v.total ?? v.fare) : null;
  };
  const roundOf = (fare: RoundtripFare | undefined, key: string) =>
    fare?.vehicles.find((x) => x.key === key)?.fare ?? null;

  const car = vehicle ? all.find((v) => v.key === vehicle) : undefined;
  if (vehicle && (!car || (!oneOf(vehicle) && !roundOf(day1, vehicle)))) notFound();

  const path = car ? routeCarPath(pickup, drop, car.key) : routeRoundPath(pickup, drop);
  const routeHref = routePath(pickup, drop);
  // The pair's road guide, facing this direction — the same road block the route page has
  // (content/guides/roads.ts; drafts are not included), 7 Oct 2026.
  const guide = roadGuideFor(pickup, drop);
  const roadVia = guide
    ? (guide.a === pickup ? [...guide.via] : [...guide.via].reverse()).filter(
        (t) => t !== A && t !== B,
      )
    : [];
  const title = car ? `${A} to ${B} ${car.label}` : `${A} to ${B} round trip cab`;
  const checkedAt = faresCheckedAt();

  // What the page is about, as figures.
  const roundRows = day1.vehicles
    .map((v) => ({
      key: v.key,
      label: v.label,
      seats: all.find((x) => x.key === v.key)?.seats,
      d1: v.fare,
      d2: roundOf(day2 ?? undefined, v.key),
      d3: roundOf(day3 ?? undefined, v.key),
      one: oneOf(v.key),
    }))
    .sort((a, b) => a.d1 - b.d1);
  const cheapestRound = roundRows[0];
  const carOne = car ? oneOf(car.key) : null;
  const carRound = car ? roundOf(day1, car.key) : null;
  const carRound2 = car ? roundOf(day2 ?? undefined, car.key) : null;
  const carRound3 = car ? roundOf(day3 ?? undefined, car.key) : null;
  const leadFare = car ? (carOne ?? carRound ?? 0) : cheapestRound?.d1 ?? 0;

  // The route's own hand-written questions (Agra is shut on Fridays, Pushkar is over the
  // hill) apply to the trip whichever way it is booked, so they follow it here.
  const ownFaq = routeContent(pickup, drop).faq ?? [];
  const faq = [
    ...(car
      ? carFaq({
          A,
          B,
          km,
          car,
          carOne,
          carRound,
          carRound2,
          carRound3,
          day1,
          rows: roundRows,
          local: packages.find((p) => p.vehicle === car.key),
          back: (() => {
            const v = backOneway?.vehicles.find((x) => x.key === car.key);
            return v ? (v.total ?? v.fare) : null;
          })(),
        })
      : roundFaq({ A, B, km, day1, byDays, rows: roundRows })),
    ...ownFaq,
  ];
  // The two ends of the trip, from the same city notes the route page uses.
  const leaving = cityPickup(pickup);
  const there = cityNote(drop);

  // Siblings that exist — linked from here, as this page is linked from them.
  const otherCars = CAR_VARIANT_VEHICLES.filter(
    (v) => v !== vehicle && hasCarPage(pickup, drop, v),
  ).map((v) => ({ href: routeCarPath(pickup, drop, v), label: all.find((x) => x.key === v)?.label ?? v }));
  const roundHref = hasRoundTripPage(pickup, drop) && car ? routeRoundPath(pickup, drop) : null;
  const backRound = hasRoundTripPage(drop, pickup) ? routeRoundPath(drop, pickup) : null;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: `${A} to ${B} cab`, path: routeHref },
          { name: car ? car.label : 'Round trip', path },
        ])}
      />
      <JsonLd
        data={serviceSchema({
          name: title,
          description: car
            ? `${car.label} with a driver from ${A} to ${B}${km ? `, about ${km} km` : ''}. Fixed fare, driver included.`
            : `Round trip taxi from ${A} to ${B} and back${km ? `, about ${km} km each way` : ''}, for one to three days. Fixed fare, driver included.`,
          path,
          serviceType: 'Outstation taxi service',
          areaServed: [A, B],
          ...(km ? { image: `${routeHref}/map.svg` } : {}),
          offers: car
            ? [
                ...(carOne ? [{ name: `${car.label} — one way`, price: carOne }] : []),
                ...(carRound ? [{ name: `${car.label} — round trip`, price: carRound }] : []),
              ]
            : roundRows.map((r) => ({ name: `${r.label} — round trip`, price: r.d1 })),
        })}
      />
      <JsonLd data={faqSchema(faq)} />
      <JsonLd
        data={webPageSchema({ path, name: title, modified: checkedAt, about: `${env.siteUrl}${path}#service` })}
      />

      <Header />

      <section
        id="book"
        className="hero-ground grain vignette relative scroll-mt-16 overflow-hidden text-white"
      >
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl 2xl:max-w-7xl items-center gap-14 px-5 pb-24 pt-14 md:grid-cols-[1fr_minmax(330px,380px)] lg:grid-cols-[1.15fr_minmax(400px,452px)] lg:gap-16 lg:pb-32 lg:pt-20">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="rise rise-1 text-small text-white/60 [&_a]:inline-block [&_a]:py-3 [&_a]:-my-3"
            >
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <Link href={routeHref} className="hover:text-white">{A} to {B}</Link>
              <span className="mx-2">/</span>
              <span className="text-white/70">{car ? car.label : 'Round trip'}</span>
            </nav>
            <h1 className="rise rise-2 font-display mt-6 text-balance text-h1">{title}</h1>
            <p className="rise rise-3 mt-6 max-w-md text-pretty text-lead text-white/75">
              {car
                ? `${/^[aeiou]/i.test(car.label) ? 'An' : 'A'} ${car.label}${car.seats ? ` seats ${car.seats}` : ''} and runs from ${A} to ${B} at ${
                    carOne ? `${rupees(carOne)} one way` : 'round trips only'
                  }${carRound ? ` and ${rupees(carRound)} there and back in a day` : ''}, with the driver, fuel and GST in it.`
                : `There and back in a day from ${rupees(cheapestRound.d1)}, ${day1.billedKm} km billed. The car and driver stay with you in ${B} and bring you back; a longer stay is priced by the day.`}
            </p>
            {km ? (
              <p className="rise rise-4 mt-6 text-small text-white/60">
                {km} km each way · {hoursFor(km)} of driving each way
              </p>
            ) : null}
            <FaresChecked at={checkedAt} className="rise rise-4 mt-2 text-white/55" />
          </div>
          <div className="rise rise-5">
            <BookingWidget
              defaultPickup={from}
              defaultDrop={to}
              defaultTripType={car && carOne ? 'one_way' : 'round_trip'}
              defaultVehicle={car?.key}
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl 2xl:max-w-7xl px-5">
        <div className="pt-8">
          <OnThisPage />
        </div>

        {car ? (
          <>
            <section className="reveal pt-12">
              <h2 className="font-display text-balance text-h2">The {car.label} on this road</h2>
              <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
                <VehicleArt vehicleKey={car.key} label={car.label} className="h-20 w-48 shrink-0" />
                <dl className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4" data-fare-rows={[carOne, carRound, carRound2, carRound3].filter(Boolean).length}>
                  {[
                    ['One way', carOne ? rupees(carOne) : 'Round trips only'],
                    ['Round trip, same day', carRound ? rupees(carRound) : '—'],
                    ['Two days', carRound2 ? rupees(carRound2) : '—'],
                    ['Three days', carRound3 ? rupees(carRound3) : '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-2xl border border-line bg-surface-raised px-4 py-3">
                      <dt className="text-label font-medium uppercase text-muted">{k}</dt>
                      <dd className="mt-1 font-display text-title tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {car.seats ? (
                <p className="mt-8 max-w-measure text-pretty text-body text-muted">
                  With {car.seats} on board, that is{' '}
                  {carOne ? `${rupees(Math.round(carOne / car.seats))} a head one way` : ''}
                  {carOne && carRound ? ' and ' : ''}
                  {carRound ? `${rupees(Math.round(carRound / car.seats))} a head for the day out and back` : ''}.{' '}
                  {car.tripTypes.length === 1
                    ? `It runs on round trips only, priced by the kilometre with a floor of ${day1.minKmPerDay} km a day — ${day1.billedKm} km on this route for a same-day return.`
                    : `The one-way fare is the whole fare for the ${km ?? ''} km; nothing is added for the car going back.`}
                </p>
              ) : null}
            </section>

            {carOne || carRound ? (
              <section className="reveal section-gap">
                <h2 className="font-display text-balance text-h2">What the {car.label} works out at</h2>
                <p className="mt-6 max-w-measure text-pretty text-body text-muted">
                  {carOne && km
                    ? `One way, ${rupees(carOne)} over ${km} km is about ₹${Math.round((carOne / km) * 10) / 10} a kilometre, with the driver, fuel and GST in it. `
                    : ''}
                  {carOne && carRound
                    ? carRound < carOne * 2
                      ? `Going and coming back the same day, the round trip at ${rupees(carRound)} is ${rupees(carOne * 2 - carRound)} less than two one-way fares, and keeps the same ${car.label} and driver for the return.`
                      : `Two one-way fares (${rupees(carOne * 2)}) cost no more than the round trip (${rupees(carRound)}) here — the round trip keeps the same ${car.label} and driver for the return.`
                    : carRound
                      ? `The same-day round trip is ${rupees(carRound)}, billed on ${day1.billedKm} km.`
                      : ''}
                </p>
              </section>
            ) : null}

            <section className="reveal section-gap">
              <h2 className="font-display text-balance text-h2">
                The {car.label} against the other cars from {A} to {B}
              </h2>
              <CompareTable rows={roundRows} highlight={car.key} />
              <p className="mt-6 max-w-measure text-pretty text-body text-muted">
                A head is the fare divided by the seats — what it costs each when the car is full.
                A smaller car costs less in all; a bigger one can cost less each.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="reveal pt-12">
              <h2 className="font-display text-balance text-h2">Round trip fares, one to three days</h2>
              <div className="mt-8 overflow-x-auto" data-fare-rows={roundRows.length}>
                <table className="w-full text-left text-small sm:text-body">
                  <thead>
                    <tr className="border-b border-line text-label uppercase text-muted">
                      <th className="py-3 pr-2 sm:pr-4 font-medium">Car</th>
                      <th className="py-3 pr-2 font-medium sm:pr-3">1 day</th>
                      <th className="py-3 pr-2 font-medium sm:pr-3">2 days</th>
                      <th className="py-3 font-medium">3 days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roundRows.map((r) => (
                      <tr key={r.key} className="border-b border-line/60">
                        <td className="py-3 pr-2 sm:pr-4 font-medium">
                          {r.label}
                          {r.seats ? (
                            <span className="block text-small font-normal text-muted sm:inline">
                              <span className="hidden sm:inline"> · </span>
                              {r.seats} seats
                            </span>
                          ) : null}
                        </td>
                        <td className="py-3 pr-2 sm:pr-4 tabular-nums">{rupees(r.d1)}</td>
                        <td className="py-3 pr-2 sm:pr-4 tabular-nums">{r.d2 ? rupees(r.d2) : '—'}</td>
                        <td className="py-3 tabular-nums">{r.d3 ? rupees(r.d3) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="reveal section-gap">
              <h2 className="font-display text-balance text-h2">How a round trip to {B} is billed</h2>
              <p className="mt-6 max-w-measure text-pretty text-body text-muted">
                By the kilometre, out and back, with a floor of {day1.minKmPerDay} km for every day
                the car is with you. {A} to {B} and back in a day is {day1.billedKm} km billed
                {km ? ` — ${km} km each way` : ''}
                {day2 ? `; kept for two days it is ${day2.billedKm} km` : ''}
                {day3 ? `, for three ${day3.billedKm} km` : ''}.{' '}
                {day1.nightCharge
                  ? `A night the driver spends away adds ${rupees(day1.nightCharge)}. `
                  : ''}
                {day1.hill ? 'Part of the road is hill driving, which is priced into the rate. ' : ''}
                Toll, parking and any state entry tax are paid as they come.
              </p>
            </section>

            <section className="reveal section-gap">
              <h2 className="font-display text-balance text-h2">Round trip, or two one-way fares?</h2>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {roundRows
                  .filter((r) => r.one)
                  .map((r) => {
                    const two = (r.one as number) * 2;
                    const diff = two - r.d1;
                    return (
                      <li key={r.key} className="rounded-2xl border border-line bg-surface-raised px-5 py-4">
                        <p className="font-medium">{r.label}</p>
                        <p className="mt-1 text-small text-muted">
                          Round trip {rupees(r.d1)} · two one-ways {rupees(two)} ·{' '}
                          {diff > 0
                            ? `${rupees(diff)} less as a round trip`
                            : diff < 0
                              ? `${rupees(-diff)} less as two one-ways`
                              : 'the same either way'}
                        </p>
                      </li>
                    );
                  })}
              </ul>
              <p className="mt-6 max-w-measure text-pretty text-body text-muted">
                A round trip keeps the same car and driver for the return. Two one-way bookings are
                two separate cars, each at its own time.
              </p>
            </section>
          </>
        )}

        {/* The route's map (lib/route-map.ts, served for the one-way route) — the same road,
            so the same picture, named for this page (7 Oct 2026). */}
        {km ? (
          <figure className="reveal section-gap">
            {/* eslint-disable-next-line @next/next/no-img-element -- an SVG map of our own, drawn at its display size; nothing for the optimiser to do. */}
            <img
              src={`${routeHref}/map.svg`}
              alt={`Map of the ${car ? `${A} to ${B} ${car.label} taxi` : `${A} to ${B} round trip`} — ${km} km each way`}
              width={640}
              height={400}
              loading="lazy"
              decoding="async"
              className="h-auto w-full max-w-2xl rounded-3xl border border-line"
            />
            <figcaption className="mt-3 max-w-2xl text-small text-muted">
              {A} and {B} on the map. The dashed line joins the two cities; the road is {km} km
              each way.
            </figcaption>
          </figure>
        ) : null}

        {guide ? (
          <section className="reveal section-gap">
            <h2 className="font-display text-balance text-h2">The road</h2>
            <p className="mt-6 max-w-measure text-pretty text-body text-muted">
              Most trips take {guide.highway}
              {roadVia.length
                ? `, through ${
                    roadVia.length > 1
                      ? `${roadVia.slice(0, -1).join(', ')} and ${roadVia[roadVia.length - 1]}`
                      : roadVia[0]
                  }`
                : ''}
              .{guide.alternative ? ` Some drivers take ${guide.alternative}.` : ''} The driver may
              take another way for traffic.{' '}
              <Link href={guidePath(guide.slug)} className="font-semibold text-accent hover:underline">
                {cityTitle(guide.a)} to {cityTitle(guide.b)} by road — the guide
              </Link>
            </p>
          </section>
        ) : null}

        {there?.arrival ? (
          <section className="reveal section-gap">
            <h2 className="font-display text-balance text-h2">
              {car ? `In ${B}` : `A day in ${B}`}
            </h2>
            <p className="mt-6 max-w-measure text-pretty text-body text-muted">{there.arrival}</p>
            {there.drop ? (
              <p className="mt-4 max-w-measure text-pretty text-body text-muted">{there.drop}</p>
            ) : null}
          </section>
        ) : null}

        {leaving ? (
          <section className="reveal section-gap">
            <h2 className="font-display text-balance text-h2">Leaving {A}</h2>
            <p className="mt-6 max-w-measure text-pretty text-body text-muted">{leaving.about}</p>
            {leaving.points.length ? (
              <p className="mt-4 max-w-measure text-pretty text-body text-muted">
                People are usually collected at {leaving.points.join(', ')}, or at home anywhere
                in {A}.
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="reveal section-gap">
          <h2 className="font-display text-balance text-h2">{title}, answered</h2>
          <Faq items={faq} />
        </section>

        <section className="reveal section-gap">
          <h2 className="font-display text-balance text-h2">More on {A} to {B}</h2>
          <ul className="mt-8 flex flex-wrap gap-2">
            {[
              { href: routeHref, label: `${A} to ${B} cab — every car, one way and round trip` },
              ...(roundHref ? [{ href: roundHref, label: `${A} to ${B} round trip` }] : []),
              ...otherCars.map((c) => ({ href: c.href, label: `${A} to ${B} ${c.label}` })),
              ...(backRound ? [{ href: backRound, label: `${B} to ${A} round trip` }] : []),
              ...(car ? [{ href: vehiclePath(car.key), label: `${car.label} on other routes` }] : []),
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface-raised px-4 text-small font-semibold hover:border-accent hover:text-accent"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
      <WhatsAppFab />
      <StickyBookBar from={leadFare || null} onDistance={false} title={car ? `${A} → ${B} · ${car.label}` : `${A} ⇄ ${B}`} />
    </>
  );
}

type Row = {
  key: string;
  label: string;
  seats?: number;
  d1: number;
  d2: number | null;
  d3: number | null;
  one: number | null;
};

function CompareTable({ rows, highlight }: { rows: Row[]; highlight: string }) {
  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full text-left text-small sm:text-body">
        <thead>
          <tr className="border-b border-line text-label uppercase text-muted">
            <th className="py-3 pr-2 sm:pr-4 font-medium">Car</th>
            <th className="py-3 pr-2 font-medium sm:pr-3">One way</th>
            <th className="py-3 pr-2 font-medium sm:pr-3">Round trip</th>
            <th className="py-3 font-medium">A head</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const base = r.one ?? r.d1;
            return (
              <tr
                key={r.key}
                className={`border-b border-line/60 ${r.key === highlight ? 'bg-accent/8 font-semibold' : ''}`}
              >
                <td className="py-3 pr-4">
                  {r.label}
                  {r.seats ? (
                    <span className="block text-small font-normal text-muted sm:inline">
                      <span className="hidden sm:inline"> · </span>
                      {r.seats} seats
                    </span>
                  ) : null}
                </td>
                <td className="py-3 pr-2 sm:pr-4 tabular-nums">{r.one ? rupees(r.one) : '—'}</td>
                <td className="py-3 pr-2 sm:pr-4 tabular-nums">{rupees(r.d1)}</td>
                <td className="py-3 tabular-nums">{r.seats ? rupees(Math.round(base / r.seats)) : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type Q = { q: string; a: string };

function roundFaq({
  A,
  B,
  km,
  day1,
  byDays,
  rows,
}: {
  A: string;
  B: string;
  km?: number;
  day1: RoundtripFare;
  byDays: RoundtripFare[];
  rows: Row[];
}): Q[] {
  const low = rows[0];
  const out: Q[] = [
    {
      q: `What does a round trip from ${A} to ${B} cost?`,
      a: `From ${rupees(low.d1)} in ${low.label === 'Hatchback' ? 'a hatchback' : `a ${low.label}`} to go and come back the same day — ${day1.billedKm} km billed.`,
    },
    {
      q: 'How many kilometres am I billed for?',
      a: `At least ${day1.minKmPerDay} km for each day the car is with you, or the real distance if that is more. For a same-day return on this route that is ${day1.billedKm} km.`,
    },
  ];
  if (byDays.length > 1) {
    out.push({
      q: `What if I stay in ${B} for a few days?`,
      a: byDays
        .map((f, i) => `${i + 1} day${i ? 's' : ''}: ${rupees(Math.min(...f.vehicles.map((v) => v.fare)))}`)
        .join(', ') + ' — the lowest fare for each, with the car and driver kept the whole time.',
    });
  }
  if (day1.nightCharge) {
    out.push({
      q: 'Is there a charge for the driver staying overnight?',
      a: `${rupees(day1.nightCharge)} for each night the driver is away from base, on a trip longer than a day.`,
    });
  }
  const cheaper = rows.filter((r) => r.one && r.one * 2 > r.d1);
  out.push({
    q: 'Is a round trip cheaper than two one-way fares?',
    a: cheaper.length
      ? `On this route, for ${cheaper.map((r) => r.label).join(', ')}. For the rest, two one-ways cost the same or less — the table above has every car.`
      : 'Not on this route: two one-way fares cost the same or less. A round trip still keeps the same car and driver for the return.',
  });
  const vans = rows.filter((r) => !r.one);
  if (vans.length) {
    out.push({
      q: 'Can I take a tempo traveller there and back?',
      a: `Yes — ${vans.map((r) => `the ${r.label} is ${rupees(r.d1)}`).join(', ')} for the same-day round trip. These run on round trips only.`,
    });
  }
  if (km) {
    out.push({
      q: 'How long is the drive each way?',
      a: `${km} km, ${hoursFor(km)} of driving each way before any stops.`,
    });
  }
  out.push(
    {
      q: 'Can I change the return date?',
      a: 'Give the return date when you book, and the fare is worked out for the days the car is out. To change it after booking, call the desk.',
    },
    {
      q: 'Are toll and parking included?',
      a: 'No. Toll, parking and any state entry tax are paid as they come; the fare covers the car, the driver, the fuel and GST.',
    },
  );
  return out;
}

function carFaq({
  A,
  B,
  km,
  car,
  carOne,
  carRound,
  carRound2,
  carRound3,
  day1,
  rows,
  local,
  back,
}: {
  A: string;
  B: string;
  km?: number;
  car: Vehicle;
  carOne: number | null;
  carRound: number | null;
  carRound2: number | null;
  carRound3: number | null;
  day1: RoundtripFare;
  rows: Row[];
  /** This car's hourly package, when it has one (fare API /fare/local). */
  local?: { includedHours: number; includedKm: number; baseFareRupees: number };
  /** This car one way on the reverse route, when it is priced. */
  back?: number | null;
}): Q[] {
  const name = car.label;
  const an = /^[aeiou]/i.test(name) ? 'an' : 'a';
  const out: Q[] = [
    {
      q: `How much is ${an} ${name} from ${A} to ${B}?`,
      a: [
        carOne ? `${rupees(carOne)} one way` : `It runs on round trips only`,
        carRound ? `${rupees(carRound)} for a same-day round trip` : null,
      ]
        .filter(Boolean)
        .join(', ') + ', with the driver, fuel and GST in it.',
    },
  ];
  if (car.seats) {
    const base = carOne ?? carRound;
    out.push({
      q: `How many people fit in ${an} ${name}?`,
      a: `${car.seats} passengers.${base ? ` Full, the ${carOne ? 'one-way' : 'round-trip'} fare comes to ${rupees(Math.round(base / car.seats))} each.` : ''}`,
    });
  }
  if (!carOne) {
    out.push({
      q: `Can I book ${an} ${name} one way from ${A} to ${B}?`,
      a: `No — it runs on round trips only, billed at a floor of ${day1.minKmPerDay} km a day (${day1.billedKm} km on this route for a same-day return).`,
    });
  }
  if (carRound2 || carRound3) {
    out.push({
      q: `What if I keep the ${name} for two or three days?`,
      a: [carRound2 ? `Two days: ${rupees(carRound2)}` : null, carRound3 ? `three days: ${rupees(carRound3)}` : null]
        .filter(Boolean)
        .join(', ') + `${day1.nightCharge ? `, plus ${rupees(day1.nightCharge)} for each night the driver is away` : ''}.`,
    });
  }
  const smaller = rows
    .filter((r) => r.key !== car.key && (r.seats ?? 0) < (car.seats ?? 0) && r.one)
    .sort((a, b) => (b.seats ?? 0) - (a.seats ?? 0))[0];
  if (smaller && carOne) {
    out.push({
      q: `Is the ${name} worth it over a smaller car?`,
      a: `${an[0].toUpperCase()}${an.slice(1)} ${smaller.label} is ${rupees(smaller.one as number)} one way${
        smaller.seats ? ` for ${smaller.seats}` : ''
      }, against ${rupees(carOne)} for the ${name}${car.seats ? `'s ${car.seats}` : ''}. For a group that fills it, the ${name} costs ${
        car.seats && smaller.seats && carOne / car.seats < (smaller.one as number) / smaller.seats ? 'less' : 'more'
      } each.`,
    });
  }
  if (km) {
    out.push({
      q: `How long does the ${A} to ${B} drive take in ${an} ${name}?`,
      a: `${km} km, ${hoursFor(km)} of driving depending on traffic and stops — the same road and the same time as any car.`,
    });
  }
  out.push(
    {
      q: 'Is the fare fixed?',
      a: `Yes. The ${name} fare is fixed when you book; toll, parking and any state entry tax are paid as they come.`,
    },
    ...(back
      ? [
          {
            q: `What does the ${name} cost from ${B} back to ${A}?`,
            a: `${rupees(back)} one way.${carOne ? (back === carOne ? ' The same as going out.' : ` Going out it is ${rupees(carOne)}.`) : ''}${carOne && carRound ? ` Out and back the same day as one booking, the round trip is ${rupees(carRound)}.` : ''}`,
          },
        ]
      : []),
    ...(local
      ? [
          {
            q: `Can I keep the ${name} for local trips in ${B}?`,
            a: `By the hour, yes — booked as a local hire: ${local.includedHours} hours and ${local.includedKm} km for ${rupees(local.baseFareRupees)} in the ${name}.`,
          },
        ]
      : []),
    {
      q: `Is the ${name} air-conditioned?`,
      a: `Yes — every car and van we run is AC, the ${name} included.`,
    },
    {
      q: `Can I choose the ${name} when I book?`,
      a: `Yes — the booking form on this page carries the ${name} through, and it is first on the list when you pick the car.`,
    },
  );
  return out;
}

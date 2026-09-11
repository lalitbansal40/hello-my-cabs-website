import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { cityTitle, routePath, vehiclePath } from '@/lib/slug';
import { rupees } from '@/lib/seo';
import { JsonLd, breadcrumbSchema, faqSchema, serviceSchema } from '@/lib/schema';
import { BookingWidget } from '@/components/BookingWidget';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { StickyBookBar } from '@/components/site/StickyBookBar';
import { Icon } from '@/components/site/Icons';
import { Faq } from '@/components/site/Faq';

export function vehicleFaq(label: string, seats: number | undefined, roundOnly: boolean) {
  return [
    {
      q: `How many people fit in ${a(label)}?`,
      a: seats
        ? `${seats} passengers, plus the driver. Luggage depends on how full the cabin is — tell us when you book and we will send a vehicle with a carrier if you need one.`
        : `Four passengers comfortably, plus the driver, with luggage for a weekend.`,
    },
    ...(roundOnly
      ? [
          {
            q: `Can I book ${a(label)} one way?`,
            a: `No. This vehicle runs on round trips only. On a one-way booking the driver has to return empty, and pricing that honestly would cost more than the trip is worth to you — so we do not offer it rather than quote a number nobody wants.`,
          },
        ]
      : [
          {
            q: `Is ${a(label)} available one way?`,
            a: `Yes, on every trip type — one way, round trip and by the hour.`,
          },
        ]),
    {
      q: `What does the fare include?`,
      a: `The driver, fuel and GST. Toll, parking and state taxes are paid as they arise and appear on your bill; a night allowance applies after 10 pm.`,
    },
  ];
}

const a = (label: string) => (/^[aeiou]/i.test(label) ? `an ${label}` : `a ${label}`);

export async function VehiclePage({ vehicleKey }: { vehicleKey: string }) {
  const [vehicles, all] = await Promise.all([
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
    api.routes().catch(() => ({ count: 0, routes: [] })),
  ]);

  const list = [...vehicles.intercity, ...vehicles.roundTripOnly];
  const v = list.find((x) => x.key === vehicleKey);
  // Returning null here served a 200 with an empty body. A page that does not exist must
  // say so.
  if (!v) notFound();

  const roundOnly = v.tripTypes.length === 1;
  const faq = vehicleFaq(v.label, v.seats, roundOnly);
  const path = vehiclePath(v.key);

  // `fromRupees` on a route is the cheapest one-way car. For a vehicle that can only be
  // booked as a round trip that number is unreachable, so quoting it would be a lie — the
  // real round-trip fare has to be fetched per route instead. Without this these four pages
  // carried no price at all, which is the thin page the plan warns about.
  const picked = all.routes.slice(0, 8);
  // Every route priced for THIS vehicle. It used to take `fromRupees` off the route, which
  // is the cheapest car on it — so the Innova Crysta page advertised Jaipur → Delhi at
  // ₹3,200 when an Innova Crysta on that route is ₹6,000. A price on a page has to be the
  // price of the thing the page is about.
  const fares = await Promise.all(
    picked.map((r) =>
      (roundOnly ? api.roundtripFare(r.pickup, r.drop) : api.onewayFare(r.pickup, r.drop))
        .then((f) => {
          const row = f.vehicles.find((x) => x.key === v.key) as
            | { fare: number; total?: number }
            | undefined;
          return { pickup: r.pickup, drop: r.drop, rupees: row ? (row.total ?? row.fare) : undefined };
        })
        .catch(() => ({ pickup: r.pickup, drop: r.drop, rupees: undefined })),
    ),
  );
  // A route whose fare did not come back is dropped rather than shown priceless.
  const top: Array<{ pickup: string; drop: string; rupees: number }> = fares.flatMap((r) =>
    typeof r.rupees === 'number' && r.rupees > 0
      ? [{ pickup: r.pickup, drop: r.drop, rupees: r.rupees }]
      : [],
  );

  const cheapest = Math.min(...top.map((r) => r.rupees));
  const dearest = Math.max(...top.map((r) => r.rupees));

  /**
   * What this vehicle costs against the next size down and the next size up, on one real
   * route — with the per-seat figure, which is the comparison that actually decides it.
   *
   * Two neighbours rather than the whole fleet on purpose: a table of all eight vehicles
   * would be the same table on all eight pages, which is the duplication this is trying to
   * undo.
   */
  const bench = picked[0];
  const benchFare = bench
    ? await (roundOnly
        ? api.roundtripFare(bench.pickup, bench.drop)
        : api.onewayFare(bench.pickup, bench.drop)
      ).catch(() => null)
    : null;
  const seated = list.filter((x) => x.seats);
  const order = [...seated].sort((x, y) => (x.seats ?? 0) - (y.seats ?? 0) || x.label.localeCompare(y.label));
  const at = order.findIndex((x) => x.key === v.key);
  const neighbours = at === -1 ? [] : [order[at - 1], order[at], order[at + 1]].filter(Boolean);
  const comparison = benchFare
    ? neighbours.flatMap((x) => {
        const row = benchFare.vehicles.find((y) => y.key === x.key) as
          | { fare: number; total?: number }
          | undefined;
        const price = row ? (row.total ?? row.fare) : null;
        return price && x.seats
          ? [{ key: x.key, label: x.label, seats: x.seats, price, each: Math.round(price / x.seats) }]
          : [];
      })
    : [];

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: v.label, path },
      ])} />
      {Number.isFinite(cheapest) ? (
        <JsonLd
          data={serviceSchema({
            name: `${v.label} ${roundOnly ? 'on rent' : 'taxi'}`,
            description: `Book ${a(v.label)} with a driver for outstation travel. Fixed fare, no surge.`,
            path,
            serviceType: roundOnly ? 'Vehicle rental with driver' : 'Outstation taxi service',
            // The cities this vehicle is actually priced between on this page.
            areaServed: [...new Set(top.flatMap((r) => [cityTitle(r.pickup), cityTitle(r.drop)]))],
            // The routes printed on the page, at the prices printed on it.
            offers: top.map((r) => ({
              name: `${cityTitle(r.pickup)} to ${cityTitle(r.drop)}`,
              price: r.rupees,
            })),
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
              <span className="text-white/70">{v.label}</span>
            </nav>

            <h1 className="font-display mt-6 text-balance text-h1">
              {v.label} on hire
            </h1>

            {/* Said here, at the top, and not buried in a footnote. Somebody arriving from a
                search for a one-way trip needs to know before they fill anything in. */}
            {roundOnly ? (
              <p className="mt-6 inline-flex items-start gap-2.5 rounded-2xl border border-clay/40 bg-clay/10 px-4 py-3 text-pretty text-small text-white/85">
                <Icon.tag className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                Round trips only. On a one-way booking this vehicle would have to return
                empty, so we do not offer it rather than quote a price nobody wants.
              </p>
            ) : null}

            <p className="mt-6 max-w-md text-pretty text-lead text-white/75">
              {v.seats ? `Seats ${v.seats}, plus the driver. ` : ''}
              {Number.isFinite(cheapest) && cheapest !== dearest
                ? `On our published routes ${a(v.label)} runs ${rupees(cheapest)} to ${rupees(dearest)} ${roundOnly ? 'round trip' : 'one way'}. `
                : ''}
              The fare is fixed before you leave, and you pay in cash at the end.
            </p>

            <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6 border-t border-white/10 pt-8">
              {[
                v.seats ? [String(v.seats), 'seats'] : null,
                [roundOnly ? 'Round trip' : 'All trips', 'available on'],
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

          <div className="lg:-mb-44">
            <BookingWidget defaultTripType={roundOnly ? 'round_trip' : 'one_way'} />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl 2xl:max-w-7xl px-5">
        {top.length > 0 ? (
          <section className="pt-20 lg:pt-52">
            <h2 className="font-display text-balance text-h2">
              Popular routes
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-body text-muted">
              {roundOnly
                ? `Round-trip fares for ${a(v.label)}, driver and fuel included.`
                : 'One-way fares, driver and fuel included.'}
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
              {top.map((r) => (
                <li key={`${r.pickup}-${r.drop}`}>
                  <Link
                    href={routePath(r.pickup, r.drop)}
                    className="group flex flex-col rounded-2xl border border-line bg-surface-raised px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
                  >
                    <span className="text-small font-medium">
                      {cityTitle(r.pickup)} → {cityTitle(r.drop)}
                    </span>
                    <span className="mt-1 text-small text-muted">
                      from ₹{r.rupees.toLocaleString('en-IN')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {comparison.length > 1 && bench ? (
          <section className="pt-24">
            <h2 className="font-display text-balance text-h2">
              {v.label}, against the size either side
            </h2>
            <p className="mt-4 max-w-measure text-pretty text-body text-muted">
              {cityTitle(bench.pickup)} to {cityTitle(bench.drop)},{' '}
              {roundOnly ? 'round trip' : 'one way'}, so the three figures are comparable. The
              second number is the fare divided by the seats.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {comparison.map((c) => (
                <li
                  key={c.key}
                  className={
                    'rounded-2xl border px-5 py-4 ' +
                    (c.key === v.key
                      ? 'border-forest/30 bg-surface-alt'
                      : 'border-line bg-surface-raised')
                  }
                >
                  <p className="text-small font-bold">{c.label}</p>
                  <p className="mt-0.5 text-small text-muted">{c.seats} seats</p>
                  <p className="font-display mt-3 text-title font-black">{rupees(c.price)}</p>
                  <p className="mt-0.5 text-small text-muted">{rupees(c.each)} per seat</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {v.perKm ? (
          <section className="pt-24">
            <h2 className="font-display text-balance text-h2">How this one is priced</h2>
            <p className="mt-4 max-w-measure text-pretty text-body text-muted">
              {a(v.label).replace(/^a/, 'A')} is charged by the kilometre for the whole
              journey, out and back: ₹{v.perKm} a km on the plains
              {v.hillPerKm ? `, ₹${v.hillPerKm} on hill routes` : ''}
              {v.nightCharge ? `, and ${rupees(v.nightCharge)} for a night halt` : ''}. There
              is a minimum distance billed per day, which is what lets a driver take a long
              return leg without it being priced as two separate trips.
            </p>
          </section>
        ) : null}

        <section className="pt-24">
          <h2 className="font-display text-balance text-h2">
            Other vehicles
          </h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {list
              .filter((x) => x.key !== v.key)
              .map((x) => (
                <li key={x.key}>
                  <Link
                    href={vehiclePath(x.key)}
                    className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line bg-surface-raised px-5 py-2.5 text-small font-medium transition-colors hover:border-forest/25"
                  >
                    <Icon.car className="h-4 w-4 text-forest" />
                    {x.label}
                  </Link>
                </li>
              ))}
          </ul>
        </section>

        <section className="pt-24">
          <h2 className="font-display text-balance text-h2">
            {v.label}, answered
          </h2>
          <Faq items={faq} />
        </section>
      </main>

      <Footer />
      <StickyBookBar from={Number.isFinite(cheapest) ? cheapest : null} />
    </>
  );
}

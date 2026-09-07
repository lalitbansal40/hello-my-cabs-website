import Link from 'next/link';
import { api } from '@/lib/api';
import { cityTitle, routePath, vehiclePath } from '@/lib/slug';
import { JsonLd, breadcrumbSchema, faqSchema, productSchema } from '@/lib/schema';
import { BookingWidget } from '@/components/BookingWidget';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
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
  if (!v) return null;

  const roundOnly = v.tripTypes.length === 1;
  const faq = vehicleFaq(v.label, v.seats, roundOnly);
  const path = vehiclePath(v.key);

  // Round-trip-only vehicles are not in the one-way table, so a "from" price taken from it
  // would be a number this vehicle cannot be booked at.
  const top = roundOnly ? [] : all.routes.slice(0, 8);
  const cheapest = Math.min(...top.map((r) => r.fromRupees ?? Infinity));

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: v.label, path },
      ])} />
      {Number.isFinite(cheapest) ? (
        <JsonLd
          data={productSchema({
            name: `${v.label} taxi`,
            description: `Book ${a(v.label)} with a driver for outstation travel. Fixed fare, no surge.`,
            fromRupees: cheapest,
            path,
          })}
        />
      ) : null}
      <JsonLd data={faqSchema(faq)} />

      <Header />

      <section className="hero-ground grain vignette relative overflow-hidden text-white">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-14 lg:grid-cols-[1.15fr_minmax(400px,452px)] lg:gap-16 lg:pb-32 lg:pt-20">
          <div>
            <nav aria-label="Breadcrumb" className="text-[13px] text-white/45">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white/70">{v.label}</span>
            </nav>

            <h1 className="font-display mt-6 text-[2.75rem] leading-[1.02] tracking-[-0.03em] sm:text-[3.75rem]">
              {v.label} on hire
            </h1>

            {/* Said here, at the top, and not buried in a footnote. Somebody arriving from a
                search for a one-way trip needs to know before they fill anything in. */}
            {roundOnly ? (
              <p className="mt-6 inline-flex items-start gap-2.5 rounded-2xl border border-clay/40 bg-clay/10 px-4 py-3 text-[14.5px] leading-relaxed text-white/85">
                <Icon.tag className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                Round trips only. On a one-way booking this vehicle would have to return
                empty, so we do not offer it rather than quote a price nobody wants.
              </p>
            ) : null}

            <p className="mt-6 max-w-md text-[17px] leading-[1.65] text-white/75">
              {v.seats ? `Seats ${v.seats}, plus the driver. ` : 'Comfortable for four, plus the driver. '}
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
                      <dt className="font-display text-[1.9rem] leading-[1.05] tracking-tight">{big}</dt>
                      <dd className="mt-1.5 text-[12px] font-medium uppercase tracking-[0.12em] text-white/40">
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

      <main className="mx-auto max-w-6xl px-5">
        {top.length > 0 ? (
          <section className="pt-20 lg:pt-52">
            <h2 className="font-display text-[2.4rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
              Popular routes
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {top.map((r) => (
                <li key={`${r.pickup}-${r.drop}`}>
                  <Link
                    href={routePath(r.pickup, r.drop)}
                    className="group flex flex-col rounded-2xl border border-line bg-surface-raised px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
                  >
                    <span className="text-[14px] font-medium">
                      {cityTitle(r.pickup)} → {cityTitle(r.drop)}
                    </span>
                    <span className="mt-1 text-[13px] text-muted">
                      from ₹{r.fromRupees?.toLocaleString('en-IN')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="pt-24">
          <h2 className="font-display text-[2.4rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
            Other vehicles
          </h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {list
              .filter((x) => x.key !== v.key)
              .map((x) => (
                <li key={x.key}>
                  <Link
                    href={vehiclePath(x.key)}
                    className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface-raised px-5 py-2.5 text-[14px] font-medium transition-colors hover:border-forest/25"
                  >
                    <Icon.car className="h-4 w-4 text-forest" />
                    {x.label}
                  </Link>
                </li>
              ))}
          </ul>
        </section>

        <section className="pt-24">
          <h2 className="font-display text-[2.4rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
            {v.label}, answered
          </h2>
          <Faq items={faq} />
        </section>
      </main>

      <Footer />
    </>
  );
}

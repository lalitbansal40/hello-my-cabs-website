import Link from 'next/link';
import { api } from '@/lib/api';
import { cityPath, cityTitle, routePath } from '@/lib/slug';
import { JsonLd, breadcrumbSchema, faqSchema, productSchema } from '@/lib/schema';
import { BookingWidget } from '@/components/BookingWidget';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { Icon } from '@/components/site/Icons';
import { Faq } from '@/components/site/Faq';
import { FareTable } from '@/components/landing/FareTable';
import { Included } from '@/components/landing/Included';

/** Rough driving time. Stated as a range, because a single figure would be a promise. */
const hoursFor = (km: number) => {
  const low = Math.round(km / 55);
  const high = Math.round(km / 42);
  return low === high ? `about ${low} hours` : `${low}–${high} hours`;
};

export async function routeFaq(pickup: string, drop: string, km?: number, hill?: boolean) {
  const A = cityTitle(pickup);
  const B = cityTitle(drop);
  return [
    {
      q: `How much does a cab from ${A} to ${B} cost?`,
      a: `The fare depends on the vehicle. Every price on this page is the full one-way or round-trip fare — it is fixed when you book and does not change afterwards. Toll, parking and state taxes are paid as they arise.`,
    },
    {
      q: `How long does the ${A} to ${B} drive take?`,
      a: km
        ? `The route is about ${km} km, which is ${hoursFor(km)} of driving depending on traffic and how many stops you make.`
        : `It depends on traffic and the number of stops you make along the way.`,
    },
    {
      q: `Is a one-way fare cheaper than a round trip?`,
      a: `For a single journey, yes — a one-way fare covers only the distance you travel. If you are coming back, a round trip is usually better value because it is priced per kilometre for the whole journey.`,
    },
    ...(hill
      ? [
          {
            q: `Why does this route cost more per kilometre?`,
            a: `Part of this route is hill driving, which is slower, harder on the vehicle and uses more fuel. That is priced in rather than added at the end.`,
          },
        ]
      : []),
    {
      q: `Do I pay in advance?`,
      a: `No. You pay the driver in cash at the end of the trip. There is nothing to pay when you book.`,
    },
  ];
}

export async function RoutePage({ pickup, drop }: { pickup: string; drop: string }) {
  const [cities, vehicles, oneway, roundtrip, all] = await Promise.all([
    api.cities().catch(() => []),
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
    api.onewayFare(pickup, drop).catch(() => null),
    api.roundtripFare(pickup, drop).catch(() => null),
    api.routes().catch(() => ({ count: 0, routes: [] })),
  ]);

  const from = cities.find((c) => c.name === pickup);
  const to = cities.find((c) => c.name === drop);
  const A = from?.label ?? cityTitle(pickup);
  const B = to?.label ?? cityTitle(drop);
  const km = roundtrip?.distanceKm ?? oneway?.distanceKm;
  const cheapest = Math.min(
    ...[...(oneway?.vehicles ?? []).map((v) => v.total ?? v.fare)].filter((n) => n > 0),
  );
  const fromRupees = Number.isFinite(cheapest) ? cheapest : 0;
  const faq = await routeFaq(pickup, drop, km, roundtrip?.hill);
  const path = routePath(pickup, drop);

  // Other routes out of the same city — the internal links that get these pages found.
  const related = all.routes.filter((r) => r.pickup === pickup && r.drop !== drop).slice(0, 6);

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: `Cabs in ${A}`, path: cityPath(pickup) },
        { name: `${A} to ${B}`, path },
      ])} />
      {fromRupees > 0 ? (
        <JsonLd
          data={productSchema({
            name: `${A} to ${B} cab`,
            description: `One-way and round-trip cab from ${A} to ${B}${km ? `, about ${km} km` : ''}. Fixed fare, driver included.`,
            fromRupees,
            path,
          })}
        />
      ) : null}
      <JsonLd data={faqSchema(faq)} />

      <Header />

      <section className="hero-ground grain vignette relative overflow-hidden text-white">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-14 md:grid-cols-[1fr_minmax(330px,380px)] lg:grid-cols-[1.15fr_minmax(400px,452px)] lg:gap-16 lg:pb-32 lg:pt-20">
          <div>
            <nav aria-label="Breadcrumb" className="text-[13px] text-white/45">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <Link href={cityPath(pickup)} className="hover:text-white">{A}</Link>
              <span className="mx-2">/</span>
              <span className="text-white/70">{B}</span>
            </nav>

            <h1 className="font-display mt-6 text-[2.75rem] leading-[1.02] tracking-[-0.03em] sm:text-[3.75rem]">
              {A} to {B} cab
            </h1>

            <p className="mt-6 max-w-md text-[17px] leading-[1.65] text-white/75">
              {km ? `About ${km} km, ${hoursFor(km)} of driving. ` : ''}
              The fare below is what you pay — fixed when you book, with the driver included.
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
                      <dt className="font-display text-[1.9rem] leading-[1.05] tracking-tight">{big}</dt>
                      <dd className="mt-1.5 text-[12px] font-medium uppercase tracking-[0.12em] text-white/40">
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

      <main className="mx-auto max-w-6xl px-5">
        <section className="pt-20 lg:pt-52">
          <h2 className="font-display text-[2.25rem] leading-[1.05] tracking-[-0.03em] sm:text-[2.75rem]">
            Fares for this route
          </h2>
          <FareTable
            oneway={oneway}
            roundtrip={roundtrip}
            vehicles={[...vehicles.intercity, ...vehicles.roundTripOnly]}
          />
          <Included
            nightCharge={roundtrip?.nightCharge}
            airportSurcharge={oneway?.airportSurcharge}
          />
          {roundtrip?.minKmPerDay ? (
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-muted">
              Round trips are billed at a minimum of {roundtrip.minKmPerDay} km a day
              {roundtrip.billedKm ? `, and this route bills ${roundtrip.billedKm} km` : ''}. That
              floor is what lets a driver take a long return leg without pricing it as two
              separate journeys.
            </p>
          ) : null}
        </section>

        {related.length > 0 ? (
          <section className="pt-24">
            <h2 className="font-display text-[2.25rem] leading-[1.05] tracking-[-0.03em] sm:text-[2.75rem]">
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
                    <span className="flex items-baseline gap-2 text-[14px] text-muted">
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
          <h2 className="font-display text-[2.25rem] leading-[1.05] tracking-[-0.03em] sm:text-[2.75rem]">
            {A} to {B}, answered
          </h2>
          <Faq items={faq} />
        </section>
      </main>

      <Footer />
    </>
  );
}

import Link from 'next/link';
import { api } from '@/lib/api';
import { cityPath, cityTitle, routePath, vehiclePath } from '@/lib/slug';
import { JsonLd, breadcrumbSchema, faqSchema, localBusinessSchema } from '@/lib/schema';
import { BookingWidget } from '@/components/BookingWidget';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { StickyBookBar } from '@/components/site/StickyBookBar';
import { Icon } from '@/components/site/Icons';
import { Faq } from '@/components/site/Faq';
import { RouteList } from '@/components/site/RouteList';

export function cityFaq(city: string, routeCount: number) {
  const A = cityTitle(city);
  return [
    {
      q: `How do I book a cab in ${A}?`,
      a: `Choose where you are going, pick a vehicle, and confirm with your phone number. There is nothing to pay when you book — you pay the driver in cash at the end of the trip.`,
    },
    {
      q: `Which routes from ${A} have a fixed price?`,
      a: `${routeCount} routes out of ${A} carry a listed fare on this site. Every one of them is priced in advance, so the number you see is the number you pay.`,
    },
    {
      q: `Can I hire a cab by the hour in ${A}?`,
      a: `Yes. The hourly package includes eight hours and eighty kilometres; beyond that, extra hours are charged at a fixed rate you can see before booking.`,
    },
    {
      q: `How early should I book?`,
      a: `At least two hours before pickup. For an early-morning departure, book the night before so the driver can plan the run.`,
    },
  ];
}

export async function CityPage({ city }: { city: string }) {
  const [cities, all, packages, vehicles] = await Promise.all([
    api.cities().catch(() => []),
    api.routes().catch(() => ({ count: 0, routes: [] })),
    api.localPackages().catch(() => []),
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
  ]);

  const info = cities.find((c) => c.name === city);
  const A = info?.label ?? cityTitle(city);
  const fromHere = all.routes.filter((r) => r.pickup === city);
  const toHere = all.routes.filter((r) => r.drop === city).slice(0, 6);
  const cheapest = Math.min(...fromHere.map((r) => r.fromRupees ?? Infinity));
  const faq = cityFaq(city, fromHere.length);

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: `Cabs in ${A}`, path: cityPath(city) },
      ])} />
      <JsonLd data={localBusinessSchema({ city: A, path: cityPath(city) })} />
      <JsonLd data={faqSchema(faq)} />

      <Header />

      <section
        id="book"
        // The sticky bar jumps here; the margin keeps the form clear of the sticky header.
        className="hero-ground grain vignette relative scroll-mt-16 overflow-hidden text-white"
      >
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-14 md:grid-cols-[1fr_minmax(330px,380px)] lg:grid-cols-[1.15fr_minmax(400px,452px)] lg:gap-16 lg:pb-32 lg:pt-20">
          <div>
            <nav aria-label="Breadcrumb" className="text-[13px] text-white/45">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white/70">{A}</span>
            </nav>

            <h1 className="font-display mt-6 text-[2.75rem] leading-[1.02] tracking-[-0.03em] sm:text-[3.75rem]">
              Cab service in {A}
            </h1>

            <p className="mt-6 max-w-md text-[17px] leading-[1.65] text-white/75">
              Outstation cabs out of {A} with a driver — one way, round trip, or by the hour.
              Every fare below is fixed before you leave.
            </p>

            <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6 border-t border-white/10 pt-8">
              {[
                [String(fromHere.length), 'priced routes'],
                Number.isFinite(cheapest) ? [`₹${cheapest.toLocaleString('en-IN')}`, 'from'] : null,
                info?.state ? [info.state, 'state'] : null,
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

          {/* Pickup already set — a visitor on this page has told us where they are. */}
          <div className="lg:-mb-44">
            <BookingWidget defaultPickup={info} />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5">
        {fromHere.length > 0 ? (
          <section className="pt-20 lg:pt-52">
            <h2 className="font-display text-[2.4rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
              Routes from {A}
            </h2>
            <RouteList routes={fromHere} />
          </section>
        ) : null}

        <section className="pt-24">
          <h2 className="font-display text-[2.4rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
            By the hour in {A}
          </h2>
          <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-muted">
            For a day of errands or a wedding run, take the car by the hour instead of by the
            kilometre.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            {packages.map((p) => (
              <li key={p.vehicle} className="rounded-[1.5rem] border border-line bg-surface-raised p-6">
                <p className="font-display text-[1.25rem] leading-tight tracking-[-0.02em]">
                  {p.label}
                </p>
                <p className="mt-1.5 text-[13.5px] text-muted">
                  {p.includedHours} h / {p.includedKm} km included
                </p>
                <p className="font-display mt-5 text-[1.6rem] leading-none tracking-tight">
                  ₹{p.baseFareRupees.toLocaleString('en-IN')}
                </p>
                <p className="mt-1.5 text-[13px] text-faint">
                  ₹{p.extraPerHour} per extra hour
                </p>
              </li>
            ))}
          </ul>
        </section>

        {toHere.length > 0 ? (
          <section className="pt-24">
            <h2 className="font-display text-[2.4rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
              Coming into {A}
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {toHere.map((r) => (
                <li key={r.pickup}>
                  <Link
                    href={routePath(r.pickup, r.drop)}
                    className="group flex items-center justify-between rounded-2xl border border-line bg-surface-raised px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
                  >
                    <span className="font-medium">From {cityTitle(r.pickup)}</span>
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
          <h2 className="font-display text-[2.4rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
            The fleet in {A}
          </h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {[...vehicles.intercity, ...vehicles.roundTripOnly].map((v) => (
              <li key={v.key}>
                <Link
                  href={vehiclePath(v.key)}
                  className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface-raised px-5 py-2.5 text-[14px] font-medium transition-colors hover:border-forest/25"
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
          <h2 className="font-display text-[2.4rem] leading-[1.05] tracking-[-0.03em] sm:text-[3.25rem]">
            Booking in {A}, answered
          </h2>
          <Faq items={faq} />
        </section>
      </main>

      <Footer />
      <StickyBookBar from={Number.isFinite(cheapest) ? cheapest : null} />
    </>
  );
}

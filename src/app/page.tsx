import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { JsonLd, organizationSchema } from '@/lib/schema';
import { BookingWidget } from '@/components/BookingWidget';

export const metadata: Metadata = {
  title: 'Outstation cabs across India — one way, round trip, hourly',
  description:
    'Book a cab with a driver for intercity trips. Fixed fares with no surge, verified drivers, and the price you are quoted is the price you pay.',
  alternates: { canonical: '/' },
};

// Rebuilt daily, served from cache in between. The prices come from a static table, not a
// live lookup, so there is nothing here worth hitting the database for on every visit.
export const revalidate = 86_400;

export default async function Home() {
  // Both fetched on the SERVER: the HTML a crawler receives already has the numbers in it.
  // A page that fills its prices in from the browser is a page with no prices to index.
  const [routes, vehicles] = await Promise.all([
    api.routes().catch(() => ({ count: 0, routes: [] })),
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
  ]);

  return (
    <>
      <JsonLd data={organizationSchema()} />

      <main className="mx-auto max-w-5xl px-5 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          Hello My Cab
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
          Chalna kahan hai?
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Outstation cab, driver ke saath. Ek taraf, aana-jana, ya ghante ke hisaab se —
          daam pehle se tay, koi surge nahi.
        </p>

        {/* The trip is described once, here. Deliberately NOT a boxed form floating over a
            stock photo — that is what every competitor does, and it is the first thing that
            makes a site look like a copy of one. */}
        <div className="mt-10 max-w-xl">
          <BookingWidget />
        </div>

        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight">Popular routes</h2>
          {routes.routes.length === 0 ? (
            <p className="mt-3 text-muted">Fares abhi load nahi ho paaye.</p>
          ) : (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {routes.routes.slice(0, 9).map((r) => (
                <li
                  key={`${r.pickup}-${r.drop}`}
                  className="rounded-card border border-line p-4"
                >
                  <p className="font-semibold">
                    {r.pickup} → {r.drop}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {r.distanceKm ? `${r.distanceKm} km` : '—'}
                    {r.fromRupees ? ` · ₹${r.fromRupees} se` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-sm text-faint">
            {routes.count} routes par tay daam.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight">Gaadiyan</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {[...vehicles.intercity, ...vehicles.roundTripOnly].map((v) => (
              <li
                key={v.key}
                className="rounded-full border border-line px-4 py-1.5 text-sm"
              >
                {v.label}
                {v.seats ? <span className="text-faint"> · {v.seats} seats</span> : null}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}

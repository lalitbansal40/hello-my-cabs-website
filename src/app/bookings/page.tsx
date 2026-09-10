import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { NotACustomer } from '@/components/site/NotACustomer';
import { BookingCard } from '@/components/site/BookingCard';
import { getCurrentUser } from '@/lib/session';
import { myBookings } from '@/lib/bookings';
import { statusView } from '@/lib/booking-status';
import { company } from '@/lib/company';

// Somebody's trips are not a page for search results, and must never be cached: a cached
// booking list is the one mistake here that shows one customer another customer's trips.
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Your trips · Hello My Cab',
  robots: { index: false, follow: false },
};

export default async function BookingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/bookings');

  return (
    <>
      <Header />

      <section className="hero-ground grain relative overflow-hidden text-white">
        <div className="relative mx-auto max-w-4xl px-5 pb-12 pt-12 sm:pb-14">
          <h1 className="font-display text-h1 text-balance">
            Your trips
          </h1>
          {user.name ? (
            <p className="mt-3 text-lead text-white/70">Signed in as {user.name}</p>
          ) : null}
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-5 pb-24 pt-12">
        {/* A driver's account signs in here fine and then gets a 403 from this very
            endpoint. Say what happened rather than showing an empty page. */}
        {user.role !== 'CUSTOMER' ? <NotACustomer role={user.role} /> : <List />}
      </main>

      <Footer />
    </>
  );
}

async function List() {
  const result = await myBookings();

  if (!result.ok) {
    return (
      <div className="rounded-2xl border border-line bg-surface-raised p-8">
        <p className="font-display text-title">
          We could not load your trips
        </p>
        <p className="mt-3 text-body text-muted">{result.error}</p>
        <p className="mt-4 text-body text-muted">
          Call{' '}
          <a className="font-semibold text-ink hover:text-accent" href={company.phoneHref}>
            {company.phone}
          </a>{' '}
          and we will look it up for you.
        </p>
      </div>
    );
  }

  const bookings = result.data.bookings ?? [];

  if (bookings.length === 0) {
    // The first thing every new customer sees here. An empty page would read as a fault.
    return (
      <div className="rounded-2xl border border-line bg-surface-raised p-8 text-center">
        <p className="font-display text-h3 text-balance">
          No trips yet
        </p>
        <p className="mx-auto text-body mt-3 max-w-sm text-muted text-pretty">
          When you book a cab, it will show up here with its status, the fare and your
          driver&rsquo;s details.
        </p>
        <Link
          href="/"
          className="mt-6 text-small inline-block rounded-full bg-forest px-6 py-3 font-bold text-white transition-colors hover:bg-accent hover:text-forest inline-flex min-h-11 items-center"
        >
          Book a cab
        </Link>
      </div>
    );
  }

  // Split on the status, not the date: yesterday's cancelled trip is not upcoming, and a
  // confirmed trip whose time has slipped is not history.
  const upcoming = bookings.filter((b) => statusView(b.status).upcoming);
  const past = bookings.filter((b) => !statusView(b.status).upcoming);

  return (
    <div className="flex flex-col gap-14">
      {upcoming.length > 0 ? (
        <section>
          <h2 className="font-bold text-label uppercase text-faint">
            Coming up
          </h2>
          <ul className="mt-5 flex flex-col gap-3">
            {upcoming.map((b) => (
              <BookingCard key={b._id} b={b} />
            ))}
          </ul>
        </section>
      ) : null}

      {past.length > 0 ? (
        <section>
          <h2 className="font-bold text-label uppercase text-faint">
            Past trips
          </h2>
          <ul className="mt-5 flex flex-col gap-3">
            {past.map((b) => (
              <BookingCard key={b._id} b={b} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

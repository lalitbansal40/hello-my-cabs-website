import type { Metadata } from 'next';
import Link from 'next/link';
import { DocPage, DocSection } from '@/components/site/DocPage';
import { api } from '@/lib/api';
import { citiesWithPages } from '@/lib/city-pages';
import { cityPath, cityTitle } from '@/lib/slug';
import { rupees } from '@/lib/seo';

export const metadata: Metadata = {
  title: { absolute: 'About Hello My Cab — Outstation Cab Service' },
  description:
    'Outstation and local cabs with a driver, at a fare fixed before you leave. The routes we price, the fleet we run, and how the fare is decided.',
  alternates: { canonical: '/about' },
};

export const revalidate = 86400;

/**
 * The numbers on this page are counted from the live catalogue rather than typed in, so
 * they cannot drift out of date and cannot be flattering. How long the company has been
 * running and how many drivers it has are not in any API, so they are not claimed here.
 */
export default async function AboutPage() {
  const [routes, vehicles] = await Promise.all([
    api.listedRoutes().catch(() => ({ count: 0, fixedCount: 0, routes: [] })),
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
  ]);

  // The fixed-fare network, as the paragraph below describes it; its cities all have pages.
  const fixedRoutes = routes.routes.filter((r) => r.fixed);
  const origins = [...new Set(fixedRoutes.map((r) => r.pickup))].filter((c) =>
    citiesWithPages(routes.routes).has(c),
  );
  const fleetCount = vehicles.intercity.length + vehicles.roundTripOnly.length;
  // The states the published routes actually reach, counted from the catalogue rather than
  // claimed — "across North India" would be a phrase, this is a list.
  const cityList = await api.cities().catch(() => []);
  const states = [
    ...new Set(
      origins
        .map((c) => cityList.find((x) => x.name === c)?.state)
        .filter((x): x is string => Boolean(x)),
    ),
  ];
  const fares = fixedRoutes.map((r) => r.fromRupees ?? 0).filter((n) => n > 0);
  const lowest = fares.length ? Math.min(...fares) : null;
  const highest = fares.length ? Math.max(...fares) : null;

  return (
    <DocPage
      title="About us"
      intro="We run outstation and local cabs with a driver, at a price agreed before the trip starts rather than counted up at the end."
      path="/about"
    >
      <DocSection title="What we do">
        <p>
          You tell us where you are going and when. We quote a fare for the whole journey,
          and that is the fare — it does not move because of the hour, the weather or how
          long the road took.
        </p>
        <p>
          Every trip is with a driver. There is nothing to self-drive here and no deposit to
          leave.
        </p>
      </DocSection>

      <DocSection title="Where we run">
        <p>
          {routes.fixedCount} routes have a fixed, published price, out of{' '}
          {origins.length} pickup cities
          {states.length > 0 ? ` in ${states.length} ${states.length === 1 ? 'state' : 'states'} — ${states.join(', ')}` : ''}
          {lowest && highest ? `. One-way fares on them run from ${rupees(lowest)} to ${rupees(highest)}` : ''}:
        </p>
        {/* Chips rather than a comma-separated line. These are eight links people press,
            and a 20px-tall word between commas is a hard thing to hit — the same list of
            cities is drawn this way on the home page. */}
        <ul className="flex flex-wrap gap-2">
          {origins.map((c) => (
            <li key={c}>
              <Link
                className="flex min-h-11 items-center rounded-full border border-line bg-surface px-4 font-semibold text-ink transition-colors hover:border-forest hover:text-forest"
                href={cityPath(c)}
              >
                {cityTitle(c)}
              </Link>
            </li>
          ))}
        </ul>
        <p>
          Other journeys are quoted on distance when you ask for them. The{' '}
          <Link className="font-semibold text-accent" href="/routes">
            full route list
          </Link>{' '}
          has the prices.
        </p>
      </DocSection>

      <DocSection title="The fleet">
        <p>
          {fleetCount} vehicle types, from a hatchback for two people to a tempo traveller
          for a group. The larger vehicles run on round trips only, and that is said plainly
          on their pages rather than discovered at the last step of a booking.
        </p>
      </DocSection>

      <DocSection title="How a booking works">
        <p>
          You choose the route and the time, and every vehicle on that route is shown with
          its fare before you are asked for anything. You pick one, give a name and a mobile
          number, and confirm it with a one-time code sent to that number — there is no
          password to make.
        </p>
        <p>
          You can pay the driver in cash at the end of the trip, or pay an advance of 15% of
          the fare online when you book and the rest to the driver. A cash booking costs
          nothing to cancel before the trip starts; an online one keeps at most the advance.
          The{' '}
          <Link className="font-semibold text-accent" href="/refund">
            cancellation terms
          </Link>{' '}
          set it out in full.
        </p>
      </DocSection>

      <DocSection title="What is in a fare, and what is not">
        <p>
          In it: the vehicle, the driver, the fuel and GST. Not in it: toll, parking and
          state entry tax, which belong to the road rather than to us and are paid as they
          arise, and a night allowance where a trip runs past 10 pm. Each of those is listed
          on the route page before you book, so none of them is a surprise at the end.
        </p>
      </DocSection>

      <DocSection title="How the price is decided">
        <p>
          Fares come from one place — the same system the driver app uses. That is
          deliberate: it is the reason the number on this website and the number in the app
          cannot disagree.
        </p>
        <p>
          Tolls, parking and state tax are separate, because they belong to the road rather
          than to us. They are listed on each route page before you book.
        </p>
      </DocSection>

      {/* The same two claims the home page makes, said once more where somebody checking
          the company is likely to look. Nothing new is claimed here. */}
      <DocSection title="Drivers and support">
        <p>
          Every driver is verified and rated, and poor ratings take a driver off the
          platform. The driver&rsquo;s name and number are sent to you before the trip, so you
          know who is coming.
        </p>
        <p>
          A person answers the phone every day, around the clock, for the length of the
          journey.
        </p>
      </DocSection>

      <DocSection title="The app">
        <p>
          The same bookings are in the Hello My Cab app on{' '}
          <a
            className="font-semibold text-accent"
            href="https://play.google.com/store/apps/details?id=com.hellomycab.hello_my_cab_app"
            target="_blank"
            rel="noreferrer"
          >
            Google Play
          </a>
          . Sign in with the same mobile number and a trip booked here is there too.
        </p>
      </DocSection>

      <DocSection title="Talk to us">
        <p>
          <a className="font-semibold text-accent" href="tel:+919667111921">
            +91 96671 11921
          </a>
          , or see{' '}
          <Link className="font-semibold text-accent" href="/contact">
            contact
          </Link>
          .
        </p>
      </DocSection>
    </DocPage>
  );
}

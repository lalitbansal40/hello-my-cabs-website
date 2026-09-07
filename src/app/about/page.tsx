import type { Metadata } from 'next';
import Link from 'next/link';
import { DocPage, DocSection } from '@/components/site/DocPage';
import { api } from '@/lib/api';
import { cityPath, cityTitle } from '@/lib/slug';

export const metadata: Metadata = {
  title: 'About Hello My Cab',
  description:
    'Outstation and local cabs with a driver, at a fare fixed before you leave. What we run, and how the price is decided.',
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
    api.routes().catch(() => ({ count: 0, routes: [] })),
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
  ]);

  const origins = [...new Set(routes.routes.map((r) => r.pickup))];
  const fleetCount = vehicles.intercity.length + vehicles.roundTripOnly.length;

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
          {routes.count} routes have a fixed, published price, out of{' '}
          {origins.length} pickup cities:
        </p>
        <ul className="flex flex-wrap gap-x-2 gap-y-1">
          {origins.map((c, i) => (
            <li key={c}>
              <Link className="font-semibold text-accent hover:underline" href={cityPath(c)}>
                {cityTitle(c)}
              </Link>
              {i < origins.length - 1 ? <span className="text-faint">,</span> : null}
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

import type { Metadata } from 'next';
import Link from 'next/link';
import { DocPage, DocSection } from '@/components/site/DocPage';
import { api } from '@/lib/api';
import { rupees } from '@/lib/seo';

export const metadata: Metadata = {
  title: { absolute: 'How Our Taxi Fares Work — Toll, Night & Round Trip' },
  description:
    'What a Hello My Cab fare includes and what is paid on the road: toll and state tax, the night charge, round trips, stops, the advance and cancelling.',
  alternates: { canonical: '/fares-explained' },
};

export const revalidate = 86_400;

/**
 * The rules every route page used to explain again in its own words (7 Oct 2026).
 *
 * Ninety-odd route pages each carried the same paragraphs about tolls, the night charge, the
 * round-trip minimum, stops, the advance and cancelling — a quarter of every page, identical
 * but for the city names, which is what made unrelated routes read as copies of each other.
 * The rules are said once, here; a route page keeps its own numbers and links to the section.
 *
 * Nothing here is new: every rule is the one /terms, /refund and the booking already apply,
 * and the figures come from the fare API (the round-trip minimum and the night charge).
 */
export default async function FaresExplainedPage() {
  // Any priced round trip carries the site-wide minimum and night charge.
  const sample = await api.roundtripFare('JAIPUR', 'DELHI').catch(() => null);
  const minKm = sample?.minKmPerDay;
  const night = sample?.nightCharge;
  return (
    <DocPage
      title="How our fares work"
      intro="Every route page shows its own fares. These are the rules behind all of them — what the fare covers, what is paid on the road, and how a round trip, a stop, the advance and cancelling work."
      updated="October 2026"
      path="/fares-explained"
    >
      <DocSection id="included" title="What the fare includes">
        <p>
          The car, the driver and the fuel. GST is added on top, at 5%. The fare shown when you
          book is fixed at that moment — no surge, and it is not worked out again when the driver arrives.
        </p>
        <p>
          A one way fare is for the journey you take. There is no return fare for the car
          going back.
        </p>
      </DocSection>

      <DocSection id="tolls" title="Toll, parking and state tax">
        <p>
          Toll and parking are paid as they arise on the road, and so is state entry tax where
          the road crosses from one state into another. They depend on the road taken, so they
          are not in the fare. On routes that begin or end at an airport, the airport surcharge
          is already in the fare shown.
        </p>
      </DocSection>

      <DocSection id="night" title="The night charge">
        <p>
          {night ? `${rupees(night)} is added` : 'A night charge is added'} after 10 pm — when
          the trip runs through the night or keeps the driver out overnight. It is listed with
          the fare on each route before you book.
        </p>
      </DocSection>

      <DocSection id="round-trip" title="How a round trip is billed">
        <p>
          By the kilometre for the whole journey, out and back,
          {minKm ? ` with a floor of ${minKm} km for each day the car is out` : ' with a daily minimum'}.
          That floor is what lets a driver take a long return leg without it being priced as two
          separate journeys. Each route page shows what a same-day return comes to there.
        </p>
        <p>
          On a short route the floor can make two one-way fares cheaper than a round trip; on a
          long one the round trip is usually cheaper. Each route page does the sum for you.
        </p>
      </DocSection>

      <DocSection id="hills" title="Hill routes">
        <p>
          Part of some routes is hill driving — slower, harder on the vehicle and heavier on
          fuel — so those routes cost more per kilometre. It is priced into the fare, not added
          afterwards.
        </p>
      </DocSection>

      <DocSection id="stops" title="Adding a stop">
        <p>
          Add it in the booking form under &ldquo;Add a stop on the way&rdquo;. The fare shown is
          the direct route&rsquo;s; the desk calls to confirm what the stop adds before the trip.
        </p>
      </DocSection>

      <DocSection id="groups" title="Groups: which car">
        <p>
          The cheapest way to seat everyone is not always the smallest car: one bigger car often
          costs less than two small ones. Each route page lists, for each group size, the cheapest
          car that fits.
        </p>
      </DocSection>

      <DocSection id="advance" title="Paying: the advance">
        <p>
          On this website a booking is made with a small advance online — ₹500, or 20% of the
          fare when it is above ₹2,500 — or more, up to the whole fare, if you choose. The rest
          is paid to the driver at the end of the trip. In the app the advance is 15%, and the
          app also takes cash.
        </p>
      </DocSection>

      <DocSection id="booking" title="When to book">
        <p>
          At least two hours before pickup. For an early start, book the night before so the
          driver can plan the run; on a festival weekend, earlier again.
        </p>
      </DocSection>

      <DocSection id="cancelling" title="Cancelling">
        <p>
          Any time before the trip starts. The minimum advance is kept as the cancellation fee
          and anything you paid above it is refunded — the full rule, with examples, is on the{' '}
          <Link className="font-semibold text-accent" href="/refund">
            cancellation page
          </Link>
          .
        </p>
      </DocSection>
    </DocPage>
  );
}

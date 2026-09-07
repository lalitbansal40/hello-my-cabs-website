import type { Metadata } from 'next';
import Link from 'next/link';
import { DocPage, DocSection } from '@/components/site/DocPage';

export const metadata: Metadata = {
  title: 'Terms of service · Hello My Cab',
  description:
    'The conditions a Hello My Cab booking is made under — what the fare covers, what is charged separately, and how cancellation works.',
  alternates: { canonical: '/terms' },
};

/**
 * Kept to what the booking system actually enforces: a quoted fare that holds, tolls and
 * state tax billed separately, a night charge on late running, a 15% advance online, and
 * cancellation up to the moment the trip starts. Nothing here promises behaviour the
 * backend does not implement.
 */
export default function TermsPage() {
  return (
    <DocPage
      title="Terms of service"
      intro="What you are agreeing to when you book a cab here. It is short, because the arrangement is simple."
      updated="September 2026"
      path="/terms"
    >
      <DocSection title="Who we are">
        <p>
          Hello My Cab arranges outstation and local cab trips with a driver. When you book,
          the agreement is between you and us for that trip.
        </p>
      </DocSection>

      <DocSection title="The fare we quote">
        <p>
          The fare shown when you book is the fare for the trip. It is fixed at the moment
          you book and does not rise afterwards — there is no surge, and it is not
          recalculated when the driver arrives.
        </p>
        <p>
          A quote is held for a limited time while you complete the booking. If it runs out,
          the price is worked out again and you are told before anything is charged.
        </p>
      </DocSection>

      <DocSection title="What the fare covers, and what it does not">
        <p>The fare covers the vehicle, the fuel and the driver.</p>
        <p>
          Tolls, parking and state entry tax are charged separately, because they depend on
          the road you take. A night charge applies when the trip runs through the night, and
          an airport surcharge applies on routes that begin or end at an airport. Each of
          these is listed on the route page before you book.
        </p>
      </DocSection>

      <DocSection title="Paying">
        <p>
          You can pay the driver in cash at the end of the trip, or pay a{' '}
          <strong>15% advance</strong> online when booking and the rest at the end.
        </p>
      </DocSection>

      <DocSection title="Cancelling">
        <p>
          A booking can be cancelled at any point before the trip starts. A cash booking
          costs nothing to cancel. An online booking keeps the advance as the cancellation
          fee, and never more than you paid. The full rule is on the{' '}
          <Link className="font-semibold text-accent" href="/refund">
            cancellation page
          </Link>
          .
        </p>
      </DocSection>

      <DocSection title="What we ask of you">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>A pickup address the driver can actually find, and a number they can reach.</li>
          <li>
            Nothing illegal carried in the vehicle, and no damage to it beyond ordinary use.
          </li>
          <li>Passengers within the seating the vehicle is booked for.</li>
        </ul>
      </DocSection>

      <DocSection title="Things outside anyone's control">
        <p>
          Roads close, weather turns and vehicles break down. If a trip cannot run for a
          reason of that kind, we will arrange a replacement where we can, and where we
          cannot, you are not charged a cancellation fee.
        </p>
      </DocSection>

      <DocSection title="Talking to us">
        <p>
          Any question about a booking:{' '}
          <a className="font-semibold text-accent" href="tel:+919667111921">
            +91 96671 11921
          </a>
          . See also{' '}
          <Link className="font-semibold text-accent" href="/privacy">
            privacy
          </Link>
          .
        </p>
      </DocSection>
    </DocPage>
  );
}

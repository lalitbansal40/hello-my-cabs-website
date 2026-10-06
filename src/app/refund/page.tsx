import type { Metadata } from 'next';
import Link from 'next/link';
import { DocPage, DocSection } from '@/components/site/DocPage';
import { company } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Cancellation and refund policy',
  description:
    'What you are charged if you cancel a booking, and what comes back. A website booking keeps the minimum advance — ₹500, or 20% above ₹2,500 — and refunds the rest.',
  alternates: { canonical: '/refund' },
};

/**
 * Every figure on this page is read out of the booking service, not decided here
 * (hello-my-cab-backend, 6 Oct 2026):
 *
 *   website minimum = ₹500 up to a ₹2,500 fare, else 20%     utils/advance.ts minimumAdvanceOf
 *   app advance     = 15% of the fare                         utils/advance.ts advanceOf
 *   cancelFee       = the booking's minimum, else 15%          utils/advance.ts platformShareOf
 *   charge          = min(paidOnline, cancelFee)              booking.controller.ts computeCancellation
 *   refund          = paidOnline − charge                     booking.controller.ts computeCancellation
 *   cancellable while status is not ONGOING/COMPLETED/CANCELLED   booking.controller.ts cancelBooking
 *
 * If that code changes, this page has to change with it. A refund policy that does not
 * match what the system actually does is the document that loses the dispute.
 */
export default function RefundPage() {
  return (
    <DocPage
      title="Cancellation and refund"
      intro="The short version: cancelling costs at most the minimum advance, and anything you paid above it comes back to you."
      updated="October 2026"
      path="/refund"
    >
      <DocSection title="Cancelling a booking made on this website">
        <p>
          A booking made here is paid for online when you book: at least{' '}
          <strong>₹500, or 20% of the fare when the fare is above ₹2,500</strong> — the
          minimum advance — or more, up to the whole fare, if you choose.
        </p>
        <p>
          If you cancel, the cancellation fee is that minimum advance, and it is never more
          than what you actually paid. Anything you paid above it comes back to you.
        </p>
        <p>
          So for a ₹4,500 trip the minimum advance is ₹900. If you paid ₹2,000 when you
          booked and then cancel, ₹900 is kept as the cancellation fee and ₹1,100 is refunded.
          For a ₹2,000 trip the minimum is ₹500, and that is what is kept.
        </p>
      </DocSection>

      <DocSection title="Cancelling a booking made in the app">
        <p>
          In the Hello My Cab app you can still pay the driver in cash at the end of the trip.
          A cash booking has sent us no money, so cancelling it costs nothing.
        </p>
        <p>
          An app booking paid online pays an advance of <strong>15% of the fare</strong>. If
          you cancel, that 15% is the cancellation fee — never more than you paid — and
          anything paid beyond it comes back to you. For a ₹10,000 trip that is ₹1,500.
        </p>
      </DocSection>

      <DocSection title="Until when you can cancel">
        <p>
          A booking can be cancelled any time before the trip starts. Once the driver has
          begun the journey the booking is in progress and can no longer be cancelled from
          the app or this site.
        </p>
        <p>
          If something has gone wrong after that point, call us on{' '}
          <a className="font-semibold text-accent" href={company.phoneHref}>
            {company.phone}
          </a>{' '}
          — it is handled by a person, not by a form.
        </p>
      </DocSection>

      <DocSection title="How a refund reaches you">
        <p>
          Refunds are sent back through the same payment method you used, by our payment
          provider. We do not refund to a different card, account or wallet than the one the
          money came from.
        </p>
      </DocSection>

      <DocSection title="If we cancel">
        <p>
          If we cannot provide the vehicle you booked, you are not charged a cancellation
          fee. Anything you have paid is returned in full.
        </p>
      </DocSection>

      <DocSection title="Questions">
        <p>
          Call{' '}
          <a className="font-semibold text-accent" href={company.phoneHref}>
            {company.phone}
          </a>
          , or see the <Link className="font-semibold text-accent" href="/terms">terms</Link>{' '}
          for the rest of the conditions.
        </p>
      </DocSection>
    </DocPage>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { DocPage, DocSection } from '@/components/site/DocPage';

export const metadata: Metadata = {
  title: 'Cancellation and refund policy · Hello My Cab',
  description:
    'What you are charged if you cancel a booking, and what comes back. Cash bookings cost nothing to cancel; online bookings keep the 15% advance.',
  alternates: { canonical: '/refund' },
};

/**
 * Every figure on this page is read out of the booking service, not decided here:
 *
 *   ADVANCE_PERCENT = 15                                   booking.controller.ts:71
 *   advance      = 15% of the fare                         booking.controller.ts:741
 *   cancelFee    = 15% of fareEstimate                     booking.controller.ts:1229
 *   charge       = min(paidOnline, cancelFee)              booking.controller.ts:1230
 *   refund       = paidOnline − charge                     booking.controller.ts:1231
 *   cancellable while status is not ONGOING/COMPLETED/CANCELLED   booking.controller.ts:1257
 *
 * If that code changes, this page has to change with it. A refund policy that does not
 * match what the system actually does is the document that loses the dispute.
 *
 * Note: the comment at booking.model.ts:23 still mentions a flat ₹500 cap. That is stale —
 * the controller replaced it with the 15% rule and says so at line 69.
 */
export default function RefundPage() {
  return (
    <DocPage
      title="Cancellation and refund"
      intro="The short version: cancelling a cash booking costs you nothing, and cancelling an online booking costs at most the advance you already paid."
      updated="September 2026"
      path="/refund"
    >
      <DocSection title="Cancelling a cash booking">
        <p>
          If you chose to pay the driver in cash, no money has reached us, so there is
          nothing to charge and nothing to refund. Cancel it and that is the end of it.
        </p>
      </DocSection>

      <DocSection title="Cancelling an online booking">
        <p>
          When you book online you pay an advance of <strong>15% of the fare</strong>. The
          rest is paid at the end of the trip.
        </p>
        <p>
          If you cancel, the cancellation fee is that same 15% — and it is never more than
          what you actually paid. Anything paid beyond it comes back to you.
        </p>
        <p>
          So for a ₹10,000 trip you would have paid ₹1,500 as the advance. Cancel, and the
          ₹1,500 is kept as the cancellation fee. Nothing further is charged.
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
          <a className="font-semibold text-accent" href="tel:+919667111921">
            +91 96671 11921
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
          <a className="font-semibold text-accent" href="tel:+919667111921">
            +91 96671 11921
          </a>
          , or see the <Link className="font-semibold text-accent" href="/terms">terms</Link>{' '}
          for the rest of the conditions.
        </p>
      </DocSection>
    </DocPage>
  );
}

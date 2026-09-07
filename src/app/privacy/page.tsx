import type { Metadata } from 'next';
import Link from 'next/link';
import { DocPage, DocSection } from '@/components/site/DocPage';

export const metadata: Metadata = {
  title: 'Privacy policy · Hello My Cab',
  description:
    'What this site collects when you book a cab — name, mobile number and pickup address — why it is needed, and who else sees it.',
  alternates: { canonical: '/privacy' },
};

/**
 * Written from what the site actually does, field by field, rather than from a template.
 * The funnel asks for exactly three things (DetailsForm.tsx: name, phone, pickup address),
 * the session is an httpOnly cookie, and payments never touch this site — the backend
 * returns a hosted payment link. Anything beyond that would be a claim we cannot support.
 */
export default function PrivacyPage() {
  return (
    <DocPage
      title="Privacy"
      intro="We ask for three things to run a cab booking, and nothing else. This page says what they are and where they go."
      updated="September 2026"
      path="/privacy"
    >
      <DocSection title="What we collect">
        <p>To make a booking, this site asks for:</p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong>Your name</strong> — so the driver knows who they are meeting.
          </li>
          <li>
            <strong>Your mobile number</strong> — to send the one-time code that signs you
            in, and so the driver can reach you.
          </li>
          <li>
            <strong>Your pickup address</strong> — a house, hotel or landmark, so the driver
            arrives at the right door.
          </li>
        </ul>
        <p>
          Along with these we keep the trip itself: the cities, the date and time, the
          vehicle and the fare.
        </p>
      </DocSection>

      <DocSection title="What we do not collect">
        <p>
          This website does not ask for your location — nothing here reads your GPS. It does
          not ask for your email address, your date of birth, or any identity document.
        </p>
        <p>
          Card and UPI details never reach us. Payment happens on our payment provider&rsquo;s
          own page, and we are told only whether it succeeded.
        </p>
      </DocSection>

      <DocSection title="Staying signed in">
        <p>
          After you verify the code, your session is stored in a cookie that JavaScript
          cannot read. It exists so you can see your booking without signing in again.
        </p>
      </DocSection>

      <DocSection title="Who else sees it">
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong>The driver on your trip</strong> — your name, your number and the pickup
            address. That is the point of the booking.
          </li>
          <li>
            <strong>Our payment provider</strong> — the amount and the booking reference,
            when you choose to pay online.
          </li>
        </ul>
        <p>We do not sell your details, and we do not pass them to advertisers.</p>
      </DocSection>

      <DocSection title="How long we keep it">
        <p>
          Bookings are kept as our record of the trip — for accounts, for tax, and so we can
          answer a question about a journey you took months ago.
        </p>
      </DocSection>

      <DocSection title="Your details, your call">
        <p>
          You can ask us what we hold about you, ask us to correct it, or ask us to delete
          it. Call{' '}
          <a className="font-semibold text-accent" href="tel:+919667111921">
            +91 96671 11921
          </a>
          .
        </p>
        <p>
          Deleting your details closes any booking history with them. Records we are
          required to keep for tax are the exception.
        </p>
      </DocSection>

      <DocSection title="Related">
        <p>
          See the <Link className="font-semibold text-accent" href="/terms">terms</Link> and
          the{' '}
          <Link className="font-semibold text-accent" href="/refund">
            cancellation policy
          </Link>
          .
        </p>
      </DocSection>
    </DocPage>
  );
}

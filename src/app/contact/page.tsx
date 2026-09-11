import type { Metadata } from 'next';
import Link from 'next/link';
import { DocPage, DocSection } from '@/components/site/DocPage';
import { company } from '@/lib/company';

export const metadata: Metadata = {
  title: { absolute: 'Contact Hello My Cab — +91 96671 11921' },
  description:
    'Call +91 96671 11921 to book a cab, change a trip or ask about a fare. A person answers every day, around the clock — no form, no waiting.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <DocPage
      title="Contact"
      intro="A booking question is faster on the phone than in a form, so the phone is what we put first."
      path="/contact"
    >
      <DocSection title="Call us">
        <a
          href={company.phoneHref}
          className="font-display inline-flex min-h-11 items-center text-h2 transition-colors hover:text-accent"
        >
          {company.phone}
        </a>
        <p className="text-muted">{company.hours}</p>
      </DocSection>

      {company.whatsapp ? (
        <DocSection title="WhatsApp">
          <p>
            <a
              className="font-semibold text-accent"
              href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`}
            >
              Message us on WhatsApp
            </a>
          </p>
        </DocSection>
      ) : null}

      {company.email ? (
        <DocSection title="Email">
          <p>
            <a className="font-semibold text-accent" href={`mailto:${company.email}`}>
              {company.email}
            </a>
          </p>
        </DocSection>
      ) : null}

      {company.registeredAddress ? (
        <DocSection title="Registered office">
          <p className="whitespace-pre-line">{company.registeredAddress}</p>
        </DocSection>
      ) : null}

      {/* What the phone is for, said plainly — a contact page with a number and nothing
          else leaves the visitor to guess whether this is the right place for their
          question. Everything below is something the site actually does. */}
      <DocSection title="When to call, and when to book here">
        <p>
          Every route with a published fare can be booked on this site without speaking to
          anyone — the price is on the page and it is the price you pay. Call when the
          journey is not on the{' '}
          <Link className="font-semibold text-accent" href="/routes">
            route list
          </Link>
          : other journeys are quoted on distance, and a person does that faster than a form.
        </p>
        <p>
          Call as well for anything that does not fit a booking form — several stops, a
          group large enough to need two vehicles, a pickup at an odd hour.
        </p>
      </DocSection>

      <DocSection title="What to have ready">
        <p>
          The pickup city and the drop city, the date and time, how many people are
          travelling and roughly how much luggage — that is everything needed to quote a fare
          and pick the right vehicle. For an airport pickup, the flight number and terminal
          as well.
        </p>
      </DocSection>

      <DocSection title="About an existing booking">
        <p>
          Have the booking number ready — it is on the confirmation page and in the message
          we sent you. If you booked on this site, every trip is under{' '}
          <Link className="font-semibold text-accent" href="/bookings">
            your trips
          </Link>{' '}
          once you sign in with the same mobile number.
        </p>
        <p>
          A booking can be cancelled from its own page before the trip starts; what that
          costs is set out on the{' '}
          <Link className="font-semibold text-accent" href="/refund">
            cancellation page
          </Link>
          . To change a pickup time or address, call — changes are made by a person rather
          than a form, so that the driver hears about them.
        </p>
      </DocSection>

      <DocSection title="If you drive with us">
        <p>
          This site is for booking a cab. Trips, earnings and everything else a driver needs
          are in the driver app, and a driver&rsquo;s account signs in there rather than here.
        </p>
      </DocSection>
    </DocPage>
  );
}

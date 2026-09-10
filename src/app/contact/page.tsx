import type { Metadata } from 'next';
import Link from 'next/link';
import { DocPage, DocSection } from '@/components/site/DocPage';
import { company } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Contact Hello My Cab · +91 96671 11921',
  description:
    'Call +91 96671 11921 to book a cab or ask about a booking. Someone answers every day, around the clock.',
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

      <DocSection title="About an existing booking">
        <p>
          Have the booking number ready — it is on the confirmation page and in the message
          we sent you. Cancelling is covered on the{' '}
          <Link className="font-semibold text-accent" href="/refund">
            cancellation page
          </Link>
          .
        </p>
      </DocSection>
    </DocPage>
  );
}

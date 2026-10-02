import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { DialNow } from '@/components/DialNow';
import { company } from '@/lib/company';

/**
 * Call this driver.
 *
 * The desk's WhatsApp alert about a failed wallet top-up carries a "Call driver" button, and
 * a WhatsApp template button cannot be a `tel:` link — Meta allows only http/https there, and
 * its native Call button has its number fixed at approval, so it cannot vary per driver.
 * This page is the way round that: the button points here with the number in the path, and
 * the page hands it to the phone.
 *
 * Only ever opened by whoever is holding the desk's phone. It is not part of the site.
 */
export const dynamic = 'force-dynamic';
// A link meant for one person, about one driver, is not a search result.
export const metadata: Metadata = {
  title: 'Call driver',
  robots: { index: false, follow: false },
};

export default async function CallDriver({ params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;

  // STRICT, and it has to be. Two reasons, and the second one was a live bug:
  //
  //  1. Without validation this page turns any string in the URL into a `tel:` link — an open
  //     door for sending someone a hellomycabs.com link that dials a number of the sender's
  //     choosing.
  //  2. Next hands over the RAW path segment, not a decoded one. The first version of this
  //     page stripped non-digits and kept the last ten, and `/c/%2B91%2092679%2092724` then
  //     produced tel:+916792092724 — the digits inside `%2B` and `%20` had been swept up as
  //     part of the number. A wrong number that still dials is the worst possible failure
  //     here, so nothing is salvaged from a malformed input: it is refused.
  //
  // What is accepted, after one decode: ten digits beginning 6-9, optionally prefixed with
  // 91 or +91, and optionally spaced or hyphened. Anything else goes home.
  let decoded = '';
  try {
    decoded = decodeURIComponent(phone || '');
  } catch {
    redirect('/'); // a malformed escape is not a phone number
  }
  const match = /^\s*(?:\+?91[\s-]?)?([6-9](?:[\s-]?\d){9})\s*$/.exec(decoded);
  if (!match) redirect('/');
  const ten = match[1].replace(/[\s-]/g, '');

  const href = `tel:+91${ten}`;
  const pretty = `${ten.slice(0, 5)} ${ten.slice(5)}`;

  return (
    <>
      <Header />

      <main className="mx-auto max-w-xl px-gutter py-section-sm">
        {/* Fires on arrival. The link below is what carries the page when it does not. */}
        <DialNow href={href} />

        <h1 className="font-display text-h2 text-balance">Calling the driver</h1>
        <p className="mt-4 text-body text-muted">
          Your phone should be opening the dialer. If it does not, tap the number.
        </p>

        <a
          href={href}
          className="mt-8 inline-flex min-h-14 items-center rounded-full bg-accent px-7 text-body font-bold text-white transition-colors hover:bg-accent-dark"
        >
          Call +91 {pretty}
        </a>

        {/* The number is spelled out as text too, so the desk can read it back to someone
            or copy it even on a device that will not dial. */}
        <p className="mt-6 text-small text-muted">
          Driver&rsquo;s number: +91 {pretty}
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={company.phoneHref}
            className="inline-flex min-h-11 items-center rounded-full border border-line px-6 text-small font-bold"
          >
            Call the office
          </a>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full border border-line px-6 text-small font-bold"
          >
            Home
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}

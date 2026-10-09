import type { Metadata } from 'next';
import Link from 'next/link';
import { env } from '@/lib/env';
import { company } from '@/lib/company';
import { RateForm } from '@/components/rate/RateForm';

/**
 * "Rate your ride" — the link a customer gets on WhatsApp after a trip (9 Oct 2026).
 *
 * No sign-in: the signed link names the booking and nothing else, and a trip can be rated
 * once. The rating is counted into the route's summary on the website (a number, never a
 * name). Not for search: noindex, out of the sitemap.
 */
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { absolute: 'Rate your ride — Hello My Cab' },
  robots: { index: false, follow: false },
};

interface Trip {
  from: string;
  to: string;
  date: string | null;
  completed: boolean;
  alreadyRated: boolean;
  googleReviewUrl: string | null;
}

async function load(token: string): Promise<Trip | null> {
  try {
    const res = await fetch(`${env.apiBaseUrl}/public/reviews/rate/${encodeURIComponent(token)}`, {
      cache: 'no-store',
      headers: { accept: 'application/json' },
    });
    const body = await res.json().catch(() => null);
    return body?.ok ? (body.data as Trip) : null;
  } catch {
    return null;
  }
}

const day = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      })
    : '';

export default async function RatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const trip = await load(token);
  const route = trip ? [trip.from, trip.to].filter(Boolean).join(' to ') : '';

  return (
    <div className="min-h-dvh bg-surface-alt">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <Link href="/" className="font-display inline-flex min-h-11 items-center text-title font-bold">
            {company.name}
          </Link>
          <a href={company.phoneHref} className="inline-flex min-h-11 items-center text-small font-semibold text-accent">
            {company.phone}
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-20 pt-8">
        {!trip ? (
          <>
            <h1 className="font-display text-balance text-h2">This link is not working</h1>
            <p className="mt-3 text-body text-muted">
              Please open it again from the WhatsApp message, or call us on {company.phone}.
            </p>
          </>
        ) : trip.alreadyRated ? (
          <>
            <h1 className="font-display text-balance text-h2">You have rated this trip — thank you</h1>
            {trip.googleReviewUrl ? (
              <a
                href={trip.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-12 items-center rounded-full bg-accent px-6 font-semibold text-white hover:bg-accent-dark"
              >
                Also review us on Google
              </a>
            ) : null}
          </>
        ) : !trip.completed ? (
          <>
            <h1 className="font-display text-balance text-h2">This trip is not complete yet</h1>
            <p className="mt-3 text-body text-muted">You can rate it once it ends.</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-balance text-h2">How was your {route || 'trip'}?</h1>
            {trip.date ? <p className="mt-2 text-body text-muted">{day(trip.date)}</p> : null}
            <div className="mt-8">
              <RateForm token={token} googleReviewUrl={trip.googleReviewUrl} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

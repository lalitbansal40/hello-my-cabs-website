import type { Metadata } from 'next';
import Link from 'next/link';
import { env } from '@/lib/env';
import { company } from '@/lib/company';
import { DriverRouteForm, type SurveyAnswer } from '@/components/driver/DriverRouteForm';

/**
 * The road survey a driver opens from a push after a trip.
 *
 * It lives on the website rather than in the app so that it reaches every driver today —
 * an app screen would reach only the ones who have updated. The signed link in the URL is
 * the whole authorisation: it names the driver and the road, and it expires in a week.
 *
 * Not for search, not for customers: noindex, nofollow, out of the sitemap, and no booking
 * header — a driver filling this in should not be offered a cab.
 */
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { absolute: 'Tell us about the road — Hello My Cab' },
  robots: { index: false, follow: false },
};

interface FormData {
  pickupLabel: string;
  dropLabel: string;
  driverFirstName: string | null;
  answer: SurveyAnswer | null;
  status: 'new' | 'approved' | 'rejected' | null;
}

async function load(
  token: string,
): Promise<{ ok: true; data: FormData } | { ok: false; message: string }> {
  try {
    const res = await fetch(`${env.apiBaseUrl}/route-knowledge/form/${encodeURIComponent(token)}`, {
      cache: 'no-store',
      headers: { accept: 'application/json' },
    });
    const body = await res.json().catch(() => null);
    if (body?.ok) return { ok: true, data: body.data as FormData };
    return {
      ok: false,
      message:
        body?.error?.message ?? 'This link is not working. Please open it again from the app.',
    };
  } catch {
    return {
      ok: false,
      message: 'We could not load the form just now. Please try again in a minute.',
    };
  }
}

export default async function DriverRoutePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await load(token);

  return (
    <div className="min-h-dvh bg-surface-alt">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="font-display inline-flex min-h-11 items-center text-title font-bold"
          >
            {company.name}
          </Link>
          <a
            href={company.phoneHref}
            className="inline-flex min-h-11 items-center text-small font-semibold text-accent"
          >
            {company.phone}
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-20 pt-8">
        {result.ok ? (
          <>
            <h1 className="font-display text-balance text-h2">
              {result.data.pickupLabel} → {result.data.dropLabel}
            </h1>
            <p className="mt-3 text-pretty text-body text-muted">
              {result.data.driverFirstName ? `Hello ${result.data.driverFirstName}. ` : ''}
              You just drove this road. Tell us what you know about it — it takes two minutes.
              Answer only what you know; you can skip any question.
            </p>
            <p className="mt-2 text-small text-faint">
              We check every answer before anything goes on our website. Your name is never shown.
            </p>
            <DriverRouteForm
              token={token}
              pickupLabel={result.data.pickupLabel}
              initial={result.data.answer}
              answeredBefore={result.data.status !== null}
            />
          </>
        ) : (
          <>
            <h1 className="font-display text-h2">This link is not working</h1>
            <p className="mt-3 text-body text-muted">{result.message}</p>
            <p className="mt-6 text-body">
              Need help? Call{' '}
              <a href={company.phoneHref} className="font-semibold text-accent">
                {company.phone}
              </a>
              .
            </p>
          </>
        )}
      </main>
    </div>
  );
}

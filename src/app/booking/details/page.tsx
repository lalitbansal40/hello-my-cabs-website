import type { Metadata } from 'next';
import Link from 'next/link';
import { FunnelShell } from '@/components/site/FunnelShell';
import { DetailsForm } from '@/components/DetailsForm';
import { TripSummary } from '@/components/ui/TripSummary';
import { NotACustomer } from '@/components/site/NotACustomer';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Search = Promise<Record<string, string | undefined>>;

export default async function DetailsPage({ searchParams }: { searchParams: Search }) {
  const q = await searchParams;

  // Who is booking, if anybody. A customer already signed in has proved their number
  // once; asking again at the step where people are most likely to leave is friction for
  // nothing. A driver signed in here would fill the whole form and then meet a 403 from
  // /bookings, which is customer-only — so they are stopped before they start typing.
  const user = await getCurrentUser();

  if (!q.quoteId || !q.vehicleType || !q.when) {
    return (
      <FunnelShell
        title="This link is incomplete"
        subtitle="It is missing the quote it belongs to, which usually means it was copied without the whole address."
      >
        <Link className="font-semibold text-accent" href="/">
          Start again from the home page
        </Link>
      </FunnelShell>
    );
  }
  return (
    <FunnelShell
      step={2}
      title="Your details"
      subtitle={
        user && user.role === 'CUSTOMER'
          ? 'Just where we should pick you up.'
          : 'Three things, then a code to confirm the number. No password to make.'
      }
    >
      {/* The last step used to ask for a phone number with no reminder of what was being
          booked — the one screen where people are deciding whether to go through with it. */}
      <TripSummary
        pickup={q.pickup ?? ''}
        drop={q.drop}
        when={q.when}
        returnWhen={q.returnWhen}
        vehicleLabel={q.vehicleLabel}
        hours={q.hours ? Number(q.hours) : undefined}
        changeHref={`/booking?${new URLSearchParams({
          tripType: q.tripType ?? 'one_way',
          pickup: q.pickup ?? '',
          when: q.when,
          ...(q.drop ? { drop: q.drop } : {}),
          ...(q.returnWhen ? { returnWhen: q.returnWhen } : {}),
          ...(q.hours ? { hours: q.hours } : {}),
        })}`}
      />

      {/* A shortcut, not a requirement: somebody with an account skips the code by taking
          it, and everybody else finishes exactly as before. The whole address travels in
          `next` — the quote id, the time, the vehicle — so they come back to this price
          rather than to the start of the funnel. */}
      {!user ? (
        <p className="mt-6 text-[14px] text-muted">
          Booked with us before?{' '}
          <Link
            className="font-semibold text-accent hover:underline"
            href={`/login?next=${encodeURIComponent(
              `/booking/details?${new URLSearchParams(
                Object.entries(q).filter((e): e is [string, string] => e[1] !== undefined),
              )}`,
            )}`}
          >
            Sign in
          </Link>{' '}
          and skip the code.
        </p>
      ) : null}

      {user && user.role !== 'CUSTOMER' ? (
        <div className="mt-6">
          <NotACustomer role={user.role} />
        </div>
      ) : (
        <DetailsForm
          signedInAs={user ? { name: user.name, phone: user.phone } : undefined}
          quoteId={q.quoteId}
          expiresAt={q.expiresAt}
          tripType={(q.tripType ?? 'one_way') as 'one_way' | 'round_trip' | 'local'}
          vehicleType={q.vehicleType}
          pickup={q.pickup ?? ''}
          drop={q.drop}
          when={q.when}
          returnWhen={q.returnWhen}
          hours={q.hours ? Number(q.hours) : undefined}
        />
      )}
    </FunnelShell>
  );
}

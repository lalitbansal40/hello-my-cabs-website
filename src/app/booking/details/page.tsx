import type { Metadata } from 'next';
import { tripMetadata } from '@/lib/trip-share';
import Link from 'next/link';
import { FunnelShell } from '@/components/site/FunnelShell';
import { DetailsForm } from '@/components/DetailsForm';
import { TripSummary } from '@/components/ui/TripSummary';
import { getCurrentUser } from '@/lib/session';
import { parseStops } from '@/lib/stops';

export const dynamic = 'force-dynamic';
// Out of search, but a shared link shows the trip it is about (lib/trip-share.ts).
export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  return tripMetadata(await searchParams);
}

type Search = Promise<Record<string, string | undefined>>;

export default async function DetailsPage({ searchParams }: { searchParams: Search }) {
  const q = await searchParams;
  const stops = q.tripType === 'local' ? [] : parseStops(q.stops);

  // Who is booking, if anybody. Somebody already signed in — any account: drivers and
  // admins book too — is not asked for a number at all.
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
        user
          ? 'Just where we should pick you up.'
          : 'Just your mobile number — no OTP, no password.'
      }
    >
      {/* The last step used to ask for a phone number with no reminder of what was being
          booked — the one screen where people are deciding whether to go through with it. */}
      <TripSummary
        pickup={q.pickup ?? ''}
        drop={q.drop}
        when={q.when}
        returnWhen={q.returnWhen}
        stops={stops}
        vehicleLabel={q.vehicleLabel}
        hours={q.hours ? Number(q.hours) : undefined}
        days={q.days ? Number(q.days) : undefined}
        billedKm={q.billedKm ? Number(q.billedKm) : undefined}
        changeHref={`/booking?${new URLSearchParams({
          tripType: q.tripType ?? 'one_way',
          pickup: q.pickup ?? '',
          when: q.when,
          ...(q.drop ? { drop: q.drop } : {}),
          ...(q.returnWhen ? { returnWhen: q.returnWhen } : {}),
          ...(stops.length ? { stops: stops.join('|') } : {}),
          ...(q.hours ? { hours: q.hours } : {}),
        })}`}
      />

      {/* A shortcut, not a requirement: nobody needs an account to book. The whole address
          travels in `next` — the quote id, the time, the vehicle — so somebody who signs in
          comes back to this price rather than to the start of the funnel. */}
      {!user ? (
        <p className="mt-6 text-small text-muted">
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
          to see this booking with your other trips.
        </p>
      ) : null}

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
        stops={stops}
        hours={q.hours ? Number(q.hours) : undefined}
        totalRupees={q.totalRupees ? Number(q.totalRupees) : undefined}
        advanceRupees={q.advanceRupees ? Number(q.advanceRupees) : undefined}
      />
    </FunnelShell>
  );
}

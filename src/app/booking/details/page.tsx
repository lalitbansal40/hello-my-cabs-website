import type { Metadata } from 'next';
import Link from 'next/link';
import { FunnelShell } from '@/components/site/FunnelShell';
import { DetailsForm } from '@/components/DetailsForm';
import { TripSummary } from '@/components/ui/TripSummary';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Search = Promise<Record<string, string | undefined>>;

export default async function DetailsPage({ searchParams }: { searchParams: Search }) {
  const q = await searchParams;
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
      subtitle="Three things, then a code to confirm the number. No password to make."
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

      <DetailsForm
        quoteId={q.quoteId}
        tripType={(q.tripType ?? 'one_way') as 'one_way' | 'round_trip' | 'local'}
        vehicleType={q.vehicleType}
        pickup={q.pickup ?? ''}
        drop={q.drop}
        when={q.when}
        returnWhen={q.returnWhen}
        hours={q.hours ? Number(q.hours) : undefined}
      />
    </FunnelShell>
  );
}

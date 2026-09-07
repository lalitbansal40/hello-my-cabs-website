import type { Metadata } from 'next';
import { Stepper } from '@/components/ui/Stepper';
import { DetailsForm } from '@/components/DetailsForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Search = Promise<Record<string, string | undefined>>;

export default async function DetailsPage({ searchParams }: { searchParams: Search }) {
  const q = await searchParams;
  if (!q.quoteId || !q.vehicleType || !q.when) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="font-display text-[2.25rem] leading-tight tracking-[-0.02em]">This link is incomplete</h1>
        <p className="mt-2 text-muted">Please start again from the home page.</p>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Stepper current={2} />
      <DetailsForm
        quoteId={q.quoteId}
        tripType={(q.tripType ?? 'one_way') as 'one_way' | 'round_trip' | 'local'}
        vehicleType={q.vehicleType}
        pickup={q.pickup ?? ''}
        drop={q.drop}
        when={q.when}
        hours={q.hours ? Number(q.hours) : undefined}
      />
    </main>
  );
}

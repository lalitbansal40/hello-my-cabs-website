import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Stepper } from '@/components/ui/Stepper';
import { VehicleChoice } from '@/components/VehicleChoice';

// A funnel step is personal to one visitor and must never be cached or indexed.
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Search = Promise<Record<string, string | undefined>>;

export default async function BookingPage({ searchParams }: { searchParams: Search }) {
  const q = await searchParams;
  const tripType = (q.tripType ?? 'one_way') as 'one_way' | 'round_trip' | 'local';
  const { pickup, drop, when, hours } = q;

  if (!pickup || !when || (tripType !== 'local' && !drop)) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-display text-[2.25rem] leading-tight tracking-[-0.02em]">Something is missing</h1>
        <p className="mt-2 text-muted">
          Pick your cities and a time, then try again.
        </p>
        <Link className="mt-6 inline-block font-semibold text-accent" href="/">
          Back to home
        </Link>
      </main>
    );
  }

  // Fetched on the server: the prices are in the HTML, and the browser makes no second
  // round trip before the visitor can see what the trip costs.
  const [cities, vehicles, fare] = await Promise.all([
    api.cities().catch(() => []),
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
    (tripType === 'one_way'
      ? api.onewayFare(pickup, drop!)
      : tripType === 'round_trip'
        ? api.roundtripFare(pickup, drop!)
        : api.localPackages()
    ).catch((e: Error & { code?: string }) => ({ error: e.code ?? 'REQUEST_FAILED' })),
  ]);

  const pickupCity = cities.find((c) => c.name === pickup);
  const dropCity = drop ? cities.find((c) => c.name === drop) : undefined;

  if ('error' in fare) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="font-display text-[2.25rem] leading-tight tracking-[-0.02em]">We do not cover this route yet</h1>
        <p className="mt-2 text-muted">
          {pickupCity?.label ?? pickup} to {dropCity?.label ?? drop} is not priced yet.
          Please try another city.
        </p>
        <Link className="mt-6 inline-block font-semibold text-accent" href="/">
          Try another route
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Stepper current={1} />
      <h1 className="font-display mt-7 text-[2.5rem] leading-tight tracking-[-0.025em]">
        {pickupCity?.label ?? pickup}
        {dropCity ? ` → ${dropCity.label}` : ''}
      </h1>
      <p className="mt-1 text-muted">
        {new Date(when).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Kolkata',
        })}
        {tripType === 'local' ? ` · ${hours ?? 8}h` : ''}
      </p>

      <VehicleChoice
        tripType={tripType}
        pickup={pickup}
        drop={drop}
        when={when}
        hours={hours ? Number(hours) : undefined}
        vehicles={vehicles}
        fare={fare}
      />
    </main>
  );
}

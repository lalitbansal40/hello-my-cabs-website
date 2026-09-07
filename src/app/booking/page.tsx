import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FunnelShell } from '@/components/site/FunnelShell';
import { VehicleChoice } from '@/components/VehicleChoice';
import { formatWhen } from '@/lib/when';

// A funnel step is personal to one visitor and must never be cached or indexed.
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Search = Promise<Record<string, string | undefined>>;


export default async function BookingPage({ searchParams }: { searchParams: Search }) {
  const q = await searchParams;
  const tripType = (q.tripType ?? 'one_way') as 'one_way' | 'round_trip' | 'local';
  const { pickup, drop, when, hours, returnWhen } = q;

  if (!pickup || !when || (tripType !== 'local' && !drop)) {
    return (
      <FunnelShell
        title="Something is missing"
        subtitle="We need the cities and a time before we can price the trip."
      >
        <Link className="font-semibold text-accent" href="/">
          Start again from the home page
        </Link>
      </FunnelShell>
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
      <FunnelShell
        title="We do not cover this route yet"
        subtitle={`${pickupCity?.label ?? pickup} to ${dropCity?.label ?? drop} has no published price.`}
      >
        {/* A dead end, so it gets the two ways out: the routes we do run, and a phone
            number in the bar below — some of these journeys can be quoted by hand. */}
        <div className="flex flex-col gap-3">
          <Link className="font-semibold text-accent" href="/routes">
            See the routes we price
          </Link>
          <Link className="font-semibold text-accent" href="/">
            Try another city
          </Link>
        </div>
      </FunnelShell>
    );
  }

  return (
    <FunnelShell
      step={1}
      title={`${pickupCity?.label ?? pickup}${dropCity ? ` → ${dropCity.label}` : ''}`}
      subtitle={
        formatWhen(when) +
        // A round trip that shows only its outbound leg reads as a one way, and the
        // return is half of what was asked for.
        (tripType === 'round_trip' && returnWhen ? ` · back ${formatWhen(returnWhen)}` : '') +
        (tripType === 'local' ? ` · ${hours ?? 8}h` : '')
      }
    >
      <VehicleChoice
        tripType={tripType}
        pickup={pickup}
        drop={drop}
        when={when}
        returnWhen={returnWhen}
        hours={hours ? Number(hours) : undefined}
        vehicles={vehicles}
        fare={fare}
      />
    </FunnelShell>
  );
}

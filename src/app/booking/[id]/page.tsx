import type { Metadata } from 'next';
import Link from 'next/link';
import { env } from '@/lib/env';
import { getSession } from '@/lib/session';
import { Card } from '@/components/ui/Card';
import { FunnelShell } from '@/components/site/FunnelShell';

export const dynamic = 'force-dynamic';
// Somebody's booking is not a page for search results, and the id in the URL should not
// be indexed under any circumstances.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function BookingConfirmation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getSession();

  if (!token) {
    return (
      <FunnelShell
        title="Sign in to see this booking"
        subtitle="A booking is only shown to the number it was made with."
      >
        <Link className="font-semibold text-accent" href="/">
          Go to the home page
        </Link>
      </FunnelShell>
    );
  }

  const res = await fetch(`${env.apiBaseUrl}/bookings/${id}`, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const body = await res.json().catch(() => null);

  if (!body?.ok) {
    return (
      <FunnelShell
        title="We could not find that booking"
        subtitle={body?.error?.message ?? 'Please try again.'}
      >
        <Link className="font-semibold text-accent" href="/">
          Go to the home page
        </Link>
      </FunnelShell>
    );
  }

  const b = body.data.booking;
  const rupees = (paise: number) => `₹${Math.round((paise ?? 0) / 100).toLocaleString('en-IN')}`;

  return (
    <FunnelShell
      step={3}
      title={`Booking #${b.bookingNo ?? b.seq ?? id.slice(-6)}`}
      subtitle="Confirmed. We will call before the driver sets off."
    >
      <Card className="flex flex-col gap-3">
        <Row label="Route" value={`${b.pickup?.address ?? '—'} → ${b.drop?.address ?? '—'}`} />
        <Row label="Vehicle" value={b.vehicleType} />
        <Row
          label="Pickup"
          value={
            b.scheduledAt
              ? new Date(b.scheduledAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                  timeZone: 'Asia/Kolkata',
                })
              : '—'
          }
        />
        {/* The FARE is what the trip costs. `bookingAmount` is only what was charged
            online — zero on a cash booking, and `??` does not fall through a zero, so
            this read as "₹0" for a trip the customer owes ₹3,500 on. */}
        <Row label="Fare" value={rupees(b.fareEstimate)} />
        {b.bookingAmount > 0 ? (
          <Row label="Paid online" value={rupees(b.bookingAmount)} />
        ) : (
          <Row label="Payment" value="Cash — pay the driver" />
        )}
        <Row label="Status" value={b.status} />
      </Card>

      {b.billToken ? (
        <a
          className="mt-5 inline-block font-semibold text-accent"
          href={`${env.apiBaseUrl}/bookings/bill/${b.billToken}`}
          target="_blank"
          rel="noreferrer"
        >
          View invoice
        </a>
      ) : null}

      <Card className="mt-8">
        <p className="font-bold">Everything in one place</p>
        <p className="mt-1 text-sm text-muted">
          Driver details, live status and your past trips are all in the app.
        </p>
        <a
          className="mt-3 inline-block font-semibold text-accent"
          href="https://play.google.com/store/apps/details?id=com.hellomycab.hello_my_cab_app"
          target="_blank"
          rel="noreferrer"
        >
          Get the app
        </a>
      </Card>
    </FunnelShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

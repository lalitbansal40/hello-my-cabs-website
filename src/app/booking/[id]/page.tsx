import type { Metadata } from 'next';
import Link from 'next/link';
import { env } from '@/lib/env';
import { getSession } from '@/lib/session';
import { Card } from '@/components/ui/Card';
import { Stepper } from '@/components/ui/Stepper';

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
      <main className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="text-2xl font-bold">Ye booking dekhne ke liye login chahiye</h1>
        <Link className="mt-6 inline-block font-semibold text-accent" href="/">
          Home par jaayein
        </Link>
      </main>
    );
  }

  const res = await fetch(`${env.apiBaseUrl}/bookings/${id}`, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const body = await res.json().catch(() => null);

  if (!body?.ok) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="text-2xl font-bold">Ye booking nahi mili</h1>
        <p className="mt-2 text-muted">{body?.error?.message ?? 'Dobara koshish karein.'}</p>
      </main>
    );
  }

  const b = body.data.booking;
  const rupees = (paise: number) => `₹${Math.round((paise ?? 0) / 100).toLocaleString('en-IN')}`;

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Stepper current={3} />

      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-accent">
        Booking confirm
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">
        #{b.bookingNo ?? b.seq ?? id.slice(-6)}
      </h1>

      <Card className="mt-6 flex flex-col gap-3">
        <Row label="Route" value={`${b.pickup?.address ?? '—'} → ${b.drop?.address ?? '—'}`} />
        <Row label="Gaadi" value={b.vehicleType} />
        <Row
          label="Kab"
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
        <Row label="Daam" value={rupees(b.bookingAmount ?? b.fareEstimate)} />
        <Row label="Status" value={b.status} />
      </Card>

      {b.billToken ? (
        <a
          className="mt-5 inline-block font-semibold text-accent"
          href={`${env.apiBaseUrl}/bookings/bill/${b.billToken}`}
          target="_blank"
          rel="noreferrer"
        >
          Invoice dekhein
        </a>
      ) : null}

      <Card className="mt-8">
        <p className="font-bold">App par sab kuch ek jagah</p>
        <p className="mt-1 text-sm text-muted">
          Driver ka number, live status aur purani bookings — sab app me.
        </p>
        <a
          className="mt-3 inline-block font-semibold text-accent"
          href="https://play.google.com/store/apps/details?id=com.hellomycab.hello_my_cab_app"
          target="_blank"
          rel="noreferrer"
        >
          App download karein
        </a>
      </Card>
    </main>
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

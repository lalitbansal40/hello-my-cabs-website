import type { Metadata } from 'next';
import Link from 'next/link';
import { FunnelShell } from '@/components/site/FunnelShell';
import { getSession } from '@/lib/session';
import { PaymentResult } from '@/components/PaymentResult';

/**
 * Where Razorpay sends the customer back to.
 *
 * Until now a payment made on the site ended on Razorpay's own page: the customer had paid
 * and had no idea whether the trip was booked. This page waits for the money to land and
 * then says so — with the booking, what was taken, and the receipt.
 *
 * Nothing in the returning URL is believed. Razorpay's webhook and this browser arrive by
 * different roads and either can be first, so the answer is always asked of the backend.
 */
export const dynamic = 'force-dynamic';
// A payment page is nobody's search result, and the booking id must not be indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ConfirmPayment({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const q = await searchParams;

  if (!(await getSession())) {
    return (
      <FunnelShell
        title="Sign in to see this booking"
        subtitle="A booking is only shown to the number it was made with."
      >
        <Link className="font-semibold text-accent" href={`/login?next=/booking/${id}/confirm`}>
          Sign in
        </Link>
      </FunnelShell>
    );
  }

  return (
    <PaymentResult
      bookingId={id}
      // Razorpay says what it thinks happened. It is used for ONE thing: to stop waiting a
      // full minute for money that was never sent. Whether it arrived is still the
      // backend's answer, never this.
      cancelled={(q.razorpay_payment_link_status ?? '').toLowerCase() === 'cancelled'}
    />
  );
}

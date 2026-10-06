import Link from 'next/link';
import { RateUs } from '@/components/site/RateUs';
import { Card } from './ui/Card';
import { PayOptions } from './PayOptions';
import { BookingShare } from './BookingShare';
import { formatWhen } from '@/lib/when';
import { rupees } from '@/lib/bookings';
import { statusView, toneClass } from '@/lib/booking-status';
import { company } from '@/lib/company';

/** What GET /public/bookings/:id?g= returns — the trip, never a phone number. */
export interface GuestBookingData {
  booking: {
    _id: string;
    bookingNo?: number;
    status: string;
    vehicleType: string;
    pickup?: { address?: string };
    drop?: { address?: string };
    scheduledAt?: string;
    fareEstimate: number;
    bookingAmount: number;
    paymentMethod?: 'online' | 'cash';
    /** The whole fare paid online (backend 4 Oct 2026). */
    paidFull?: boolean;
  };
  driverName: string | null;
  paid: boolean;
  amountPaid: number;
  billUrl: string | null;
}

/**
 * A booking made without an OTP, as the browser that made it sees it.
 *
 * The trip, its status and the money — read with this booking's own token. Cancelling,
 * the driver's number and the other trips on the account all need the number proved, so
 * those are one "sign in" away rather than here.
 */
export function GuestBooking({
  data,
  guestToken,
  vehicleLabel,
}: {
  data: GuestBookingData;
  guestToken: string;
  vehicleLabel: string;
}) {
  const b = data.booking;
  const view = statusView(b.status);
  const unpaid = b.status === 'PAYMENT_PENDING' || b.status === 'PAYMENT_FAILED';
  const live = ['CONFIRMED', 'DRIVER_ASSIGNED', 'ONGOING'].includes(b.status);
  const dueToDriver = Math.max(0, (b.fareEstimate ?? 0) - (data.amountPaid ?? 0));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span
          className={`inline-block text-small rounded-full px-3.5 py-1.5 font-bold ${toneClass(view.tone)}`}
        >
          {view.label}
        </span>
      </div>

      {unpaid ? (
        <Card className="border-danger/30 bg-danger/5">
          <p className="font-bold text-danger">This trip is not confirmed</p>
          <p className="mt-2 text-body text-ink-soft text-pretty">
            The payment did not finish, so no driver has been assigned. Try the payment again,
            or call{' '}
            <a className="font-semibold text-ink hover:text-accent" href={company.phoneHref}>
              {company.phone}
            </a>{' '}
            and we will complete the booking with you.
          </p>
          {b.paymentMethod === 'online' ? (
            <div className="mt-4">
              {/* A UPI app, the QR, or card — the same payment, never a second charge. */}
              <PayOptions bookingId={String(b._id)} guestToken={guestToken} />
            </div>
          ) : null}
        </Card>
      ) : live ? (
        <Card className="border-success/30 bg-success/5">
          <span
            aria-hidden
            className="mb-3 grid size-11 place-items-center rounded-full bg-success/12 text-success"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6">
              <path
                className="tick-draw"
                d="M5 12.5 10 17.5 19 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="font-bold text-success">Your booking is confirmed</p>
          <p className="mt-2 text-body text-ink-soft text-pretty">
            The details are on their way to your phone, and our desk may call to confirm the
            pickup. The driver&apos;s name and number reach you before the trip.
          </p>
          <div className="mt-4">
            <BookingShare
              bookingNo={b.bookingNo}
              route={`${b.pickup?.address || '—'} → ${b.drop?.address || '—'}`}
              scheduledAt={b.scheduledAt}
              vehicle={vehicleLabel}
            />
          </div>
        </Card>
      ) : null}

      <Card className="flex flex-col gap-3">
        <Row label="Route" value={`${b.pickup?.address || '—'} → ${b.drop?.address || '—'}`} />
        <Row label="Vehicle" value={vehicleLabel} />
        <Row label="Pickup" value={b.scheduledAt ? formatWhen(b.scheduledAt) : 'To be confirmed'} />
        {data.driverName ? <Row label="Driver" value={data.driverName} /> : null}
      </Card>

      <Card className="flex flex-col gap-3">
        <Row label="Total fare" value={rupees(b.fareEstimate)} />
        {data.paid && data.amountPaid > 0 ? (
          <>
            <Row label="Paid online" value={rupees(data.amountPaid)} />
            {/* Paid in full: not "₹0" — there is simply nothing to pay the driver. */}
            <Row
              label="Pay the driver"
              value={b.paidFull || dueToDriver === 0 ? 'Nothing — paid in full' : rupees(dueToDriver)}
            />
          </>
        ) : b.paymentMethod === 'online' ? (
          <Row label="Payment" value="Online — nothing has been charged yet" />
        ) : (
          <Row label="Payment" value="Cash — pay the driver at the end" />
        )}
        <RateUs status={b.status} />
        {data.billUrl ? (
          <a
            className="pt-1 font-semibold text-accent hover:underline"
            href={data.billUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download receipt (PDF)
          </a>
        ) : null}
        <p className="pt-1 text-small text-faint">
          Toll, parking and state taxes are charged separately.{' '}
          <Link className="font-semibold text-muted hover:text-accent" href="/refund">
            Cancellation terms
          </Link>
        </p>
      </Card>

      <Card>
        <p className="text-body text-ink-soft">
          To cancel, see the driver&apos;s number or find this trip again later, sign in with
          the same mobile number — we will send a code.
        </p>
        <Link
          className="mt-3 inline-flex min-h-11 items-center font-semibold text-accent"
          href={`/login?next=/booking/${b._id}`}
        >
          Sign in to manage this booking
        </Link>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-small text-muted">{label}</span>
      <span className="text-right text-body font-semibold tabular-nums text-ink">{value}</span>
    </div>
  );
}

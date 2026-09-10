import type { Metadata } from 'next';
import Link from 'next/link';
import { env } from '@/lib/env';
import { Card } from '@/components/ui/Card';
import { FunnelShell } from '@/components/site/FunnelShell';
import { formatWhen } from '@/lib/when';
import { getSession } from '@/lib/session';
import { oneBooking, cancelPreview, rupees, type MyBooking } from '@/lib/bookings';
import { CancelBooking } from '@/components/CancelBooking';
import { statusView, toneClass, isCancellable } from '@/lib/booking-status';
import { company } from '@/lib/company';
import { api } from '@/lib/api';
import { labelMap, vehicleName } from '@/lib/vehicle-name';

export const dynamic = 'force-dynamic';
// Somebody's booking is not a page for search results, and the id in the URL should not
// be indexed under any circumstances.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!(await getSession())) {
    return (
      <FunnelShell
        title="Sign in to see this booking"
        subtitle="A booking is only shown to the number it was made with."
      >
        <Link className="font-semibold text-accent" href={`/login?next=/booking/${id}`}>
          Sign in
        </Link>
      </FunnelShell>
    );
  }

  const result = await oneBooking(id);

  if (!result.ok) {
    // The backend matches on customerId, so somebody else's id lands here rather than
    // showing their trip. It still needs to be a page, not a blank screen.
    return (
      <FunnelShell title="We could not find that booking" subtitle={result.error}>
        <div className="flex flex-col gap-3">
          <Link className="font-semibold text-accent" href="/bookings">
            See your trips
          </Link>
          <p className="text-muted text-body">
            Or call{' '}
            <a className="font-semibold text-ink hover:text-accent" href={company.phoneHref}>
              {company.phone}
            </a>
            .
          </p>
        </div>
      </FunnelShell>
    );
  }

  const b: MyBooking = result.data.booking;
  const driver = result.data.assignedDriver ?? b.assignedDriver;
  const view = statusView(b.status);

  const unpaid = b.status === 'PAYMENT_PENDING' || b.status === 'PAYMENT_FAILED';

  /**
   * `bookingAmount` is the advance the booking ASKED for, not proof that it arrived. A
   * booking can carry paymentMethod 'online' and an amount, and still have taken nothing:
   * the link is issued at creation and the money may never follow. One cancelled trip here
   * carries ₹500 as its bookingAmount and a cancellation record of nothing kept and nothing
   * refunded — because the backend works that out from the payment record, not from this
   * field. Printing "Paid online ₹500" on it would have told the customer we hold money we
   * never took.
   *
   * The states below are the ones a booking only reaches once payment has actually gone
   * through.
   */
  // Only fetched when the button could actually appear — the backend refuses a cancel once
  // the trip has started, so asking for the figures then is a call for nothing.
  const canCancel = isCancellable(b.status);
  const [preview, vehicles] = await Promise.all([
    canCancel ? cancelPreview(id) : null,
    // So the page can name the car rather than print the key the booking stores.
    api.vehicles().catch(() => ({ intercity: [], roundTripOnly: [] })),
  ]);
  const labels = labelMap([...vehicles.intercity, ...vehicles.roundTripOnly]);

  const paymentReceived =
    (b.bookingAmount ?? 0) > 0 &&
    ['CONFIRMED', 'DRIVER_ASSIGNED', 'ONGOING', 'COMPLETED'].includes(b.status);

  // What is left for the driver. Only meaningful once the advance is genuinely in.
  const dueToDriver = Math.max(0, (b.fareEstimate ?? 0) - (b.bookingAmount ?? 0));

  return (
    <FunnelShell
      // The stepper belongs to a booking that has just been made. On a cancelled or
      // expired trip, reached from the list weeks later, it would claim progress that is
      // not happening.
      step={['CREATED', 'CONFIRMED', 'DRIVER_ASSIGNED'].includes(b.status) ? 3 : undefined}
      title={`Booking #${b.bookingNo ?? b.typeSeq ?? id.slice(-6)}`}
      subtitle={view.next || undefined}
    >
      <div className="flex flex-col gap-6">
        <div>
          <span
            className={`inline-block text-small rounded-full px-3.5 py-1.5 font-bold ${toneClass(view.tone)}`}
          >
            {view.label}
          </span>
        </div>

        {/* A booking that looks made but is not is the one thing here somebody must not
            misread. There is no way to finish a payment from this site — the payment link
            is issued once, at booking, and never stored — so this offers the phone rather
            than a button that would do nothing. */}
        {unpaid ? (
          <Card className="border-danger/30 bg-danger/5">
            <p className="font-bold text-danger">This trip is not confirmed</p>
            <p className="mt-2 text-body text-ink-soft text-pretty">
              The payment did not finish, so no driver has been assigned. Call{' '}
              <a className="font-semibold text-ink hover:text-accent" href={company.phoneHref}>
                {company.phone}
              </a>{' '}
              and we will complete the booking with you.
            </p>
          </Card>
        ) : null}

        <Card className="flex flex-col gap-3">
          <Row label="Route" value={`${b.pickup?.address ?? '—'} → ${b.drop?.address ?? '—'}`} />
          <Row label="Vehicle" value={vehicleName(b.vehicleType, labels)} />
          <Row
            label="Pickup"
            value={b.scheduledAt ? formatWhen(b.scheduledAt) : 'To be confirmed'}
          />
        </Card>

        <Card className="flex flex-col gap-3">
          <Row label="Total fare" value={rupees(b.fareEstimate)} />
          {paymentReceived ? (
            <>
              <Row label="Paid online" value={rupees(b.bookingAmount)} />
              <Row label="Pay the driver" value={rupees(dueToDriver)} />
            </>
          ) : b.paymentMethod === 'online' ? (
            <Row label="Payment" value="Online — nothing has been charged yet" />
          ) : (
            <Row label="Payment" value="Cash — pay the driver at the end" />
          )}
          <p className="pt-1 text-small text-faint">
            Toll, parking and state taxes are charged separately.{' '}
            <Link className="font-semibold text-muted hover:text-accent" href="/refund">
              Cancellation terms
            </Link>
          </p>
        </Card>

        {driver?.name ? (
          <Card>
            <p className="font-bold text-label uppercase text-faint">
              Your driver
            </p>
            <p className="font-display text-h3 mt-2">{driver.name}</p>
            {driver.phone ? (
              <a
                className="mt-3 inline-block font-semibold text-accent"
                href={`tel:${driver.phone}`}
              >
                Call {driver.phone}
              </a>
            ) : null}
          </Card>
        ) : null}

        {/* Where the money went. Without this a cancelled booking says only "Cancelled"
            and the customer has no idea what was kept or returned. */}
        {b.status === 'CANCELLED' && b.cancellation ? (
          <Card className="flex flex-col gap-3">
            <p className="font-bold text-label uppercase text-faint">
              Cancellation
            </p>
            {b.cancellation.at ? (
              <Row label="Cancelled on" value={formatWhen(b.cancellation.at)} />
            ) : null}
            {(b.cancellation.cancellationCharge ?? 0) === 0 &&
            (b.cancellation.refundAmount ?? 0) === 0 ? (
              // Two rows of ₹0 read as an accounting statement about money that was never
              // involved. Nothing was taken, so say that.
              <p className="text-ink-soft text-body">
                Nothing was charged for this cancellation.
              </p>
            ) : (
              <>
                <Row label="Fee kept" value={rupees(b.cancellation.cancellationCharge)} />
                <Row label="Refunded" value={rupees(b.cancellation.refundAmount)} />
              </>
            )}
            {b.cancellation.reason ? <Row label="Reason" value={b.cancellation.reason} /> : null}
          </Card>
        ) : null}

        {/* NOTE: billToken is not returned by any endpoint — it is computed only when the
            WhatsApp message is built (bookingNotify.ts). So this link has never rendered.
            Left in place pending a decision to either add the field to getBooking or drop
            the link; see PLAN_accounts_phaseD.md §1.1. */}
        {(b as MyBooking & { billToken?: string }).billToken ? (
          <a
            className="font-semibold text-accent"
            href={`${env.apiBaseUrl}/bookings/bill/${(b as MyBooking & { billToken?: string }).billToken}`}
            target="_blank"
            rel="noreferrer"
          >
            View invoice
          </a>
        ) : null}

        {/* Shown only where the backend would accept it. A button that answers with an
            error the moment it is pressed is worse than no button. */}
        {canCancel ? (
          <CancelBooking id={id} preview={preview?.ok ? preview.data : null} />
        ) : null}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6">
          <Link
            className="-my-2 inline-flex min-h-11 items-center font-semibold text-accent"
            href="/bookings"
          >
            See all your trips
          </Link>
          <a
            className="-my-2 inline-flex min-h-11 items-center font-semibold text-accent"
            href="https://play.google.com/store/apps/details?id=com.hellomycab.hello_my_cab_app"
            target="_blank"
            rel="noreferrer"
          >
            Get the app
          </a>
        </div>
      </div>
    </FunnelShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-2 last:border-0 last:pb-0">
   <span className="text-small text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

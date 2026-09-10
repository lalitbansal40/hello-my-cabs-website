import Link from 'next/link';
import { formatWhen } from '@/lib/when';
import { statusView, toneClass } from '@/lib/booking-status';
import { rupees, type MyBooking } from '@/lib/bookings';
import { cityTitle } from '@/lib/slug';
import { vehicleName } from '@/lib/vehicle-name';

/** A trip, as one row in the customer's own list. */
export function BookingCard({
  b,
  labels,
}: {
  b: MyBooking;
  /** The live catalogue's names, keyed by the key a booking stores. */
  labels?: Record<string, string>;
}) {
  const view = statusView(b.status);
  const route =
    b.pickupCity && b.dropCity
      ? `${cityTitle(b.pickupCity)} → ${cityTitle(b.dropCity)}`
      : (b.pickup?.address ?? 'Your trip');

  return (
    <li>
      <Link
        href={`/booking/${b._id}`}
        className="group flex flex-col gap-4 rounded-2xl border border-line bg-surface-raised p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between sm:gap-8"
      >
        <div className="min-w-0">
          <p className="font-bold text-label uppercase text-faint">
            #{b.bookingNo ?? b.typeSeq ?? b._id.slice(-6)}
          </p>
          <p className="font-display text-title mt-1.5">
            {route}
          </p>
          {/* A trip with no time on it said "— · tt_14". A dash is not an answer to when
              the cab is coming, and the key is not the name of the car. */}
          <p className="mt-1.5 text-small text-muted">
            {b.scheduledAt ? formatWhen(b.scheduledAt) : 'Pickup time to be confirmed'} ·{' '}
            {vehicleName(b.vehicleType, labels)}
          </p>
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
          <span
            className={`rounded-full text-label px-3 py-1 font-bold ${toneClass(view.tone)}`}
          >
            {view.label}
          </span>
          {/* The whole fare, not what was taken online — a cash booking has taken nothing
              and would otherwise read as a free trip. */}
          <span className="font-display text-title">
            {rupees(b.fareEstimate)}
          </span>
        </div>
      </Link>
    </li>
  );
}

import Link from 'next/link';
import { formatWhen } from '@/lib/when';
import { statusView, toneClass } from '@/lib/booking-status';
import { rupees, type MyBooking } from '@/lib/bookings';
import { cityTitle } from '@/lib/slug';

/** A trip, as one row in the customer's own list. */
export function BookingCard({ b }: { b: MyBooking }) {
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
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-faint">
            #{b.bookingNo ?? b.typeSeq ?? b._id.slice(-6)}
          </p>
          <p className="font-display mt-1.5 text-[1.35rem] leading-[1.15] tracking-[-0.02em]">
            {route}
          </p>
          <p className="mt-1.5 text-[14px] text-muted">
            {b.scheduledAt ? formatWhen(b.scheduledAt) : '—'} · {b.vehicleType}
          </p>
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[12px] font-bold ${toneClass(view.tone)}`}
          >
            {view.label}
          </span>
          {/* The whole fare, not what was taken online — a cash booking has taken nothing
              and would otherwise read as a free trip. */}
          <span className="font-display text-[1.25rem] tracking-tight">
            {rupees(b.fareEstimate)}
          </span>
        </div>
      </Link>
    </li>
  );
}

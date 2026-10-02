'use client';

import { Button } from './ui/Button';
import { formatWhen } from '@/lib/when';

/**
 * Two things people do the moment a trip is booked: tell somebody, and put it in the
 * calendar. Both from the booking on screen, nothing fetched — and no phone number in the
 * message: it goes wherever the customer sends it.
 */
export function BookingShare({
  bookingNo,
  route,
  scheduledAt,
  vehicle,
}: {
  bookingNo?: number;
  route: string;
  scheduledAt?: string;
  vehicle?: string;
}) {
  const when = scheduledAt ? formatWhen(scheduledAt) : '';
  const lines = [
    `Cab booked with Hello My Cab${bookingNo ? ` — #${bookingNo}` : ''}`,
    route,
    when ? `Pickup: ${when}` : null,
    vehicle ? `Car: ${vehicle}` : null,
  ].filter(Boolean);
  const wa = `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`;

  function addToCalendar() {
    if (!scheduledAt) return;
    const start = new Date(scheduledAt);
    // Two hours is a placeholder length: the calendar wants an end, the trip has none yet.
    const end = new Date(start.getTime() + 2 * 3600_000);
    const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Hello My Cab//Booking//EN',
      'BEGIN:VEVENT',
      `UID:${bookingNo ?? stamp(start)}@hellomycab`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:Hello My Cab · ${route.replace(/[,;]/g, ' ')}`,
      `DESCRIPTION:${(bookingNo ? `Booking #${bookingNo}` : 'Cab booking') + (vehicle ? ` · ${vehicle}` : '')}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Your cab is in an hour',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `hello-my-cab-${bookingNo ?? 'trip'}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-small font-bold text-ink transition-colors hover:border-success hover:text-success"
      >
        Share on WhatsApp
      </a>
      {scheduledAt ? (
        <Button variant="ghost" onClick={addToCalendar}>
          Add to calendar
        </Button>
      ) : null}
    </div>
  );
}

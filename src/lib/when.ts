/**
 * One way of writing a date and time, everywhere a customer reads one.
 *
 * There were three identical copies of this — the vehicle step, the details summary and
 * the confirmation — and three copies is how the confirmation ends up disagreeing with
 * the page that took the booking. The timezone is fixed rather than the browser's: the
 * car arrives in India whatever the clock on the device says.
 */
export const formatWhen = (iso: string) =>
  new Date(istInstant(iso)).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

/**
 * A time from the date picker, as the moment it names in India.
 *
 * The picker hands back "2026-09-15T09:00" with no zone. The browser reads that in its own
 * zone and the server in its own — UTC on most hosts — so the same string was 9 am on the
 * customer's screen and 2:30 pm on a page rendered by the server. A round trip is billed by
 * calendar days, and five and a half hours is enough to move the return into another day.
 * Read as India, it names one moment everywhere. A value that already carries a zone (an
 * ISO time from the API) is left as it is.
 */
export function istInstant(value: string): string {
  const zoned = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
  const d = new Date(
    zoned ? value : `${/T\d{2}:\d{2}$/.test(value) ? `${value}:00` : value}+05:30`,
  );
  return Number.isNaN(d.getTime()) ? value : d.toISOString();
}

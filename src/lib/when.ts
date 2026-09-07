/**
 * One way of writing a date and time, everywhere a customer reads one.
 *
 * There were three identical copies of this — the vehicle step, the details summary and
 * the confirmation — and three copies is how the confirmation ends up disagreeing with
 * the page that took the booking. The timezone is fixed rather than the browser's: the
 * car arrives in India whatever the clock on the device says.
 */
export const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

/**
 * One shape for a phone number, because the backend stores it as a plain unique string
 * and does no normalising of its own.
 *
 * The app sends `91` followed by the ten digits (login_screen.dart). This site was sending
 * the ten digits bare, so `User.findOne({ phone })` never matched and the same person ended
 * up with two accounts — one made by the app, one by the website. Bookings made on the site
 * were invisible in the app and the other way round, which is exactly the thing a "your
 * bookings" page exists to show.
 *
 * Display stays ten digits. The country code is added only on the way out.
 */
const COUNTRY = '91';

/** Ten digits, starting 6-9 — the range Indian mobile numbers actually use. */
export const isValidMobile = (local: string) => /^[6-9]\d{9}$/.test(local.trim());

/**
 * Ten digits in, the value the backend keys accounts by out.
 *
 * Tolerant about what it accepts — spaces, dashes, a leading +91 or 0 — because people
 * paste numbers in every one of those forms, and a login that fails on a stray space is a
 * login that fails.
 */
export function toApiPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  const local = digits.startsWith(COUNTRY) && digits.length === 12
    ? digits.slice(2)
    : digits.replace(/^0/, '');
  return `${COUNTRY}${local}`;
}

/** The ten-digit form, for showing back to the person who typed it. */
export function toLocalPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith(COUNTRY) && digits.length === 12) return digits.slice(2);
  return digits.replace(/^0/, '');
}

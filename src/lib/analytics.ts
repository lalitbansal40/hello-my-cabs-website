'use client';

/**
 * The six moments in a booking, and nothing else.
 *
 * Without these the funnel is a black box: we would know people arrive and know some of
 * them book, and be guessing about everything in between. Guessing is how you end up
 * redesigning the step that was working.
 *
 * ⚠️ NO PERSONAL DETAILS EVER LEAVE HERE. Not the name, not the phone number, not the
 * pickup address. Only which step was reached and what kind of trip it was — that is
 * enough to find where people stop, and it keeps an analytics account from quietly
 * becoming a second copy of the customer database.
 */
export type FunnelEvent =
  | 'widget_submit'
  | 'vehicle_select'
  | 'quote_created'
  | 'otp_requested'
  | 'otp_verified'
  | 'booking_created';

/** Only these keys are ever sent. Anything else is dropped rather than trusted. */
type Props = Partial<{
  tripType: string;
  vehicleType: string;
  /** A route as city keys — public catalogue data, not anything about the person. */
  route: string;
  paymentMethod: string;
}>;

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props: Record<string, string> }) => void;
  }
}

export function track(event: FunnelEvent, props: Props = {}) {
  if (typeof window === 'undefined' || !window.plausible) return;

  const clean: Record<string, string> = {};
  for (const key of ['tripType', 'vehicleType', 'route', 'paymentMethod'] as const) {
    const value = props[key];
    if (value) clean[key] = String(value);
  }
  window.plausible(event, { props: clean });
}

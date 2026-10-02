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
  /**
   * A booking made by somebody already signed in, who therefore never passed through
   * otp_requested or otp_verified. Without this the funnel reads as though people are
   * abandoning at the code step, when they simply were not asked for one.
   */
  | 'booking_signed_in'
  | 'booking_created'
  /**
   * The money actually arrived — counted on the page the customer returns to after
   * Razorpay. `booking_created` fires before any payment, so without this there is no way
   * to tell a booking that was paid for from one that was only started.
   */
  | 'payment_success'
  /** A tap on our phone number — for a cab company, a lead as real as a form. */
  | 'call_click'
  /** The WhatsApp button. The same kind of lead, from the channel most people prefer. */
  | 'whatsapp_click'
  /** The call-back popup was shown — by itself on arrival, or from the Call button. */
  | 'callback_open'
  /** A number was left in it. The number itself never leaves the page for analytics. */
  | 'callback_requested';

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

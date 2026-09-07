/**
 * The nine states a booking can be in, said in words a customer would use.
 *
 * The backend's own names are for the backend: DRIVER_ASSIGNED, PAYMENT_PENDING. Printing
 * those on a page tells somebody nothing, and worse, tells them we did not think about
 * them. But a translation on its own is only half of it — the useful part is what happens
 * next, which is the actual question behind "what does this mean".
 *
 * One place, because the list and the detail page both read from it. Two copies would drift
 * and then the same booking would say different things on two screens.
 */
export type BookingStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'DRIVER_ASSIGNED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED'
  | 'EXPIRED';

export interface StatusView {
  label: string;
  /** What happens next, or what to do. Empty when there is genuinely nothing to say. */
  next: string;
  tone: 'pending' | 'good' | 'live' | 'done' | 'bad';
  /** Whether this booking is still ahead of the customer rather than behind them. */
  upcoming: boolean;
}

const VIEWS: Record<BookingStatus, StatusView> = {
  CREATED: {
    label: 'Booking received',
    next: 'We are confirming it now. You will get a message when it is set.',
    tone: 'pending',
    upcoming: true,
  },
  PAYMENT_PENDING: {
    label: 'Payment not finished',
    // Deliberately blunt. A booking that looks made but is not is the one thing here
    // somebody must not misread.
    next: 'This trip is not confirmed yet. Call us and we will finish it with you.',
    tone: 'bad',
    upcoming: true,
  },
  PAYMENT_FAILED: {
    label: 'Payment did not go through',
    next: 'Nothing was charged. Call us and we will sort it out.',
    tone: 'bad',
    upcoming: true,
  },
  CONFIRMED: {
    label: 'Confirmed',
    next: 'We are assigning your driver. You will get their details before the trip.',
    tone: 'good',
    upcoming: true,
  },
  DRIVER_ASSIGNED: {
    label: 'Your driver is set',
    next: 'Their number is below — call them any time before pickup.',
    tone: 'good',
    upcoming: true,
  },
  ONGOING: {
    label: 'On the way',
    next: 'Your trip is running.',
    tone: 'live',
    upcoming: true,
  },
  COMPLETED: {
    label: 'Completed',
    next: '',
    tone: 'done',
    upcoming: false,
  },
  CANCELLED: {
    label: 'Cancelled',
    next: '',
    tone: 'bad',
    upcoming: false,
  },
  EXPIRED: {
    label: 'Expired',
    next: 'This booking was not confirmed in time. You can book the trip again.',
    tone: 'done',
    upcoming: false,
  },
};

/**
 * A status the site has never heard of must still render as something a person can read.
 * A new state added to the backend should look unremarkable here, not print a raw
 * constant at a customer.
 */
const UNKNOWN: StatusView = {
  label: 'In progress',
  next: 'Call us if you need an update on this trip.',
  tone: 'pending',
  upcoming: true,
};

export const statusView = (status: string): StatusView =>
  VIEWS[status as BookingStatus] ?? UNKNOWN;

/**
 * Whether to offer cancelling.
 *
 * The backend refuses once the trip has started or ended — ONGOING, COMPLETED, CANCELLED
 * (booking.controller.ts:1257). EXPIRED is not on its list and a cancel there would be
 * accepted, but there is nothing to call off: the booking already lapsed unconfirmed, and
 * offering to cancel it only invites the question of what it would do.
 */
export const isCancellable = (status: string) =>
  !['ONGOING', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(status);

const TONES: Record<StatusView['tone'], string> = {
  pending: 'bg-surface-alt text-muted',
  good: 'bg-accent/12 text-accent-dark',
  live: 'bg-accent text-forest',
  done: 'bg-surface-alt text-ink-soft',
  bad: 'bg-danger/10 text-danger',
};

export const toneClass = (tone: StatusView['tone']) => TONES[tone];

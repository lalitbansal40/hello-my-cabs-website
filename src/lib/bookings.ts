import { env } from './env';
import { getSession } from './session';

/**
 * The customer's own bookings, read on the server with their session token.
 *
 * Never cached. This is one person's data, and the only thing worse than a stale booking
 * list is somebody else's booking list.
 */
export interface MyBooking {
  _id: string;
  bookingNo?: number;
  typeSeq?: number;
  tripType: string;
  pickupCity?: string;
  dropCity?: string;
  vehicleType: string;
  pickup?: { address?: string };
  drop?: { address?: string };
  scheduledAt?: string;
  status: string;
  /** Paise. The whole fare for the trip. */
  fareEstimate: number;
  /** Paise. Only what was taken online — zero on a cash booking. */
  bookingAmount: number;
  paymentMethod?: 'online' | 'cash';
  createdAt?: string;
  assignedDriver?: { name?: string; phone?: string; rating?: number | null };
  cancellation?: {
    at?: string;
    reason?: string;
    by?: string;
    cancellationCharge?: number;
    refundAmount?: number;
  };
}

/** ₹ from paise, grouped the Indian way. Never recomputed from parts. */
export const rupees = (paise: number | undefined) =>
  `₹${Math.round((paise ?? 0) / 100).toLocaleString('en-IN')}`;

type Result<T> = { ok: true; data: T } | { ok: false; error: string; unauthorised?: boolean };

async function authed<T>(path: string, init?: RequestInit): Promise<Result<T>> {
  const token = await getSession();
  if (!token) return { ok: false, error: 'Not signed in', unauthorised: true };

  try {
    const res = await fetch(`${env.apiBaseUrl}${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${token}`,
        accept: 'application/json',
        ...(init?.body ? { 'content-type': 'application/json' } : {}),
        ...init?.headers,
      },
      cache: 'no-store',
    });
    const body = await res.json().catch(() => null);
    if (!body?.ok) {
      return {
        ok: false,
        error: body?.error?.message ?? 'Something went wrong',
        unauthorised: res.status === 401 || res.status === 403,
      };
    }
    return { ok: true, data: body.data as T };
  } catch {
    // The backend being down must not take the page with it.
    return { ok: false, error: 'We could not reach our system just now' };
  }
}

export const myBookings = () => authed<{ bookings: MyBooking[] }>('/bookings/mine');

export const oneBooking = (id: string) =>
  authed<{ booking: MyBooking; assignedDriver?: MyBooking['assignedDriver'] }>(`/bookings/${id}`);

export const cancelPreview = (id: string) =>
  authed<{ paidOnline: number; cancellationFee: number; refundAmount: number }>(
    `/bookings/${id}/cancel-preview`,
  );

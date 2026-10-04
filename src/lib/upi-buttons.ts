/**
 * The UPI app buttons for this browser, from the links the backend sends with the QR
 * (4 Oct 2026). One pure function, so the rule is in one place.
 *
 * Android: Google Pay, PhonePe, Paytm, BHIM and "Any UPI app" — BHIM and "any" open the
 * plain upi:// link, which Android hands to its chooser.
 * iPhone / iPad: Google Pay by its iPhone scheme, PhonePe, Paytm — no "any", because iOS
 * does not route upi:// reliably.
 * A computer: none — it has no UPI app; the QR is the way there.
 */
export interface UpiLinks {
  any?: string;
  gpay?: string;
  gpayIos?: string;
  phonepe?: string;
  paytm?: string;
}

export interface UpiButton {
  key: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'any';
  label: string;
  href: string;
}

export type Device = 'android' | 'ios' | 'desktop';

/** What kind of device this is, from the user agent and whether the pointer is a finger. */
export function deviceOf(userAgent: string, coarsePointer: boolean): Device {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';
  // A touch-only device that names neither (some tablets) is treated like Android.
  return coarsePointer ? 'android' : 'desktop';
}

export function pickUpiButtons(device: Device, links: UpiLinks | undefined): UpiButton[] {
  if (!links || device === 'desktop') return [];
  const out: UpiButton[] = [];
  const add = (key: UpiButton['key'], label: string, href?: string) => {
    if (href) out.push({ key, label, href });
  };
  if (device === 'ios') {
    add('gpay', 'Google Pay', links.gpayIos);
    add('phonepe', 'PhonePe', links.phonepe);
    add('paytm', 'Paytm', links.paytm);
  } else {
    add('gpay', 'Google Pay', links.gpay);
    add('phonepe', 'PhonePe', links.phonepe);
    add('paytm', 'Paytm', links.paytm);
    add('bhim', 'BHIM', links.any);
    add('any', 'Any UPI app', links.any);
  }
  return out;
}

'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { track } from '@/lib/analytics';
import { company } from '@/lib/company';
import { isValidMobile } from '@/lib/phone';
import { Button } from '../ui/Button';
import { PhoneInput } from '../ui/Field';
import { Icon } from './Icons';
import { fabAway } from './useFabsVisible';

/** When the popup was last closed or answered — it does not come back by itself for a day. */
const SEEN_KEY = 'hmc_callback_seen';
const QUIET_FOR_MS = 24 * 3600_000;
/** Long enough that the page has said what it is before anything asks for a number. */
const AUTO_OPEN_AFTER_MS = 8000;

function seenRecently(): boolean {
  try {
    const at = Number(localStorage.getItem(SEEN_KEY) || 0);
    return at > 0 && Date.now() - at < QUIET_FOR_MS;
  } catch {
    // Storage blocked (a private window): behave as though it was seen, so a visitor who
    // cannot be remembered is not asked on every page.
    return true;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, String(Date.now()));
  } catch {
    /* nothing to remember it in — fine */
  }
}

/**
 * "Call me back": the red button above WhatsApp, and the popup it opens.
 *
 * The popup also opens by itself, once, a few seconds after somebody arrives (owner's
 * decision, 2 Oct 2026). It asks for one thing — a mobile number — and can always be
 * closed. A number left here becomes an enquiry: if no booking comes from that number
 * within five minutes, the customer gets a WhatsApp message with the website and a Call
 * button, and the desk gets a copy (backend: the web-lead follow-up, stage `callback`).
 *
 * Once closed or answered it stays away for a day — by itself, that is; the button still
 * opens it. A popup that comes back on every page is how a site gets closed for good.
 */
/** [visible] — the shared answer from useFabsVisible, so this and WhatsApp move together. */
export function CallbackFab({ visible = true }: { visible?: boolean }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDivElement>(null);

  const show = useCallback(() => {
    opener.current = document.activeElement as HTMLElement | null;
    setOpen(true);
    track('callback_open');
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    markSeen();
    // Back to whatever had focus, so a keyboard user is not dropped at the top of the page.
    opener.current?.focus?.();
  }, []);

  // Once, by itself, a few seconds in — unless it was closed or answered in the last day.
  useEffect(() => {
    if (seenRecently()) return;
    const t = setTimeout(() => {
      if (!seenRecently()) show();
    }, AUTO_OPEN_AFTER_MS);
    return () => clearTimeout(t);
  }, [show]);

  // Escape closes; focus goes to the number.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      // Tab stays inside the popup: behind it is a page the visitor cannot see or reach.
      if (e.key === 'Tab' && dialog.current) {
        const items = [
          ...dialog.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ];
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    // The page under the popup stays put; on a phone it otherwise scrolls behind it.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
      document.body.style.overflow = overflow;
    };
  }, [open, close]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidMobile(phone)) {
      setError('Enter a 10-digit mobile number');
      return;
    }
    setError('');
    setBusy(true);
    try {
      // The enquiry is saved by the backend; whatever happens there, the visitor is
      // thanked — their number is not their problem to retry.
      await fetch('/api/booking/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ phone, stage: 'callback' }),
      }).catch(() => {});
      track('callback_requested');
      setSent(true);
      markSeen();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label="Get a call back"
        aria-haspopup="dialog"
        aria-hidden={visible ? undefined : true}
        tabIndex={visible ? undefined : -1}
        // Stacked above the WhatsApp button (WhatsAppFab): 6rem + 3rem + a gap on a phone,
        // where both clear the sticky Book bar; 1.5rem + 3.5rem + the same gap from `lg`.
        // Steps aside with it at the footer and while somebody types (useFabsVisible).
        className={`group fixed bottom-[9.75rem] right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-accent text-white shadow-[0_10px_30px_-8px_rgba(216,48,40,0.6)] transition-[opacity,transform] duration-300 hover:scale-105 active:scale-95 motion-reduce:transition-none lg:bottom-[5.75rem] lg:right-6 lg:h-14 lg:w-14 ${
          visible ? '' : fabAway
        }`}
      >
        <Icon.phone className="h-5 w-5 lg:h-6 lg:w-6" />
        {/* What it does, on a laptop, where a round icon alone is a guess. */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-small font-semibold text-white opacity-0 shadow-[var(--shadow-soft)] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 lg:block"
        >
          Call me back
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          {/* The backdrop is a button for the pointer only; Escape and "Close" cover the rest. */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={close}
            className="absolute inset-0 bg-ink/50"
          />
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="enter relative w-full max-w-sm rounded-3xl bg-surface-raised p-6 shadow-[var(--shadow-soft)]"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-surface-alt hover:text-ink"
            >
              <Icon.x className="h-5 w-5" />
            </button>

            <span className="grid size-12 place-items-center rounded-full bg-accent/10 text-accent">
              <Icon.phone className="h-6 w-6" />
            </span>

            {sent ? (
              <>
                <h2 id={titleId} className="font-display mt-4 text-title-lg">
                  Thank you — we will call you
                </h2>
                <p className="mt-2 text-body text-muted">
                  Our desk will get back to you shortly with the fare and the car. Or book yourself
                  in a minute — no OTP needed.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <Link
                    href="/#book"
                    onClick={close}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 text-small font-bold text-white transition-colors hover:bg-accent-dark"
                  >
                    See fares and book
                  </Link>
                  <Button variant="ghost" onClick={close}>
                    Close
                  </Button>
                </div>
              </>
            ) : (
              <form onSubmit={submit} noValidate>
                <h2 id={titleId} className="font-display mt-4 text-title-lg">
                  Need a cab? We will call you
                </h2>
                <p className="mt-2 text-body text-muted">
                  Leave your mobile number and our desk will call you with the fare.
                </p>
                <label
                  htmlFor={`${titleId}-phone`}
                  className="mt-5 block text-label font-bold uppercase text-muted"
                >
                  Mobile number
                </label>
                <div className="mt-1.5">
                  <PhoneInput
                    id={`${titleId}-phone`}
                    ref={inputRef}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    aria-invalid={error ? true : undefined}
                  />
                </div>
                {error ? <p className="shake mt-1.5 text-small text-danger">{error}</p> : null}
                <Button type="submit" className="mt-4 w-full" disabled={busy}>
                  {busy ? 'Sending…' : 'Call me back'}
                </Button>
                <a
                  href={company.phoneHref}
                  className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 text-small font-semibold text-ink-soft transition-colors hover:text-accent"
                >
                  <Icon.phone className="h-4 w-4" />
                  Or call us now
                </a>
                <p className="mt-1 text-center text-small text-faint">
                  We may message you about this on WhatsApp. Reply STOP to opt out.
                </p>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

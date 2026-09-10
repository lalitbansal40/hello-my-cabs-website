'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icons';
import { SignOutButton } from './SignOutButton';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { company } from '@/lib/company';

/** True only in the browser, without setting state inside an effect. */
const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

/**
 * The header's small-screen half: phones and tablets.
 *
 * The overlay is portalled to <body>, and that is the whole of the fix for the menu that
 * never worked. The header carries a backdrop blur, and an element with backdrop-filter
 * becomes the containing block for its position:fixed descendants — so "fixed inset-0"
 * inside it meant "fill the 64px header", not "fill the screen". Measured: the overlay was
 * 64px tall on an 812px phone, and every link in it lay transparent across the page text.
 * The blur stays on the header; only the overlay leaves it.
 *
 * No library. This is on every page and the header is in front of the largest paint.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const user = useCurrentUser();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // Back to the button that opened it, so a keyboard user is not dropped at the top of
    // the page.
    requestAnimationFrame(() => trigger.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;

    const focusables = () => [
      ...(panel.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') ?? []),
    ];
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close();
      // Tab stays inside the panel: behind it is a page nobody can see.
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    // The panel covers the page; letting the page scroll underneath moves the content out
    // from behind the menu while somebody is reading it.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close]);

  const links: [string, string][] = [
    ['Routes', '/routes'],
    ['Fleet', '/#fleet'],
    ['How it works', '/#how'],
  ];

  const row = 'flex min-h-14 items-center border-b border-white/10 text-title font-medium';

  const overlay = (
    <div className="fixed inset-0 z-50 lg:hidden" data-menu-overlay role="dialog" aria-modal="true" aria-label="Menu">
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 h-full w-full bg-ink/60 backdrop-blur-sm"
      />

      <nav
        ref={panel}
        className="relative ml-auto flex h-full w-[min(22rem,88vw)] flex-col overflow-y-auto overscroll-contain bg-forest px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] text-white"
      >
        <div className="flex min-h-14 items-center justify-between">
          <span className="text-label font-bold uppercase text-white/40">Menu</span>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="-mr-3 flex size-11 items-center justify-center text-h3 leading-none text-white/60 hover:text-white"
          >
            ×
          </button>
        </div>

        <ul className="mt-4 flex flex-col">
          {links.map(([label, href]) => (
            <li key={href}>
              <Link href={href} onClick={close} className={row}>
                {label}
              </Link>
            </li>
          ))}

          {/* The account rows are the reason this menu exists. A driver is left out of the
              trips link — that endpoint is customer-only and would refuse them. */}
          {user === undefined ? null : user === null ? (
            <li>
              <Link href="/login" onClick={close} className={`${row} text-accent`}>
                Sign in
              </Link>
            </li>
          ) : (
            <>
              {user.role === 'CUSTOMER' ? (
                <li>
                  <Link href="/bookings" onClick={close} className={`${row} text-accent`}>
                    Your trips
                  </Link>
                </li>
              ) : null}
              <li className="border-b border-white/10 py-3">
                <p className="text-small text-white/45">
                  Signed in as {user.name?.trim().split(/\s+/)[0] ?? user.phone}
                </p>
                <SignOutButton className="flex min-h-11 items-center text-body font-semibold text-white/75 hover:text-white" />
              </li>
            </>
          )}
        </ul>

        <a
          href={company.phoneHref}
          className="mt-auto flex min-h-14 items-center gap-2.5 pt-6 text-title font-bold"
        >
          <Icon.headset className="h-4 w-4 text-accent" />
          {company.phone}
        </a>
      </nav>
    </div>
  );

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-haspopup="dialog"
        // 44×44, the size a thumb actually hits, with the bars centred inside it. No
        // negative margin: at 320 that once pushed the button past the edge.
        className="flex size-11 shrink-0 flex-col items-center justify-center gap-[5px] text-white/70 transition-colors hover:text-white lg:hidden"
      >
        <span className="block h-[2px] w-5 bg-current" />
        <span className="block h-[2px] w-5 bg-current" />
        <span className="block h-[2px] w-5 bg-current" />
      </button>

      {open && mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}

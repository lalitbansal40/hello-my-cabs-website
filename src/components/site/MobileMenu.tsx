'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Icon } from './Icons';
import { SignOutButton } from './SignOutButton';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { company } from '@/lib/company';

/**
 * The header's small-screen half.
 *
 * Below `sm` the header carried a logo and a Book button and nothing else — no navigation,
 * no phone number, and after the account work, no way to reach your trips. Most of this
 * site's traffic is on a phone, so "the links are in the desktop nav" means most people
 * who have an account never see the way into it.
 *
 * No library. This is on every page and the header is in front of the largest paint.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const user = useCurrentUser();

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);

    // The panel covers the page; letting the page scroll underneath it moves the content
    // out from behind the menu while somebody is reading it.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const links: [string, string][] = [
    ['Routes', '/routes'],
    ['Fleet', '/#fleet'],
    ['How it works', '/#how'],
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="-mr-1 p-2 text-white/70 transition-colors hover:text-white lg:hidden"
      >
        <span className="block h-[2px] w-5 bg-current" />
        <span className="mt-[5px] block h-[2px] w-5 bg-current" />
        <span className="mt-[5px] block h-[2px] w-5 bg-current" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-ink/60 backdrop-blur-sm"
          />

          <nav className="relative ml-auto flex h-full w-[min(21rem,88vw)] flex-col bg-forest px-6 pb-8 pt-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-white/40">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="-mr-2 p-2 text-[22px] leading-none text-white/60 hover:text-white"
              >
                ×
              </button>
            </div>

            <ul className="mt-8 flex flex-col gap-1">
              {links.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-white/10 py-4 text-[17px] font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}

              {/* The account rows are the reason this menu exists. A driver is left out of
                  the trips link — that endpoint is customer-only and would refuse them. */}
              {user === undefined ? null : user === null ? (
                <li>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block border-b border-white/10 py-4 text-[17px] font-medium text-accent"
                  >
                    Sign in
                  </Link>
                </li>
              ) : (
                <>
                  {user.role === 'CUSTOMER' ? (
                    <li>
                      <Link
                        href="/bookings"
                        onClick={() => setOpen(false)}
                        className="block border-b border-white/10 py-4 text-[17px] font-medium text-accent"
                      >
                        Your trips
                      </Link>
                    </li>
                  ) : null}
                  <li className="border-b border-white/10 py-4">
                    <p className="text-[13px] text-white/40">
                      Signed in as {user.name?.trim().split(/\s+/)[0] ?? user.phone}
                    </p>
                    <SignOutButton className="mt-1.5 text-[15px] font-semibold text-white/70 hover:text-white" />
                  </li>
                </>
              )}
            </ul>

            <a
              href={company.phoneHref}
              className="mt-auto flex items-center gap-2.5 pt-8 text-[17px] font-bold"
            >
              <Icon.headset className="h-4 w-4 text-accent" />
              {company.phone}
            </a>
          </nav>
        </div>
      ) : null}
    </>
  );
}

'use client';

import Link from 'next/link';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { SignOutButton } from './SignOutButton';

/**
 * The account corner of the header.
 *
 * A client component on purpose. The header is on all 105 prerendered pages, and reading
 * the session on the server would make every one of them render on demand — measured, and
 * it costs the whole of the SEO work.
 */
export function AccountMenu() {
  const user = useCurrentUser();

  /**
   * Where to come back to after signing in.
   *
   * Not useSearchParams(): that hook makes every page holding this component bail out of
   * static rendering unless it is inside a Suspense boundary, and the build failed outright
   * on /about. This component sits in the header, which is on all 105 prerendered pages.
   *
   * Not state set from an effect either — that is a cascading render, and this value never
   * changes while the page is open.
   *
   * Reading location during render is safe HERE specifically: nothing below is rendered
   * until the account answer arrives, which is always after hydration, so the server's
   * markup and the browser's first pass agree.
   */
  const here =
    typeof window === 'undefined'
      ? '/'
      : `${window.location.pathname}${window.location.search}`;
  // Same rule as safeNextPath on the server: somewhere on this site, and nowhere else.
  const signInHref = `/login?next=${encodeURIComponent(
    here.startsWith('/') && !here.startsWith('//') ? here : '/',
  )}`;

  // Not known yet. Something must hold the space — but not "Sign in", which would flash
  // the wrong word at every signed-in person on every page they open.
  if (user === undefined) return <span className="hidden h-5 w-20 lg:block" aria-hidden />;

  if (user === null) {
    return (
      <Link
        href={signInHref}
        className="hidden text-small font-semibold text-white/65 transition-colors hover:text-white lg:inline-flex min-h-11 items-center"
      >
        Sign in
      </Link>
    );
  }

  const firstName = user.name?.trim().split(/\s+/)[0];

  return (
    <div className="hidden items-center gap-4 lg:flex">
      {/* A driver's account signs in here and then gets a 403 from the trips endpoint,
          which is customer-only. Offering the link would be offering a dead end. */}
      {user.role === 'CUSTOMER' ? (
        <Link
          href="/bookings"
          className="font-semibold text-small text-white/65 transition-colors hover:text-white inline-flex min-h-11 items-center"
        >
          Your trips
        </Link>
      ) : null}
      <span className="max-w-[9rem] text-small truncate text-white/45" title={user.phone}>
        {firstName ?? user.phone}
      </span>
      <SignOutButton className="font-semibold text-small text-white/45 transition-colors hover:text-white inline-flex min-h-11 items-center" />
    </div>
  );
}

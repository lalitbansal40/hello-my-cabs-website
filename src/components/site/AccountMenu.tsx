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
        className="hidden text-small font-semibold text-ink-soft transition-colors hover:text-accent lg:inline-flex min-h-11 items-center"
      >
        Sign in
      </Link>
    );
  }

  const firstName = user.name?.trim().split(/\s+/)[0];

  return (
    <div className="hidden items-center gap-4 lg:flex">
      {/* Every account's — drivers and admins book cabs too (2 Oct 2026). */}
      <Link
        href="/bookings"
        className="font-semibold text-small text-ink-soft transition-colors hover:text-accent inline-flex min-h-11 items-center"
      >
        Your trips
      </Link>
      <span className="max-w-[9rem] text-small truncate text-muted" title={user.phone}>
        {firstName ?? user.phone}
      </span>
      <SignOutButton className="font-semibold text-small text-muted transition-colors hover:text-accent inline-flex min-h-11 items-center" />
    </div>
  );
}

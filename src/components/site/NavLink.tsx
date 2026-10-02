'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * A header link that knows when it is the page you are on — underlined in red, and
 * announced as the current page. A client component of its own so the header itself stays
 * a server component (it is on every prerendered page).
 */
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const path = usePathname();
  // "/#fleet" is a place on the home page, never "the page you are on".
  const current = !href.includes('#') && (path === href || path.startsWith(`${href}/`));
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={`relative flex min-h-11 items-center transition-colors hover:text-accent ${
        current
          ? 'text-accent after:absolute after:inset-x-0 after:bottom-2 after:h-0.5 after:rounded-full after:bg-accent'
          : ''
      }`}
    >
      {children}
    </Link>
  );
}

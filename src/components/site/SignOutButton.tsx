'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { forgetCurrentUser } from '@/lib/useCurrentUser';

/**
 * Signs out of this browser only — the route it calls drops the cookie and does not touch
 * the account, so the app on the person's own phone stays signed in.
 *
 * A button rather than a link, deliberately: a crawler following a link, or a browser
 * prefetching one, would otherwise sign people out for them.
 */
export function SignOutButton({ className = '' }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch('/api/logout', { method: 'POST' });
          // The header asks once per page load and keeps the answer, so a refresh alone
          // would leave the previous person's name sitting in the corner until a full
          // reload. Drop the remembered answer first.
          forgetCurrentUser();
          // And ask the server again for everything it rendered based on the session.
          router.refresh();
          router.push('/');
        } finally {
          setBusy(false);
        }
      }}
      className={className || 'font-semibold text-small text-accent hover:underline inline-flex min-h-11 items-center'}
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  );
}

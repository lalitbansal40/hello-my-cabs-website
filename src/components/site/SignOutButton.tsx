'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
          // Everything that shows who is signed in is rendered on the server, so it has to
          // be asked again rather than left showing the previous person.
          router.refresh();
          router.push('/');
        } finally {
          setBusy(false);
        }
      }}
      className={className || 'text-[14px] font-semibold text-accent hover:underline'}
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  );
}

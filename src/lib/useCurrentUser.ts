'use client';

import { useEffect, useState } from 'react';

export interface ClientUser {
  id: string;
  name?: string;
  phone: string;
  role: string;
}

/**
 * Who is signed in, asked from the browser.
 *
 * It has to be asked from here rather than rendered on the server: reading the session
 * cookie in a server component makes that route dynamic, and the header is on every page,
 * including the 105 that are prerendered. That change was measured — it took the build
 * from 105 static pages to none.
 *
 * `undefined` means the answer has not arrived. That is a real third state and the header
 * has to respect it: rendering "Sign in" while waiting would flash the wrong thing at
 * every signed-in person on every page.
 *
 * The promise is shared at module level so that several components asking during one page
 * make one request between them.
 */
let inFlight: Promise<ClientUser | null> | null = null;

function fetchUser(): Promise<ClientUser | null> {
  inFlight ??= fetch('/api/me', { cache: 'no-store' })
    .then((r) => r.json())
    .then((b) => (b?.ok ? ((b.data.user as ClientUser | null) ?? null) : null))
    .catch(() => null);
  return inFlight;
}

/**
 * Components already on screen have to be told, not just the next one to mount.
 *
 * Clearing the shared answer alone would leave the header showing the previous person's
 * name until a full page load, because a mounted hook has already run its effect and will
 * not ask again on its own.
 */
const listeners = new Set<() => void>();

/** Drops the shared answer and re-asks, everywhere it is on screen. Used after signing out. */
export function forgetCurrentUser() {
  inFlight = null;
  listeners.forEach((fn) => fn());
}

export function useCurrentUser(): ClientUser | null | undefined {
  const [user, setUser] = useState<ClientUser | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;

    const ask = () => {
      fetchUser().then((u) => {
        if (alive) setUser(u);
      });
    };

    ask();
    listeners.add(ask);
    return () => {
      alive = false;
      listeners.delete(ask);
    };
  }, []);

  return user;
}

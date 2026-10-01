'use client';

import { useEffect } from 'react';

/**
 * Open the dialer, once, as soon as the page is on screen.
 *
 * This exists because a WhatsApp template button cannot be a `tel:` link — Meta only allows
 * http/https there — so the button points at a page on this site and the page hands the
 * number to the phone. Nobody reads this page; it is a doorway.
 *
 * `window.location.href` rather than a redirect: a `tel:` is not a navigation the server can
 * perform, and Next's `redirect()` refuses the scheme outright.
 *
 * The page it sits on always draws a real link as well. Browsers may ignore a programmatic
 * `tel:` without a user gesture, and some in-app webviews block it entirely — in that case
 * nothing at all happens here, and the visible link is the whole of the page's job.
 */
export function DialNow({ href }: { href: string }) {
  useEffect(() => {
    // One attempt. A retry loop would re-open the dialer every time the viewer dismissed it.
    window.location.href = href;
  }, [href]);

  return null;
}

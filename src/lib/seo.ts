/**
 * Titles and descriptions that survive the result page.
 *
 * Google gives a title about 580px — roughly sixty characters — and cuts the rest with an
 * ellipsis. Every landing title here ran 68 to 77 characters, so the half that said what
 * the page offers ("one way & round trip", the brand) was never shown. Worse, six pages
 * carried the brand twice: their own title ended with "· Hello My Cab" and the layout
 * template appended "| Hello My Cab" after it.
 *
 * So titles are built, not written: a required head, then optional tails that are dropped
 * one at a time until it fits. Nothing is ever truncated mid-word by us, and nothing that
 * matters is left to the crawler to cut.
 */

/** The visible limit. Sixty is the safe number across desktop and mobile. */
export const TITLE_MAX = 60;
/** Under thirty characters a title is usually missing its subject or its brand. */
export const TITLE_MIN = 30;

/**
 * `fitTitle('Jaipur to Delhi Cab ₹3,200', [' — Taxi Fare & Booking', ' — Taxi Fare'])`
 *
 * Returns the head plus the longest tail that fits in sixty characters, or the head alone.
 * The head is never trimmed: if it alone is too long, that is a signal the page's name is
 * wrong, not something to hide with an ellipsis.
 */
export function fitTitle(head: string, tails: string[] = []): string {
  for (const tail of tails) {
    if ((head + tail).length <= TITLE_MAX) return head + tail;
  }
  return head;
}

/**
 * Descriptions are not a ranking factor; they are the sentence that decides the click. The
 * band is 120–155 characters — under 120 Google often writes its own from the page, over
 * 155 it cuts.
 */
export const DESC_MAX = 155;

/**
 * Joins whole sentences up to the cut, skipping any that will not fit rather than stopping
 * at the first one.
 *
 * Stopping was the obvious version and it was wrong: a long sentence in the middle ended
 * the description at 107 characters and threw away the three short ones after it, which
 * would have fitted. Pass the sentences longest-first-ish, with a short one at the end as
 * the thing that fills the last few characters.
 */
export function fitDescription(...sentences: string[]): string {
  let out = '';
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (next.length <= DESC_MAX) out = next;
  }
  return out;
}

/**
 * Driving time from distance, as a range.
 *
 * 42–55 km/h is what these roads actually average once toll queues, town crossings and a
 * tea stop are in it — a figure taken from a maps API would be the no-traffic best case,
 * which is the number every other site quotes and nobody achieves.
 */
export function hoursFor(km: number): string {
  const low = Math.round(km / 55);
  const high = Math.round(km / 42);
  return low === high ? `about ${low} hours` : `${low}–${high} hours`;
}

/** `3200` → `₹3,200` */
export const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;

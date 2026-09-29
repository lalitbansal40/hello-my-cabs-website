/**
 * The site's photography.
 *
 * These files live in `public/img` rather than on a stock host. The hero image is what
 * Largest Contentful Paint is measured on, and serving it from someone else's domain means
 * a second DNS lookup, a second TLS handshake and a hero that is blank whenever they are
 * having a bad day. Next resizes and re-encodes local files to AVIF/WebP itself, so the
 * phone gets a smaller file than the stock host ever sent.
 *
 * They are still ATMOSPHERIC placeholders — a road, a horizon, movement. None is captioned
 * as a place and none should be: a stock photograph labelled "Udaipur" that is not Udaipur
 * is a lie on the page, and it is the sort of thing a visitor notices.
 *
 * Swap them for the company's own photographs (see PHOTOS below). That single change does
 * more for how this site feels than anything else on the page. PHOTO_SHOTLIST.md at the
 * root says exactly what to shoot and how to deliver it.
 */
export const IMAGES = {
  heroRoad: '/img/hero-road.jpg',
  openRoad: '/img/open-road.jpg',
  monument: '/img/monument.jpg',
} as const;

/**
 * The company's OWN photographs — the cars, the drivers, the road.
 *
 * Empty means "not supplied yet", and every component that reads one falls back to what is
 * on the page today. A missing photograph must never leave an empty box: the site has to
 * look finished at every point between here and a full set — so any subset can be filled
 * in, in any order, and the page is finished either way.
 *
 * Note for whoever fills `hero` in: it is used on the HOME page only. A hero photograph was
 * measured on the route, city and vehicle pages on 29 Sep 2026 and became their Largest
 * Contentful Paint, taking them from 0.84 s to over 2 s on a phone. Those heroes carry
 * texture instead, and should stay that way.
 */
export const PHOTOS = {
  /** Wide, a clean car on an open road, sky above for the headline to sit in. */
  hero: '',
  /** One per vehicle key, same angle and same light for all four. */
  fleet: {
    dzire: '',
    ertiga: '',
    crysta: '',
    tempo_traveller: '',
  } as Record<string, string>,
  /** A driver in uniform, beside the car. Face clear, and only with their permission. */
  driver: '',
  /** Inside the car: clean seats, water bottles. Daylight. */
  interior: '',
} as const;

/**
 * Kept so every existing caller keeps working.
 *
 * It used to build an Unsplash URL with width and quality in the query string. Local files
 * need neither — Next decides the width from `sizes` and the quality from the `quality`
 * prop — so the extra arguments are accepted and ignored rather than removed one by one
 * from a dozen call sites.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const img = (url: string, ...ignored: unknown[]) => url;

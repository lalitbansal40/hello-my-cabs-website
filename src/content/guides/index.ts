/**
 * The guides — pages that answer a question rather than sell a route.
 *
 * They exist for the searches that come before a booking ("is a round trip cheaper", "what
 * do twelve people hire") and for the answer engines that quote pages like these. Every
 * figure in them is fetched from the fare API when the page is built, so a guide cannot
 * quote a price the site no longer charges.
 *
 * Published slowly on purpose — two at a time. A site that adds twenty articles in a day
 * looks like what it would be: output, not writing.
 *
 * The Jaipur ↔ Delhi road guides are deliberately not here yet. Without the drivers' own
 * account of the road they would restate the route page in paragraphs, which is a second
 * copy of a page, not a guide.
 */
export interface Guide {
  slug: string;
  /** The page title — kept inside sixty characters by fitTitle at render. */
  title: string;
  /** One sentence for the index and the meta description. */
  description: string;
  published: string;
  updated: string;
}

export const GUIDES: Guide[] = [
  {
    slug: 'one-way-or-round-trip',
    title: 'One way or round trip? The arithmetic on our routes',
    description:
      'When a round trip costs less than two one-way fares, when it does not, and the figures on six real routes — worked out from the fares we charge.',
    published: '2026-09-11',
    updated: '2026-09-13',
  },
  {
    slug: 'group-travel-which-vehicle',
    title: 'Travelling as a group: which vehicle for 6 to 16 people',
    description:
      'The cheapest way to seat a group of six, eight, twelve or sixteen — one larger vehicle or two cars — worked out from real round-trip fares.',
    published: '2026-09-11',
    updated: '2026-09-11',
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug) ?? null;
export const guidePath = (slug: string) => `/guides/${slug}`;

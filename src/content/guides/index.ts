/**
 * The guides — pages that answer a question rather than sell a route.
 *
 * They exist for the searches that come before a booking ("is a round trip cheaper", "what
 * do twelve people hire") and for the answer engines that quote pages like these. Every
 * figure in them is fetched from the fare API when the page is built, so a guide cannot
 * quote a price the site no longer charges.
 *
 * Published slowly on purpose. A site that adds twenty articles in a day looks like what it
 * would be: output, not writing.
 *
 * The "by road" guides (3 Oct 2026) were held back until each could say something its route
 * page does not: the highway, the towns on it in order, what is on the way, and both
 * directions' fares side by side (content/guides/roads.ts). Six, for the busiest pairs —
 * the "kitna km", "by road", "distance and time" searches in content/queries.json. Toll
 * amounts and food stops stay out until the drivers' own answers are approved.
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
  {
    slug: 'jaipur-delhi-by-road',
    title: 'Jaipur to Delhi by Road: Distance, Route & Taxi Fare',
    description:
      'How far Jaipur is from Delhi by road, the NH48 route through Kotputli, Behror and Gurugram, the driving time, and taxi fares in every car, both ways.',
    published: '2026-10-03',
    updated: '2026-10-03',
  },
  {
    slug: 'delhi-agra-by-road',
    title: 'Delhi to Agra by Road: Distance, Route & Taxi Fare',
    description:
      'How far Agra is from Delhi by road, the Yamuna Expressway and the old NH19 through Mathura, the driving time, and taxi fares in every car, both ways.',
    published: '2026-10-03',
    updated: '2026-10-03',
  },
  {
    slug: 'delhi-chandigarh-by-road',
    title: 'Delhi to Chandigarh by Road: Distance, Route & Taxi Fare',
    description:
      'How far Chandigarh is from Delhi by road, the NH44 route through Panipat, Karnal and Ambala, the driving time, and taxi fares in every car, both ways.',
    published: '2026-10-03',
    updated: '2026-10-03',
  },
  {
    slug: 'delhi-haridwar-by-road',
    title: 'Delhi to Haridwar by Road: Distance, Route & Taxi Fare',
    description:
      'How far Haridwar is from Delhi by road, the route through Meerut, Muzaffarnagar and Roorkee, the driving time, and taxi fares in every car, both ways.',
    published: '2026-10-03',
    updated: '2026-10-03',
  },
  {
    slug: 'jaipur-agra-by-road',
    title: 'Jaipur to Agra by Road: Distance, Route & Taxi Fare',
    description:
      'How far Agra is from Jaipur by road, the NH21 route through Dausa, Bharatpur and Fatehpur Sikri, the driving time, and taxi fares in every car, both ways.',
    published: '2026-10-03',
    updated: '2026-10-03',
  },
  {
    slug: 'jaipur-ajmer-by-road',
    title: 'Jaipur to Ajmer by Road: Distance, Route & Taxi Fare',
    description:
      'How far Ajmer is from Jaipur by road, the NH48 route through Dudu and Kishangarh, the driving time, and taxi fares in every car, both ways — Pushkar too.',
    published: '2026-10-03',
    updated: '2026-10-03',
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug) ?? null;
export const guidePath = (slug: string) => `/guides/${slug}`;

/**
 * The "by road" guides — one per pair of cities, for the searches that come before a
 * booking: how far is it, which road, what is on the way, what does it cost each way.
 *
 * Written 3 Oct 2026 for the six busiest pairs. What makes each one more than its route
 * page in paragraphs is the road itself, so only these facts are written here, and only
 * the kind that does not move:
 *   - the highway most trips use and the towns it passes, in order from `a` to `b`;
 *   - well-known places on or just off that road.
 * Every distance, time and price is the fare API's, fetched when the page is built.
 *
 * ⚠️ Nothing that changes or that only a driver knows: no toll amounts or counts, no
 * restaurants or dhabas, no "best time to leave". Those come from the drivers' own answers
 * (content/routes, driver.generated.ts) and appear on the route pages when they exist. The
 * road named is the usual one; the guide says the driver may take another for traffic.
 */
export interface RoadGuide {
  slug: string;
  /** Backend city keys; the guide is written from `a` to `b` and covers both directions. */
  a: string;
  b: string;
  /** The road most trips take. */
  highway: string;
  /** Towns the road passes, in order from a to b. */
  via: ReadonlyArray<string>;
  /** Another way some drivers go, when there is a well-known one. */
  alternative?: string;
  /** Places on or just off the road worth knowing about. */
  onTheWay: ReadonlyArray<{ name: string; note: string }>;
  /** What most people make this trip for — one or two sentences. */
  why: string;
  published: string;
}

export const ROAD_GUIDES: ReadonlyArray<RoadGuide> = [
  {
    slug: 'jaipur-delhi-by-road',
    a: 'JAIPUR',
    b: 'DELHI',
    highway: 'NH48, the old NH8',
    via: ['Shahpura', 'Kotputli', 'Behror', 'Neemrana', 'Dharuhera', 'Manesar', 'Gurugram'],
    onTheWay: [
      { name: 'Neemrana', note: 'the hill fort above the highway near the Rajasthan–Haryana border' },
      { name: 'Gurugram', note: 'the first city on the Delhi side — a drop here is on the way, not a detour' },
      { name: 'Amer', note: 'the fort on the hills at the Jaipur end, north of the city' },
    ],
    why: 'Work, family and flights out of Delhi’s airport keep this road busy in both directions.',
    published: '2026-10-03',
  },
  {
    slug: 'delhi-agra-by-road',
    a: 'DELHI',
    b: 'AGRA',
    highway: 'the Yamuna Expressway',
    via: ['Noida', 'Greater Noida', 'Jewar', 'Mathura', 'Agra'],
    alternative: 'NH19, the old Delhi–Agra highway through Faridabad, Palwal, Kosi Kalan and Mathura',
    onTheWay: [
      { name: 'Mathura and Vrindavan', note: 'close to both roads, an easy stop on the way there or back' },
      { name: 'Taj Mahal', note: 'at the Agra end; it is closed on Fridays, so check the day before you book' },
      { name: 'Agra Fort', note: 'on the Yamuna, a short way up river from the Taj' },
    ],
    why: 'Most people make it a day out — the Taj Mahal and home the same evening.',
    published: '2026-10-03',
  },
  {
    slug: 'delhi-chandigarh-by-road',
    a: 'DELHI',
    b: 'CHANDIGARH',
    highway: 'NH44, the Grand Trunk Road',
    via: ['Sonipat', 'Panipat', 'Karnal', 'Kurukshetra', 'Ambala', 'Zirakpur'],
    onTheWay: [
      { name: 'Kurukshetra', note: 'the pilgrimage town of the Mahabharata, a short way off the highway' },
      { name: 'Panipat', note: 'the town of the three battles, on the road itself' },
      { name: 'Zirakpur', note: 'where the road reaches the Chandigarh tricity, with Panchkula and Mohali beside it' },
    ],
    why: 'A straight run up the plains to the city where the roads to Shimla and Manali begin.',
    published: '2026-10-03',
  },
  {
    slug: 'delhi-haridwar-by-road',
    a: 'DELHI',
    b: 'HARIDWAR',
    highway: 'the Delhi–Meerut Expressway, then NH334',
    via: ['Ghaziabad', 'Meerut', 'Muzaffarnagar', 'Roorkee'],
    onTheWay: [
      { name: 'Roorkee', note: 'the last town before Haridwar, home of the old engineering college on the Ganga canal' },
      { name: 'Har Ki Pauri', note: 'the ghat at the heart of Haridwar, where the Ganga aarti is held every evening' },
      { name: 'Rishikesh', note: 'a short way further up the Ganga, if the trip carries on' },
    ],
    why: 'A pilgrimage for most, timed around the Ganga aarti at sunset or a holy day.',
    published: '2026-10-03',
  },
  {
    slug: 'jaipur-agra-by-road',
    a: 'JAIPUR',
    b: 'AGRA',
    highway: 'NH21',
    via: ['Dausa', 'Sikandra', 'Mahwa', 'Bharatpur', 'Fatehpur Sikri'],
    onTheWay: [
      { name: 'Abhaneri', note: 'the Chand Baori stepwell, a short detour off the road in Dausa district' },
      { name: 'Bharatpur', note: 'the Keoladeo bird sanctuary, on the road itself' },
      { name: 'Fatehpur Sikri', note: 'Akbar’s abandoned capital, on the road just before Agra' },
    ],
    why: 'Two sides of the Golden Triangle — the forts of Jaipur to the Taj at Agra.',
    published: '2026-10-03',
  },
  {
    slug: 'jaipur-ajmer-by-road',
    a: 'JAIPUR',
    b: 'AJMER',
    highway: 'NH48',
    via: ['Bagru', 'Dudu', 'Kishangarh'],
    onTheWay: [
      { name: 'Bagru', note: 'the village of hand-block printing, on the road out of Jaipur' },
      { name: 'Kishangarh', note: 'the marble town, close to the Ajmer end' },
      { name: 'Pushkar', note: 'just beyond Ajmer over the hill — most people who come this far see both' },
    ],
    why: 'The dargah of Moinuddin Chishti at Ajmer, and Pushkar beside it.',
    published: '2026-10-03',
  },
];

export const roadGuideBySlug = (slug: string) => ROAD_GUIDES.find((g) => g.slug === slug) ?? null;

/** The road guide covering this pair of cities, either way round. */
export const roadGuideFor = (x: string, y: string) =>
  ROAD_GUIDES.find((g) => (g.a === x && g.b === y) || (g.a === y && g.b === x)) ?? null;

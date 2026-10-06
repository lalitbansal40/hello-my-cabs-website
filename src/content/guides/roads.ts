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
  /**
   * Written but not yet checked by the owner or a driver (7 Oct 2026). A draft is not
   * rendered anywhere — no guide page, no road block or FAQ on the route pages, no sitemap
   * entry. Delete the flag (and add its entry to GUIDES in ./index.ts) once it is confirmed.
   */
  draft?: true;
  /** For a draft: exactly what has to be confirmed before it goes live. */
  check?: string;
}

const ROAD_GUIDES_ALL: ReadonlyArray<RoadGuide> = [
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

  // ── Drafts (7 Oct 2026) — NOT rendered until each is confirmed ─────────────
  {
    slug: 'jaipur-chandigarh-by-road',
    a: 'JAIPUR',
    b: 'CHANDIGARH',
    highway: 'NH48 towards Delhi, the KMP Expressway round it, then NH44',
    via: ['Kotputli', 'Behror', 'Manesar', 'Sonipat', 'Panipat', 'Karnal', 'Ambala', 'Zirakpur'],
    onTheWay: [
      { name: 'Panipat', note: 'the historic battlefield town on the Grand Trunk Road' },
      { name: 'Kurukshetra', note: 'just off the road between Karnal and Ambala' },
    ],
    why: 'Jaipur to the gateway of the hills — Chandigarh, and on to Shimla or Manali.',
    published: '2026-10-07',
    draft: true,
    check:
      'Is this the road the drivers take (round Delhi on the KMP Expressway), or do they go by Narnaul and Rohtak? Are the towns in the right order?',
  },
  {
    slug: 'jaipur-jodhpur-by-road',
    a: 'JAIPUR',
    b: 'JODHPUR',
    highway: 'NH48 to Beawar, then NH25',
    via: ['Kishangarh', 'Ajmer', 'Beawar', 'Bar', 'Bilara'],
    onTheWay: [
      { name: 'Ajmer', note: 'the dargah city, where the road turns west' },
    ],
    why: 'The pink city to the blue city — Mehrangarh fort above Jodhpur.',
    published: '2026-10-07',
    draft: true,
    check:
      'Do the drivers go by Ajmer and Beawar (NH48, then NH25 by Bar and Bilara), or by Nagaur? Highway numbers right?',
  },
  {
    slug: 'jaipur-udaipur-by-road',
    a: 'JAIPUR',
    b: 'UDAIPUR',
    highway: 'NH48',
    via: ['Kishangarh', 'Beawar', 'Bhim', 'Rajsamand'],
    alternative: 'the road by Bhilwara and Chittorgarh',
    onTheWay: [
      { name: 'Rajsamand', note: 'the lake town, an hour short of Udaipur' },
      { name: 'Chittorgarh', note: 'the fort, on the other road by Bhilwara' },
    ],
    why: 'Jaipur to the lakes of Udaipur — often with Chittorgarh on the way.',
    published: '2026-10-07',
    draft: true,
    check:
      'Which of the two roads do the drivers usually take — Beawar and Rajsamand (NH48), or Bhilwara and Chittorgarh? Towns in order?',
  },
  {
    slug: 'delhi-dehradun-by-road',
    a: 'DELHI',
    b: 'DEHRADUN',
    highway: 'the Delhi–Meerut Expressway, then NH334 and NH307',
    via: ['Ghaziabad', 'Meerut', 'Muzaffarnagar', 'Roorkee', 'Chhutmalpur'],
    onTheWay: [
      { name: 'Roorkee', note: 'the canal town, where the Haridwar and Dehradun roads part' },
    ],
    why: 'Delhi to the Doon valley — Dehradun, and Mussoorie above it.',
    published: '2026-10-07',
    draft: true,
    check:
      'Is the new Delhi–Dehradun Expressway (by Baghpat and Saharanpur) the usual way now? If so the road and towns change.',
  },
  {
    slug: 'jaipur-delhi-airport-by-road',
    a: 'JAIPUR',
    b: 'DELHI_AIRPORT',
    highway: 'NH48, the old NH8',
    via: ['Shahpura', 'Kotputli', 'Behror', 'Neemrana', 'Dharuhera', 'Manesar', 'Gurugram'],
    onTheWay: [
      { name: 'Neemrana', note: 'the hill fort above the highway near the Rajasthan–Haryana border' },
      { name: 'Gurugram', note: 'the last city before the airport — a drop on the way is easy' },
    ],
    why: 'Flights out of Delhi — the airport is on the Jaipur side of the city.',
    published: '2026-10-07',
    draft: true,
    check: 'Same road as Jaipur–Delhi up to Gurugram, then the airport road — right?',
  },
];

/** Every road guide, drafts included — for the owner's list of what to confirm. */
export const ALL_ROAD_GUIDES = ROAD_GUIDES_ALL;


/** The guides that are live — every one but the drafts. */
export const ROAD_GUIDES: ReadonlyArray<RoadGuide> = ROAD_GUIDES_ALL.filter((g) => !g.draft);

export const roadGuideBySlug = (slug: string) => ROAD_GUIDES.find((g) => g.slug === slug) ?? null;

/** The road guide covering this pair of cities, either way round. */
export const roadGuideFor = (x: string, y: string) =>
  ROAD_GUIDES.find((g) => (g.a === x && g.b === y) || (g.a === y && g.b === x)) ?? null;

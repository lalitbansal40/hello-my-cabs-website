/**
 * Char Dham packages.
 *
 * SAMPLE DATA — owner's decision (2 Oct 2026): show these dummy packages and prices now, the
 * real ones later. While this is true the page is kept out of search (noindex, not in the
 * sitemap, no schema) so a made-up price is never what Google shows. Set it to false in the
 * same commit that puts the real packages in.
 */
export const CHARDHAM_IS_SAMPLE = true;

export type DhamPackage = {
  slug: string;
  name: string;
  dhams: string[];
  days: number;
  nights: number;
  startsFrom: string;
  /** The halts, in order. */
  route: string[];
  /** Per vehicle, "from" — SAMPLE while CHARDHAM_IS_SAMPLE is true. */
  fromRupees: { vehicle: string; rupees: number }[];
  highlights: string[];
};

export const DHAM_PACKAGES: DhamPackage[] = [
  {
    slug: 'char-dham',
    name: 'Char Dham Yatra',
    dhams: ['Yamunotri', 'Gangotri', 'Kedarnath', 'Badrinath'],
    days: 10,
    nights: 9,
    startsFrom: 'Haridwar',
    route: [
      'Haridwar',
      'Barkot',
      'Janki Chatti (Yamunotri)',
      'Uttarkashi',
      'Gangotri',
      'Guptkashi / Sonprayag (Kedarnath)',
      'Badrinath',
      'Rudraprayag',
      'Haridwar',
    ],
    fromRupees: [
      { vehicle: 'Dzire', rupees: 32000 },
      { vehicle: 'Ertiga', rupees: 38000 },
      { vehicle: 'Innova Crysta', rupees: 48000 },
      { vehicle: 'Tempo Traveller', rupees: 78000 },
    ],
    highlights: ['All four dhams in one run', 'Halts planned around the treks', 'Hill-trained drivers'],
  },
  {
    slug: 'do-dham',
    name: 'Do Dham — Kedarnath & Badrinath',
    dhams: ['Kedarnath', 'Badrinath'],
    days: 6,
    nights: 5,
    startsFrom: 'Haridwar',
    route: ['Haridwar', 'Guptkashi / Sonprayag (Kedarnath)', 'Badrinath', 'Rudraprayag', 'Haridwar'],
    fromRupees: [
      { vehicle: 'Dzire', rupees: 21000 },
      { vehicle: 'Ertiga', rupees: 25000 },
      { vehicle: 'Innova Crysta', rupees: 32000 },
      { vehicle: 'Tempo Traveller', rupees: 52000 },
    ],
    highlights: ['The two most-visited dhams', 'A day for the Kedarnath trek', 'Back in six days'],
  },
  {
    slug: 'kedarnath',
    name: 'Ek Dham — Kedarnath',
    dhams: ['Kedarnath'],
    days: 4,
    nights: 3,
    startsFrom: 'Haridwar',
    route: ['Haridwar', 'Guptkashi', 'Sonprayag (Kedarnath trek)', 'Haridwar'],
    fromRupees: [
      { vehicle: 'Dzire', rupees: 13000 },
      { vehicle: 'Ertiga', rupees: 16000 },
      { vehicle: 'Innova Crysta', rupees: 21000 },
      { vehicle: 'Tempo Traveller', rupees: 34000 },
    ],
    highlights: ['Short and focused', 'Drop and pick-up at Sonprayag', 'Good for a long weekend'],
  },
  {
    slug: 'badrinath',
    name: 'Ek Dham — Badrinath',
    dhams: ['Badrinath'],
    days: 4,
    nights: 3,
    startsFrom: 'Haridwar',
    route: ['Haridwar', 'Rudraprayag', 'Joshimath', 'Badrinath', 'Haridwar'],
    fromRupees: [
      { vehicle: 'Dzire', rupees: 14000 },
      { vehicle: 'Ertiga', rupees: 17000 },
      { vehicle: 'Innova Crysta', rupees: 22000 },
      { vehicle: 'Tempo Traveller', rupees: 36000 },
    ],
    highlights: ['Road all the way to the temple', 'Mana village on the way back', 'Easy for elders'],
  },
];

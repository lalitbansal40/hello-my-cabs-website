/**
 * Rajasthan tour packages.
 *
 * SAMPLE DATA — owner's decision (12 Oct 2026): show these dummy packages and prices now, the
 * real ones later, exactly as Char Dham was (content/chardham). While this is true the page
 * is kept out of search (noindex, not in the sitemap, no schema) so a made-up price is never
 * what Google shows. Set it to false in the same commit that puts the real packages in.
 */
export const RAJASTHAN_IS_SAMPLE = true;

export type TourPackage = {
  slug: string;
  name: string;
  days: number;
  nights: number;
  startsFrom: string;
  /** The places, in order. */
  route: string[];
  /** Per vehicle, "from" — SAMPLE while RAJASTHAN_IS_SAMPLE is true. */
  fromRupees: { vehicle: string; rupees: number }[];
  highlights: string[];
};

const price = (dzire: number, ertiga: number, crysta: number) => [
  { vehicle: 'Dzire', rupees: dzire },
  { vehicle: 'Ertiga', rupees: ertiga },
  { vehicle: 'Innova Crysta', rupees: crysta },
];

export const TOUR_PACKAGES: TourPackage[] = [
  {
    slug: 'pink-city-weekend',
    name: 'Jaipur Pink City Weekend',
    days: 2,
    nights: 1,
    startsFrom: 'Jaipur',
    route: ['Amer Fort', 'Nahargarh', 'City Palace', 'Hawa Mahal', 'Jal Mahal'],
    fromRupees: price(4999, 5999, 7999),
    highlights: [
      'Amer Fort in the morning, before the heat and the crowds',
      'Sunset from Nahargarh over the old city',
      'The bazaars of the walled city on foot, the car waiting',
      'Pickup from your hotel, the station or the airport',
    ],
  },
  {
    slug: 'ajmer-pushkar',
    name: 'Ajmer–Pushkar Darshan',
    days: 2,
    nights: 1,
    startsFrom: 'Jaipur',
    route: ['Jaipur', 'Ajmer', 'Pushkar', 'Jaipur'],
    fromRupees: price(5499, 6499, 8499),
    highlights: [
      'Ajmer Sharif Dargah and the Ana Sagar lake',
      'The Brahma temple and the ghats of Pushkar lake',
      'The evening aarti at Pushkar',
      'Back in Jaipur on the second evening',
    ],
  },
  {
    slug: 'lakes-and-forts',
    name: 'Lakes & Forts',
    days: 5,
    nights: 4,
    startsFrom: 'Jaipur',
    route: ['Jaipur', 'Chittorgarh', 'Udaipur', 'Kumbhalgarh', 'Jaipur'],
    fromRupees: price(17999, 21999, 27999),
    highlights: [
      'Chittorgarh, the largest fort in India',
      'Udaipur — the City Palace and a boat on Lake Pichola',
      'The walls of Kumbhalgarh',
      'One car and one driver for all five days',
    ],
  },
  {
    slug: 'royal-rajasthan',
    name: 'Royal Rajasthan Circuit',
    days: 7,
    nights: 6,
    startsFrom: 'Jaipur',
    route: ['Jaipur', 'Jodhpur', 'Jaisalmer', 'Udaipur', 'Jaipur'],
    fromRupees: price(27999, 33999, 42999),
    highlights: [
      'Mehrangarh Fort over the blue city of Jodhpur',
      'A night by the dunes near Jaisalmer',
      'The lakes and palaces of Udaipur',
      'A driver who has run the whole circuit before',
    ],
  },
  {
    slug: 'ranthambore',
    name: 'Ranthambore Wildlife',
    days: 2,
    nights: 1,
    startsFrom: 'Jaipur',
    route: ['Jaipur', 'Sawai Madhopur (Ranthambore)', 'Jaipur'],
    fromRupees: price(5999, 6999, 8999),
    highlights: [
      'Dropped at the park gate for the morning or the afternoon safari',
      'Ranthambore Fort inside the park',
      'Back in Jaipur the next evening',
      'Safari permits booked by you, on the forest department site',
    ],
  },
  {
    slug: 'mount-abu',
    name: 'Udaipur–Mount Abu',
    days: 3,
    nights: 2,
    startsFrom: 'Udaipur',
    route: ['Udaipur', 'Mount Abu', 'Udaipur'],
    fromRupees: price(8999, 10999, 13999),
    highlights: [
      'The Dilwara temples',
      'Nakki lake and the sunset point',
      'The only hill station in Rajasthan, a cool break in summer',
      'Starts and ends in Udaipur',
    ],
  },
];

/** What every package covers, and what it does not — the same rule as every trip on the site. */
export const TOUR_INCLUDED = [
  'The car and the driver, for every day of the tour',
  'Fuel',
  'Driver allowance and his stay',
];
export const TOUR_NOT_INCLUDED = [
  'GST, 5% on top of the fare',
  'Hotels and meals',
  'Entry tickets and safari permits',
  'Toll, parking and state tax, as they arise',
];

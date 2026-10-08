/**
 * The company's own details, in one place.
 *
 * Everything here has to be true, because it appears on the contact page, in the
 * LocalBusiness schema, and on the payment provider's record of us. So the fields I was
 * not given are `null` rather than plausible-looking filler: a page that shows no address
 * is incomplete, but a page that shows the wrong address is worse — people turn up at it.
 *
 * TO FILL IN: email. It renders itself the moment it stops being null; nothing else changes.
 *
 * The address is the Google Business Profile's ("Hello My Cab -Taxi service in jaipur",
 * 4.7★, 156 reviews; its Website link is this site — the owner's own profile, 7 Oct 2026),
 * word for word, so the name, address and phone read the same everywhere Google looks.
 */
export const company = {
  name: 'Hello My Cab',
  /**
   * The other ways people write the name — what they type when they search for us, and
   * what Google may show as the site's name (WebSite.alternateName). Only spellings of
   * this name; never another brand's.
   */
  alternateNames: ['HelloMyCab', 'Hello My Cabs', 'HelloMyCabs'] as readonly string[],
  phone: '+91 96671 11921',
  /** tel: needs it unspaced. */
  phoneHref: 'tel:+919667111921',
  hours: 'Every day, around the clock',

  /**
   * The profiles that are demonstrably this company, for `sameAs` in the structured data.
   *
   * This is how a search engine joins the website, the Play Store listing and the Google
   * Business Profile into one entity rather than three mentions of a similar name — and it
   * is the single cheapest thing on this list to fill in. A URL here that turns out to be
   * somebody else's page does the opposite, so each one has to be checked before it is
   * added.
   */
  sameAs: [
    // The Android app, checked 3 Oct 2026: "Hello My Cab - Apps on Google Play", the same
    // package the app repo builds (com.hellomycab.hello_my_cab_app).
    'https://play.google.com/store/apps/details?id=com.hellomycab.hello_my_cab_app',
    // The Google Business Profile, by its Knowledge Graph id — what the owner's share link
    // (share.google/8gmnhT0ikL2o3DMOT, 7 Oct 2026) resolves to.
    'https://www.google.com/search?kgmid=/g/11txkmqf6s',
    // The owner's own Instagram and Facebook (8 Oct 2026) — the same two the WhatsApp
    // broadcast prints. The Facebook share link resolves to this profile.
    'https://www.instagram.com/hellomycabjaipur',
    'https://www.facebook.com/people/Hello-My-Cab/100095184243227/',
  ] as readonly string[],

  /**
   * Confirmed: the backend sends this number the owner's WhatsApp alert for every website
   * enquiry, and those are delivered. Country code, no spaces — wa.me takes nothing else.
   */
  whatsapp: '919667111921' as string | null,
  email: null as string | null,
  /** As printed on the site — the Business Profile's address. */
  registeredAddress: 'Plot no 5, Chinab Apartment Rd, Sector 28, Pratap Nagar, Jaipur, Rajasthan 302033' as
    | string
    | null,
  /**
   * The Business Profile's rating, as TEXT on the home and city pages, with the month it was
   * read — never in the structured data (Google ignores a business's own rating there, and a
   * number that goes stale misleads). Null until the owner says to show it; then set it by
   * hand from the profile, e.g. { value: 4.7, count: 156, asOf: 'October 2026' }, and update
   * or clear it when it changes.
   */
  googleRating: null as { value: number; count: number; asOf: string } | null,
  /**
   * The Business Profile's "Ask for reviews" link (g.page/r/…/review). Null until the owner
   * sends it; then the contact page and completed bookings offer "Rate us on Google"
   * (components/site/RateUs.tsx). The backend's review-request WhatsApp uses the same link
   * (GBP_REVIEW_URL).
   */
  reviewUrl: null as string | null,
  /** The Business Profile on Google Maps — directions, photos, reviews. */
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hello+My+Cab+-Taxi+service+in+jaipur',
  /** The same address, in parts, for the structured data. */
  postalAddress: {
    streetAddress: 'Plot no 5, Chinab Apartment Rd, Sector 28, Pratap Nagar',
    addressLocality: 'Jaipur',
    addressRegion: 'Rajasthan',
    postalCode: '302033',
    addressCountry: 'IN',
  } as {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  } | null,
} as const;

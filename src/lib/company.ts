/**
 * The company's own details, in one place.
 *
 * Everything here has to be true, because it appears on the contact page, in the
 * LocalBusiness schema, and on the payment provider's record of us. So the fields I was
 * not given are `null` rather than plausible-looking filler: a page that shows no address
 * is incomplete, but a page that shows the wrong address is worse — people turn up at it.
 *
 * TO FILL IN: registeredAddress, email, whatsapp (once confirmed the number is on
 * WhatsApp). Each renders itself the moment it stops being null; nothing else changes.
 */
export const company = {
  name: 'Hello My Cab',
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
  sameAs: [] as readonly string[],

  /** Not yet confirmed to be a WhatsApp number — see the note above. */
  whatsapp: null as string | null,
  email: null as string | null,
  registeredAddress: null as string | null,
} as const;

import { env } from './env';
import { company } from './company';

/**
 * JSON-LD. This is how a price becomes a rich result rather than a plain blue link, and —
 * increasingly the bigger prize — how an answer engine works out that "Hello My Cab" is one
 * company rather than a phrase on a page.
 *
 * Everything here must describe what is genuinely on the page. Marking up a price the
 * visitor cannot actually get is grounds for a manual penalty, not just a lost snippet.
 *
 * Two things are deliberate and easy to undo by accident:
 *
 * 1. Every node hangs off two @ids — the organisation and the site. A graph of nodes that
 *    point at each other is read as one entity; the same facts repeated as unconnected
 *    islands on 115 pages are read as 115 unrelated mentions.
 * 2. A field with nothing behind it is left out entirely rather than emitted empty. An
 *    address we do not have is not `""`; it is absent until somebody fills it in.
 */

export const ORG_ID = `${env.siteUrl}/#organization`;
export const SITE_ID = `${env.siteUrl}/#website`;

/** `+91 96671 11921` → `+919667111921`. Schema wants E.164, not something to read. */
const E164 = company.phone.replace(/[^\d+]/g, '');

/** Every day, all day — what the site promises ("every day, around the clock"). */
const ALL_DAY = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  opens: '00:00',
  closes: '23:59',
};

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    // A taxi service is what the company is, and TaxiService is an Organization (by way of
    // LocalBusiness) — so one node, on every page, is both. Typed so only now that it has
    // the address a LocalBusiness needs (the Business Profile's, 7 Oct 2026).
    '@type': company.postalAddress ? 'TaxiService' : 'Organization',
    '@id': ORG_ID,
    name: company.name,
    alternateName: [...company.alternateNames],
    url: env.siteUrl,
    // An ImageObject rather than a bare URL: it survives being read by things that want
    // dimensions, and the file itself now exists — it used to 404, which meant the one
    // image a knowledge panel would have used could not be fetched at all.
    logo: {
      '@type': 'ImageObject',
      url: `${env.siteUrl}/logo.png`,
      width: 512,
      height: 512,
    },
    image: `${env.siteUrl}/logo.png`,
    telephone: E164,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: E164,
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
      // The phone is answered round the clock — the site says so on every page.
      hoursAvailable: ALL_DAY,
    },
    areaServed: { '@type': 'Country', name: 'India' },
    // Left out until they are real. An `address` we do not have, and a `sameAs` pointing
    // nowhere, are worse than their absence: both get checked.
    ...(company.postalAddress
      ? {
          address: { '@type': 'PostalAddress', ...company.postalAddress },
          openingHoursSpecification: ALL_DAY,
          priceRange: '₹₹',
        }
      : company.registeredAddress
        ? { address: company.registeredAddress }
        : {}),
    ...(company.sameAs.length > 0 ? { sameAs: [...company.sameAs] } : {}),
  };
}

/**
 * The customers' rating, as printed in the rating block on the same page
 * (components/landing/RatingSummary.tsx) — the backend's count of real customer ratings.
 *
 * Only ever passed when that block is showing (lib/reviews.ts — 5 ratings or more). A rating
 * in the markup that the page does not show, or one built from a couple of reviews, is the
 * kind of structured data that gets a site's markup ignored altogether — and a made-up one
 * is a manual penalty. On a route it sits on the Product (serviceSchema), where a result's
 * stars are read from.
 */
function aggregateRating(rating?: { count: number; average: number | null } | null) {
  if (!rating || rating.average == null) return {};
  return {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.average,
      ratingCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITE_ID,
    // The name Google shows above the result is read from here — with the other spellings,
    // so "HelloMyCab" or "Hello My Cabs" in a search is recognised as this site.
    name: company.name,
    alternateName: [...company.alternateNames],
    url: env.siteUrl,
    inLanguage: 'en-IN',
    publisher: { '@id': ORG_ID },
  };
}

/**
 * What is actually offered on a route or vehicle page: a service with a price range, not a
 * product.
 *
 * This was `Product` with a single `Offer` — the markup Google reads for things in a shop:
 * merchant listings, stock, shipping. A cab journey is a service, and typing it as one is
 * both truthful and the only way to describe what the page shows: eight vehicles from
 * ₹3,200 to ₹21,420 is an AggregateOffer, not one price.
 */
export function serviceSchema({
  name,
  description,
  path,
  serviceType,
  areaServed,
  offers,
  rating,
  image,
  photo,
}: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
  /** The page's own picture — a route's map (app/[slug]/map.svg). */
  image?: string;
  /**
   * The route's raster card (its opengraph-image, also shown on the page) — listed first,
   * because a search result's thumbnail is taken from a photo, not an SVG (9 Oct 2026).
   */
  photo?: string;
  /** The city names this page is about — both ends of a route, or the one city. */
  areaServed: string[];
  /** Every vehicle priced on the page. These must be the figures printed on it. */
  offers: Array<{ name: string; price: number }>;
  /** Only when the page shows its rating block (5 or more real ratings). */
  rating?: { count: number; average: number | null } | null;
}) {
  const priced = offers.filter((o) => o.price > 0);
  const prices = priced.map((o) => o.price);
  const url = `${env.siteUrl}${path}`;
  const images = [photo, image].filter(Boolean).map((p) => `${env.siteUrl}${p}`);
  const aggregateOffer =
    prices.length > 0
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'INR',
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          offerCount: prices.length,
          availability: 'https://schema.org/InStock',
          url,
          offers: priced.map((o) => ({
            '@type': 'Offer',
            name: o.name,
            price: o.price,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            url,
          })),
        }
      : null;

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name,
    description,
    serviceType,
    url,
    provider: { '@id': ORG_ID },
    isPartOf: { '@id': SITE_ID },
    areaServed: areaServed.map((city) => ({ '@type': 'City', name: city })),
    ...(images.length ? { image: images } : {}),
    ...(aggregateOffer ? { offers: aggregateOffer } : {}),
  };
  if (!aggregateOffer) return service;

  /*
   * The same journey as a Product (9 Oct 2026, owner D2) — the markup the results above ours
   * use, and the one a result's "Starting from ₹X" line is read from. Same name, same offers,
   * same picture: one set of figures, said twice in the two vocabularies Google reads. The
   * rating sits here only, and only when the page shows its rating block.
   */
  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name,
    description,
    url,
    brand: { '@type': 'Brand', name: 'Hello My Cab' },
    ...(images.length ? { image: images } : {}),
    offers: aggregateOffer,
    ...aggregateRating(rating),
  };
  return [service, product];
}

/**
 * A city page describes the company operating in that city, which is what a local query is
 * asking about. `TaxiService` is the precise type and inherits from LocalBusiness, so being
 * specific costs nothing.
 */
export function taxiServiceSchema({
  city,
  path,
  fromRupees,
  rating,
  image,
}: {
  city: string;
  path: string;
  fromRupees?: number;
  /** The city's route map (app/[slug]/map.svg). */
  image?: string;
  /** Only when the page shows its reviews block. */
  rating?: { count: number; average: number | null } | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    '@id': `${env.siteUrl}${path}#service`,
    name: `${company.name} — ${city}`,
    url: `${env.siteUrl}${path}`,
    provider: { '@id': ORG_ID },
    isPartOf: { '@id': SITE_ID },
    telephone: E164,
    areaServed: { '@type': 'City', name: city },
    priceRange: '₹₹',
    openingHoursSpecification: ALL_DAY,
    ...(image ? { image: `${env.siteUrl}${image}` } : {}),
    // Where the company is — the same office serves every city it drives from.
    ...(company.postalAddress
      ? { address: { '@type': 'PostalAddress', ...company.postalAddress } }
      : {}),
    ...aggregateRating(rating),
    ...(fromRupees
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: fromRupees,
            availability: 'https://schema.org/InStock',
            url: `${env.siteUrl}${path}`,
          },
        }
      : {}),
  };
}

/**
 * The page itself, with the day its fares were read (components/site/FaresChecked.tsx) —
 * `dateModified` belongs to the page, not to the Service it describes.
 */
export function webPageSchema({
  path,
  name,
  modified,
  about,
}: {
  path: string;
  name: string;
  modified: Date;
  /** The @id of what the page is about — the route's Service, the city's TaxiService. */
  about?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${env.siteUrl}${path}#webpage`,
    url: `${env.siteUrl}${path}`,
    name,
    dateModified: modified.toISOString(),
    isPartOf: { '@id': SITE_ID },
    ...(about ? { about: { '@id': about } } : {}),
  };
}

/**
 * Questions and answers.
 *
 * Google stopped showing FAQ rich results — restricted to government and health sites in
 * 2023, withdrawn entirely in May 2026 — so this earns no snippet any more. It stays
 * because answer engines read it: an AI summary that quotes this site quotes these
 * answers. Do not delete it looking for a rich result; there was never going to be one.
 */
export function faqSchema(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    isPartOf: { '@id': SITE_ID },
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function breadcrumbSchema(trail: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${env.siteUrl}${t.path}`,
    })),
  };
}

/**
 * A guide. `author` and `publisher` are the organisation rather than a person, because that
 * is who stands behind the figures — and the dates are real, so a guide that is updated
 * says so rather than pretending to be new.
 */
export function articleSchema({
  headline,
  description,
  path,
  published,
  updated,
  image,
}: {
  headline: string;
  description: string;
  path: string;
  published: string;
  updated: string;
  /** The guide's own cover picture (lib/images GUIDE_IMAGES), else the logo. */
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    datePublished: published,
    dateModified: updated,
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': SITE_ID },
    mainEntityOfPage: `${env.siteUrl}${path}`,
    image: `${env.siteUrl}${image ?? '/logo.png'}`,
    inLanguage: 'en-IN',
  };
}

/** Renders a block. Next escapes the string, so this is safe for server-built data. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

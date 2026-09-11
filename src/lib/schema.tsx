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

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: company.name,
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
    },
    areaServed: { '@type': 'Country', name: 'India' },
    // Left out until they are real. An `address` we do not have, and a `sameAs` pointing
    // nowhere, are worse than their absence: both get checked.
    ...(company.registeredAddress ? { address: company.registeredAddress } : {}),
    ...(company.sameAs.length > 0 ? { sameAs: [...company.sameAs] } : {}),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: company.name,
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
}: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
  /** The city names this page is about — both ends of a route, or the one city. */
  areaServed: string[];
  /** Every vehicle priced on the page. These must be the figures printed on it. */
  offers: Array<{ name: string; price: number }>;
}) {
  const priced = offers.filter((o) => o.price > 0);
  const prices = priced.map((o) => o.price);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${env.siteUrl}${path}#service`,
    name,
    description,
    serviceType,
    url: `${env.siteUrl}${path}`,
    provider: { '@id': ORG_ID },
    isPartOf: { '@id': SITE_ID },
    areaServed: areaServed.map((city) => ({ '@type': 'City', name: city })),
    ...(prices.length > 0
      ? {
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'INR',
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            offerCount: prices.length,
            offers: priced.map((o) => ({
              '@type': 'Offer',
              name: o.name,
              price: o.price,
              priceCurrency: 'INR',
              availability: 'https://schema.org/InStock',
              url: `${env.siteUrl}${path}`,
            })),
          },
        }
      : {}),
  };
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
}: {
  city: string;
  path: string;
  fromRupees?: number;
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
}: {
  headline: string;
  description: string;
  path: string;
  published: string;
  updated: string;
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
    image: `${env.siteUrl}/logo.png`,
    inLanguage: 'en-IN',
  };
}

/** Renders a block. Next escapes the string, so this is safe for server-built data. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

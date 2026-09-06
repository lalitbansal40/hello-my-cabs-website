import { env } from './env';

/**
 * JSON-LD. This is how a price, a rating or an FAQ becomes a rich result rather than a
 * plain blue link — and rich results are clicked far more often at the same position.
 *
 * Everything here must describe what is genuinely on the page. Marking up a price the
 * visitor cannot actually get is grounds for a manual penalty, not just a lost snippet.
 */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Hello My Cab',
    url: env.siteUrl,
    logo: `${env.siteUrl}/logo.png`,
  };
}

export function faqSchema(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
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

/** Renders a block. Next escapes the string, so this is safe for server-built data. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

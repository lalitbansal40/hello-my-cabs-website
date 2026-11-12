import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { SITEMAP_GROUPS } from '@/lib/sitemap-entries';

/**
 * Preview deployments must NOT be indexed. Two copies of the same pages competing for the
 * same queries is a self-inflicted ranking problem, and it is easy to leave running for
 * months without noticing.
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction = env.siteUrl === 'https://www.hellomycabs.com';
  return {
    rules: isProduction
      ? { userAgent: '*', allow: '/' }
      : { userAgent: '*', disallow: '/' },
    // The full list first (what Search Console has read since launch), then the same pages
    // one kind per file (app/sitemaps/sitemap.ts, 13 Nov 2026).
    sitemap: [
      `${env.siteUrl}/sitemap.xml`,
      ...SITEMAP_GROUPS.map((g) => `${env.siteUrl}/sitemaps/sitemap/${g}.xml`),
    ],
  };
}

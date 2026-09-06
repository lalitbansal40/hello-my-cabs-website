import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

/**
 * Preview deployments must NOT be indexed. Two copies of the same pages competing for the
 * same queries is a self-inflicted ranking problem, and it is easy to leave running for
 * months without noticing.
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction = env.siteUrl.includes('hellomycabs.com');
  return {
    rules: isProduction
      ? { userAgent: '*', allow: '/' }
      : { userAgent: '*', disallow: '/' },
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}

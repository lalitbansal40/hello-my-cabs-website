import type { MetadataRoute } from 'next';
import { sitemapEntries } from '@/lib/sitemap-entries';

/**
 * Every page the site asks to have indexed, in one list — the sitemap Search Console has
 * read since launch, and the one the site's own checks and IndexNow read. Built in
 * lib/sitemap-entries.ts, where the rules for what belongs in it live; the same pages are
 * also split by kind in app/sitemaps/sitemap.ts (13 Nov 2026).
 */
export const revalidate = 86_400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return (await sitemapEntries()).map((t) => t.entry);
}

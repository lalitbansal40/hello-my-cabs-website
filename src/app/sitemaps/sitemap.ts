import type { MetadataRoute } from 'next';
import { SITEMAP_GROUPS, sitemapEntries, type SitemapGroup } from '@/lib/sitemap-entries';

/**
 * The same pages as /sitemap.xml, one kind per file (13 Nov 2026) —
 * /sitemaps/sitemap/{core,cities,routes,vehicles,guides}.xml.
 *
 * Search Console reports how many pages of each submitted sitemap are indexed. With one list
 * of 145 it could only say "1 indexed"; per group it says whether it is the routes, the
 * cities or the cars Google is holding back. Listed in robots.txt; submit each once in
 * Search Console.
 */
export const revalidate = 86_400;

export async function generateSitemaps() {
  return SITEMAP_GROUPS.map((id) => ({ id }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = (await props.id) as SitemapGroup;
  return (await sitemapEntries()).filter((t) => t.group === id).map((t) => t.entry);
}

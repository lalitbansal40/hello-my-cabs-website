import { HINDI_LIVE, TIER1_CITIES, TIER1_ROUTES } from './indexing-tiers';
import { cityPath, routePath } from './slug';

/**
 * Which pages have a Hindi copy, and what links them (21 Nov 2026, PROMPT_RANK_21NOV Step 9).
 * The Tier 1 routes and cities that have Hindi names, and the Jaipur Airport page.
 */
export function hindiEnglishPaths(hiNames: Readonly<Record<string, string>>): string[] {
  return [
    '/',
    '/jaipur-airport-taxi',
    ...TIER1_CITIES.filter((c) => hiNames[c]).map(cityPath),
    ...TIER1_ROUTES.filter(([a, b]) => hiNames[a] && hiNames[b]).map(([a, b]) => routePath(a, b)),
  ];
}

export const hiPath = (enPath: string) => (enPath === '/' ? '/hi' : `/hi${enPath}`);

/** Robots for a /hi page: indexable only once HINDI_LIVE. */
export const hindiRobots = (live: boolean = HINDI_LIVE) =>
  live ? undefined : ({ index: false, follow: true } as const);

/**
 * hreflang for a page — both ways — only once the Hindi pages are live. Until then nothing:
 * an hreflang pointing at a noindex page is an error Search Console reports.
 */
export function hreflangFor(
  enPath: string,
  hasHindi: boolean,
  live: boolean = HINDI_LIVE,
): { languages: Record<string, string> } | Record<string, never> {
  if (!live || !hasHindi) return {};
  return { languages: { 'en-IN': enPath, 'hi-IN': hiPath(enPath) } };
}

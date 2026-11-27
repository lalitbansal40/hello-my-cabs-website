import { cityPath, cityPageName, cityTitle, routePath, vehiclePath } from './slug';
import { OWN_PAGE } from './city-pages';

/**
 * Tier 1 — the pages Search Console shows people already asking for (13 Nov 2026,
 * docs/seo/PLAN_INDEX_AND_RANK_13NOV.md §1). On a new domain Google trusts a few pages
 * first and the rest later, so these are linked from the home page by their own names, and
 * the crawl audit (scripts/seo/crawl-audit.py --only) checks them as a group.
 *
 * What put each here, from the 3-month export: Kota ("one way taxi service in kota", pos
 * 2.4, 96 impressions; "kota taxi service", 85), Jaipur–Delhi ("delhi jaipur taxi", 115;
 * "jaipur delhi cab", 98), Jaipur and Delhi city searches, the Delhi-airport and Agra,
 * Chandigarh, Haridwar runs, Sikar (Khatu Shyam and Reengus searches land there), and the
 * two cars most asked for. Only pages that exist are ever linked: a pair or city the
 * catalogue no longer lists simply drops out.
 *
 * Keys are the backend's city keys, as everywhere else on the site.
 */
// The lists live in indexing-tiers.ts (20 Nov 2026), the one place tiers are decided.
export { TIER1_CITIES, TIER1_ROUTES, TIER1_VEHICLES } from './indexing-tiers';
import { TIER1_CITIES, TIER1_ROUTES, TIER1_VEHICLES } from './indexing-tiers';

/** How a Tier 1 car is named in the link, in the words people search with. */
const CAR_LABEL: Record<string, string> = {
  crysta: 'Innova Crysta taxi',
  dzire: 'Dzire taxi',
  ertiga: 'Ertiga taxi',
  tt_12: 'Tempo Traveller 12 seater',
};

export interface Tier1Link {
  href: string;
  label: string;
}

/**
 * The Tier 1 links that exist right now: cities with a page, routes the catalogue lists,
 * the two cars. `label` is what somebody searching would call the page.
 */
export function tier1Links({
  routes,
  cityPages,
  vehicles,
}: {
  routes: ReadonlyArray<{ pickup: string; drop: string }>;
  cityPages: ReadonlySet<string>;
  /** Vehicle keys that have a page. */
  vehicles: ReadonlySet<string>;
}): { cities: Tier1Link[]; routes: Tier1Link[]; vehicles: Tier1Link[] } {
  const listed = new Set(routes.map((r) => `${r.pickup}>${r.drop}`));
  return {
    cities: [
      ...TIER1_CITIES.filter((c) => cityPages.has(c)).map((c) => ({
        href: cityPath(c),
        // "Taxi service in Kota" — the words the searches use, not the page's H1.
        label: cityPageName(c).replace(/^Cab service in /, 'Taxi service in '),
      })),
      // A place with a page of its own (21 Nov 2026) — once the catalogue has its routes.
      ...Object.entries(OWN_PAGE)
        .filter(([c]) => routes.some((r) => r.pickup === c))
        .map(([c, href]) => ({ href, label: `${cityTitle(c)} taxi` })),
    ],
    routes: TIER1_ROUTES.filter(([a, b]) => listed.has(`${a}>${b}`)).map(([a, b]) => ({
      href: routePath(a, b),
      label: `${cityTitle(a)} to ${cityTitle(b)} cab`,
    })),
    vehicles: TIER1_VEHICLES.filter((v) => vehicles.has(v)).map((v) => ({
      href: vehiclePath(v),
      label: CAR_LABEL[v] ?? `${cityTitle(v)} taxi`,
    })),
  };
}

/** Every Tier 1 path, for the crawl audit and the sitemap's ordering. */
export function tier1Paths(links: ReturnType<typeof tier1Links>): string[] {
  return ['/', '/routes', ...links.cities, ...links.routes, ...links.vehicles].map((l) =>
    typeof l === 'string' ? l : l.href,
  );
}

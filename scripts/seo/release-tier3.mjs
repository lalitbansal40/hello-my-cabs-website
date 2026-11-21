#!/usr/bin/env node
/**
 * Which Tier 3 routes to release next (20 Nov 2026, docs/seo/PLAN_INDEXING_20NOV.md §F3).
 *
 *   node scripts/seo/release-tier3.mjs --count 25 --gsc <Performance export folder or Pages.csv>
 *   node scripts/seo/release-tier3.mjs --count 25 --gsc <…> --demand   # also ask the API
 *
 * Prints the next routes to take out of TIER3_ROUTES (src/lib/indexing-tiers.ts): most Search
 * Console impressions first, then — with --demand — most trips in the last 90 days
 * (/public/route-insights). It changes nothing: a person reads the list, checks the gate in
 * indexing-tiers.ts (Tier 1 ≥ 80% indexed, "Discovered" not rising) and commits the removal.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const count = Number(opt('--count', '25'));
const gsc = opt('--gsc', null);
const withDemand = args.includes('--demand');
const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.hellomycabs.com/api/v1';

// The Tier 3 list, read from the source so this can never disagree with the site.
const src = readFileSync(new URL('../../src/lib/indexing-tiers.ts', import.meta.url), 'utf8');
const block = src.slice(src.indexOf('export const TIER3_ROUTES'));
const tier3 = [...block.slice(0, block.indexOf('];')).matchAll(/\['([A-Z_]+)', '([A-Z_]+)'\]/g)].map(
  (m) => [m[1], m[2]],
);
const slug = (k) => k.toLowerCase().replace(/_/g, '-');
const pathOf = ([a, b]) => `/${slug(a)}-to-${slug(b)}-cab`;

const impressions = new Map();
if (gsc) {
  const file = existsSync(gsc) && statSync(gsc).isDirectory() ? join(gsc, 'Pages.csv') : gsc;
  for (const line of readFileSync(file, 'utf8').split('\n').slice(1)) {
    const cells = line.split(',');
    if (cells.length < 3) continue;
    try {
      impressions.set(new URL(cells[0]).pathname, Number(cells[2]) || 0);
    } catch {
      /* not a URL row */
    }
  }
}

const demand = new Map();
if (withDemand) {
  for (const r of tier3) {
    const res = await fetch(`${API}/public/route-insights?pickup=${r[0]}&drop=${r[1]}`).catch(() => null);
    const body = res && (await res.json().catch(() => null));
    demand.set(pathOf(r), body?.data?.demand ?? 0);
  }
}

const ranked = tier3
  .map((r) => ({ route: r, path: pathOf(r), impr: impressions.get(pathOf(r)) ?? 0, trips: demand.get(pathOf(r)) ?? 0 }))
  .sort((x, y) => y.impr - x.impr || y.trips - x.trips || x.path.localeCompare(y.path))
  .slice(0, count);

console.log(`Tier 3 routes: ${tier3.length}. Next ${ranked.length} to release:\n`);
for (const r of ranked) console.log(`  ['${r.route[0]}', '${r.route[1]}'],  ${r.path}  impressions ${r.impr}${withDemand ? `  trips ${r.trips}` : ''}`);
console.log('\nRemove these lines from TIER3_ROUTES (src/lib/indexing-tiers.ts) only if the gate there is met.');

/**
 * The tier lists, read from src/lib/indexing-tiers.ts (the one place tiers are decided), for
 * the plain-Node SEO scripts that cannot import TypeScript. Paths are built the way
 * src/lib/slug.ts builds them — a test (scripts/test/rank.mjs) checks the two agree.
 */
import { readFileSync } from 'node:fs';

const SOURCE = new URL('../../../src/lib/indexing-tiers.ts', import.meta.url);

export const readTiersSource = () => readFileSync(SOURCE, 'utf8');

/** The array literal after `export const NAME`, as text. */
function block(src, name) {
  const at = src.indexOf(`export const ${name}`);
  if (at === -1) return '';
  const start = src.indexOf('= [', at);
  const end = src.indexOf('];', start);
  return start === -1 || end === -1 ? '' : src.slice(start, end);
}

export const pairsOf = (src, name) =>
  [...block(src, name).matchAll(/\[\s*'([A-Z_]+)',\s*'([A-Z_]+)'\s*\]/g)].map((m) => [m[1], m[2]]);
export const stringsOf = (src, name) => [...block(src, name).matchAll(/'([^']+)'/g)].map((m) => m[1]);

const VEHICLE_SLUG = {
  crysta: 'innova-crysta',
  tt_12: 'tempo-traveller-12-seater',
  tt_14: 'tempo-traveller-14-seater',
  tt_16: 'tempo-traveller-16-seater',
  urbania: 'force-urbania',
};
const dash = (k) => k.toLowerCase().replace(/_/g, '-');
export const routePath = (a, b) => `/${dash(a)}-to-${dash(b)}-cab`;
export const cityPath = (c) => `/cab-service-in-${dash(c)}`;
export const vehiclePath = (key) =>
  key.startsWith('tt_') || key === 'urbania'
    ? `/${VEHICLE_SLUG[key] ?? dash(key)}-rental`
    : `/${VEHICLE_SLUG[key] ?? dash(key)}-taxi`;

/** Every Tier 1 path, in the order the source lists them. */
export function tier1Paths(src = readTiersSource()) {
  return [
    ...stringsOf(src, 'TIER1_OTHER_PATHS'),
    ...stringsOf(src, 'TIER1_CITIES').map(cityPath),
    ...pairsOf(src, 'TIER1_ROUTES').map(([a, b]) => routePath(a, b)),
    ...stringsOf(src, 'TIER1_VEHICLES').map(vehiclePath),
  ];
}

/**
 * Wave 1 (27 Nov 2026, PROMPT_INDEX_RANK_27NOV Step 6): the only pages offered for indexing —
 * the Tier 1 lists. Legal pages are indexable but not part of the wave (not in sitemaps).
 */
export const wave1Paths = (src = readTiersSource()) => [
  ...new Set([...tier1Paths(src), ...stringsOf(src, 'TIER1_GUIDES').map((g) => `/guides/${g}`)]),
];
export const wave1RoutePaths = (src = readTiersSource()) =>
  pairsOf(src, 'TIER1_ROUTES').map(([a, b]) => routePath(a, b));

/** The routes a wave holds (27 Nov 2026: TIER3_ROUTES is no longer a literal list). */
export const wavePairs = (src, wave) =>
  pairsOf(src, wave === 2 ? 'WAVE2_ROUTES' : wave === 3 ? 'WAVE3_ROUTES' : 'NO_DEMAND_ROUTES');
export const tier3Pairs = (src = readTiersSource()) => [...wavePairs(src, 2), ...wavePairs(src, 3), ...wavePairs(src, 'none')];

/** The waves already released (RELEASED_WAVES in indexing-tiers.ts). */
export function releasedWaves(src = readTiersSource()) {
  const m = /export const RELEASED_WAVES = \[([^\]]*)\]/.exec(src);
  return m ? [...m[1].matchAll(/\d/g)].map((x) => Number(x[0])) : [];
}

/** The same source with `wave` added to RELEASED_WAVES — the only edit release-wave makes. */
export function withReleasedWave(src, wave) {
  const now = releasedWaves(src);
  if (now.includes(wave)) return src;
  const next = [...now, wave].sort();
  return src.replace(/export const RELEASED_WAVES = \[[^\]]*\]/, `export const RELEASED_WAVES = [${next.join(', ')}]`);
}

#!/usr/bin/env node
/**
 * Open the next wave of route pages for indexing (27 Nov 2026,
 * docs/seo/PROMPT_INDEX_RANK_27NOV.md Step 10). Replaces release-tier3.mjs.
 *
 *   node scripts/seo/release-wave.mjs --wave 2 --coverage <Pages export> [--prev-coverage <last week>]
 *        [--check <base-url>] [--max-overlap 0.25] [--apply]
 *
 * Wave 2 opens only when Wave 1 (the Tier 1 pages) is ≥ 80% indexed and "Discovered – not
 * indexed" is not rising against last week; Wave 3 only after Wave 2 was released and its own
 * routes are ≥ 80% indexed. Fare-held, twin and no-demand routes are never in a wave.
 * --check measures the wave's route pages (scripts/seo/page-quality.mjs) on a running build and
 * refuses if two of them — or one of them and a Wave 1 route — read alike above --max-overlap.
 * Without --apply nothing changes. With --apply the only edit is RELEASED_WAVES in
 * src/lib/indexing-tiers.ts; then run the tests, commit, deploy and resubmit the sitemaps.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { pairsOf, stringsOf, readTiersSource, routePath, wavePairs, releasedWaves, withReleasedWave, wave1Paths as tier1Paths, wave1RoutePaths } from './lib/tiers.mjs';

export function waveCandidates(src, wave) {
  const k = ([a, b]) => `${a}>${b}`;
  const never = new Set([...pairsOf(src, 'FARE_HOLD'), ...pairsOf(src, 'NO_DEMAND_ROUTES')].map(k));
  return wavePairs(src, wave).filter((p) => !never.has(k(p)));
}

/** Can `wave` open? Returns { ok, why }. */
export function gateFor({ src, wave, cov, wavePaths }) {
  if (![2, 3].includes(wave)) return { ok: false, why: 'only waves 2 and 3 exist' };
  const released = releasedWaves(src);
  if (released.includes(wave)) return { ok: false, why: `wave ${wave} is already released` };
  if (wave === 3 && !released.includes(2)) return { ok: false, why: 'wave 3 waits for wave 2' };
  if (!cov) return { ok: false, why: 'needs --coverage <Search Console Pages export>: the gate decides, not this script' };
  if (wave === 2) {
    if (cov.share < 0.8) return { ok: false, why: `Gate not met: Wave 1 ${cov.tier1Indexed}/${cov.tier1Total} indexed (< 80%)` };
  } else {
    const share = wavePaths.length ? wavePaths.filter((p) => cov.isIndexed(p)).length / wavePaths.length : 0;
    if (share < 0.8) return { ok: false, why: `Gate not met: Wave 2 ${Math.round(share * 100)}% indexed (< 80%)` };
  }
  if (cov.discoveredLastWeek != null && cov.discovered > cov.discoveredLastWeek)
    return { ok: false, why: `Gate not met: Discovered rose ${cov.discoveredLastWeek} → ${cov.discovered}` };
  return { ok: true, why: 'gate met' };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const opt = (n, d = null) => {
    const i = args.indexOf(n);
    return i === -1 ? d : args[i + 1];
  };
  const wave = Number(opt('--wave', '2'));
  const src = readTiersSource();
  const routes = waveCandidates(src, wave);
  const paths = routes.map(([a, b]) => routePath(a, b));
  console.log(`Wave ${wave}: ${routes.length} routes`);
  for (const p of paths) console.log(`  ${p}`);

  let cov = null;
  if (opt('--coverage')) {
    const { coverage } = await import('./gsc-weekly.mjs');
    const prev = opt('--prev-coverage') ? coverage(opt('--prev-coverage')) : null;
    cov = coverage(opt('--coverage'), tier1Paths(src), prev?.discovered ?? null);
    const prevWave = wave === 3 ? waveCandidates(src, 2).map(([a, b]) => routePath(a, b)) : [];
    const waveCov = coverage(opt('--coverage'), prevWave);
    cov.isIndexed = (p) => !waveCov.tier1NotIndexed.some((x) => x.startsWith(`${p} `));
  }
  const prevPaths = wave === 3 ? waveCandidates(src, 2).map(([a, b]) => routePath(a, b)) : [];
  const g = gateFor({ src, wave, cov, wavePaths: prevPaths });

  if (opt('--check')) {
    const { measureOverlap } = await import('./page-quality.mjs');
    const max = Number(opt('--max-overlap', '0.25'));
    // Routes of the wave + its held pages (WAVE2_PATHS), against Wave 1's routes.
    const extra = wave === 2 ? stringsOf(src, 'WAVE2_PATHS') : [];
    const pairs = await measureOverlap(opt('--check'), [...paths, ...extra, ...wave1RoutePaths(src)]);
    const bad = pairs.filter((x) => x.overlap > max && (paths.includes(x.a) || paths.includes(x.b)));
    console.log(`\nOverlap check (max ${max}): ${bad.length} pair(s) above`);
    for (const x of bad.slice(0, 20)) console.log(`  ${x.overlap}  ${x.a}  ${x.b}`);
    if (bad.length && args.includes('--apply')) {
      console.error('\nRefused: improve those pages first (Step 3 blocks), then check again.');
      process.exit(1);
    }
  }

  if (!args.includes('--apply')) {
    console.log(`\n${g.ok ? 'Gate met' : g.why}. Nothing changed (no --apply).`);
  } else if (!g.ok) {
    console.error(`\n${g.why}. Nothing changed.`);
    process.exit(1);
  } else if (!opt('--check')) {
    console.error('\n--apply needs --check <base-url of a build with these pages>: the pages must pass the overlap check first.');
    process.exit(1);
  } else {
    const file = new URL('../../src/lib/indexing-tiers.ts', import.meta.url);
    writeFileSync(file, withReleasedWave(readFileSync(file, 'utf8'), wave));
    console.log(`\nGate met. RELEASED_WAVES now has ${wave} — run the tests, commit, deploy, resubmit the routes sitemap, and list the wave's URLs for Request Indexing.`);
  }
}

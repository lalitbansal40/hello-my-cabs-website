/**
 * Check that every old hellomycab.com page redirects to the right new page, once and
 * permanently.
 *
 *   node scripts/seo/old-domain/verify-redirects.mjs                 # the real old domain
 *   OLD_ORIGIN=http://localhost:4400 node scripts/seo/old-domain/verify-redirects.mjs
 *
 * For each entry in map.json: the old URL must answer 301 (or 308), its Location must be
 * exactly the new URL, and the new URL must answer 200 — one hop, no chains. A 302 fails: a
 * temporary redirect does not carry a page's standing to its new address. Also checks one
 * path that is not in the map, which must land on the fallback.
 *
 * Exits 1 if anything fails, so it can gate a "done".
 */
import { readFileSync } from 'node:fs';

const map = JSON.parse(readFileSync(new URL('map.json', import.meta.url), 'utf8'));
const OLD = (process.env.OLD_ORIGIN ?? `https://${map.oldHost}`).replace(/\/+$/, '');
const NEW = (process.env.NEW_ORIGIN ?? map.newOrigin).replace(/\/+$/, '');
const checkTargets = process.env.SKIP_TARGETS !== '1';

const cases = [
  ...map.redirects.map((r) => ({ from: r.from, to: r.to })),
  { from: '/some-page-that-was-never-in-the-map/', to: map.fallback },
];

const bad = [];
const targetStatus = new Map();
for (const { from, to } of cases) {
  const want = `${NEW}${to}`;
  let res;
  try {
    res = await fetch(`${OLD}${from}`, { redirect: 'manual', signal: AbortSignal.timeout(15_000) });
  } catch (e) {
    bad.push(`${from}  → request failed: ${e.message}`);
    continue;
  }
  const loc = res.headers.get('location') ?? '';
  if (res.status !== 301 && res.status !== 308) {
    bad.push(`${from}  → ${res.status} (want 301)${loc ? ` to ${loc}` : ''}`);
    continue;
  }
  if (loc !== want) {
    bad.push(`${from}  → 301 to ${loc || '(no Location)'} (want ${want})`);
    continue;
  }
  if (checkTargets) {
    if (!targetStatus.has(want)) {
      const t = await fetch(want, { redirect: 'manual', signal: AbortSignal.timeout(15_000) })
        .then((r) => r.status)
        .catch(() => 0);
      targetStatus.set(want, t);
    }
    const t = targetStatus.get(want);
    if (t !== 200) bad.push(`${from}  → ${want} answers ${t} (want 200, no second hop)`);
  }
}

console.log(
  `${cases.length - bad.length}/${cases.length} old URLs redirect correctly (${OLD} → ${NEW})`,
);
for (const b of bad) console.log(`  ✗ ${b}`);
process.exit(bad.length ? 1 : 0);

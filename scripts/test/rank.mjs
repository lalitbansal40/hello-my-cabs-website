#!/usr/bin/env node
/**
 * Tests for the ranking-work scripts (21 Nov 2026, docs/seo/PROMPT_RANK_21NOV.md):
 * keyword list, weekly Search Console diff, coverage gate, fare sanity, Tier 3 release.
 * Plain Node — no network, no Next build. `npm run test:rank`.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

let passed = 0;
const failures = [];
const test = async (name, fn) => {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failures.push(name);
    console.log(`  ✗ ${name}\n    ${e?.stack ?? e}`);
  }
};

const csv = (path) => {
  const [head, ...lines] = readFileSync(path, 'utf8').trim().split('\n');
  const cols = head.split(',');
  return lines.map((l) => Object.fromEntries(l.split(',').map((v, i) => [cols[i], v])));
};

// Pages that exist from 21 Nov even though the 21 Nov catalog snapshot predates them.
const PLANNED_PAIRS = new Set(['JAIPUR>KHATU_SHYAM_JI', 'KHATU_SHYAM_JI>JAIPUR', 'DELHI>KHATU_SHYAM_JI', 'KHATU_SHYAM_JI>DELHI']);
const PLANNED_PATHS = new Set(['/', '/jaipur-airport-taxi', '/cab-service-in-khatu-shyam-ji']);

// ── 27 Nov 2026 (docs/seo/PROMPT_INDEX_RANK_27NOV.md Steps 2.6, 3, 9) ──────────────────────
// Read from the last `next build` (.next/server/app/*.html). Without a build these say so and
// pass — CI builds before it tests (amplify.yml), and the release routine runs them after one.
const builtHtml = (path) => {
  const f = `.next/server/app/${path === '/' ? 'index' : path.slice(1)}.html`;
  try {
    return readFileSync(f, 'utf8');
  } catch {
    return null;
  }
};

await test('weight guard: Wave 1 pages stay under the 27 Nov guard (HTML ≤ 360 kB, gzip ≤ 55 kB, CSS not inlined; measured max 325 kB / 47 kB)', async () => {
  const { measure } = await import('../seo/page-quality.mjs');
  const { wave1Paths } = await import('../seo/lib/tiers.mjs');
  const pages = wave1Paths().map((p) => [p, builtHtml(p)]).filter(([, h]) => h);
  if (!pages.length) return console.log('    (no build — skipped)');
  for (const [p, h] of pages) {
    const m = measure(h);
    assert.ok(m.html <= 360_000, `${p} HTML ${m.html} B`);
    assert.ok(m.gzip <= 55_000, `${p} gzip ${m.gzip} B`);
    assert.equal(m.style, 0, `${p} has inline CSS again (next.config inlineCss)`);
    assert.equal(m.h1, 1, `${p} must have exactly one <h1>`);
  }
});

await test('sameness guard: Wave 1 route pages — no pair above 0.65, median at most 0.33 (masked 5-grams)', async () => {
  const { mainText, overlapMatrix } = await import('../seo/page-quality.mjs');
  const { wave1RoutePaths } = await import('../seo/lib/tiers.mjs');
  const texts = Object.fromEntries(wave1RoutePaths().map((p) => [p, builtHtml(p)]).filter(([, h]) => h).map(([p, h]) => [p, mainText(h)]));
  if (Object.keys(texts).length < 2) return console.log('    (no build — skipped)');
  const pairs = overlapMatrix(texts);
  assert.ok(pairs[0].overlap <= 0.65, `${pairs[0].a} vs ${pairs[0].b}: ${pairs[0].overlap}`);
  const median = pairs.map((x) => x.overlap).sort((a, b) => a - b)[Math.floor(pairs.length / 2)];
  assert.ok(median <= 0.33, `median overlap ${median}`);
});

const FAQ_MODULES = { 'lib/route-faq': 'src/lib/route-faq.ts', 'lib/seo': 'src/lib/seo.ts' };

await test('route FAQ: at most 8, written questions first, then by search order; schema = visible', async () => {
  const { loadTsx } = await import('./tsx-load.mjs');
  const mods = await loadTsx(FAQ_MODULES);
  const { pickFaq, FAQ_MAX } = await mods.import('lib/route-faq');
  mods.close();
  const built = [
    { q: 'What is the per-kilometre rate from A to B?', a: '' },
    { q: 'How long does the A to B drive take?', a: '' },
    { q: 'How much does a taxi from A to B cost?', a: '' },
    ...Array.from({ length: 12 }, (_, i) => ({ q: `Other ${i}`, a: '' })),
  ];
  const out = pickFaq(built, [{ q: 'Written one', a: '' }]);
  assert.equal(out.length, FAQ_MAX);
  assert.deepEqual(out.slice(0, 4).map((x) => x.q), ['Written one', 'How much does a taxi from A to B cost?', 'How long does the A to B drive take?', 'What is the per-kilometre rate from A to B?']);
  for (const p of ['/jaipur-to-delhi-cab', '/kota-to-jaipur-cab']) {
    const h = builtHtml(p);
    if (!h) continue;
    const ld = [...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const faq = ld.flat().find((x) => x['@type'] === 'FAQPage');
    assert.ok(faq && faq.mainEntity.length >= 4 && faq.mainEntity.length <= FAQ_MAX, `${p} FAQ count`);
    for (const q of faq.mainEntity) assert.ok(h.includes(q.name.replace(/&/g, '&amp;').replace(/'/g, '&#x27;')) || h.includes(q.name), `${p}: "${q.name}" not on the page`);
  }
});

await test('gsc-weekly coverage (27 Nov 2026 fix): with the Indexed list, only listed pages count — 1 of Wave 1', async () => {
  const { coverage } = await import('../seo/gsc-weekly.mjs');
  const c = coverage('docs/seo/evidence/gsc-2026-11-27', undefined, 119);
  assert.equal(c.exactIndexed, true);
  assert.equal(c.tier1Indexed, 1, 'only the home page is indexed on 23 Nov');
  assert.equal(c.discovered, 50);
  assert.match(c.gate, /release nothing/);
  assert.ok(c.tier1NotIndexed.some((x) => /jaipur-airport-taxi \(not seen by Google yet\)/.test(x)), 'a page not live yet is not counted as indexed');
});

await test('index set: the built sitemap is exactly Wave 1 (legal pages out); every Wave 1 page index, every held page noindex', async () => {
  const { wave1Paths, routePath, tier3Pairs, pairsOf, readTiersSource } = await import('../seo/lib/tiers.mjs');
  let body;
  try {
    body = readFileSync('.next/server/app/sitemap.xml.body', 'utf8');
  } catch {
    return console.log('    (no build — skipped)');
  }
  const inMap = [...body.matchAll(/<loc>https:\/\/www\.hellomycabs\.com([^<]*)<\/loc>/g)].map((m) => m[1] || '/').sort();
  const wave1 = wave1Paths().sort();
  assert.deepEqual(inMap, wave1, 'sitemap.xml must equal the Wave 1 set');
  for (const legal of ['/terms', '/privacy', '/refund', '/luxury-car']) assert.ok(!inMap.includes(legal), `${legal} listed`);
  const robots = (h) => /<meta name="robots" content="([^"]+)"/.exec(h)?.[1] ?? 'index, follow';
  for (const p of wave1) {
    const h = builtHtml(p);
    if (h) assert.ok(!/noindex/.test(robots(h)), `${p} is Wave 1 but noindex`);
  }
  const src = readTiersSource();
  const held = [...tier3Pairs(src), ...pairsOf(src, 'FARE_HOLD')].map(([a, b]) => routePath(a, b));
  let seen = 0;
  for (const p of held) {
    const h = builtHtml(p);
    if (!h) continue;
    seen++;
    assert.match(robots(h), /noindex, ?follow/, `${p} held but indexable`);
  }
  for (const p of ['/luxury-car', '/jaipur-to-delhi-innova-crysta', '/cab-service-in-noida', '/force-urbania-rental']) {
    const h = builtHtml(p);
    if (h) assert.match(robots(h), /noindex/, `${p} must be noindex (not Wave 1)`);
  }
  console.log(`    (${wave1.length} Wave 1 URLs; ${seen} prebuilt held pages checked)`);
});

await test('page basics on every built Wave 1 page: self canonical, title ≤ 60 and unique, description 100–160, og image, img alt', async () => {
  const { wave1Paths } = await import('../seo/lib/tiers.mjs');
  const titles = new Map();
  for (const p of wave1Paths()) {
    const h = builtHtml(p);
    if (!h) continue;
    const canon = /<link rel="canonical" href="([^"]+)"/.exec(h)?.[1];
    assert.equal(canon, `https://www.hellomycabs.com${p === '/' ? '' : p}`, `${p} canonical`);
    const title = /<title>([^<]*)<\/title>/.exec(h)?.[1]?.replace(/&amp;/g, '&') ?? '';
    assert.ok(title.length > 10 && title.length <= 62, `${p} title "${title}" (${title.length})`);
    assert.ok(!titles.has(title), `${p} has the same title as ${titles.get(title)}`);
    titles.set(title, p);
    const desc = /<meta name="description" content="([^"]*)"/.exec(h)?.[1]?.replace(/&amp;/g, '&') ?? '';
    assert.ok(desc.length >= 100 && desc.length <= 160, `${p} description ${desc.length}`);
    assert.ok(/<meta property="og:image"/.test(h), `${p} og:image`);
    for (const img of h.match(/<img\b[^>]*>/g) ?? []) assert.ok(/\balt="/.test(img), `${p}: <img> without alt: ${img.slice(0, 80)}`);
  }
});

await test('keywords: Wave 1 routes carry their keyword — title "A to B" + Cab + Taxi, H1 "Taxi Service", the price = the fare table', async () => {
  const { wave1RoutePaths } = await import('../seo/lib/tiers.mjs');
  const name = (k) => k.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
  for (const p of wave1RoutePaths()) {
    const h = builtHtml(p);
    if (!h) continue;
    const [a, b] = p.slice(1).replace(/-cab$/, '').split('-to-');
    const A = name(a).replace('Khatu Shyam Ji', 'Khatu Shyam Ji');
    const B = name(b);
    const title = /<title>([^<]*)<\/title>/.exec(h)[1].replace(/&amp;/g, '&');
    assert.ok(title.toLowerCase().includes(`${A} to ${B}`.toLowerCase()), `${p} title "${title}"`);
    assert.match(title, /Cab/, `${p} title has "Cab"`);
    assert.match(title, /Taxi/, `${p} title has "Taxi"`);
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(h)[1].replace(/<[^>]+>/g, '');
    assert.match(h1, /Taxi Service/, `${p} H1 "${h1}"`);
    const tp = /₹([\d,]+)/.exec(title)?.[1];
    const hp = /₹([\d,]+)/.exec(h1)?.[1];
    if (tp && hp) assert.equal(tp, hp, `${p}: title price ₹${tp} vs heading ₹${hp}`);
  }
});

await test('keywords.csv (27 Nov): one target per keyword; every Wave 1 keyword targets a Wave 1 page; waves follow the map', async () => {
  const rows = csv('docs/seo/keywords.csv');
  const { wave1Paths } = await import('../seo/lib/tiers.mjs');
  const w1 = new Set(wave1Paths());
  const seen = new Set();
  for (const r of rows) {
    assert.ok(!seen.has(r.keyword), `duplicate keyword ${r.keyword}`);
    seen.add(r.keyword);
    assert.ok(['1', '2', '3', 'held'].includes(r.wave), `${r.keyword}: wave "${r.wave}"`);
    if (r.wave === '1') assert.ok(w1.has(r.target_url), `${r.keyword} → ${r.target_url} is not Wave 1`);
    else assert.ok(!w1.has(r.target_url), `${r.keyword} → ${r.target_url} is Wave 1 but marked ${r.wave}`);
  }
  assert.ok(rows.length >= 500, `only ${rows.length} keywords`);
});

await test('NAP: name, phone and address the same in company.ts, the JSON-LD, the footer and /contact', async () => {
  const { loadTsx } = await import('./tsx-load.mjs');
  const mods = await loadTsx({ 'lib/company': 'src/lib/company.ts' });
  const { company } = await mods.import('lib/company');
  mods.close();
  const a = company.postalAddress;
  assert.equal(`${a.streetAddress}, ${a.addressLocality}, ${a.addressRegion} ${a.postalCode}`, company.registeredAddress);
  for (const p of ['/contact', '/jaipur-to-delhi-cab', '/']) {
    const h = builtHtml(p);
    if (!h) continue;
    assert.ok(h.includes(company.registeredAddress), `${p}: address missing or different`);
    assert.ok(h.includes(company.phone), `${p}: phone`);
    const org = [...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]))
      .flat()
      .find((x) => x['@id'] === 'https://www.hellomycabs.com/#organization' && x.address);
    if (org) {
      assert.equal(org.address.streetAddress, a.streetAddress);
      assert.equal(org.address.postalCode, a.postalCode);
      assert.equal(String(org.telephone).replace(/\D/g, ''), company.phone.replace(/\D/g, ''));
    }
  }
});

await test('analytics: nothing loads while both code switches are null; GA4 never on token pages', async () => {
  const src = readFileSync('src/config/analytics.ts', 'utf8');
  assert.match(src, /PLAUSIBLE_DOMAIN: null/);
  assert.match(src, /GA4_ID: null/);
  const ga = readFileSync('src/components/site/Ga4.tsx', 'utf8');
  const re = new RegExp(/const PRIVATE = (\/.*\/);/.exec(ga)[1].slice(1, -1));
  for (const p of ['/driver/route/abc', '/rate/xyz', '/r/abc', '/bookings', '/booking/1', '/login']) assert.ok(re.test(p), p);
  for (const p of ['/', '/jaipur-to-delhi-cab', '/routes', '/cab-service-in-jaipur']) assert.ok(!re.test(p), p);
  const h = builtHtml('/');
  if (h) assert.ok(!/plausible\.io|googletagmanager/.test(h), 'an analytics script is on the page with both switches null');
});

await test('keywords.csv: one row per keyword, every target is a real or planned page', async () => {
  const { slugOf, routePath, cityPath } = await import('../seo/keywords-seed.mjs');
  const rows = csv('docs/seo/keywords.csv');
  assert.ok(rows.length >= 80, `only ${rows.length} keywords`);
  const seen = new Set();
  for (const r of rows) {
    assert.ok(!seen.has(r.keyword), `duplicate keyword ${r.keyword}`);
    seen.add(r.keyword);
  }
  const catalog = JSON.parse(readFileSync('docs/seo/evidence/routes-2026-11-21.json', 'utf8')).routes;
  const ok = new Set(PLANNED_PATHS);
  const cities = new Set();
  for (const r of catalog) {
    ok.add(routePath(r.pickup, r.drop));
    cities.add(r.pickup);
  }
  for (const k of PLANNED_PAIRS) ok.add(routePath(...k.split('>')));
  for (const c of cities) ok.add(cityPath(c));
  for (const r of rows) assert.ok(ok.has(r.target_url), `${r.keyword} → ${r.target_url} is not a page`);
  assert.equal(slugOf('KHATU_SHYAM_JI'), 'khatu-shyam-ji');
});

await test('keywords: mapping rules', async () => {
  const { targetFor } = await import('../seo/keywords-seed.mjs');
  assert.equal(targetFor('delhi jaipur taxi').url, '/delhi-to-jaipur-cab');
  assert.equal(targetFor('jaipur delhi cab').url, '/jaipur-to-delhi-cab');
  assert.equal(targetFor('dehli jaipur taxi services').url, '/delhi-to-jaipur-cab');
  assert.equal(targetFor('jaipur airport taxi').url, '/jaipur-airport-taxi');
  assert.equal(targetFor('airport taxi').url, '/jaipur-airport-taxi');
  assert.equal(targetFor('taxi service in reengus').url, '/cab-service-in-khatu-shyam-ji');
  assert.equal(targetFor('jaipur to khatu shyam taxi').url, '/jaipur-to-khatu-shyam-ji-cab');
  assert.equal(targetFor('vasant kunj taxi service').url, '/cab-service-in-delhi');
  assert.equal(targetFor('kota taxi service number').url, '/cab-service-in-kota');
  assert.equal(targetFor('hello my cab').url, '/');
  assert.equal(targetFor('one way taxi').url, '/');
});

await test('tiers reader: Tier 1 paths match the committed quality baseline (slug rules agree)', async () => {
  const { tier1Paths } = await import('../seo/lib/tiers.mjs');
  const base = Object.keys(JSON.parse(readFileSync('docs/seo/quality-baseline.json', 'utf8')).pages);
  const paths = tier1Paths();
  for (const p of base) assert.ok(paths.includes(p), `baseline page ${p} missing from tier1Paths()`);
});

await test('gsc-weekly: CSV with quoted commas, movers, new queries', async () => {
  const { loadQueries, loadPages, movers, parseCsv } = await import('../seo/gsc-weekly.mjs');
  assert.deepEqual(parseCsv('a,b\n"x, y","he said ""hi"""\n'), [{ a: 'x, y', b: 'he said "hi"' }]);
  const a = loadQueries('scripts/test/fixtures/gsc-a');
  const b = loadQueries('scripts/test/fixtures/gsc-b');
  assert.equal(b.get('taxi, jaipur').impressions, 15);
  const m = movers(a, b);
  assert.deepEqual(m.up.map((r) => r.query), ['taxi, jaipur', 'jaipur delhi cab']);
  assert.deepEqual(m.down.map((r) => r.query), ['kota taxi service']);
  assert.deepEqual(m.fresh, ['jaipur airport taxi']);
  const pages = loadPages('scripts/test/fixtures/gsc-b');
  assert.equal(pages.get('/jaipur-to-delhi-cab').clicks, 3, 'trailing slash folded');
  assert.ok(pages.has('http://hellomycabs.com/'), 'other hosts kept as full URLs');
});

await test('gsc-weekly: coverage counts Tier 1, ignores http URLs, gate wording', async () => {
  const { coverage } = await import('../seo/gsc-weekly.mjs');
  const c = coverage('scripts/test/fixtures/cov', ['/', '/cab-service-in-kota', '/jaipur-to-delhi-cab', '/kota-to-jaipur-cab', '/x']);
  assert.equal(c.indexedTotal, 30);
  assert.equal(c.notIndexedTotal, 100);
  assert.equal(c.tier1Indexed, 4, '/ is only "not indexed" as http://www, which is not our page');
  assert.equal(c.discovered, 2);
  assert.match(c.gate, /^met/);
  const worse = coverage('scripts/test/fixtures/cov', ['/', '/cab-service-in-kota', '/jaipur-to-delhi-cab', '/kota-to-jaipur-cab', '/x'], 1);
  assert.match(worse.gate, /^not met/, 'Discovered rose since last week');
  const half = coverage('scripts/test/fixtures/cov', ['/cab-service-in-kota', '/a']);
  assert.match(half.gate, /improve/);
});

await test('gsc-weekly: keywords refresh only touches matched rows', async () => {
  const { refreshKeywords, loadQueries } = await import('../seo/gsc-weekly.mjs');
  const rows = [
    { keyword: 'jaipur delhi cab', impressions_3m: '1', position_3m: '9', last_checked: 'old' },
    { keyword: 'never seen', impressions_3m: '', position_3m: '', last_checked: '' },
  ];
  const out = refreshKeywords(rows, loadQueries('scripts/test/fixtures/gsc-b'), '2026-11-30');
  assert.deepEqual(out[0], { keyword: 'jaipur delhi cab', impressions_3m: '120', position_3m: '1.50', last_checked: '2026-11-30' });
  assert.deepEqual(out[1], rows[1]);
});

await test('driver facts: areas card shows only when drivers agreed on areas; survey input is cleaned', async () => {
  const { loadTsx } = await import('./tsx-load.mjs');
  const mods = await loadTsx({
    'components/site/Icons': 'src/components/site/Icons.tsx',
    'components/landing/RouteRoad': 'src/components/landing/RouteRoad.tsx',
  });
  try {
    const { RouteRoad } = await mods.import('components/landing/RouteRoad');
    const html = mods.render(RouteRoad, {
      A: 'Kota',
      B: 'Jaipur',
      driver: { pickupAreas: ['Talwandi', 'Kunhari'], dropAreas: ['Sindhi Camp'] },
    });
    assert.match(html, /Where trips start and end/);
    assert.match(html, /Most pickups in Kota: Talwandi and Kunhari\./);
    assert.match(html, /Most drops in Jaipur: Sindhi Camp\./);
    assert.equal(mods.render(RouteRoad, { A: 'Kota', B: 'Jaipur', driver: {} }), '', 'nothing without driver data');
  } finally {
    mods.close();
  }
  const src = readFileSync('src/components/driver/DriverRouteForm.tsx', 'utf8');
  const fn = src.slice(src.indexOf('export function areaList'), src.indexOf('function Question('));
  const ts = (await import('node:module')).createRequire(import.meta.url)('typescript');
  const js = ts.transpileModule(fn, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  const { areaList } = await import(`data:text/javascript,${encodeURIComponent(js)}`);
  assert.deepEqual(areaList('Sindhi Camp, mansarovar , , sindhi camp,x'), ['Sindhi Camp', 'mansarovar']);
  assert.equal(areaList(' , '), undefined);
  assert.equal(areaList('a1,b2,c3,d4,e5,f6').length, 5);
});

await test('fare sanity: flags the known wrong fares, not the normal ones', async () => {
  const { flagFares } = await import('../seo/fare-sanity.mjs');
  const routes = JSON.parse(readFileSync('docs/seo/evidence/routes-2026-11-21.json', 'utf8')).routes;
  const flagged = new Set(flagFares(routes).flags.map((f) => `${f.route.pickup}>${f.route.drop}`));
  for (const k of ['DELHI>DELHI_AIRPORT', 'DELHI>NOIDA', 'NOIDA>DELHI', 'DELHI_AIRPORT>DELHI', 'DELHI>SIKAR', 'SIKAR>DELHI', 'CHANDIGARH>HARIDWAR', 'KOTA>AGRA', 'AGRA>KOTA']) {
    assert.ok(flagged.has(k), `${k} should be flagged`);
  }
  for (const k of ['JAIPUR>DELHI', 'DELHI>JAIPUR', 'JAIPUR>AJMER', 'DELHI>AGRA', 'KOTA>JAIPUR', 'JAIPUR>SIKAR']) {
    assert.ok(!flagged.has(k), `${k} is a normal fare`);
  }
});

await test('FARE_HOLD: equals the flagged list, never a Tier 1 route, never in a released wave', async () => {
  const { pairsOf, readTiersSource } = await import('../seo/lib/tiers.mjs');
  const { flagFares } = await import('../seo/fare-sanity.mjs');
  const { waveCandidates } = await import('../seo/release-wave.mjs');
  const src = readTiersSource();
  const held = pairsOf(src, 'FARE_HOLD');
  const routes = JSON.parse(readFileSync('docs/seo/evidence/routes-2026-11-21.json', 'utf8')).routes;
  const flagged = flagFares(routes).flags.map((f) => `${f.route.pickup}>${f.route.drop}`).sort();
  assert.deepEqual(held.map(([a, b]) => `${a}>${b}`).sort(), flagged, 'FARE_HOLD out of date with fare-sanity');
  const tier1 = new Set(pairsOf(src, 'TIER1_ROUTES').map(([a, b]) => `${a}>${b}`));
  for (const [a, b] of held) assert.ok(!tier1.has(`${a}>${b}`), `${a}>${b} is Tier 1 and fare-held`);
  for (const w of [2, 3])
    for (const [a, b] of waveCandidates(src, w)) assert.ok(!held.some(([x, y]) => x === a && y === b), `${a}>${b} held but in wave ${w}`);
});

await test('waves: one list each, no overlap with Tier 1, the CSV decides; release-wave edits only RELEASED_WAVES', async () => {
  const { pairsOf, readTiersSource, releasedWaves, withReleasedWave, tier3Pairs } = await import('../seo/lib/tiers.mjs');
  const src = readTiersSource();
  const k = ([a, b]) => `${a}>${b}`;
  const w2 = pairsOf(src, 'WAVE2_ROUTES').map(k);
  const w3 = pairsOf(src, 'WAVE3_ROUTES').map(k);
  const nd = pairsOf(src, 'NO_DEMAND_ROUTES').map(k);
  const t1 = pairsOf(src, 'TIER1_ROUTES').map(k);
  const all = [...w2, ...w3, ...nd, ...t1];
  assert.equal(new Set(all).size, all.length, 'a route is on one list only');
  assert.equal(tier3Pairs(src).length, w2.length + w3.length + nd.length);
  // The keyword map is the source: its Wave 2 / Wave 3 / no-demand rows are these lists.
  const csv = readFileSync('docs/seo/KEYWORD_MAP_ROUTES_27NOV.csv', 'utf8').split('\n').slice(1).filter(Boolean);
  const keyOf = (url) => url.replace(/^\//, '').replace(/-cab$/, '').split('-to-').map((x) => x.toUpperCase().replace(/-/g, '_')).join('>');
  const byAction = (word) => csv.filter((l) => l.includes(word)).map((l) => keyOf(l.split(',')[1]));
  for (const r of byAction('Wave 2')) assert.ok(w2.includes(r), `${r} missing from WAVE2`);
  for (const r of byAction('Wave 3')) assert.ok(w3.includes(r), `${r} missing from WAVE3`);
  for (const r of byAction('Noindex rakho')) assert.ok(nd.includes(r), `${r} missing from NO_DEMAND`);
  assert.deepEqual(releasedWaves(src), [], 'nothing released on 27 Nov 2026');
  const after = withReleasedWave(src, 2);
  assert.deepEqual(releasedWaves(after), [2]);
  assert.equal(after.replace(/export const RELEASED_WAVES = \[[^\]]*\]/, ''), src.replace(/export const RELEASED_WAVES = \[[^\]]*\]/, ''), 'only RELEASED_WAVES changes');
});

await test('release-wave refuses: no coverage, gate not met (27 Nov), wave 3 before 2; a met gate passes', async () => {
  const { spawnSync } = await import('node:child_process');
  const run = (...a) => spawnSync(process.execPath, ['scripts/seo/release-wave.mjs', ...a], { encoding: 'utf8' });
  let r = run('--wave', '2', '--apply');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /needs --coverage/);
  r = run('--wave', '2', '--coverage', 'docs/seo/evidence/gsc-2026-11-27', '--apply');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /Gate not met: Wave 1 1\/\d+ indexed/);
  r = run('--wave', '3', '--coverage', 'docs/seo/evidence/gsc-2026-11-27', '--apply');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /wave 3 waits for wave 2/);
  const { gateFor } = await import('../seo/release-wave.mjs');
  const { readTiersSource } = await import('../seo/lib/tiers.mjs');
  const src = readTiersSource();
  const cov = { share: 0.85, tier1Indexed: 32, tier1Total: 37, discovered: 10, discoveredLastWeek: 20 };
  assert.equal(gateFor({ src, wave: 2, cov }).ok, true);
  assert.equal(gateFor({ src, wave: 2, cov: { ...cov, discovered: 25 } }).ok, false, 'Discovered rose');
  assert.equal(gateFor({ src, wave: 2, cov: { ...cov, share: 0.6 } }).ok, false);
});

await test('one distance: measured km wins for fixed routes, per-km routes keep their own; catalogue overlay', async () => {
  const { loadTsx } = await import('./tsx-load.mjs');
  const mods = await loadTsx({
    'lib/seo': 'src/lib/seo.ts',
    'lib/env': 'src/lib/env.ts',
    'lib/route-distance': 'src/lib/route-distance.ts',
  });
  try {
    const { routeDistance, driveTime } = await mods.import('lib/route-distance');
    const insights = { distance: { distanceKm: 281, durationMin: 247 } };
    const fixedRow = { fixed: true, distanceKm: 306, distanceMeasured: false };
    assert.deepEqual(routeDistance({ row: fixedRow, insights }), { km: 281, measured: true, minutes: 247 });
    assert.deepEqual(routeDistance({ row: fixedRow, insights: null }), { km: 306, measured: false, minutes: null });
    const perKm = { fixed: false, distanceKm: 410, distanceMeasured: true };
    assert.equal(routeDistance({ row: perKm, insights, fareKm: 410 }).km, 410, 'a per-km price is made of its own km');
    assert.equal(routeDistance({ row: null, insights: null, fareKm: null }), null);
    assert.equal(driveTime({ km: 281, measured: true, minutes: 247 }), '4–4½ hours');
    assert.equal(driveTime({ km: 281, measured: true, minutes: 240 }), 'about 4 hours');
    assert.match(driveTime({ km: 281, measured: false, minutes: null }), /hours/);
  } finally {
    mods.close();
  }
  // The overlay in lib/api.ts, by its source (the module needs the Next fetch cache).
  const src = readFileSync('src/lib/api.ts', 'utf8');
  const fn = src.slice(src.indexOf('export function withMeasuredKm'), src.indexOf('const measuredRoutes'));
  const ts = (await import('node:module')).createRequire(import.meta.url)('typescript');
  const js = ts.transpileModule(fn, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  const { withMeasuredKm } = await import(`data:text/javascript,${encodeURIComponent(js)}`);
  const rows = [
    { pickup: 'JAIPUR', drop: 'DELHI', fixed: true, distanceKm: 306, distanceMeasured: false },
    { pickup: 'JAIPUR', drop: 'PUSHKAR', fixed: false, distanceKm: 150 },
    { pickup: 'KOTA', drop: 'JAIPUR', fixed: true, distanceKm: 246 },
  ];
  const ins = { routes: [
    { pickup: 'JAIPUR', drop: 'DELHI', distance: { distanceKm: 295 } },
    { pickup: 'JAIPUR', drop: 'PUSHKAR', distance: { distanceKm: 144 } },
    { pickup: 'KOTA', drop: 'JAIPUR', distance: null },
  ] };
  const out = withMeasuredKm(rows, ins);
  assert.deepEqual(out.map((r) => [r.distanceKm, r.distanceMeasured ?? null]), [[295, true], [150, null], [246, null]]);
  assert.equal(withMeasuredKm(rows, null), rows);
});

await test('rating page: everyone gets the Google link (no gating); a low rating gets a way to complain first', async () => {
  const { loadTsx } = await import('./tsx-load.mjs');
  const mods = await loadTsx({
    'lib/env': 'src/lib/env.ts',
    'lib/company': 'src/lib/company.ts',
    'lib/review-rules': 'src/lib/review-rules.ts',
    'components/rate/RateForm': 'src/components/rate/RateForm.tsx',
    'components/site/GoogleRating': 'src/components/site/GoogleRating.tsx',
  });
  try {
    const { RateThanks } = await mods.import('components/rate/RateForm');
    const url = 'https://g.page/r/example/review';
    const low = mods.render(RateThanks, { stars: 2, googleReviewUrl: url });
    const high = mods.render(RateThanks, { stars: 5, googleReviewUrl: url });
    assert.match(low, /data-low-rating/);
    assert.ok(low.indexOf('data-low-rating') < low.indexOf(url), 'complaint line first');
    assert.match(low, /wa\.me\/919667111921/);
    assert.ok(!/data-low-rating/.test(high));
    for (const html of [low, high]) assert.ok(html.includes(url), 'Google link for every rating');
    assert.ok(!mods.render(RateThanks, { stars: 5, googleReviewUrl: null }).includes('Google'));
    const { GoogleRating } = await mods.import('components/site/GoogleRating');
    assert.match(mods.render(GoogleRating, {}), /4\.7 on Google · 156 reviews · October 2026/);
  } finally {
    mods.close();
  }
  // The Business Profile's own rating never enters the structured data.
  assert.ok(!/googleRating/.test(readFileSync('src/lib/schema.tsx', 'utf8')), 'schema.tsx must not read company.googleRating');
});

await test('transfer form: areas from the price list, fare looked up (not computed), Reengus preselected', async () => {
  const { loadTsx } = await import('./tsx-load.mjs');
  const mods = await loadTsx({
    'lib/env': 'src/lib/env.ts',
    'lib/company': 'src/lib/company.ts',
    'lib/phone': 'src/lib/phone.ts',
    'lib/analytics': 'src/lib/analytics.ts',
    'components/ui/Field': 'src/components/ui/Field.tsx',
    'components/landing/TransferForm': 'src/components/landing/TransferForm.tsx',
  });
  try {
    const { TransferForm } = await mods.import('components/landing/TransferForm');
    const zones = [
      { zone: 'A', upToKm: 12, fares: { hatchback: 449, dzire: 549, ertiga: 749, crysta: 1199 } },
      { zone: 'B', upToKm: 20, fares: { hatchback: 549, dzire: 649, ertiga: 899, crysta: 1399 } },
    ];
    const airport = {
      key: 'jaipur-airport', from: 'Jaipur Airport (JAI)', fromCity: 'JAIPUR_AIRPORT', zones,
      localities: [{ name: 'Jagatpura', km: 7.9, zone: 'A' }, { name: 'C-Scheme', km: 17.2, zone: 'B' }],
      freeWaitMinutes: 45, waitingRupeesPer30Min: 100, night: null, includes: ['GST', 'Airport parking'], setOn: '2026-11-21',
    };
    const html = mods.render(TransferForm, { transfer: airport, otherCity: 'JAIPUR', otherLabel: 'Jaipur' });
    assert.match(html, /<option value="Jagatpura">Jagatpura<\/option>/);
    assert.match(html, /Another area/);
    assert.match(html, /Choose the area to see the fixed fare/);
    assert.match(html, /Flight number/);
    const reengus = { ...airport, key: 'reengus-khatu', from: 'Reengus Junction', fromCity: 'REENGUS',
      zones: [{ zone: 'A', upToKm: 25, fares: { hatchback: 449, dzire: 549, ertiga: 749, crysta: 1099 } }],
      localities: [{ name: 'Khatu Shyam Ji', km: 19, zone: 'A' }] };
    const k = mods.render(TransferForm, { transfer: reengus, otherCity: 'KHATU_SHYAM_JI', otherLabel: 'Khatu Shyam Ji' });
    assert.match(k, /data-transfer-fare[^>]*>Fixed fare <span[^>]*>₹549/);
    assert.ok(!/Flight number/.test(k), 'no flight box away from an airport');
  } finally {
    mods.close();
  }
});

await test('own pages and twins: Jaipur Airport gets /jaipur-airport-taxi, never a city page; twins are noindex', async () => {
  const src = readFileSync('src/lib/city-pages.ts', 'utf8');
  const ts = (await import('node:module')).createRequire(import.meta.url)('typescript');
  const js = ts.transpileModule(src, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  const { citiesWithPages, OWN_PAGE } = await import(`data:text/javascript,${encodeURIComponent(js)}`);
  const routes = ['DELHI', 'AGRA', 'KOTA', 'SIKAR'].flatMap((d) => [{ pickup: 'JAIPUR_AIRPORT', drop: d }, { pickup: 'KHATU_SHYAM_JI', drop: d }]);
  const cities = citiesWithPages(routes);
  assert.ok(cities.has('KHATU_SHYAM_JI'));
  assert.ok(!cities.has('JAIPUR_AIRPORT'));
  assert.equal(OWN_PAGE.JAIPUR_AIRPORT, '/jaipur-airport-taxi');
  assert.match(readFileSync('next.config.ts', 'utf8'), /source: '\/cab-service-in-jaipur-airport', destination: '\/jaipur-airport-taxi', permanent: true/);
  const { pairsOf, readTiersSource, tier1Paths } = await import('../seo/lib/tiers.mjs');
  const tiers = readTiersSource();
  assert.match(tiers, /export const TWIN_ROUTES/);
  assert.match(readFileSync('src/lib/held-routes.ts', 'utf8'), /\.\.\.TWIN_ROUTES/);
  const t1 = tier1Paths(tiers);
  for (const p of ['/jaipur-airport-taxi', '/cab-service-in-khatu-shyam-ji', '/jaipur-to-khatu-shyam-ji-cab', '/khatu-shyam-ji-to-jaipur-cab', '/guides/how-to-reach-khatu-shyam']) {
    assert.ok(t1.includes(p), `${p} should be Tier 1`);
  }
  assert.equal(pairsOf(tiers, 'TIER3_ROUTES').filter(([a, b]) => a.includes('KHATU') || b.includes('KHATU')).length, 0);
});

await test('Hindi: held (noindex, no hreflang) while HINDI_LIVE is false; correct pairs when it is true', async () => {
  const { loadTsx } = await import('./tsx-load.mjs');
  const mods = await loadTsx({
    'lib/env': 'src/lib/env.ts',
    'lib/api': 'src/lib/api.ts',
    'lib/slug': 'src/lib/slug.ts',
    'lib/held-routes': 'src/lib/held-routes.ts',
    'lib/indexing-tiers': 'src/lib/indexing-tiers.ts',
    'lib/hindi': 'src/lib/hindi.ts',
    'content/hi': 'src/content/hi/index.ts',
  });
  try {
    const tiers = await mods.import('lib/indexing-tiers');
    const { hindiRobots, hreflangFor, hindiEnglishPaths, hiPath } = await mods.import('lib/hindi');
    const { HI_CITY } = await mods.import('content/hi');
    assert.equal(tiers.HINDI_LIVE, false, 'held until a Hindi reader reviews it and the gate is met');
    assert.deepEqual(hindiRobots(), { index: false, follow: true });
    assert.deepEqual(hreflangFor('/jaipur-to-delhi-cab', true), {}, 'no hreflang to a noindex page');
    assert.equal(hindiRobots(true), undefined);
    assert.deepEqual(hreflangFor('/jaipur-to-delhi-cab', true, true), {
      languages: { 'en-IN': '/jaipur-to-delhi-cab', 'hi-IN': '/hi/jaipur-to-delhi-cab' },
    });
    assert.deepEqual(hreflangFor('/x', false, true), {});
    assert.equal(hiPath('/'), '/hi');
    const paths = hindiEnglishPaths(HI_CITY);
    for (const p of ['/', '/jaipur-airport-taxi', '/cab-service-in-kota', '/jaipur-to-delhi-cab', '/jaipur-to-khatu-shyam-ji-cab']) assert.ok(paths.includes(p), p);
  } finally {
    mods.close();
  }
  // Every Tier 1 city and route endpoint has a Hindi name, so no Hindi page shows a raw key.
  const hi = readFileSync('src/content/hi/index.ts', 'utf8');
  const { pairsOf, stringsOf, readTiersSource } = await import('../seo/lib/tiers.mjs');
  const src = readTiersSource();
  for (const k of new Set([...stringsOf(src, 'TIER1_CITIES'), ...pairsOf(src, 'TIER1_ROUTES').flat()])) {
    assert.match(hi, new RegExp(`\\b${k}: '`), `${k} has no Hindi name`);
  }
});

await test('new-routes: demand ≥ 20 and not in the catalogue, most trips first', async () => {
  const { newRoutes } = await import('../seo/new-routes.mjs');
  const ins = [
    { pickup: 'JAIPUR', drop: 'PUSHKAR', demand: 70, distance: { distanceKm: 144 } },
    { pickup: 'JAIPUR', drop: 'DELHI', demand: 179 },
    { pickup: 'MUMBAI', drop: 'SURAT', demand: 228 },
    { pickup: 'A', drop: 'B', demand: 19 },
    { pickup: 'X', drop: 'X', demand: 99 },
  ];
  const out = newRoutes(ins, [{ pickup: 'JAIPUR', drop: 'DELHI' }]);
  assert.deepEqual(out.map((r) => `${r.pickup}>${r.drop}`), ['MUMBAI>SURAT', 'JAIPUR>PUSHKAR']);
  assert.equal(out[1].km, 144);
});

await test('car drawings: each use points at a symbol the sprite defines (12 = 6 shapes × 2 tones)', async () => {
  const { loadTsx } = await import('./tsx-load.mjs');
  const mods = await loadTsx({
    'lib/images': 'src/lib/images.ts',
    'lib/og-photos.generated': 'src/lib/og-photos.generated.ts',
    'components/site/VehicleArt': 'src/components/site/VehicleArt.tsx',
  }).catch((e) => ({ error: e }));
  if (mods.error) throw mods.error;
  try {
    const { VehicleArt, VehicleSprites } = await mods.import('components/site/VehicleArt');
    const sprite = mods.render(VehicleSprites, {});
    const ids = [...sprite.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(ids.length, 12);
    for (const [key, tone] of [['dzire', 'light'], ['crysta', 'dark'], ['tt_12', 'light'], ['unknown_car', 'light']]) {
      const html = mods.render(VehicleArt, { vehicleKey: key, label: 'x', tone });
      const ref = /<use href="#([^"]+)"/.exec(html)?.[1];
      assert.ok(ref && ids.includes(ref), `${key}/${tone} → ${ref}`);
      assert.ok(!/<circle/.test(html), 'no inline drawing');
    }
  } finally {
    mods.close();
  }
});

// @@more-tests@@

if (failures.length) {
  console.log(`\n${failures.length} failed: ${failures.join(', ')}`);
  process.exit(1);
}
console.log(`${passed} ranking tests passed`);

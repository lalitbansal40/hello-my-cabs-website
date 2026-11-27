#!/usr/bin/env node
/**
 * Builds docs/seo/keywords.csv — the keyword list, one target page per keyword
 * (21 Nov 2026, docs/seo/PROMPT_RANK_21NOV.md Step 1.1).
 *
 *   node scripts/seo/keywords-seed.mjs [--queries <Queries.csv>] [--out docs/seo/keywords.csv]
 *
 * Rows:
 *   - every Search Console query with ≥ 10 impressions (3-month export), mapped to its page;
 *   - four phrasings of each Tier 1 route ("a to b cab / taxi / one way taxi / cab fare");
 *   - the Jaipur Airport and Khatu Shyam groups, which have pages from 21 Nov.
 * The mapping is a rule (`targetFor`), so rerunning on a newer export keeps it consistent;
 * `gsc-report.mjs` later refreshes impressions and position in place.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { wave1Paths } from './lib/tiers.mjs';
import { parseCsv } from './gsc-weekly.mjs';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const root = new URL('../../', import.meta.url);
const queriesPath = opt('--queries', new URL('docs/seo/evidence/gsc-2026-11-27/perf-3m/Queries.csv', root).pathname);
const outPath = opt('--out', new URL('docs/seo/keywords.csv', root).pathname);

/** City words people type → backend city key. Longest names first (matched in order). */
export const CITY_WORDS = [
  ['delhi airport', 'DELHI_AIRPORT'],
  ['jaipur airport', 'JAIPUR_AIRPORT'],
  ['khatu shyam ji', 'KHATU_SHYAM_JI'],
  ['khatu shyamji', 'KHATU_SHYAM_JI'],
  ['khatu shyam', 'KHATU_SHYAM_JI'],
  ['khatu', 'KHATU_SHYAM_JI'],
  ['reengus', 'KHATU_SHYAM_JI'],
  ['ringas', 'KHATU_SHYAM_JI'],
  ['south delhi', 'DELHI'],
  ['vasant kunj', 'DELHI'],
  ['new delhi', 'DELHI'],
  ['dehli', 'DELHI'],
  ['delhi', 'DELHI'],
  ['jaipur', 'JAIPUR'],
  ['kota', 'KOTA'],
  ['sikar', 'SIKAR'],
  ['agra', 'AGRA'],
  ['chandigarh', 'CHANDIGARH'],
  ['ajmer', 'AJMER'],
  ['haridwar', 'HARIDWAR'],
  ['noida', 'NOIDA'],
  ['udaipur', 'UDAIPUR'],
  ['jodhpur', 'JODHPUR'],
  ['dehradun', 'DEHRADUN'],
];

export const slugOf = (key) => key.toLowerCase().replace(/_/g, '-');
export const routePath = (a, b) => `/${slugOf(a)}-to-${slugOf(b)}-cab`;
export const cityPath = (key) => `/cab-service-in-${slugOf(key)}`;
export const AIRPORT_PATH = '/jaipur-airport-taxi';

/** Cities named in the query, in the order they appear. */
function citiesIn(q) {
  let rest = ` ${q} `;
  const found = [];
  for (const [word, key] of CITY_WORDS) {
    const re = new RegExp(`(^|\\s)${word}(\\s|$)`);
    const m = re.exec(rest);
    if (!m) continue;
    found.push({ key, at: m.index });
    rest = rest.slice(0, m.index) + ' '.repeat(m[0].length) + rest.slice(m.index + m[0].length);
  }
  return found.sort((x, y) => x.at - y.at).map((f) => f.key);
}

/** The one page a query should land on. */
export function targetFor(query) {
  const q = query.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (/\bhello\b|hellomy/.test(q)) return { url: '/', group: 'brand' };
  const cities = citiesIn(q);
  if (cities.length >= 2) {
    const [a, b] = cities;
    if (a === b) return { url: cityPath(a), group: 'city' };
    return { url: routePath(a, b), group: 'route' };
  }
  if (/\bairport\b/.test(q) && (cities[0] === 'JAIPUR' || cities[0] === 'JAIPUR_AIRPORT' || cities.length === 0)) {
    return { url: AIRPORT_PATH, group: 'airport' };
  }
  if (cities.length === 1) {
    if (cities[0] === 'KHATU_SHYAM_JI') return { url: cityPath('KHATU_SHYAM_JI'), group: 'khatu' };
    if (cities[0] === 'JAIPUR_AIRPORT') return { url: AIRPORT_PATH, group: 'airport' };
    return { url: cityPath(cities[0]), group: 'city' };
  }
  return { url: '/', group: 'generic' };
}

/** Tier 1 routes, read from the source so the list can never disagree with the site. */
export function tier1Routes() {
  const src = readFileSync(new URL('src/lib/indexing-tiers.ts', root), 'utf8');
  const block = src.slice(src.indexOf('export const TIER1_ROUTES'));
  return [...block.slice(0, block.indexOf('];')).matchAll(/\['([A-Z_]+)', '([A-Z_]+)'\]/g)].map((m) => [m[1], m[2]]);
}

const LABEL = (key) => slugOf(key).replace(/-/g, ' ').replace('delhi airport', 'delhi airport');

function parseQueries(path) {
  const rows = [];
  for (const line of readFileSync(path, 'utf8').split('\n').slice(1)) {
    const cells = line.split(',');
    if (cells.length < 5) continue;
    rows.push({ keyword: cells[0].trim(), impressions: Number(cells[2]) || 0, position: Number(cells[4]) || null });
  }
  return rows;
}

export function buildRows({ queries, routes, today }) {
  const out = new Map();
  const add = (keyword, { impressions = '', position = '' } = {}, forced) => {
    const k = keyword.toLowerCase().trim();
    if (!k || out.has(k)) return;
    const t = forced ?? targetFor(k);
    const imp = impressions === '' ? 0 : impressions;
    const priority = imp >= 50 || (position !== '' && position <= 3 && imp >= 10) ? 'high' : imp >= 10 ? 'medium' : 'seed';
    out.set(k, { keyword: k, group: t.group, target_url: t.url, priority, impressions_3m: impressions, position_3m: position, last_checked: impressions === '' ? '' : today });
  };
  for (const q of queries.filter((r) => r.impressions >= 10)) add(q.keyword, { impressions: q.impressions, position: q.position });
  for (const [a, b] of routes) {
    for (const form of ['cab', 'taxi', 'one way taxi', 'cab fare']) add(`${LABEL(a)} to ${LABEL(b)} ${form}`, {}, { url: routePath(a, b), group: 'route' });
  }
  for (const k of ['jaipur airport taxi', 'taxi service in jaipur airport', 'airport taxi service in jaipur', 'jaipur airport taxi service', 'jaipur airport cab', 'airport taxi']) add(k, {}, { url: AIRPORT_PATH, group: 'airport' });
  for (const k of ['jaipur to khatu shyam taxi', 'jaipur to khatu shyam cab', 'jaipur to khatu shyam ji taxi']) add(k, {}, { url: routePath('JAIPUR', 'KHATU_SHYAM_JI'), group: 'khatu' });
  for (const k of ['delhi to khatu shyam taxi', 'delhi to khatu shyam cab']) add(k, {}, { url: routePath('DELHI', 'KHATU_SHYAM_JI'), group: 'khatu' });
  for (const k of ['taxi in khatu', 'taxi service in khatu shyamji', 'khatu shyam taxi service contact number', 'taxi service in reengus', 'reengus to khatu shyam taxi']) add(k, {}, { url: cityPath('KHATU_SHYAM_JI'), group: 'khatu' });
  // 27 Nov 2026 (PROMPT_INDEX_RANK_27NOV Step 7.4): every route of the keyword map — its
  // primary and four secondaries — and the city / generic groups of the plan (F2), the
  // modifiers Google autocomplete showed (outstation, contact number, near me, fare…).
  for (const r of mapRows) {
    const [a, b] = r.route.split(' → ');
    for (const k of [r.primary, ...r.secondary.split(';').map((x) => x.trim())]) add(k, {}, { url: r.url, group: 'route' });
    void a;
    void b;
  }
  for (const c of ['jaipur', 'kota', 'delhi', 'sikar', 'agra', 'chandigarh']) {
    for (const k of [`taxi service in ${c}`, `cab service in ${c}`, `${c} taxi service`, `taxi service in ${c} for outstation`, `taxi service in ${c} contact number`, `one way taxi ${c}`])
      add(k, {}, { url: cityPath(c.toUpperCase()), group: 'city' });
  }
  for (const k of ['one way taxi', 'one way cab', 'one way cab booking', 'one way taxi service', 'online cab service', 'outstation cab']) add(k, {}, { url: '/', group: 'generic' });
  for (const k of ['hello my cab', 'hello cab', 'hello my cab delhi', 'hello my taxi sikar']) add(k, {}, { url: '/', group: 'brand' });
  const rows = [...out.values()];
  for (const r of rows) {
    r.wave = waveOfUrl(r.target_url);
    r.source = r.impressions_3m !== '' && r.impressions_3m !== undefined ? 'gsc' : 'map';
  }
  // 27 Nov 2026 (PROMPT_KEYWORD_FILES_27NOV Step 1.3): the owner's keyword file, mapped to our
  // real URLs (scripts/seo/keyword-files-map.mjs). A keyword already here keeps its row; an
  // owner keyword with no page keeps an empty target and wave "none" so it is still tracked.
  const have = new Set(rows.map((r) => r.keyword));
  for (const r of ownerRows) {
    if (have.has(r.Keyword)) continue;
    have.add(r.Keyword);
    rows.push({
      keyword: r.Keyword,
      group: `owner:${r.Cluster}`,
      target_url: r.our_url,
      wave: r.wave,
      priority: r.Priority === 'P1' ? 'high' : r.Priority === 'P2' ? 'medium' : 'seed',
      impressions_3m: '',
      position_3m: '',
      last_checked: '',
      source: 'owner-file',
    });
  }
  return rows;
}

/** The owner's keyword file, already mapped (empty when the map has not been built). */
const OWNER_MAP = new URL('docs/seo/evidence/keyword-files-2026-11-27/keyword-map.csv', root);
const ownerRows = (() => {
  try {
    return parseCsv(readFileSync(OWNER_MAP, 'utf8'));
  } catch {
    return [];
  }
})();

/** The keyword map's rows (docs/seo/KEYWORD_MAP_ROUTES_27NOV.csv). */
export function readKeywordMap(path = new URL('docs/seo/KEYWORD_MAP_ROUTES_27NOV.csv', root)) {
  return parseCsv(readFileSync(path, 'utf8'));
}
const mapRows = readKeywordMap();
const WAVE1 = new Set(wave1Paths());
const MAP_WAVE = new Map(
  mapRows.map((r) => [r.url, /^Abhi index/.test(r.action) ? '1' : /^Wave 2/.test(r.action) ? '2' : /^Wave 3/.test(r.action) ? '3' : 'held']),
);
/** Wave 1 if the page is offered for indexing now; else the wave its route waits for. */
export const waveOfUrl = (url) => (WAVE1.has(url) ? '1' : MAP_WAVE.get(url) ?? (/-to-khatu-shyam-ji-cab$|^\/khatu-shyam-ji-to-delhi/.test(url) ? '2' : 'held'));

const COLS = ['keyword', 'group', 'target_url', 'wave', 'priority', 'impressions_3m', 'position_3m', 'last_checked', 'source'];
export const toCsv = (rows) => [COLS.join(','), ...rows.map((r) => COLS.map((c) => r[c] ?? '').join(','))].join('\n') + '\n';

if (import.meta.url === `file://${process.argv[1]}`) {
  const rows = buildRows({ queries: parseQueries(queriesPath), routes: tier1Routes(), today: '2026-11-27' });
  writeFileSync(outPath, toCsv(rows));
  const by = rows.reduce((m, r) => ((m[r.group] = (m[r.group] ?? 0) + 1), m), {});
  console.log(`keywords ${rows.length} → ${outPath}`, by);
}

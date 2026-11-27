#!/usr/bin/env node
/**
 * The Monday numbers (21 Nov 2026, docs/seo/PROMPT_RANK_21NOV.md Steps 1.2 and 1.4).
 *
 *   node scripts/seo/gsc-weekly.mjs --curr <Performance export> [--prev <older export>]
 *        [--coverage <Pages export>] [--date YYYY-MM-DD] [--write]
 *
 * --curr / --prev  Search Console "Performance → Export" folders (Queries.csv, Pages.csv).
 * --coverage       Search Console "Pages → Export" folder: coverage-summary/Chart.csv plus one
 *                  folder per reason (drill-*, each with Metadata.csv naming the Issue and
 *                  Table.csv listing URLs). Gives the Tier 1 index count and the release gate.
 * --write          Update docs/seo/keywords.csv (impressions, position, date) and append the
 *                  report to docs/seo/WEEKLY.md. Without it, only print.
 *
 * (gsc-report.mjs is the older one-export report; it runs on import, so this is beside it.)
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { wave1Paths as tier1Paths, wavePairs, routePath, stringsOf, readTiersSource } from './lib/tiers.mjs';

/** Wave 2 routes and held pages, as paths. */
export const wave2Paths = (src = readTiersSource()) => [...wavePairs(src, 2).map(([a, b]) => routePath(a, b)), ...stringsOf(src, 'WAVE2_PATHS')];

/** RFC-4180-ish CSV → array of objects (quoted fields, commas and quotes inside). */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [head = [], ...body] = rows.filter((r) => r.some((c) => c !== ''));
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.replace(/^﻿/, ''), r[i] ?? ''])));
}

const num = (s) => Number(String(s ?? '').replace(/[,%\s]/g, '')) || 0;
const fileIn = (dir, name) => {
  if (!dir || !existsSync(dir)) return null;
  const f = readdirSync(dir).find((x) => x.toLowerCase() === name.toLowerCase());
  return f ? join(dir, f) : null;
};

/** Queries.csv → Map(query → {clicks, impressions, position}). */
export function loadQueries(dir) {
  const f = fileIn(dir, 'Queries.csv');
  if (!f) throw new Error(`no Queries.csv in ${dir}`);
  return new Map(
    parseCsv(readFileSync(f, 'utf8')).map((r) => {
      const q = (r['Top queries'] ?? r.Query ?? Object.values(r)[0]).trim().toLowerCase();
      return [q, { clicks: num(r.Clicks), impressions: num(r.Impressions), position: num(r.Position) || null }];
    }),
  );
}

/** Pages.csv → Map(path → {clicks, impressions, position}); hosts other than www are kept as full URLs. */
export function loadPages(dir) {
  const f = fileIn(dir, 'Pages.csv');
  if (!f) return new Map();
  const out = new Map();
  for (const r of parseCsv(readFileSync(f, 'utf8'))) {
    const url = (r['Top pages'] ?? r.Page ?? Object.values(r)[0]).trim();
    let key = url;
    try {
      const u = new URL(url);
      key = u.protocol === 'https:' && u.host === 'www.hellomycabs.com' ? u.pathname.replace(/(.)\/$/, '$1') : url;
    } catch {
      /* keep as is */
    }
    out.set(key, { clicks: num(r.Clicks), impressions: num(r.Impressions), position: num(r.Position) || null });
  }
  return out;
}

/** Position movers: queries with ≥ minImpr now, present in both; up = position number fell. */
export function movers(prev, curr, minImpr = 10, n = 10) {
  const rows = [];
  for (const [q, c] of curr) {
    const p = prev.get(q);
    if (!p || !c.position || !p.position || c.impressions < minImpr) continue;
    rows.push({ query: q, from: p.position, to: c.position, delta: p.position - c.position, impr: c.impressions });
  }
  return {
    up: rows.filter((r) => r.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, n),
    down: rows.filter((r) => r.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, n),
    fresh: [...curr].filter(([q, c]) => !prev.has(q) && c.impressions >= minImpr).map(([q]) => q),
  };
}

/** Impression-weighted average position per keyword group. */
export function groupPositions(keywords, curr) {
  const acc = {};
  for (const k of keywords) {
    const c = curr.get(k.keyword);
    if (!c?.position || !c.impressions) continue;
    const g = (acc[k.group] ??= { w: 0, s: 0, n: 0 });
    g.w += c.impressions;
    g.s += c.position * c.impressions;
    g.n++;
  }
  return Object.fromEntries(Object.entries(acc).map(([g, v]) => [g, { position: v.s / v.w, keywords: v.n, impressions: v.w }]));
}

/**
 * The Pages export → Tier 1 status and the release gate.
 * A Tier 1 URL listed under a "not indexed" reason is not indexed; the rest of Tier 1 is
 * counted as indexed only when the export says how many pages are indexed in total and the
 * not-indexed lists are complete (Search Console caps a table at 1,000 rows; we are far below).
 */
export function coverage(dir, tier1 = tier1Paths(), lastWeekDiscovered = null) {
  const reasons = {};
  const notIndexed = new Map(); // path → reason
  const indexedList = new Set();
  let hasIndexedList = false;
  for (const sub of readdirSync(dir)) {
    const p = join(dir, sub);
    if (!statSync(p).isDirectory()) continue;
    const meta = fileIn(p, 'Metadata.csv');
    const table = fileIn(p, 'Table.csv');
    if (!meta || !table) continue;
    const issue = parseCsv(readFileSync(meta, 'utf8')).find((r) => r.Property === 'Issue')?.Value;
    const urls = parseCsv(readFileSync(table, 'utf8')).map((r) => r.URL ?? Object.values(r)[0]);
    // The "Indexed" drilldown (Pages → View data about indexed pages) has no Issue row
    // (27 Nov 2026): its URLs are the indexed ones — the only list that proves a page is in.
    if (!issue) {
      for (const u of urls) {
        try {
          const x = new URL(u);
          if (x.protocol === 'https:' && x.host === 'www.hellomycabs.com') indexedList.add(x.pathname.replace(/(.)\/$/, '$1'));
        } catch {
          /* skip */
        }
      }
      hasIndexedList = true;
      continue;
    }
    reasons[issue] = urls.length;
    for (const u of urls) {
      try {
        const x = new URL(u);
        if (x.protocol === 'https:' && x.host === 'www.hellomycabs.com') notIndexed.set(x.pathname.replace(/(.)\/$/, '$1'), issue);
      } catch {
        /* skip */
      }
    }
  }
  let indexedTotal = null;
  let notIndexedTotal = null;
  const chart = fileIn(join(dir, 'coverage-summary'), 'Chart.csv') ?? fileIn(dir, 'Chart.csv');
  if (chart) {
    const last = parseCsv(readFileSync(chart, 'utf8')).at(-1) ?? {};
    indexedTotal = num(last['Indexed'] ?? last['Indexed pages']);
    notIndexedTotal = num(last['Not indexed'] ?? last['Not indexed pages']);
  }
  // 27 Nov 2026 fix: with the Indexed list, a page counts only if it is on it; a page on no
  // list at all (not live yet, never seen) is NOT indexed. Without that list (older exports)
  // the old rule — everything not listed as not-indexed — is kept, and said so.
  const isIn = (p) => (hasIndexedList ? indexedList.has(p) : !notIndexed.has(p));
  const t1Not = tier1.filter((p) => !isIn(p));
  const t1Indexed = tier1.length - t1Not.length;
  const share = tier1.length ? t1Indexed / tier1.length : 0;
  const discovered = Object.entries(reasons).find(([k]) => /discovered/i.test(k))?.[1] ?? 0;
  const gate =
    share >= 0.8 && (lastWeekDiscovered == null || discovered <= lastWeekDiscovered)
      ? 'met — release the next wave (release-wave.mjs)'
      : share >= 0.5
        ? 'not met — improve the Tier 1 pages that are not indexed'
        : 'not met — release nothing';
  return {
    reasons,
    indexedTotal,
    notIndexedTotal,
    exactIndexed: hasIndexedList,
    tier1Total: tier1.length,
    tier1Indexed: t1Indexed,
    tier1NotIndexed: t1Not.map((p) => `${p} (${notIndexed.get(p) ?? 'not seen by Google yet'})`),
    share,
    discovered,
    discoveredLastWeek: lastWeekDiscovered,
    gate,
    /** What Search Console says about any path (27 Nov 2026): 'indexed', a reason, or null. */
    statusOf: (p) => (indexedList.has(p) ? 'indexed' : notIndexed.get(p) ?? null),
  };
}

/** Keywords per source (gsc / map / owner-file) and how many of them this export saw. */
export function sourceBreakdown(keywords, curr) {
  const out = {};
  for (const r of keywords) {
    const k = r.source || 'unknown';
    out[k] ??= { keywords: 0, seen: 0, impressions: 0 };
    out[k].keywords++;
    const c = curr.get(r.keyword);
    if (c) {
      out[k].seen++;
      out[k].impressions += c.impressions;
    }
  }
  return out;
}

/** The decision rule of scripts/seo/weekly.md §10 that this week's numbers point to. */
export function nextStep(cov) {
  if (cov.discoveredLastWeek != null && cov.discovered > cov.discoveredLastWeek)
    return 'Discovered rose — release nothing; check the newest pages (weekly.md §10).';
  if (cov.share >= 0.8) return 'gate met — release-wave.mjs --wave 2 (weekly.md §10).';
  if (cov.share < 0.3)
    return 'Wave 1 under 30% — after 2 weeks: URL Inspection on 5 pages + page-quality.mjs; after 4 weeks: propose the lean static template (weekly.md §10).';
  return 'between 30% and 80% — improve the Wave 1 pages still not indexed first (weekly.md §10).';
}

/** keywords.csv rows with fresh numbers from this export. */
export function refreshKeywords(rows, curr, date) {
  return rows.map((r) => {
    const c = curr.get(r.keyword);
    return c ? { ...r, impressions_3m: String(c.impressions), position_3m: c.position ? c.position.toFixed(2) : '', last_checked: date } : r;
  });
}

const fmt = (n) => (n == null ? '—' : n.toFixed(1));

export function report({ date, curr, prev, keywords, cov }) {
  const lines = [`\n## Weekly — ${date}\n`];
  let clicks = 0;
  let impr = 0;
  for (const v of curr.values()) {
    clicks += v.clicks;
    impr += v.impressions;
  }
  lines.push(`Queries in export: ${curr.size} · clicks ${clicks} · impressions ${impr}`);
  if (cov) {
    lines.push(
      `Index: ${cov.indexedTotal ?? '?'} indexed / ${cov.notIndexedTotal ?? '?'} not · Wave 1 (Tier 1) ${cov.tier1Indexed} of ${cov.tier1Total} (${Math.round(cov.share * 100)}%)${cov.exactIndexed ? '' : ' (no Indexed list in the export — estimate)'} · Discovered ${cov.discovered}${cov.discoveredLastWeek != null ? ` (last week ${cov.discoveredLastWeek})` : ''} · **Gate: ${cov.gate}**`,
    );
    if (cov.tier1NotIndexed.length) lines.push(`Tier 1 not indexed: ${cov.tier1NotIndexed.join(', ')}`);
    lines.push(`Next step: ${nextStep(cov)}`);
    // The pages waiting for Wave 2 (27 Nov 2026): routes and held pages, and whether Google has
    // seen them yet ("Excluded by 'noindex' tag" is expected while they wait).
    const waiting = wave2Paths();
    if (waiting.length && cov.statusOf) {
      const seen = waiting.filter((p) => cov.statusOf(p));
      lines.push(`Waiting for Wave 2: ${waiting.length} pages, ${seen.length} seen by Google${seen.length ? ` (${seen.slice(0, 8).map((p) => `${p}: ${cov.statusOf(p)}`).join('; ')})` : ''}`);
    }
  }
  const groups = groupPositions(keywords, curr);
  lines.push('', '| Group | Avg position (impression-weighted) | Keywords seen | Impressions |', '|---|---|---|---|');
  for (const [g, v] of Object.entries(groups).sort()) lines.push(`| ${g} | ${fmt(v.position)} | ${v.keywords} | ${v.impressions} |`);
  // 27 Nov 2026: where the keywords come from — Search Console, our map, the owner's file.
  const src = sourceBreakdown(keywords, curr);
  if (Object.keys(src).length) {
    lines.push('', '| Source | Keywords | Seen this export | Impressions |', '|---|---|---|---|');
    for (const [k, v] of Object.entries(src).sort()) lines.push(`| ${k} | ${v.keywords} | ${v.seen} | ${v.impressions} |`);
  }
  if (prev) {
    const m = movers(prev, curr);
    lines.push('', '| Up (position) | from → to | Down (position) | from → to |', '|---|---|---|---|');
    for (let i = 0; i < Math.max(m.up.length, m.down.length, 1); i++) {
      const u = m.up[i];
      const d = m.down[i];
      lines.push(`| ${u?.query ?? ''} | ${u ? `${fmt(u.from)} → ${fmt(u.to)}` : ''} | ${d?.query ?? ''} | ${d ? `${fmt(d.from)} → ${fmt(d.to)}` : ''} |`);
    }
    if (m.fresh.length) lines.push('', `New queries (≥ 10 impressions): ${m.fresh.slice(0, 20).join(', ')}`);
  }
  return lines.join('\n') + '\n';
}

const KEY_COLS = ['keyword', 'group', 'target_url', 'wave', 'priority', 'impressions_3m', 'position_3m', 'last_checked', 'source'];

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const opt = (n) => {
    const i = args.indexOf(n);
    return i === -1 ? null : args[i + 1];
  };
  const currDir = opt('--curr');
  if (!currDir) {
    console.error('usage: node scripts/seo/gsc-weekly.mjs --curr <export> [--prev <export>] [--coverage <pages export>] [--date YYYY-MM-DD] [--write]');
    process.exit(2);
  }
  const date = opt('--date') ?? new Date().toISOString().slice(0, 10);
  const root = new URL('../../', import.meta.url).pathname;
  const kwPath = join(root, 'docs/seo/keywords.csv');
  const keywords = parseCsv(readFileSync(kwPath, 'utf8'));
  const curr = loadQueries(currDir);
  const prev = opt('--prev') ? loadQueries(opt('--prev')) : null;
  // --prev-coverage: last week's Pages export, so the gate can see whether Discovered rose.
  const prevCov = opt('--prev-coverage') ? coverage(opt('--prev-coverage')) : null;
  const cov = opt('--coverage') ? coverage(opt('--coverage'), tier1Paths(), prevCov?.discovered ?? null) : null;
  const text = report({ date, curr, prev, keywords, cov });
  console.log(text);
  if (args.includes('--write')) {
    const fresh = refreshKeywords(keywords, curr, date);
    writeFileSync(kwPath, [KEY_COLS.join(','), ...fresh.map((r) => KEY_COLS.map((c) => r[c] ?? '').join(','))].join('\n') + '\n');
    appendFileSync(join(root, 'docs/seo/WEEKLY.md'), text);
    console.log('updated docs/seo/keywords.csv and appended docs/seo/WEEKLY.md');
  }
}

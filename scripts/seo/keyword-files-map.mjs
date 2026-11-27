#!/usr/bin/env node
/**
 * The owner's keyword file → one real URL of ours per keyword (27 Nov 2026,
 * docs/seo/PROMPT_KEYWORD_FILES_27NOV.md Step 1.2).
 *
 *   node scripts/seo/keyword-files-map.mjs
 *
 * Reads the master file (docs/seo/evidence/keyword-files-2026-11-27/) and the page decisions
 * (docs/seo/KEYWORD_FILES_PAGE_DECISIONS_27NOV.csv, one row per target URL of the file) and
 * writes keyword-map.csv beside the master: Keyword, Cluster, Priority, our_url, reason, wave.
 *
 *   OPTIMISE (Wave 1)          → the page itself, wave 1
 *   HOLD …                     → the page itself (it opens with its wave), wave 2/3/held
 *   NEVER INDEX (twin)         → the page of the same road that is (or will be) indexed
 *   BUILD … / LATER …          → the planned path, wave 2 or 3
 *   DON'T BUILD …              → '' — no page (doorway / no demand)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { parseCsv } from './gsc-weekly.mjs';
import { readTiersSource, pairsOf, routePath } from './lib/tiers.mjs';

const DIR = 'docs/seo/evidence/keyword-files-2026-11-27';
export const MASTER = `${DIR}/hellomycabs_keyword_master_v2_rebuilt.csv`;
export const DECISIONS = 'docs/seo/KEYWORD_FILES_PAGE_DECISIONS_27NOV.csv';
export const OUT = `${DIR}/keyword-map.csv`;

/** A twin route page → the page carrying the same road (27 Nov 2026 plan §B.2). */
export function twinTarget(path) {
  if (path === '/delhi-airport-to-jaipur-airport-cab') return '/delhi-airport-to-jaipur-cab';
  if (path === '/jaipur-airport-to-delhi-airport-cab') return '/jaipur-to-delhi-airport-cab';
  if (path.startsWith('/jaipur-airport-to-') || path.endsWith('-to-jaipur-airport-cab')) return '/jaipur-airport-taxi';
  if (path === '/delhi-airport-to-khatu-shyam-ji-cab') return '/delhi-to-khatu-shyam-ji-cab';
  if (path === '/khatu-shyam-ji-to-delhi-airport-cab') return '/khatu-shyam-ji-to-delhi-cab';
  return '';
}

/** The wave a held route waits for, from indexing-tiers.ts. */
export function waveOfPath(path, src = readTiersSource()) {
  const has = (name) => pairsOf(src, name).some(([a, b]) => routePath(a, b) === path);
  if (has('TIER1_ROUTES')) return '1';
  if (has('WAVE2_ROUTES')) return '2';
  if (has('WAVE3_ROUTES')) return '3';
  return 'held';
}

export function mapRow(kw, decision, path, src) {
  const d = decision.decision;
  if (d.startsWith('OPTIMISE')) return { our_url: path, reason: 'wave 1 page', wave: '1' };
  if (d.startsWith('HOLD (sample')) return { our_url: path, reason: 'held: sample packages', wave: 'held' };
  if (d.startsWith('HOLD')) return { our_url: path, reason: 'held page, opens with its wave', wave: waveOfPath(path, src) };
  if (d.startsWith('NEVER INDEX')) {
    const t = twinTarget(path);
    return { our_url: t, reason: `twin of ${t || '?'}`, wave: t ? (t === '/jaipur-airport-taxi' ? '1' : waveOfPath(t, src)) : 'none' };
  }
  if (d.startsWith('BUILD later') || d.startsWith('LATER')) return { our_url: path, reason: 'planned later', wave: '3' };
  if (d.startsWith('BUILD')) return { our_url: path, reason: 'planned (Wave 2)', wave: '2' };
  if (d.includes('doorway')) return { our_url: '', reason: 'no page (doorway)', wave: 'none' };
  return { our_url: '', reason: 'no page (no demand)', wave: 'none' };
}

export function buildMap(master, decisions, src = readTiersSource()) {
  const byUrl = new Map(decisions.map((r) => [r.url, r]));
  return master.map((r) => {
    let path = '';
    try {
      path = new URL(r.Suggested_Target_URL).pathname.replace(/\/$/, '') || '/';
    } catch {
      /* no URL */
    }
    const dec = byUrl.get(path);
    const m = dec ? mapRow(r.Keyword, dec, path, src) : { our_url: '', reason: 'no decision', wave: 'none' };
    return { Keyword: r.Keyword.trim().toLowerCase(), Cluster: r.Cluster, Priority: r.Priority, file_url: path, ...m };
  });
}

const COLS = ['Keyword', 'Cluster', 'Priority', 'file_url', 'our_url', 'reason', 'wave'];
const esc = (v) => (/[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : v);

if (import.meta.url === `file://${process.argv[1]}`) {
  const rows = buildMap(parseCsv(readFileSync(MASTER, 'utf8')), parseCsv(readFileSync(DECISIONS, 'utf8')));
  writeFileSync(OUT, [COLS.join(','), ...rows.map((r) => COLS.map((c) => esc(r[c] ?? '')).join(','))].join('\n') + '\n');
  const by = rows.reduce((m, r) => ((m[r.reason.replace(/ of .*/, '')] = (m[r.reason.replace(/ of .*/, '')] ?? 0) + 1), m), {});
  console.log(`${rows.length} keywords → ${OUT}`, by);
}

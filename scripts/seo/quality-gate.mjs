#!/usr/bin/env node
/**
 * The Tier 1 content gate (20 Nov 2026, docs/seo/PROMPT_INDEXING_20NOV.md Step 6.9).
 *
 *   node scripts/seo/quality-gate.mjs docs/seo/evidence/crawl-<date>-<label>.json
 *
 * Reads a crawl (scripts/seo/crawl-audit.py) and the committed baseline
 * (docs/seo/quality-baseline.json) and FAILS (exit 1) when, against that baseline:
 *   · a Tier 1 page is missing from the crawl, or is not 200;
 *   · a Tier 1 page's closest-match similarity rises by more than 0.02;
 *   · a Tier 1 page loses more than 10% of its words;
 *   · any page in the crawl is more than 0.65 like another.
 * It REPORTS (does not fail on) the plan's targets — Tier 1 similarity < 0.35 and ≥ 900 words
 * on route and city pages — because they are met with real data (route-insights) and verified
 * facts, never with filler. Update the baseline only when a page genuinely improved:
 *   node scripts/seo/quality-gate.mjs <crawl.json> --write-baseline
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [file, flag] = process.argv.slice(2);
if (!file) {
  console.error('usage: quality-gate.mjs <crawl.json> [--write-baseline]');
  process.exit(2);
}
const crawl = JSON.parse(readFileSync(file, 'utf8'));
const basePath = new URL('../../docs/seo/quality-baseline.json', import.meta.url);
const base = JSON.parse(readFileSync(basePath, 'utf8'));
const pages = new Map(crawl.pages.map((p) => [p.path, p]));
const fail = [];
const report = [];

for (const [path, b] of Object.entries(base.pages)) {
  const p = pages.get(path);
  if (!p) { fail.push(`${path}: not in the crawl`); continue; }
  if (p.code !== 200) fail.push(`${path}: HTTP ${p.code}`);
  if (p.maxSimilarity > b.maxSimilarity + 0.02)
    fail.push(`${path}: similarity ${b.maxSimilarity} → ${p.maxSimilarity} (closest ${p.mostSimilarTo})`);
  if (p.words < b.words * 0.9) fail.push(`${path}: words ${b.words} → ${p.words}`);
  const contentPage = /-cab$|^\/cab-service-in-/.test(path);
  if (contentPage && p.maxSimilarity >= 0.35) report.push(`${path}: similarity ${p.maxSimilarity} (target < 0.35)`);
  if (contentPage && p.words < 900) report.push(`${path}: ${p.words} words (target ≥ 900)`);
}
for (const p of crawl.pages)
  if (p.maxSimilarity > 0.65) fail.push(`${p.path}: ${p.maxSimilarity} like ${p.mostSimilarTo} (limit 0.65)`);

if (flag === '--write-baseline') {
  base.date = crawl.date;
  base.source = file;
  for (const path of Object.keys(base.pages)) {
    const p = pages.get(path);
    if (p) base.pages[path] = { words: p.words, maxSimilarity: p.maxSimilarity };
  }
  writeFileSync(basePath, JSON.stringify(base, null, 2) + '\n');
  console.log('baseline written');
}
console.log(`Tier 1 pages checked: ${Object.keys(base.pages).length}`);
if (report.length) console.log(`\nTargets not met yet (${report.length}):\n  ${report.join('\n  ')}`);
if (fail.length) {
  console.error(`\nFAILED (${fail.length}):\n  ${fail.join('\n  ')}`);
  process.exit(1);
}
console.log('\nquality gate passed');

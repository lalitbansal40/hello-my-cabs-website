#!/usr/bin/env node
/**
 * Fares that look wrong — for the owner to decide, never changed by this script
 * (21 Nov 2026, docs/seo/PROMPT_RANK_21NOV.md Step 3.1).
 *
 *   node scripts/seo/fare-sanity.mjs [--routes <routes.json>] [--write]
 *
 * Reads the public catalogue (GET /public/routes, or a saved copy) and flags a route when:
 *   a. its ₹/km is more than twice the catalogue median;
 *   b. A→B and B→A differ by more than 20%;
 *   c. against routes of about the same length (±15%, ≥ 100 km, ≥ 5 of them): over 1.5× or
 *      under 0.6× their median ₹/km;
 *   d. it is under 40 km and priced above ₹1,500.
 * With --write it writes docs/seo/FARE_REVIEW_21NOV.md (a table with an empty column for the
 * owner's answer). Flagged pairs belong in FARE_HOLD (src/lib/indexing-tiers.ts) until decided.
 */
import { readFileSync, writeFileSync } from 'node:fs';

/** What the 21 Nov research found competitors asking (PLAN_RANK_21NOV.md §1). */
export const COMPETITOR = {
  'JAIPUR>DELHI': '₹1,899–3,300 (oneway.cab, Gozo, Triveni, Uber)',
  'DELHI>JAIPUR': '₹1,899–3,300 (same road)',
  'DELHI>AGRA': '₹1,499–3,300 (oneway.cab, CabBazar, Savaari, Triveni)',
  'DELHI>CHANDIGARH': '₹2,250–3,300 (CabBazar, Triveni, Uber)',
  'KOTA>JAIPUR': '₹1,999–2,249 (Rajputana, reverse direction)',
  'JAIPUR>KOTA': '₹1,999–2,249 (Rajputana)',
  'JAIPUR>SIKAR': '₹1,400–1,600 (Rajputana, oneway.cab)',
  'SIKAR>JAIPUR': '₹1,499 (oneway.cab)',
};

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function flagFares(routes) {
  const priced = routes.filter((r) => r.fromRupees > 0 && r.distanceKm > 0);
  const perKm = (r) => r.fromRupees / r.distanceKm;
  const med = median(priced.map(perKm));
  const by = new Map(priced.map((r) => [`${r.pickup}>${r.drop}`, r]));
  const flags = new Map();
  const add = (r, why) => {
    const k = `${r.pickup}>${r.drop}`;
    const f = flags.get(k) ?? { route: r, reasons: [] };
    f.reasons.push(why);
    flags.set(k, f);
  };
  for (const r of priced) {
    if (perKm(r) > 2 * med) add(r, `₹${perKm(r).toFixed(1)}/km — over twice the usual ₹${med.toFixed(1)}/km`);
    const back = by.get(`${r.drop}>${r.pickup}`);
    if (back && Math.abs(r.fromRupees - back.fromRupees) / Math.min(r.fromRupees, back.fromRupees) > 0.2) {
      add(r, `the other way is ₹${back.fromRupees.toLocaleString('en-IN')}`);
    }
    if (r.distanceKm < 40 && r.fromRupees > 1500) add(r, `under 40 km for ₹${r.fromRupees.toLocaleString('en-IN')}`);
    if (r.distanceKm >= 100) {
      // Against routes of about the same length (±15%, ≥ 100 km, at least 5 of them): far
      // dearer per km than they usually are, or far cheaper (a cheap outlier is as wrong).
      const peers = priced.filter(
        (o) => o !== r && o.distanceKm >= 100 && Math.abs(o.distanceKm - r.distanceKm) / r.distanceKm <= 0.15,
      );
      if (peers.length >= 5) {
        const peer = median(peers.map(perKm));
        if (perKm(r) > 1.5 * peer) add(r, `₹${perKm(r).toFixed(1)}/km vs ₹${peer.toFixed(1)}/km on roads of similar length`);
        else if (perKm(r) < 0.6 * peer) add(r, `only ₹${perKm(r).toFixed(1)}/km vs ₹${peer.toFixed(1)}/km on roads of similar length — too cheap?`);
      }
    }
  }
  return { median: med, flags: [...flags.values()].sort((a, b) => b.reasons.length - a.reasons.length || perKm(b.route) - perKm(a.route)) };
}

const label = (k) => k.charAt(0) + k.slice(1).toLowerCase().replace(/_(\w)/g, (_, c) => ` ${c.toUpperCase()}`);

export function reviewMarkdown({ median: med, flags }, asOf) {
  const lines = [
    '# Fare review — routes whose price looks wrong (21 Nov 2026)',
    '',
    `Made by \`scripts/seo/fare-sanity.mjs\` from the public catalogue (${asOf}). **Kuch bhi badla nahi gaya.** Har line ke aage "theek hai" ya naya fare likh dijiye — main wahi lagaunga. Tab tak ye routes Google ko nahi diye jaayenge (\`FARE_HOLD\`).`,
    '',
    `Catalogue median: ₹${med.toFixed(1)}/km (the "from" price, cheapest car, toll shown separately).`,
    '',
    '| Route | km | From price | ₹/km | Why flagged | Competitors (research) | Owner: theek / naya ₹ |',
    '|---|---|---|---|---|---|---|',
  ];
  for (const { route: r, reasons } of flags) {
    const k = `${r.pickup}>${r.drop}`;
    lines.push(
      `| ${label(r.pickup)} → ${label(r.drop)} | ${r.distanceKm} | ₹${r.fromRupees.toLocaleString('en-IN')} | ${(r.fromRupees / r.distanceKm).toFixed(1)} | ${reasons.join('; ')} | ${COMPETITOR[k] ?? '—'} |  |`,
    );
  }
  lines.push('', `${flags.length} routes flagged.`, '');
  return lines.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const i = args.indexOf('--routes');
  let routes;
  let asOf;
  if (i !== -1) {
    const j = JSON.parse(readFileSync(args[i + 1], 'utf8'));
    routes = j.routes ?? j.data?.routes;
    asOf = j.asOf ?? args[i + 1];
  } else {
    const api = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.hellomycabs.com/api/v1').replace(/\/+$/, '');
    routes = (await (await fetch(`${api}/public/routes`)).json()).data.routes;
    asOf = new Date().toISOString().slice(0, 10);
  }
  const result = flagFares(routes);
  for (const f of result.flags) console.log(`${f.route.pickup}>${f.route.drop}`.padEnd(30), f.reasons.join('; '));
  console.log(`${result.flags.length} flagged; median ₹${result.median.toFixed(1)}/km`);
  if (args.includes('--write')) {
    writeFileSync(new URL('../../docs/seo/FARE_REVIEW_21NOV.md', import.meta.url), reviewMarkdown(result, asOf));
    console.log('wrote docs/seo/FARE_REVIEW_21NOV.md');
  }
}

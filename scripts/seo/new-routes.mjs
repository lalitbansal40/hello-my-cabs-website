#!/usr/bin/env node
/**
 * Routes people already travel that the site does not sell yet (21 Nov 2026,
 * docs/seo/PROMPT_RANK_21NOV.md Step 10.2).
 *
 *   node scripts/seo/new-routes.mjs [--min 20] [--insights <all.json>] [--routes <routes.json>]
 *
 * Reads our own trips (GET /public/route-insights/all — pairs with ≥ 20 trips in 90 days) and
 * the catalogue (GET /public/routes), and prints the pairs that have demand but no route in
 * the catalogue. It creates nothing: a new route needs the owner's fare first (a page with a
 * guessed price is worse than none). The list goes into OWNER_STEPS for that decision.
 */
import { readFileSync } from 'node:fs';

export function newRoutes(insights, catalogue, min = 20) {
  const have = new Set(catalogue.map((r) => `${r.pickup}>${r.drop}`));
  return insights
    .filter((r) => r.pickup && r.drop && r.pickup !== r.drop && (r.demand ?? 0) >= min)
    .filter((r) => !have.has(`${r.pickup}>${r.drop}`))
    .map((r) => ({ pickup: r.pickup, drop: r.drop, trips: r.demand, km: r.distance?.distanceKm ?? null }))
    .sort((a, b) => b.trips - a.trips);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const opt = (n, d) => {
    const i = args.indexOf(n);
    return i === -1 ? d : args[i + 1];
  };
  const API = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.hellomycabs.com/api/v1').replace(/\/+$/, '');
  const read = async (file, path) =>
    file ? JSON.parse(readFileSync(file, 'utf8')) : (await (await fetch(`${API}/public${path}`)).json()).data;
  const ins = await read(opt('--insights', null), '/route-insights/all');
  const cat = await read(opt('--routes', null), '/routes');
  const rows = newRoutes(ins.routes ?? [], cat.routes ?? [], Number(opt('--min', '20')));
  console.log(`${rows.length} pairs with demand and no route in the catalogue:\n`);
  for (const r of rows) console.log(`  ${`${r.pickup} → ${r.drop}`.padEnd(34)} ${String(r.trips).padStart(4)} trips / 90 days${r.km ? `  ${r.km} km measured` : ''}`);
}

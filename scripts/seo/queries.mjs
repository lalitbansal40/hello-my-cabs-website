/**
 * What people actually type, for each route, city and vehicle — from Google's autocomplete.
 *
 *   node scripts/seo/queries.mjs          # Tier A and B routes, every city, every vehicle
 *   node scripts/seo/queries.mjs --all    # every one of the 90 routes
 *
 * Writes src/content/queries.json. That file is committed: the build never calls out to
 * Google, so a build today and a build next month produce the same pages.
 *
 * What it is for: seeing which phrasings exist ("jaipur se delhi taxi", "jaipur to delhi
 * innova fare") so a page answers the question behind them. What it is NOT for: putting
 * the phrases on the page. A page that carries twenty variations of its own name is written
 * for a crawler, and check 11 in seo:check fails a page that repeats its money phrase more
 * than four times.
 *
 * One request a second, and it stops at the first refusal and writes what it has — a
 * half-finished file is useful, a script that hammers the endpoint until it is blocked is
 * not.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const API = process.env.API_BASE_URL ?? 'https://api.hellomycabs.com/api/v1/public';
const OUT = new URL('../../src/content/queries.json', import.meta.url);
const ALL = process.argv.includes('--all');
const PAUSE_MS = 1000;

const TIER_A = new Set(['JAIPUR|DELHI', 'DELHI|JAIPUR']);
const TIER_B = new Set(
  [
    ['DELHI', 'AGRA'],
    ['DELHI', 'CHANDIGARH'],
    ['DELHI', 'HARIDWAR'],
    ['DELHI', 'NOIDA'],
    ['JAIPUR', 'AGRA'],
    ['JAIPUR', 'CHANDIGARH'],
    ['JAIPUR', 'AJMER'],
    ['JAIPUR', 'DELHI_AIRPORT'],
  ].flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`]),
);

const name = (key) => key.toLowerCase().replace(/_/g, ' ');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * A dropped connection is retried twice, with a pause; a refusal (429, 403) is not — that
 * is the endpoint saying stop, and the right answer is to stop. The first run died on one
 * transient network error three requests in.
 */
async function suggest(q) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=in&q=${encodeURIComponent(q)}`;
  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      // A timeout, because fetch has none: the second run hung for half an hour on one
      // connection that never answered, and a hung script writes nothing at all.
      res = await fetch(url, {
        headers: { 'user-agent': 'Mozilla/5.0 (queries.mjs)' },
        signal: AbortSignal.timeout(10_000),
      });
    } catch (e) {
      if (attempt < 2) {
        await sleep(3000 * (attempt + 1));
        continue;
      }
      throw e;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data?.[1]) ? data[1].map((s) => String(s).toLowerCase().trim()) : [];
  }
}

const routes = (await fetch(`${API}/routes`).then((r) => r.json())).data.routes;
const vehicles = (await fetch(`${API}/vehicles`).then((r) => r.json())).data;
const fleet = [...vehicles.intercity, ...vehicles.roundTripOnly];
const cities = [...new Set(routes.map((r) => r.pickup))];

const picked = routes.filter((r) => {
  const k = `${r.pickup}|${r.drop}`;
  return ALL || TIER_A.has(k) || TIER_B.has(k);
});

/** [bucket, seed, must-contain words] — a suggestion is kept only if it is still about this. */
const jobs = [
  ...picked.flatMap((r) => {
    const a = name(r.pickup);
    const b = name(r.drop);
    const key = `${r.pickup}-${r.drop}`;
    return [
      `${a} to ${b} taxi`,
      `${a} to ${b} cab`,
      `${a} to ${b} taxi fare`,
      `${a} se ${b}`,
      `${a} to ${b} one way`,
    ].map((seed) => [key, seed, [a.split(' ')[0], b.split(' ')[0]]]);
  }),
  ...cities.flatMap((c) =>
    [`taxi in ${name(c)}`, `cab service ${name(c)}`, `${name(c)} local taxi`].map((seed) => [
      `city:${c}`,
      seed,
      [name(c).split(' ')[0]],
    ]),
  ),
  ...fleet.flatMap((v) =>
    [`${v.label.toLowerCase()} on rent`, `${v.label.toLowerCase()} taxi`].map((seed) => [
      `vehicle:${v.key}`,
      seed,
      [v.label.toLowerCase().split(' ')[0]],
    ]),
  ),
];

let existing = {};
try {
  existing = JSON.parse(readFileSync(OUT, 'utf8'));
} catch {
  // first run
}
const found = { ...existing };
let done = 0;
let stopped = '';

for (const [bucket, seed, must] of jobs) {
  try {
    const got = await suggest(seed);
    const keep = got.filter((s) => must.every((w) => s.includes(w)));
    found[bucket] = [...new Set([...(found[bucket] ?? []), seed, ...keep])].sort();
    done++;
    writeFileSync(OUT, JSON.stringify(found, null, 2) + '\n');
    process.stdout.write(done % 10 === 0 ? `${done}` : '.');
  } catch (e) {
    stopped = `${e.message} after ${done} of ${jobs.length}`;
    break;
  }
  await sleep(PAUSE_MS);
}

const sorted = Object.fromEntries(Object.entries(found).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT, JSON.stringify(sorted, null, 2) + '\n');
console.log(
  `\n${stopped ? `stopped: ${stopped}` : `done: ${done} queries`} → src/content/queries.json`,
);
const routeBuckets = Object.entries(sorted).filter(([k]) => !k.includes(':'));
const thin = routeBuckets.filter(([, v]) => v.length < 15).map(([k, v]) => `${k} (${v.length})`);
console.log(
  `${routeBuckets.length} routes, ${thin.length} with fewer than 15 variations${thin.length ? `: ${thin.join(', ')}` : ''}`,
);

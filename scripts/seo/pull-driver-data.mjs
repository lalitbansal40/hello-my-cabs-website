/**
 * Bring what drivers reported about the roads into the route pages.
 *
 *   node scripts/seo/pull-driver-data.mjs            # show what would change
 *   node scripts/seo/pull-driver-data.mjs --write    # and write it
 *
 * Reads /public/route-knowledge/<pickup>/<drop> for every published route. That endpoint
 * already applies the rules — approved answers only, a stop only when 2+ drivers name it,
 * no toll count when drivers contradict each other, no driver's own words — so this script
 * does not second-guess it. What it adds is a person in the loop: it prints the change,
 * road by road, and writes src/content/routes/driver.generated.ts only when told to.
 *
 * The hand-written src/content/routes/index.ts is never touched.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const API = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.hellomycabs.com/api/v1').replace(
  /\/+$/,
  '',
);
const write = process.argv.includes('--write');
const OUT = new URL('../../src/content/routes/driver.generated.ts', import.meta.url);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * One request at a time, paced under the public API's limit (120 a minute from one IP) —
 * a run is ~90 requests. A RATE_LIMITED answer waits the minute out and tries again, rather
 * than silently reading that road as having no driver data.
 */
const get = async (path, tries = 3) => {
  await sleep(550);
  const res = await fetch(`${API}/public${path}`, { signal: AbortSignal.timeout(10_000) });
  const body = await res.json().catch(() => null);
  if (body?.error?.code === 'RATE_LIMITED' && tries > 1) {
    console.warn(`rate limited on ${path} — waiting a minute`);
    await sleep(65_000);
    return get(path, tries - 1);
  }
  if (!body?.ok) throw new Error(`${path}: ${body?.error?.code ?? res.status}`);
  return body.data;
};

/** The shape RouteRoad renders — the fields it knows, and nothing a driver typed. */
function toDriverField(k) {
  const out = {};
  if (k.stops?.length) {
    out.stops = k.stops.map((s) => ({
      name: s.name,
      ...(typeof s.aboutKm === 'number' ? { aboutKm: s.aboutKm } : {}),
      note: s.note,
    }));
  }
  if (k.tolls?.count != null) {
    out.tolls = {
      count: k.tolls.count,
      ...(k.tolls.approxRupees ? { approxRupees: k.tolls.approxRupees } : {}),
    };
  }
  if (k.bestTime) out.bestTime = k.bestTime;
  if (k.roadNote) out.roadNote = k.roadNote;
  if (k.realHours) out.realHours = k.realHours;
  return Object.keys(out).length ? out : null;
}

const { routes } = await get('/routes');
const next = {};
const failed = [];
for (const r of routes) {
  const key = `${r.pickup}-${r.drop}`;
  try {
    const k = await get(`/route-knowledge/${r.pickup}/${r.drop}`);
    const field = toDriverField(k);
    if (field) next[key] = { field, drivers: k.drivers };
  } catch (e) {
    // CITY_NOT_FOUND is a city the backend does not know — genuinely nothing. Anything else,
    // including ROUTE_NOT_FOUND (a backend without this endpoint), is a failed read, and
    // writing after one would delete that road's data.
    if (!/CITY_NOT_FOUND/.test(e.message)) failed.push(key);
    console.warn(`skip ${key}: ${e.message}`);
  }
}

// What is in the file now, to diff against.
const current = {};
const src = readFileSync(OUT, 'utf8');
const json = src.match(/DRIVER_DATA[^=]*=\s*(\{[\s\S]*\});\s*$/)?.[1];
if (json) Object.assign(current, JSON.parse(json));

const keys = [...new Set([...Object.keys(current), ...Object.keys(next).sort()])];
let changes = 0;
for (const key of keys) {
  const before = current[key] ? JSON.stringify(current[key], null, 2) : null;
  const after = next[key] ? JSON.stringify(next[key].field, null, 2) : null;
  if (before === after) continue;
  changes++;
  console.log(`\n── ${key}${next[key] ? `  (${next[key].drivers} approved drivers)` : ''}`);
  if (before)
    console.log(
      before
        .split('\n')
        .map((l) => `- ${l}`)
        .join('\n'),
    );
  if (after)
    console.log(
      after
        .split('\n')
        .map((l) => `+ ${l}`)
        .join('\n'),
    );
}
console.log(`\n${changes} road(s) changed, ${Object.keys(next).length} with driver data.`);

if (failed.length) {
  console.error(`\n${failed.length} road(s) could not be read: ${failed.join(', ')}. Not writing.`);
  process.exit(1);
}
if (!write) {
  if (changes) console.log('Nothing written. Read the change above, then run again with --write.');
  process.exit(0);
}
const data = Object.fromEntries(
  Object.keys(next)
    .sort()
    .map((k) => [k, next[k].field]),
);
writeFileSync(
  OUT,
  src.replace(/(DRIVER_DATA[^=]*=\s*)\{[\s\S]*\};\s*$/, `$1${JSON.stringify(data, null, 2)};\n`),
);
console.log(`Wrote ${OUT.pathname}`);

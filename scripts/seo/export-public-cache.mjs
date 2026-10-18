// Export only known public catalog responses already in Next's local fetch cache.
// No network, auth, private records or actual .env files are read.
// node scripts/seo/export-public-cache.mjs /tmp/hmc-seo-snapshots
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const directory = process.argv[2];
if (!directory) throw new Error('Provide an output directory outside source');
mkdirSync(directory, { recursive: true });
const simple = new Set([
  'routes',
  'vehicles',
  'cities',
  'fares/all',
  'fare/local',
  'offer',
  'reviews/all',
]);
let count = 0;
for (const file of readdirSync('.next/cache/fetch-cache').sort()) {
  let entry;
  try {
    entry = JSON.parse(readFileSync(resolve('.next/cache/fetch-cache', file), 'utf8'));
  } catch {
    continue;
  }
  const data = entry.data;
  if (!data?.url || data.status !== 200) continue;
  const url = new URL(data.url);
  if (url.origin !== 'https://api.hellomycabs.com' || !url.pathname.startsWith('/api/v1/public/'))
    continue;
  const path = url.pathname.slice('/api/v1/public/'.length);
  if (!simple.has(path) && !['fare/oneway', 'fare/roundtrip'].includes(path)) continue;
  if ([...url.searchParams.keys()].some((k) => !['pickup', 'drop', 'days'].includes(k))) continue;
  let body;
  try {
    body = JSON.parse(data.body);
  } catch {
    try {
      body = JSON.parse(Buffer.from(data.body, 'base64').toString('utf8'));
    } catch {
      continue;
    }
  }
  if (!body?.ok || !body.data) continue;
  const name = (path + url.search).replaceAll('/', '_').replaceAll('?', '_').replaceAll('&', '_');
  writeFileSync(resolve(directory, `${name}.json`), JSON.stringify(body) + '\n');
  count++;
}
for (const name of ['routes', 'vehicles', 'cities', 'fares_all', 'fare_local', 'reviews_all']) {
  try {
    readFileSync(resolve(directory, `${name}.json`));
  } catch {
    throw new Error(
      `No cached public ${name}; use approved read-only public responses, never fabricate a snapshot`,
    );
  }
}
console.log(`Exported${count} public response snapshots; cache age is not fresh live proof`);

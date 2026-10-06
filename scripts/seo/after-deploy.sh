#!/usr/bin/env bash
#
# After a deploy has gone live (7 Oct 2026): the SEO checks against the real domain, and the
# pages that matter most, read back from it.
#
#   bash scripts/seo/after-deploy.sh                      # https://www.hellomycabs.com
#   bash scripts/seo/after-deploy.sh http://localhost:3100
#
set -uo pipefail
HOST="${1:-https://www.hellomycabs.com}"
HOST="${HOST%/}"
cd "$(dirname "$0")/../.."

echo "== seo:check against $HOST"
bash scripts/seo-check.sh "$HOST"

echo
echo "== The pages that matter most"
HOST="$HOST" node --input-type=module -e '
const host = process.env.HOST;
const pages = ["/", "/jaipur-to-delhi-cab", "/delhi-to-jaipur-cab", "/cab-service-in-jaipur",
  "/delhi-to-agra-round-trip-cab", "/jaipur-to-delhi-innova-crysta", "/routes", "/fares-explained"];
for (const p of pages) {
  const res = await fetch(host + p);
  const t = await res.text();
  const title = (t.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? "";
  const imgs = (t.match(/<img /g) ?? []).length;
  const types = [...t.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => { try { return JSON.parse(m[1])["@type"]; } catch { return "ERR"; } });
  const checked = (t.match(/Fares checked <time[^>]*>([^<]+)</) ?? [])[1] ?? "-";
  console.log(`${res.status}  ${p}\n     ${title.replace(/&amp;/g, "&")}\n     img ${imgs} · ${types.join(", ")} · fares checked ${checked}`);
}
'

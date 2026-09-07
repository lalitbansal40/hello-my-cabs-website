#!/usr/bin/env bash
#
# Every check that has to pass before this site is pointed at search engines.
#
# It takes a host so the same script runs against a local build and against production —
# which is the point. The local run is a rehearsal; the one that matters is the one against
# the live domain, because that is where the environment can be wrong in ways a local build
# can never show you. Chief among them: robots.ts blocks the ENTIRE site unless the site
# URL is the real host, so a deploy with the wrong variable is invisible to Google and
# looks completely normal in a browser.
#
#   bash scripts/launch-check.sh http://localhost:3000
#   bash scripts/launch-check.sh https://www.hellomycabs.com
#
set -uo pipefail

HOST="${1:-http://localhost:3000}"
HOST="${HOST%/}"
FAILED=0

pass() { printf "  \033[32m✓\033[0m %s\n" "$1"; }
fail() { printf "  \033[31m✗\033[0m %s\n" "$1"; FAILED=$((FAILED + 1)); }
section() { printf "\n\033[1m%s\033[0m\n" "$1"; }

get()  { curl -s --max-time 25 "$HOST$1"; }
code() { curl -s -o /dev/null --max-time 25 -w '%{http_code}' "$HOST$1"; }

printf "\033[1mLaunch check — %s\033[0m\n" "$HOST"

# ── 1. Indexing allowed ───────────────────────────────────────────────────────
# The one that silently wastes a whole phase of work if it is wrong.
section "1. robots.txt"
ROBOTS=$(get /robots.txt)
if grep -qi "^Disallow: /$" <<<"$ROBOTS"; then
  fail "robots.txt says Disallow: / — the whole site is blocked from search."
  fail "  NEXT_PUBLIC_SITE_URL is not the production host. Fix it before anything else."
elif grep -qi "^Allow: /" <<<"$ROBOTS"; then
  pass "indexing allowed"
else
  fail "robots.txt has neither Allow: / nor Disallow: / — read it by hand"
fi
grep -qi "sitemap:" <<<"$ROBOTS" && pass "sitemap declared in robots.txt" \
  || fail "robots.txt does not point at the sitemap"

# ── 2 + 3. Every sitemap URL resolves, and has real content in the HTML ────────
section "2. Sitemap URLs"
URLS=$(get /sitemap.xml | grep -o '<loc>[^<]*' | sed 's|<loc>||')
COUNT=$(wc -l <<<"$URLS" | tr -d ' ')
if [ -z "$URLS" ]; then
  fail "sitemap is empty — the backend was probably unreachable at build time"
else
  pass "$COUNT URLs listed"
  BAD=0 THIN=0
  while read -r u; do
    [ -z "$u" ] && continue
    path="${u#"$HOST"}"; path="${path#http*://*/}"; [ "$path" = "$u" ] && path="/"
    [ "${path:0:1}" != "/" ] && path="/$path"
    body=$(get "$path")
    c=$(code "$path")
    [ "$c" != "200" ] && { fail "$c  $path"; BAD=$((BAD + 1)); continue; }
    # A 200 with an empty template is worse than a 404: it gets indexed.
    if ! grep -q '<h1' <<<"$body"; then fail "no <h1>  $path"; THIN=$((THIN + 1)); fi
    if ! grep -q 'application/ld+json' <<<"$body"; then fail "no schema  $path"; THIN=$((THIN + 1)); fi
    # A landing page exists to show a price. If the fare fetch was refused while the site
    # was being built, the page renders without one and the build still passes — the
    # failure is completely silent, so this is the only place it gets caught. The written
    # pages are exempt because they never had a price to lose.
    case "$path" in
      /about|/contact|/terms|/privacy|/refund) ;;
      *)
        if ! grep -q '₹' <<<"$body"; then
          fail "NO PRICE  $path — the fare fetch was refused at build time; redeploy"
          THIN=$((THIN + 1))
        fi
        ;;
    esac
  done <<<"$URLS"
  [ "$BAD" -eq 0 ] && pass "every URL returns 200"
  [ "$THIN" -eq 0 ] && pass "every page has an h1, structured data and a price"
fi

# ── 4. Prices are in the HTML, not fetched afterwards ─────────────────────────
section "3. Prices server-rendered"
ROUTE=$(get /jaipur-to-delhi-cab)
if grep -q '₹' <<<"$ROUTE"; then
  pass "a route page carries prices in its HTML"
else
  fail "no ₹ in the HTML — the price is arriving after JavaScript, and will not rank"
fi

# ── 5. Canonical points at this host ──────────────────────────────────────────
section "4. Canonical"
CANON=$(grep -o '<link rel="canonical" href="[^"]*"' <<<"$ROUTE" | sed -n '1s/.*href="//;1s/"//p')
if [ -z "$CANON" ]; then
  fail "no canonical link on a route page"
elif [[ "$CANON" == "$HOST"* ]]; then
  pass "canonical is $CANON"
elif [[ "$HOST" == *localhost* ]]; then
  # Expected during the local rehearsal: the canonical is built from the configured site
  # URL, so it names the live domain even when served from localhost. It is only a fault
  # when the site is being tested at its real address.
  pass "canonical is $CANON (live domain — correct for a local run)"
else
  fail "canonical is $CANON but this host is $HOST — NEXT_PUBLIC_SITE_URL is wrong"
fi

# ── 6. Made-up slugs 404 ──────────────────────────────────────────────────────
section "5. Unknown URLs"
BOGUS=0
for s in xyz-to-abc-cab cab-service-in-nowhere random-taxi kuch-bhi; do
  c=$(code "/$s")
  [ "$c" = "404" ] || { fail "/$s returned $c, expected 404"; BOGUS=$((BOGUS + 1)); }
done
[ "$BOGUS" -eq 0 ] && pass "invented slugs 404 rather than rendering an empty page"

# ── 7. The funnel stays out of the index ──────────────────────────────────────
section "6. Funnel excluded"
grep -q '/booking' <<<"$URLS" && fail "a /booking URL is in the sitemap" \
  || pass "no /booking URL in the sitemap"
grep -q 'noindex' <<<"$(get /booking)" && pass "/booking is noindex" \
  || fail "/booking is missing its noindex"

# ── 8. Cache purge is not open to the world ───────────────────────────────────
section "7. Revalidate endpoint"
c=$(curl -s -o /dev/null --max-time 25 -w '%{http_code}' -X POST "$HOST/api/revalidate")
[ "$c" = "403" ] && pass "rejects a call with no secret" \
  || fail "POST /api/revalidate returned $c without a secret, expected 403"

# ── Verdict ───────────────────────────────────────────────────────────────────
if [ "$FAILED" -eq 0 ]; then
  printf "\n\033[32m\033[1mAll checks passed.\033[0m %s is ready for Search Console.\n\n" "$HOST"
else
  printf "\n\033[31m\033[1m%d check(s) failed.\033[0m Do not submit the sitemap yet.\n\n" "$FAILED"
  exit 1
fi

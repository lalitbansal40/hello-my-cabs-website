#!/usr/bin/env bash
#
# The account paths, checked the way launch-check.sh checks the search ones.
#
# launch-check answers "will this rank". This answers "is somebody's account safe" — and
# those are different failures. A leaked token or a bookings page that a stranger can open
# does not show up as a broken page; it shows up as nothing at all until it matters.
#
# READ ONLY. It signs nobody in, books nothing, cancels nothing and sends no OTP. Every
# request here is either unauthenticated or a plain read, so it is safe against production.
#
#   bash scripts/account-check.sh http://localhost:3000
#   bash scripts/account-check.sh https://www.hellomycabs.com
#
set -uo pipefail

HOST="${1:-http://localhost:3000}"
HOST="${HOST%/}"
FAILED=0

pass()    { printf "  \033[32m✓\033[0m %s\n" "$1"; }
fail()    { printf "  \033[31m✗\033[0m %s\n" "$1"; FAILED=$((FAILED + 1)); }
section() { printf "\n\033[1m%s\033[0m\n" "$1"; }   # NOT `head` — that shadows the command

get()     { curl -s  --max-time 25 "$HOST$1"; }
code()    { curl -s -o /dev/null --max-time 25 -w '%{http_code}' "$HOST$1"; }
# -o /dev/null would swallow the body, so headers come separately.
headers() { curl -s -o /dev/null -D - --max-time 25 "$HOST$1"; }
postcode() { curl -s -o /dev/null --max-time 25 -X POST -w '%{http_code}' "$HOST$1"; }

printf "\033[1mAccount check — %s\033[0m\n" "$HOST"

# ── 1. Who-am-I, for somebody who is nobody ───────────────────────────────────
section "1. /api/me signed out"
ME_CODE=$(code /api/me)
ME_BODY=$(get /api/me)
ME_HEAD=$(headers /api/me)

if [ "$ME_CODE" = "000" ]; then
  # curl reports 000 when the request never completed. Saying "expected 200" there sends
  # somebody hunting through route handlers for a problem that is in the network.
  fail "could not reach $HOST — the host did not answer at all"
  printf "\n\033[31m\033[1mStopped.\033[0m Nothing else can be judged from here.\n\n"
  exit 1
elif [ "$ME_CODE" = "200" ]; then
  pass "answers 200"
elif [ "$ME_CODE" = "404" ]; then
  fail "/api/me is not deployed yet ($ME_CODE) — this host is behind the current code"
else
  # 401 here is a real fault, not a nitpick: it fills every signed-out visitor's console
  # with errors for a question that was answered correctly.
  fail "returned $ME_CODE — should be 200 with a null user, not an error"
fi

grep -q '"user":null' <<<"$ME_BODY" && pass "reports nobody signed in" \
  || fail "did not report a null user: $(cut -c1-90 <<<"$ME_BODY")"

# ── 2. The one thing that must never come back ────────────────────────────────
section "2. No token in the answer"
if grep -qiE '"?(accessToken|refreshToken|token)"?[[:space:]]*:|eyJ[A-Za-z0-9_-]{10}' <<<"$ME_BODY"; then
  fail "the identity endpoint is returning something token-shaped"
else
  pass "no token, signed out"
fi

# ── 3. Identity must not be cached ────────────────────────────────────────────
section "3. Caching"
if grep -qi '^cache-control:.*no-store' <<<"$ME_HEAD"; then
  pass "/api/me is no-store"
else
  # One person's name served to the next visitor from a CDN is the worst fault here.
  fail "/api/me is missing no-store: $(grep -i '^cache-control' <<<"$ME_HEAD" | tr -d '\r')"
fi

# ── 4. The signed-in pages turn a stranger away ───────────────────────────────
section "4. Signed-out visitor"
BOOKINGS_CODE=$(code /bookings)
BOOKINGS_LOC=$(headers /bookings | grep -i '^location:' | tr -d '\r' | sed 's/^[Ll]ocation: *//')
case "$BOOKINGS_CODE" in
  30*) pass "/bookings redirects ($BOOKINGS_CODE)" ;;
  *)   fail "/bookings returned $BOOKINGS_CODE — a stranger should be sent to sign in" ;;
esac
grep -q '/login' <<<"$BOOKINGS_LOC" && pass "…to the sign-in page" \
  || fail "…but not to /login: ${BOOKINGS_LOC:-<none>}"
grep -q 'next=' <<<"$BOOKINGS_LOC" && pass "…carrying where to come back to" \
  || fail "…without a next=, so they land nowhere useful"

# ── 5. Nobody's trips in a search result ──────────────────────────────────────
section "5. Kept out of search"
for p in /login /bookings /booking/details; do
  if grep -q 'noindex' <<<"$(get "$p")"; then pass "$p is noindex"
  else fail "$p is missing noindex"; fi
done
SITEMAP=$(get /sitemap.xml)
grep -q '/login' <<<"$SITEMAP" && fail "/login is in the sitemap" || pass "/login not in the sitemap"
grep -q '/bookings' <<<"$SITEMAP" && fail "/bookings is in the sitemap" || pass "/bookings not in the sitemap"

# ── 6. Nothing that changes state answers a bare request ──────────────────────
section "6. Write endpoints refuse a stranger"
c=$(code /api/logout)
[ "$c" = "405" ] && pass "GET /api/logout is refused ($c)" \
  || fail "GET /api/logout returned $c — a crawler or a prefetch could sign people out"

c=$(postcode /api/book)
[ "$c" = "401" ] && pass "POST /api/book needs a session ($c)" \
  || fail "POST /api/book returned $c without a session, expected 401"

c=$(postcode /api/bookings/000000000000000000000000/cancel)
[ "$c" = "401" ] && pass "POST cancel needs a session ($c)" \
  || fail "POST cancel returned $c without a session, expected 401"

# ── Verdict ───────────────────────────────────────────────────────────────────
if [ "$FAILED" -eq 0 ]; then
  printf "\n\033[32m\033[1mAll checks passed.\033[0m The account paths on %s are sound.\n\n" "$HOST"
else
  printf "\n\033[31m\033[1m%d check(s) failed.\033[0m\n\n" "$FAILED"
  exit 1
fi

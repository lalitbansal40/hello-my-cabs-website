#!/usr/bin/env bash
#
# The ten checks that decide whether these pages can rank, run against a host.
#
# Same shape as launch-check.sh, and for the same reason: the local run is a rehearsal, and
# the run that matters is the one against the live domain — where the environment can be
# wrong in ways a local build never shows.
#
#   bash scripts/seo-check.sh                         # local build on :3100
#   bash scripts/seo-check.sh https://www.hellomycabs.com
#   SEO_LEVEL=a bash scripts/seo-check.sh             # gate only what Phase A owns
#
# Levels: a | b | c | all (default). Everything is measured and printed at every level;
# the level only decides which failures stop the run — the content targets cannot be met
# before the phase that delivers them.
#
set -uo pipefail

HOST="${1:-${BASE_URL:-http://localhost:3100}}"
BASE_URL="${HOST%/}" exec node "$(dirname "$0")/audit/seo.mjs"

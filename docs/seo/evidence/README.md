# SEO recovery evidence

Recorded18 October2026. See [summary](../IMPLEMENTATION_SUMMARY.md),
[baseline](../BASELINE_AUDIT.md) and [post-deploy steps](../POST_DEPLOY_CHECKLIST.md).
No customer data/database changes, real booking, payment, message, Search Console action or deploy.

Git-action fields in these dated artifacts describe the verification snapshot, before the owner's
later request to commit this candidate locally. That request does not authorize push or deployment.
Raw command logs retain their original progress-line whitespace and final blank lines; source and
report whitespace checks exclude only these generated `.log` files.

## Current final evidence

- `check-results.json`, `final-source-checks.json` and `final-*.log`: final lint/typecheck,
  **10 rating tests +20 SEO regressions** and production build pass. Local runtime is Node24.19.0;
  the existing Amplify target uses Node22 and still needs normal deployment verification.
- `source-inventory.json`:154 source-generated public URLs/145 intended indexable. Computed using
  actual route/vehicle/variant/city/held/sample helpers and captured public catalog snapshots.
  Snapshots came from an existing Next fetch cache, not new live API proof or invented fares.
- `before-audit.json`, `after-audit.json`: raw source-HTML crawl/graph, metadata, directives,
  canonical, headings, JSON-LD and URL coverage. Final145 sitemap/156 total pages; zero orphan,
  unreachable, broken public link, fragment, JSON-LD/breadcrumb/FAQ findings. The two extra paths
  are nonexistent404 controls. No script/RSC text is mistaken for crawlable anchors.
- `representative-schema.json`: actual local rendered graph for home/one-way/round-trip/city/
  vehicle/guide. Current inconsistent counts produce no AggregateRating. Before there were104
  rating nodes. Local parsing/semantic checks do not replace external Rich Results Test eligibility.
- `fare-integrity.json`: all156 pages' existing Offer/AggregateOffer/UnitPriceSpecification names,
  amounts, currencies and tax flags are unchanged vs the same captured baseline. Customer booking,
  choice, guest, payment, session source files remain untouched. Stock assertions are intentionally
  excluded from the price comparison because unsupported availability was removed.
- `browser-report.json`, `browser-final-source.log`:36 responsive views360/390/768/1280, menu,
  swap controls and two read-only booking fare views pass; zero attempted writes/external requests/
  page exceptions. Browser cache disabled; waits assert real DOM/font/streamed-fare state.
- `asset-audit.json`:21 static references checked against local build/public files and108 generated
  assets/image-sitemap URLs fetched over loopback, all present200. Resources are from8 representative
  source pages plus all sitemap images, not every possible customer resource.
- `routes-390.png`, `routes-768.png`, `routes-1280.png`, `one-way-390.png`: selected final source
  screenshots actually opened for inspection. The route capture follows swap interaction and is
  focused on fare/distance/form; it is not a full-page capture or GSC screenshot.
- `payload-measurements.json`: source-byte observations. Existing inline CSS is97,093bytes;
  HTML/RSC remains large. No compression/field-CWV/production-capacity improvement is claimed.
- `artifact-budget.json`, `final-build.log`: fresh build **about110.12MiB** after existing Amplify
  cache/map exclusions, below the repository's documented220MB budget. This is measured **before**
  runtime crawls generate extra on-demand HTML/RSC cache files. The audit build embeds loopback API;
  always rebuild with production configuration before any authorized release.
- `live-responses.json`, `live-user-agent-comparison.json`: selected production GETs.13 priority
  HTML pages200, robots/sitemap200, two invalid404s; www/HTTPS/slash redirects recorded. Home and
  Jaipur–Delhi source headings/paragraphs/links/canonicals match normal/Googlebot/mobile agents.
  Initial direct API requests429; API-host robots404 does not identify the unknown GSC blocked URL.
- `implementation-inventory.json`: exact source/report inventory and source SHA256; pre-existing
  owner notes excluded. `handover-consistency.json`: final report/CSV/link/hash/diff checks.

## Baseline and checkpoint history

`baseline-checks.json`/`baseline-*.log` are the original green10-test lint/typecheck/build baseline.
`accepted-*`, `accepted-checks.json`, `final-checks.json`, `artifact-build.log` are earlier green
checkpoints, some with19 SEO cases, superseded by `final-source-checks.json` and20 cases.

`sitemap-negative-control.log` is the expected pre-fix failure: catalog outage incorrectly returned
a partial sitemap instead of rejecting. `outage-build.log` is the expected post-fix unavailable-
upstream build failure, not a failed healthy release candidate. `browser-harness-history.json`
records early harness errors without relabeling them as successful product checks.

Local files do not prove production deployment, genuine individual review provenance, authenticated
Search Console state or future Google indexing. Owner queues are explicit in the reports/145-row CSV.

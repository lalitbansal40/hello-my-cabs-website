# SEO recovery implementation summary

## 1. Executive summary

Safe local SEO correctness improvements are implemented on `seo/indexing-recovery-2026-10-18`,
from HEAD `9296a19`. All145 intended public URLs are crawlable and present in the source inventory;
none were removed/merged/newly noindexed. Backend, app and Ghoomo repos were not modified by this
SEO task. Production data, actual env, customer flows and owner untracked files are preserved.
At verification handover, no SEO commit, push, deployment or Search Console action had been performed.
The owner subsequently requested a local commit of this candidate; push and deployment remain separate.

This completes the local implementation/reporting candidate. Real Google indexing results,
production deployment verification, exact GSC404/blocked URL diagnosis and review provenance
remain external tasks. Google indexing cannot be guaranteed.

## 2. Confirmed code/data weaknesses

- Sitemap lastmod was derived from BUILD_TIME; route WebPage dateModified from render-time fare
  checks. Neither established significant content modification.
- Robots production detection used a substring, accepting lookalike/preview origins.
- Critical catalog reads swallowed upstream failures into empty page/allowlist/partial sitemap
  results. Controlled unavailable-upstream builds now reject instead of publishing that state.
- Captured review counters contradict their own scope contract; route/schema had accepted them
  directly, and city LocalBusiness schema carried business-owned ratings.
- Offer markup claimed InStock without an inventory source; JSON-LD serialization did not escape
  script-closing text. Current distance metadata can be estimated but was not clearly qualified.

These are confirmed weaknesses, **not proof of Google's reasons for excluding individual URLs**.

## 3. Suspicions not established

No general SSR/canonical/public-robots failure, orphan/broken-link problem or bot/mobile discrepancy
was found in the verified samples/full local crawl. Jaipur–Delhi vs Jaipur–Agra is not proven a
near duplicate by this method. Other route pairs share substantial templates and require review,
not automatic deindexing. No proof of fake individual reviews, a Google penalty, severe hosting
failure or a specific cause for the reported404/blocked URL is available. Initial live public API
reads429; successful cached build/HTML is not proof of fresh upstream availability or Google's API
experience. The user-provided Search Console figures were not independently authenticated.

## 4. Problems fixed and risks

| Change                                                                        | Purpose                                                      | Practical limit / risk                                                                                                           |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Omit unsupported sitemap dates; retain explicit guide dates; deduplicate URLs | Accurate stable sitemap signals                              | Actual update tracking is still an owner/data-source responsibility                                                              |
| Fail critical generation reads on upstream errors; honor HTTP status          | Avoid publishing empty/partial SEO results                   | Deployment now fails when required catalog is unavailable; keep the previous complete artifact and restore upstream availability |
| Exact www HTTPS production robots match                                       | Keep lookalike/preview origins blocked                       | Production environment must use the approved exact origin                                                                        |
| Whole-catalog review consistency/test-marker checks                           | Known inconsistent totals cannot produce route rating schema | Consistency alone does not certify genuine review provenance; visible unmarked feedback preserved                                |
| Remove self-serving city rating/unsupported stock                             | Describe evidenced content without availability promises     | Rich-result presentation may change; no star/FAQ guarantee                                                                       |
| Escape JSON-LD script text                                                    | Preserve valid data/script boundary                          | No customer content or schema entity rewritten                                                                                   |
| Clarify estimated route distance/time                                         | Reflect current API evidence honestly                        | No new surveyed distance or real-time timing data is invented                                                                    |
| Full-fleet contextual directory links                                         | Help users discover all currently listed vehicle choices     | 8 relevant links; small directory HTML increase, no extra API fetch                                                              |

## 5. Files changed

Production/config: `next.config.ts`, `package.json`, `src/app/sitemap.ts`, `src/app/robots.ts`,
`src/app/page.tsx`, `src/app/routes/page.tsx`, `src/app/[slug]/page.tsx`, `RoutePage.tsx`,
`RouteVariantPage.tsx`, `CityPage.tsx`, `src/lib/api.ts`, `src/lib/reviews.ts`,
`src/lib/review-rules.ts`, `src/lib/schema.tsx`, `src/components/landing/RatingSummary.tsx`,
`src/components/site/FaresChecked.tsx`. Existing `scripts/test/rating-summary.mjs` gains integrity
coverage. New source loader/regression runner, cache exporter, source inventory, loopback snapshot
API, full source crawler and responsive browser runner are under `scripts/test` and `scripts/seo`.
Exact inventory/hashes and all eight requested reports are in this folder/evidence. No dependency
or framework version changed; Python3 stdlib is needed only for the full source audit.

## 6. Pages affected

145 intended indexable URLs: home1, directory1, static/company/policy/luxury8, guides8, one-way80,
airport14, cities10, route-car8, round-trip7, vehicles8. The six already-held routes, two sample
package pages and credits remain separately nonindexable by existing policy.154 source public
URLs plus two invalid controls make156 crawled. Source-HTML title/H1/description/canonical/directive,
JSON-LD/breadcrumb/FAQ and link checks run over the intended set. No useful page's canonical or
indexing strategy was mass-changed.

## 7. Test results and evidence

See `evidence/README.md` and machine-readable check results for final command versions/exits.
Baseline lint/typecheck/10 rating tests/build passed. Final lint, typecheck,10 rating tests,
20 offline SEO regressions and production build pass. The controlled unavailable-catalog build
fails as expected, with no timeout/production-data workaround. The source crawler verifies145
sitemap URLs/156 total pages with zero orphan/broken-link/fragment/schema findings. Browser checks
cover36 responsive views, mobile menu/swap controls and two read-only booking fare steps, with
no attempted write or external request.21 static references and108 generated assets also pass. Screenshots are inspected, not presented as GSC evidence.

The earliest browser harness runs exposed canonical DOM normalization, network-idle/conditional304
and streamed-loading assumptions. The harness now checks raw canonical attributes, disables its
cache and waits for the real UI state. Those harness failures are distinct from final passes;
no booking component was changed to satisfy them. One TypeScript optional-value error introduced
during implementation was fixed; final typecheck passes.

Existing inlineCss/fare cache behavior and Amplify output strategy are preserved. Source HTML is
large; before/after payload and artifact measurements are recorded without claiming a new field
Core Web Vitals result or severe host problem. The directory grows slightly for the new links;
route markup becomes smaller after unsupported schema is removed. No unrelated performance rewrite. The fresh pre-crawl build is about110.12MiB after existing Amplify cache/map exclusions, below its documented220MB budget; runtime-generated page cache is a different measurement.

## 8. Remaining owner decisions

Confirm real review provenance/counting and whether a separately authorized reconciliation is
needed. Supply exact GSC404/robots URLs (no guess from counts). Review high-similarity routes for
verified operational facts; do not generate filler. Existing held-route fare decisions, business
policies, content rights and actual dates remain owner responsibilities. No proposed merge,
redirect, noindex strategy or production-data mutation was executed.

## 9. Deployment instructions

Review this concrete candidate, then authorize any release separately. Build fresh with the real
www HTTPS canonical and production API origins; the last local artifact uses loopback snapshots.
Use the existing Amplify Node22 workflow and validate target responses/booking handoff after deploy.
The local runtime/check evidence is explicitly versioned; it is not deployed-host proof.

## 10. Google Search Console next steps

Follow [POST_DEPLOY_CHECKLIST.md](POST_DEPLOY_CHECKLIST.md): verify sitemap success/read time,
inspect/test selected priority canonical URLs, request indexing where appropriate and track the
original120-discovered/24-crawled cohorts at weeks1/2/4/6 with real deploy/crawl dates. Diagnose
actual404/blocked URLs before changing anything. No Search Console settings changed; no indexing
outcome or timing is guaranteed. Other reports hold detailed evidence rather than duplicating it here.

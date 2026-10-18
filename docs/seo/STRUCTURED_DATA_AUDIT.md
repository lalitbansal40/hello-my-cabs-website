# Structured data and review integrity audit

## Actual source and contract

`src/lib/schema.tsx` emits linked organization/site nodes, per-page breadcrumbs, FAQ, Service,
Product/Offer, city TaxiService, WebPage and guide Article nodes. JSON-LD is server-rendered.
`JsonLd` now escapes `<` so content cannot terminate its script; parsed JSON preserves original text.
All intended public page output is parsed and the graph is checked locally. This is not a claim
that Google's external Rich Results Test has been run or that rich results are guaranteed.

| Markup                             | Finding and final handling                                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Organization/TaxiService + WebSite | Existing company name/address/phone/profile information preserved; stable @ids, no invented branch/review data                                |
| BreadcrumbList                     | Ordered actual links; all pages checked against source anchors; no navigation mismatch found                                                  |
| FAQPage                            | Existing visible questions/answers retained; no claim that a taxi site earns FAQ rich results                                                 |
| Service + Product                  | Existing dual graph retained, including prior source's owner D2 decision; no tactic of retyping business ratings to bypass self-serving rules |
| Offers                             | Existing base prices/ranges/currency and VAT-excluded specification retained; `InStock` removed because a fare list is not live availability  |
| Route AggregateRating              | Requires route-specific eligible counters after whole-catalog consistency checks; current inconsistent snapshot emits none                    |
| City TaxiService AggregateRating   | Removed from business-owned LocalBusiness schema; visible unmarked feedback stays                                                             |
| WebPage dateModified               | Removed when its only source was render-time “fares checked”; explicit true revision dates remain supported                                   |
| Guide Article dates                | Explicit published/updated content-record dates preserved; no build clock substitution                                                        |

## Rating source traced, without database access

Website: `api.reviews()` → `/public/reviews/all` → `routeReviews`/`cityReviews`/`siteReviews` → visible
summary and route schema. Browser refresh uses `/public/reviews` or `/reviews/site` and the same
numeric/test-marker filter. Backend source inspected read-only: `reviews.controller.ts`,
`reviewStats.service.ts`, `reviewStats.model.ts` and `reviewStatsRebuild.ts`. It reads running
ReviewStats; customer ratings can increment one route, both cities and the whole site.

The captured existing public cache contains94 route counters summing5,946,041, minimum62,744,
maximum63,757, but the site counter is62,734. Jaipur–Delhi count63,209 is independently visible in
production HTML/JSON-LD. A single route cannot exceed all-site count under this source contract.
This confirms inconsistent/unverified aggregates; it does not prove that individual production
reviews are fabricated. No `isSyntheticTestData` marker or hardcoded production rating seed was
found in current website/backend source. The9293 fixture is confined to the offline test script.
No raw production records, rebuild command, deletion or database repair was executed.

## Safeguards and limits

- Explicit `isSyntheticTestData=true` batches/summaries cannot render as public feedback/markup.
- Nonfinite/fractional/negative counts, invalid scores, dimension/tag counts above total, duplicate
  route scopes, route sums exceeding site and city totals above site fail the markup checks.
- Schema eligibility is computed on the server, never accepted from a raw API eligibility field.
  General/site ratings never substitute for missing route ratings.
- Unmarked, numerically valid visible feedback is retained for owner reconciliation. The current
  inconsistency stops structured stars; it does not certify or silently delete genuine reviews.
- Even a consistent catalog does not independently establish provenance. Owner must verify counts
  against genuine completed-booking reviews, source/import history and counting rules. Repair would
  require separate scoped authorization and is outside this code-only task.

Before:104 AggregateRating nodes across audited pages; after current snapshot:0. Ten self-serving
city rating nodes and unsupported stock/render-date findings are removed. Prices and the fare
calculation/booking flow are unchanged. No replacement scores are manufactured.

Google limits business-owned local-business review snippets and requires genuine user experiences:
[review snippet guidelines](https://developers.google.com/search/docs/appearance/structured-data/review-snippet).
After an authorized deploy, externally validate representative URLs at
[Rich Results Test](https://search.google.com/test/rich-results):
`https://www.hellomycabs.com/jaipur-to-delhi-cab`,
`https://www.hellomycabs.com/jaipur-to-delhi-round-trip-cab`,
`https://www.hellomycabs.com/cab-service-in-agra`,
`https://www.hellomycabs.com/innova-crysta-taxi` and `/guides/jaipur-delhi-by-road`.
Treat tool warnings/rich-result eligibility separately from general JSON-LD syntax validity.

# Route content and template quality

The CSV inventories all145 currently intended indexable URLs. All100 allowed city-pair pages
(including six already-held noindex pages),15 variants,10 cities,8 vehicles,8 guides, static pages,
package samples and credits were inspected through their source architecture/rendered responses.
No new landing page, generated filler, altered price, timetable, toll amount or business promise
was published.

## What is measured

The crawler compares main-content paragraph five-word shingles, normalizing common city/vehicle
names and numbers, excluding header/footer/nav and scripts. It records exact shared paragraphs
and repeated H2s/FAQ content for representative templates. This is a reproducible diagnostic,
not Google's scoring algorithm or proof that a page should be deindexed.

Before changes, Jaipur–Delhi vs Jaipur–Agra has normalized paragraph Jaccard0.3967 and8 exact
shared paragraphs out of102/42 respectively. Much of the shared text explains common policies;
the pickup/drop notes, route options, fares and FAQs differ. The prior “these two are duplicates”
hypothesis is not established by this comparison. Other pairs warrant review:104 pairs exceed0.80
in the baseline normalized-paragraph diagnostic. Examples include Ajmer/Sikar→Delhi Airport and
Chandigarh/Delhi→Kota. Sharing a destination naturally repeats arrival notes; sharing a policy is
not itself harmful.

## Implemented factual improvement

`RoutePage.tsx` now respects the API's `distanceMeasured` evidence flag when labelling the displayed
route distance. When no matching measured distance is supplied it says “estimated distance” and
“about”, rather than implying a surveyed value. Driving time is identified as an estimate derived
from distance. `RouteVariantPage.tsx` similarly separates approximate travel distance/time from the
billed kilometres shown by the fare API. No distance, price, fare formula or billing minimum changed.

The templates already derive vehicle fares, seats, state crossings, reverse-trip comparisons,
route-specific FAQs and multi-day options from current source/API data. Those mechanisms remain.
The directory now offers a full-fleet contextual choice. Unsupported driver stops/toll counts/best
travel times remain absent: `content/routes/driver.generated.ts` is empty and not filled with guesses.

## Owner review queue

High similarity → review for useful, verified route-specific facts, not automatic consolidation.
For each flagged route verify actual pickup/drop points, road/stop facts, operational timing caveats,
measured distance if available and customer questions not already answered by its fare table.
Use `content/routes/index.ts`, `content/cities/index.ts`, `content/guides/roads.ts` and the existing
approved-driver knowledge workflow. Record source/reviewer/date; do not change `driver.generated.ts`
by inventing reports. Genuine missing facts require an owner/operations decision.

Existing stop/airport/cancellation/tax wording is not reapproved by this task; any unverified business
policy is for owner confirmation, not an SEO rewrite. Current review counter provenance needs the
separate reconciliation in [structured data audit](STRUCTURED_DATA_AUDIT.md).

CSV actions distinguish keep/improve, distinct acceptable intent and missing verified facts.
No obsolete/broken public landing page was confirmed. No page is removed, merged, redirected or
newly noindexed because of low impressions or similarity. The existing six fare-held routes are
unchanged. Content effort should prioritize actual customer utility, not a minimum word count;
see Google's [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

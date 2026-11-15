# Development record

Stage 1 sets up the requested stack, server proxy, generated API types, URL state and validation. The initial page is a foundation screen. Later branches replace it with the map explorer and farmer workflow.

The empty GitHub repository is being developed through separate cumulative branches. No live data service, account system, price forecast, yield forecast or district-level measurement is added.

Stage 1 verification: TypeScript, 10 validation tests and the production build pass.

Stage 2 adds the locally shipped GAEZ country outline, map zoom/pan/reset, four-point selection, appearance controls, historical charts, data tables and replay. TypeScript, 12 tests and the production build pass. The browser was checked against the real FastAPI backend: the Gulu 2024 rainfall total is 1686.04 mm. The current dev runner adapts preview port flags for Next.js, uses webpack for development, and permits only localhost/127.0.0.1 as extra dev origins. Production still builds with Turbopack.

Stage 3 completes the farmer form, explicit review action, baseline and evidence-gap results, PDF download, FAQ, guide and source page. The map shell was refined to floating controls and overlays, with no hero section. Empty soil inputs remain null; a real zero is preserved. Continue buttons cannot submit the final step by accident. The URL draft has a size guard.

Final checks: 21 automated tests, TypeScript and the production build pass. A real production Next.js proxy check against local FastAPI verified catalogs, the Gulu January 2024 rainfall value (39.59 mm), insufficient-evidence rotation output, combined PDF, invalid-date errors, the route whitelist and the local map. Browser tests verified form state after refresh, a pH warning, the explicit review step, a selected maize/beans/sorghum sequence and a four-page PDF containing that sequence and the evidence status. Map scroll/drag changed the view; Reset map restored translate(0,0) scale(1). Light/dark and larger text were visually checked. Physical touch hardware has not been tested.

Stage 4 fixes a deferred React drag update that read a cleared pointer ref. Pan coordinates are now captured before the update, and pointer cancellation clears the gesture. Reset appears after a 25% displacement of the visible map frame. The map still supports Home at any position. The rotation action sits beside the area picker. A short map overlay explains the three steps without adding a landing page or header.

Archive and map loading use skeletons. Errors use clear contrast, small readable text and retry actions. Retrying returns to a loading state. The area list groups the existing points by their source region names. The downloaded resource files contain no regional polygons, so no dividing lines were invented or added from an unrelated source.

Checks: 22 tests and TypeScript pass. Browser checks verified drag/release, a large displacement showing Reset map, reset hiding it, and a small displacement keeping it hidden. No application originX error occurred. The always-visible decision note reminds users to involve their own experience and local advisers.

Stage 5 deepens evidence and help without changing the backend contract. Selected-period summaries include surface and root-zone wetness, expandable daily low/high dates and day coverage. An optional ten-year seasonal view calculates monthly history and rainfall-window comparisons. Missing or partial months exclude a yearly window. It fetches the full archive only while expanded and states that it is separate from the main selected period.

Results explain evidence gaps for the chosen priority and link to the matching historical graph through URL focus state. The local-adviser reminder stays visible in panel headings as well as the map. The guide now includes a reproducible Mbale walkthrough, area-selection rationale and seven short explainers. A new methodology route documents actual sources, grids, aggregation and unknowns. No SMAP/NDVI layer, crop rankings or unreviewed agronomic recommendations were added.

Checks: 26 tests, TypeScript and the production build pass. Seasonal tests cover missing months, leap-year completeness, zero, ties and actual denominators. Browser checks verified Gulu's 2016–2025 rainfall windows: 442.893 mm for March–May and 503.492 mm for September–November, each with five of ten complete years below the window mean. An independent calculation from the daily CSV matched. The result-to-rainfall action opened and scrolled to the real graph. Local rules and field outcomes remain unvalidated; physical touch hardware remains untested.

The production smoke runner now checks backend health before trusting cached frontend catalog responses. Its earlier readiness check could begin analysis before the backend was ready. The app's source contract and PDF service remain unchanged.

The final production smoke check passes against the real local backend: catalog, selected historical values, evidence-gap rotation response, combined PDF, validation, route whitelist and local map. Evidence focus clears when dates, topics or area change, so editing a selection does not keep scrolling away from the controls.

Stage 6 makes the conclusion visible in a fixed bottom section of the rotation panel. Known baseline conflicts receive a direct needs-changes result. Missing or incomplete evidence cannot become a suitability claim, even if individual checks pass. Download and edit actions stay beside the conclusion, while the evidence scrolls separately. The form’s final action is See my result.

An inline historical line graph reuses environmental_context from the assessment response. Topic selection uses the existing URL focus field. It adds no API request, new dataset, farm estimate or crop forecast. A values table preserves units, nulls and day coverage. Graph dates now use the requested daily/monthly interval and show the year when it changes. The farm-input explainer distinguishes actual checks from recorded texture/carbon values and missing local rules.

Validation: 34 frontend tests, TypeScript and the production build pass. Targeted backend checks pass (23 tests), including all original source-file checksums, historical aggregation and rotation constraints. These validate file integrity and software behavior, not accuracy on an individual farm. Browser checks confirmed that excluding maize from a maize-containing plan changes the pinned conclusion and that See conflicts scrolls to the failed check. Physical touch hardware remains untested.

The production proxy smoke check also confirms that assessment graph panels match the separate historical response exactly, including after a conflicting farm answer changes the baseline checks. Browser checks verified graph-topic state after refresh, full-history navigation and return, both wetness series with day counts, and Gulu rainfall values of 39.59 mm in January 2024 and 77.54 mm in February. The conclusion stayed visible as the graph and evidence scrolled.

Stage 7 pairs with backend stage/06-local-rules. It adds explicit reference-only result wording, crop-source links, temperature-evidence navigation and notices for unsupported crops. Original styling, map, URL form state, pinned conclusion and historical graphs are retained. Crop order, seasonal water and priority outcomes stay unvalidated; coffee and banana remain recordable but unassessed. Only existing resource files are used.

Validation: 37 frontend tests, TypeScript and the production build pass. The production proxy smoke passed against the matching real backend. Browser checks verified two reference-based cards, the pinned conclusion, the temperature-evidence link and a real PDF download. The paired backend has 53 passing tests including source-file integrity and offline operation.

Replay dates now use written month names, with a single label for a full day or month and explicit bounds for partial ranges. The slider exposes the same label to screen readers. Graph tooltips share this formatter. Compact area lists retain all four sample points and region names; popovers fit the available viewport, scroll if needed and include labelled close controls for areas/help. The adviser reminder remains visible in the map and the fixed panel heading, with larger mobile text and space above it for the area card. Phone-width browser checks used a 390 by 844 frame; physical touch hardware remains untested.

Stage 8 pairs with backend stage/07-complete-reference-checks. The result is a concise shared conclusion and compact alternatives; detailed checks and graphs remain available on demand. The crop form consumes all ten saved crop references and the area soil estimate, with an opt-out and measured-pH precedence. The repeated adviser sentence was removed from the map, panel header and methods page at the user's request. No presentation or unrelated feature was changed.

Catalog and browser response caches now expire at 30 seconds. The browser respects the server entry’s remaining lifetime instead of extending it for another full interval. Errors are not cached.

Validation: 41 frontend tests, TypeScript and the production build pass. The production API smoke verified ten catalog crops, soil estimates, all five requested cash-crop choices, real historical values, conflict handling, a combined PDF and the proxy whitelist. Browser checks verified the short alternatives, actual pH/coverage results, the cash-crop form, and a Robusta result that reports passed range checks without suggesting annual replacement. Both caches have 30-second boundary tests, including remaining server lifetime and error recovery.

Stage 9 pairs with backend stage/08-plan-input-checks. It prevents unfinished planned crop choices from being submitted, preserves incomplete URL drafts and older links, and adds optional available growing days. Earlier removal of the long questions block and adviser sentence is now merged into main. The assessment shows one direct prompt for unfinished plans, with no alternative cards or repeated audit list until crop choices are complete. Source limitations remain available for finished plans. No data, agricultural outcomes or 30-second cache settings were changed.

Validation: 48 frontend tests, TypeScript, production build and real frontend-to-backend API smoke pass. Browser checks verified an older incomplete results link, the Complete crop choices action, the season-specific form warning, completion into two compact options, and a passed groundnut minimum-time check using 120 available days. The assessment header has no removed adviser sentence and the long questions block is absent.

Stage 10 fixes silent-looking form submission. The final action now shows a focused warning beside the button, names missing planned seasons, routes errors from hidden steps to their section and shows an opening state. Complete crop plans still open the existing results workflow. The reported extension-injected body attribute mismatch is scoped to body hydration warnings; descendant app content is still checked.

Validation: 53 frontend tests, TypeScript and production build pass. Browser checks reproduced the missing-crop case, verified the visible focused alert and submitted the corrected plan into a real backend result. No backend contract or data change was needed. Caching remains 30 seconds.

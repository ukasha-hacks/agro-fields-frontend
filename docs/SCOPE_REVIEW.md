# Focused review: what this pass changes

This pass deepens the existing local-data prototype. It preserves the map-first layout, stack, API contract, four sample points and current crop references. It adds no new agricultural dataset or live data call.

| Request                                                            | Result and reason                                                                                                                                                                                   |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Value proposition and three-step flow                              | Compact overlays on the map. No new landing page or header.                                                                                                                                         |
| Loading and failures                                               | Skeletons, visible error messages, retry actions and a route error fallback. Spinners stay inside PDF buttons.                                                                                      |
| Map drag and reset                                                 | Captured pan coordinates fix the cleared-ref race. Reset appears at 25% displacement of the visible frame. Home always resets.                                                                      |
| Visible rotation action                                            | Lime Plan rotation button beside the area picker.                                                                                                                                                   |
| Regional separators                                                | Existing region names group the list. The downloaded files have no region boundary polygons, so map dividers remain absent.                                                                         |
| Farmer inputs                                                      | Existing crop history, source-based water choices, one main priority, crop exclusions/preferences, soil results and three planned seasons remain.                                                   |
| Low/medium/high water labels                                       | Kept the clearer rainfall-only, some irrigation, reliable irrigation and unknown values already supported end to end.                                                                               |
| Equipment, market access, erosion priority and multiple priorities | Pending a coordinated backend schema, evidence model and PDF change. A front-end-only field would imply support the assessment does not have.                                                       |
| Custom pin or coordinates                                          | Pending local data for additional points and a stated sampling method. A custom pin must not relabel a preset grid sample as a farm measurement.                                                    |
| Three validated rotations and rankings                             | Baseline plus two explained unfilled slots remain. The configured agricultural rules are empty and pending review. No fabricated alternatives, confidence percentages or agronomic scores.          |
| Evidence links and priority reasoning                              | Results explain the selected priority’s evidence gaps and open its historical charts. Local suitability remains unknown.                                                                            |
| Complete selected-period statistics                                | Rainfall, air temperature, surface and root-zone wetness. Expand low/high values, dates and per-metric day counts.                                                                                  |
| NASA transparency                                                  | Used products named explicitly. SMAP, MODIS/Landsat NDVI and evapotranspiration are clearly marked absent.                                                                                          |
| Methods                                                            | New page covers years, source grids, aggregation, partial months, missing values and limitations.                                                                                                   |
| Seasonal timeline                                                  | Optional full-archive monthly table and March–May / September–November rainfall comparisons, computed from complete years. Year totals remain inspectable. No universal Uganda planting calendar.   |
| Bare fields and crop stress                                        | Unknown because cover observations, field dates and reviewed thresholds are missing. Below-average rain is not labelled drought.                                                                    |
| Local expertise and explainers                                     | Visible support note, evidence-status wording and seven expandable explanations linked to primary sources.                                                                                          |
| Scenarios and second language                                      | Deferred to keep this pass focused.                                                                                                                                                                 |
| Printable summary                                                  | Existing historical/combined PDF retained, with no new single-page promise. Seasonal full-archive calculations are a separate on-screen view and are not silently added to the selected-period PDF. |

## How to try it

1. Move the map slightly. Reset stays hidden. Drag past a quarter of the visible width or height. Reset appears and returns the view home.
2. Choose Mbale and the full 2024 period. The daily archive totals 1,984.87 mm across 366 days. Summary values may round for display.
3. Open the wetness topic and expand **See lows, highs and dates**. Surface and root-zone wetness remain separate 0–1 indices.
4. Open **Seasonal history across 2016–2025**. Expand yearly totals. A missing month excludes that year, rather than becoming zero.
5. Open Plan rotation, select a priority and review a starting plan. Open a matching evidence graph from the result. No reviewed rule means no validated ranking.
6. Read **How it works**, **How we read the data**, and **Data and sources** from the floating menu.
7. Run typecheck, tests and production build. Use the smoke script with the local backend for catalog, analysis, rotation and PDF checks.

# Development record

Stage 1 sets up the requested stack, server proxy, generated API types, URL state and validation. The initial page is a foundation screen. Later branches replace it with the map explorer and farmer workflow.

The empty GitHub repository is being developed through separate cumulative branches. No live data service, account system, price forecast, yield forecast or district-level measurement is added.

Stage 1 verification: TypeScript, 10 validation tests and the production build pass.

Stage 2 adds the locally shipped GAEZ country outline, map zoom/pan/reset, four-point selection, appearance controls, historical charts, data tables and replay. TypeScript, 12 tests and the production build pass. The browser was checked against the real FastAPI backend: the Gulu 2024 rainfall total is 1686.04 mm. The current dev runner adapts preview port flags for Next.js, uses webpack for development, and permits only localhost/127.0.0.1 as extra dev origins. Production still builds with Turbopack.

Stage 3 completes the farmer form, explicit review action, baseline and evidence-gap results, PDF download, FAQ, guide and source page. The map shell was refined to floating controls and overlays, with no hero section. Empty soil inputs remain null; a real zero is preserved. Continue buttons cannot submit the final step by accident. The URL draft has a size guard.

Final checks: 21 automated tests, TypeScript and the production build pass. A real production Next.js proxy check against local FastAPI verified catalogs, the Gulu January 2024 rainfall value (39.59 mm), insufficient-evidence rotation output, combined PDF, invalid-date errors, the route whitelist and the local map. Browser tests verified form state after refresh, a pH warning, the explicit review step, a selected maize/beans/sorghum sequence and a four-page PDF containing that sequence and the evidence status. Map scroll/drag changed the view; Reset map restored translate(0,0) scale(1). Light/dark and larger text were visually checked. Physical touch hardware has not been tested.

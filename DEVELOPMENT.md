# Development record

Stage 1 sets up the requested stack, server proxy, generated API types, URL state and validation. The initial page is a foundation screen. Later branches replace it with the map explorer and farmer workflow.

The empty GitHub repository is being developed through separate cumulative branches. No live data service, account system, price forecast, yield forecast or district-level measurement is added.

Stage 1 verification: TypeScript, 10 validation tests and the production build pass.

Stage 2 adds the locally shipped GAEZ country outline, map zoom/pan/reset, four-point selection, appearance controls, historical charts, data tables and replay. TypeScript, 21 tests and the production build pass. The browser was checked against the real FastAPI backend: the Gulu 2024 rainfall total is 1686.04 mm. The current dev runner adapts preview port flags for Next.js, uses webpack for development, and permits only localhost/127.0.0.1 as extra dev origins. Production still builds with Turbopack.

The map stage uses a full-canvas map with floating controls and overlays. It includes the FAQ, guide and source page, and retains the read-only charts and replay workflow. Farmer forms and assessment are completed in the next stage.

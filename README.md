# Agro Field frontend

A small Next.js and TypeScript frontend for the Agro Field FastAPI backend. Source data stays on the backend and is read locally. This repository is for the frontend; it does not invent weather or crop advice.

## Current stage

Use `stage/04-map-usability` for the full implementation. Main is a branch guide until the stages are merged.

```bash
git clone --branch stage/04-map-usability https://github.com/ukasha-hacks/agro-fields-frontend.git
cd agro-fields-frontend
```

The home screen is an edge-to-edge Uganda map with a floating area picker and compact information overlays. There is no hero section or top navigation header. It follows a map-app structure without calling Google Maps or live map tile services.

## Run

Use Node.js 22 or newer and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Start the backend separately on port 8000, or set `BACKEND_URL` to its reachable address. Open http://localhost:3000. The backend must include stage 4. The same-origin Next.js proxy keeps its address on the server and avoids browser CORS setup.

## Stack and state

Next.js App Router, TypeScript, Tailwind CSS, DM Sans, shadcn-style Radix components, Motion, Recharts, React Hook Form, Zod, nuqs and Zustand. DM Sans is bundled through Fontsource; no font request is made to Google at runtime.

nuqs owns area, dates, topics, chart choice, replay position, open panel and the validated farmer draft. Zustand stores only light/dark and text size. No system theme. Form drafts are limited to a manageable link length; an oversized draft shows a warning. Do not put names or private notes in URL drafts. Shared links contain the form answers.

Successful API results have a bounded five-minute memory cache. Catalog GET requests also have one-hour server revalidation. Failed requests and PDF files are not cached. API types are generated from the checked-in backend OpenAPI file; run `npm run api:types` after updating that contract.

## Stages

| Branch                   | Scope                                                         |
| ------------------------ | ------------------------------------------------------------- |
| stage/01-foundation      | App setup, state, validation, API proxy and generated types   |
| stage/02-map-explorer    | Uganda map, historical charts and replay                      |
| stage/03-farmer-workflow | Farmer form, assessment, PDF, help and checks                 |
| stage/04-map-usability   | Drag fix, conditional reset, clear flow, skeletons and errors |

Each branch contains earlier work. README and DEVELOPMENT.md record the stage and checks.

## Main flows

- Choose a sample area from the list or map point. Scroll to zoom, drag to pan, and use Reset map to return to Uganda. Keyboard controls are available.
- Open Explore history. Change dates and topics, use line or bar charts, open a values table, or move through past periods with the replay slider.
- Add past crops, water availability, priorities and a three-season plan. Soil values and planned dates are optional. Unknown values remain unknown.
- Review the baseline checks and missing evidence. The default backend has no reviewed rotation rules, so it does not invent alternatives.
- Download a historical or combined PDF. The backend recomputes it using the same request.
- Open How it works, Common questions, or Data and sources from the floating menu. Context is kept in the return link.

The backend address is configured once in `BACKEND_URL`. The browser uses these same-origin proxy endpoints:

| Operation                           | Browser path                                                            |
| ----------------------------------- | ----------------------------------------------------------------------- |
| Areas, crop references and metadata | `/api/backend/locations`, `/api/backend/crops`, `/api/backend/metadata` |
| Historical analysis                 | `POST /api/backend/explore`                                             |
| Rotation assessment                 | `POST /api/backend/rotation-comparisons`                                |
| PDF export                          | `POST /api/backend/exports/pdf`                                         |
| Optional static maize reference     | `/api/backend/map-layers` and its whitelisted preview route             |

## Checks

```bash
npm run typecheck
npm test
npm run build
```

22 automated checks cover dates, draft validation, real zero versus unknown soil values, URL round trips, map source integrity and bounded caching. TypeScript and the production build pass. To repeat the live integration check with the local backend and its existing virtual environment:

```bash
node scripts/smoke.mjs ../agro-field-backend
```

It starts temporary local servers on ports 3087 and 8087, verifies real catalog/analysis/rotation/PDF responses, and stops them. The local development runner accepts `--port` and uses webpack for development. Production builds use Turbopack. Optional `AGRO_DEV_BACKEND=../agro-field-backend` in `.env.local` starts a sibling backend for local development; it is never used in production.

Browser checks covered map pan/zoom/reset, help overlays, date warnings, soil warnings, form steps, URL refresh, light/dark and larger text, and a real four-page PDF download. Responsive layouts are implemented; touch-device behavior has not been tested on physical hardware.

## Scope

The backend has four gridded sample points, not district averages or farm measurements. It covers 2016–2025. Wetness is not soil fertility. Rotation rules still need agricultural review; an insufficient-evidence result must remain visible.

The map and historical explorer are implemented on stage 2. Data and map references are documented in [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md). No new agricultural dataset will be added outside the challenge resource chain. Package documentation and fonts are implementation resources.

## Interface review

[Map workspace](docs/screenshots/map.jpg) · [Chart overlay](docs/screenshots/charts.jpg)

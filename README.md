# Agro Field frontend

A small Next.js and TypeScript frontend for the Agro Field FastAPI backend. Source data stays on the backend and is read locally. This repository is for the frontend; it does not invent weather or crop advice.

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

nuqs owns area, dates, topics, chart choice, replay position, open panel and the validated farmer draft. Zustand stores only light/dark and text size. No system theme. Do not put names or private notes in URL drafts. Shared links contain the form answers.

Successful API results have a bounded five-minute memory cache. Catalog GET requests also have one-hour server revalidation. Failed requests and PDF files are not cached. API types are generated from the checked-in backend OpenAPI file; run `npm run api:types` after updating that contract.

## Stages

| Branch | Scope |
| --- | --- |
| stage/01-foundation | App setup, state, validation, API proxy and generated types |
| stage/02-map-explorer | Uganda map, historical charts and replay |
| stage/03-farmer-workflow | Farmer form, assessment, PDF, help and checks |

Each branch contains earlier work. Keep README updated at every stage.

## Checks

```bash
npm run typecheck
npm test
npm run build
```

## Scope

The backend has four gridded sample points, not district averages or farm measurements. It covers 2016–2025. Wetness is not soil fertility. Rotation rules still need agricultural review; an insufficient-evidence result must remain visible.

Data and map references will be documented in docs/DATA_SOURCES.md as the map stage is implemented. No new agricultural dataset will be added outside the challenge resource chain. Package documentation and fonts are implementation resources.

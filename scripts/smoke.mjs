import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const root = process.argv[2];
if (!root)
  throw new Error('Pass the local backend path: node scripts/smoke.mjs ../agro-field-backend');
const backendRoot = resolve(root);
const python = resolve(
  backendRoot,
  '.venv',
  process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python',
);
const backend = spawn(
  python,
  ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8087'],
  { cwd: backendRoot, stdio: 'inherit' },
);
const frontend = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3087'],
  { env: { ...process.env, BACKEND_URL: 'http://127.0.0.1:8087' }, stdio: 'inherit' },
);
const base = 'http://127.0.0.1:3087/api/backend/';
const get = (url) => fetch(url, { signal: AbortSignal.timeout(2500) });
console.log('Starting production frontend and local backend smoke check.');
const post = (path, body) =>
  fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
try {
  let ready = false;
  for (let i = 0; i < 50; i++) {
    try {
      const health = await get('http://127.0.0.1:8087/health');
      const r = health.ok ? await get(base + 'locations') : null;
      if (r?.ok) {
        ready = true;
        break;
      }
    } catch {}
    await delay(200);
  }
  assert(ready, 'Frontend and backend must start');
  const locations = await (await get(base + 'locations')).json();
  assert.equal(locations.length, 4);
  const crops = await (await get(base + 'crops')).json();
  assert.equal(crops.items.length, 4);
  const exploration = {
    location_id: 'northern_gulu',
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    categories: ['rainfall', 'temperature', 'soil_wetness'],
    interval: 'monthly',
  };
  const explored = await post('explore', exploration);
  assert.equal(explored.status, 200);
  const data = await explored.json();
  assert.equal(data.panels[0].series[0].points[0].value, 39.59);
  assert.equal(data.panels.length, 3);
  assert.equal(data.statistics[0].valid_days, 31);
  const rotation = {
    exploration,
    crop_history: [{ season_label: 'Past season', crops: ['maize'] }],
    baseline_sequence: [1, 2, 3].map((season) => ({ season, crops: ['maize'] })),
    water_supply: 'rainfall_only',
    priority: 'improve_soil',
  };
  const assessment = await post('rotation-comparisons', rotation);
  assert.equal(assessment.status, 200);
  const result = await assessment.json();
  assert.equal(result.status, 'insufficient_evidence');
  assert.equal(result.unfilled_alternative_slots.length, 2);
  const report = await post('exports/pdf', { exploration, rotation });
  assert.equal(report.status, 200);
  assert.match(report.headers.get('content-type'), /application\/pdf/);
  assert.equal(
    Buffer.from(await report.arrayBuffer())
      .subarray(0, 5)
      .toString(),
    '%PDF-',
  );
  const invalid = await post('explore', { ...exploration, end_date: '2026-01-01' });
  assert.equal(invalid.status, 422);
  const blocked = await get(base + 'not-a-supported-route');
  assert.equal(blocked.status, 404);
  const map = await get('http://127.0.0.1:3087/maps/country-context.geojson');
  assert.equal(map.status, 200);
  console.log(
    'Live API smoke passed: catalog, historical values, rotation gaps, combined PDF, validation, route whitelist and local map.',
  );
} finally {
  frontend.kill('SIGTERM');
  backend.kill('SIGTERM');
}

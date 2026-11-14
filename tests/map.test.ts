import { expect, it } from 'vitest';
import { clampZoom, countryPath, project, type Country } from '../src/lib/map-geometry';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
it('keeps zoom usable and reset coordinates stable', () => {
  expect(clampZoom(0)).toBe(0.65);
  expect(clampZoom(99)).toBe(5);
  expect(project(28.2, 5.4)).toEqual([0, 0]);
});
it('ships a real Uganda polygon from the recorded resource chain', () => {
  const bytes = readFileSync('public/maps/country-context.geojson');
  const provenance = JSON.parse(readFileSync('docs/map-provenance.json', 'utf8'));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(provenance.sha256);
  const countries = JSON.parse(bytes.toString()).features as Country[];
  const uganda = countries.find((c) => c.properties.ISO3CD === 'UGA');
  expect(uganda).toBeDefined();
  expect(countryPath(uganda!)).toMatch(/^M/);
  expect(countries).toHaveLength(7);
});

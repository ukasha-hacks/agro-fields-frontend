import { describe, expect, it } from 'vitest';
import { defaultFarmer, exploreSchema, farmerSchema } from '../src/lib/validation';
const valid = { location_id: 'gulu', start_date: '2024-01-01', end_date: '2024-12-31', categories: ['rainfall'], interval: 'daily' };
describe('exploration dates', () => {
  it('allows a leap year in daily view', () => expect(exploreSchema.safeParse(valid).success).toBe(true));
  it.each([
    { start_date: '2024-02-30' }, { end_date: '2026-01-01' },
    { start_date: '2015-12-31' }, { start_date: '2025-01-01' },
    { start_date: '2023-01-01' }, { categories: [] },
  ])('rejects invalid selections %s', (change) => expect(exploreSchema.safeParse({ ...valid, ...change }).success).toBe(false));
});
describe('farmer answers', () => {
  it('keeps unknown answers without guessing crops', () => expect(farmerSchema.parse(defaultFarmer).crop_history[0].crops).toEqual(['unknown']));
  it('rejects overlapping preferences', () => expect(farmerSchema.safeParse({ ...defaultFarmer, excluded_crops: ['maize'], preferred_crops: ['maize'] }).success).toBe(false));
  it('rejects invalid soil pH', () => expect(farmerSchema.safeParse({ ...defaultFarmer, soil: { ...defaultFarmer.soil, ph: 16 } }).success).toBe(false));
});

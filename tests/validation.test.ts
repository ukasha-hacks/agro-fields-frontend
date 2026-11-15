import { describe, expect, it } from 'vitest';
import {
  defaultFarmer,
  exploreSchema,
  farmerSchema,
  optionalNumber,
  draftFitsUrl,
  missingPlannedSeasons,
} from '../src/lib/validation';
const valid = {
  location_id: 'gulu',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  categories: ['rainfall'],
  interval: 'daily',
};
describe('exploration dates', () => {
  it('allows a leap year in daily view', () =>
    expect(exploreSchema.safeParse(valid).success).toBe(true));
  it.each([
    { start_date: '2024-02-30' },
    { end_date: '2026-01-01' },
    { start_date: '2015-12-31' },
    { start_date: '2025-01-01' },
    { start_date: '2023-01-01' },
    { categories: [] },
  ])('rejects invalid selections %s', (change) =>
    expect(exploreSchema.safeParse({ ...valid, ...change }).success).toBe(false),
  );
});

it('saves incomplete drafts but requires all planned crop choices before submission', () => {
  const draft = farmerSchema.parse(defaultFarmer);
  expect(missingPlannedSeasons(draft)).toEqual([0, 1, 2]);
  draft.baseline_sequence[0].crops = ['beans', 'groundnut'];
  draft.baseline_sequence[1].crops = [];
  expect(missingPlannedSeasons(draft)).toEqual([2]);
  draft.baseline_sequence[2].crops = ['cotton'];
  expect(missingPlannedSeasons(draft)).toEqual([]);
  expect(draft.crop_history[0].crops).toEqual(['unknown']);
});

it.each([0, -1, 1.5, 3661])('rejects invalid available growing days: %s', (days) => {
  const draft = structuredClone(defaultFarmer);
  draft.baseline_sequence[0].planned_days = days;
  expect(farmerSchema.safeParse(draft).success).toBe(false);
});
describe('farmer answers', () => {
  it('keeps unknown answers without guessing crops', () =>
    expect(farmerSchema.parse(defaultFarmer).crop_history[0].crops).toEqual(['unknown']));
  it('rejects overlapping preferences', () =>
    expect(
      farmerSchema.safeParse({
        ...defaultFarmer,
        excluded_crops: ['maize'],
        preferred_crops: ['maize'],
      }).success,
    ).toBe(false));
  it('rejects invalid soil pH', () =>
    expect(
      farmerSchema.safeParse({ ...defaultFarmer, soil: { ...defaultFarmer.soil, ph: 16 } }).success,
    ).toBe(false));
});

it('keeps missing soil measurements unknown and preserves a real zero', () => {
  expect(optionalNumber(null)).toBeNull();
  expect(optionalNumber(undefined)).toBeNull();
  expect(optionalNumber('')).toBeNull();
  expect(optionalNumber(0)).toBe(0);
  expect(optionalNumber('6.2')).toBe(6.2);
});
it('limits oversized URL drafts with a recoverable form warning', () => {
  expect(draftFitsUrl(defaultFarmer)).toBe(true);
  const long = {
    ...defaultFarmer,
    crop_history: Array.from({ length: 20 }, () => ({
      season_label: 'a'.repeat(100),
      crops: Array.from({ length: 12 }, (_, i) => 'crop' + i + 'x'.repeat(70)),
    })),
  };
  expect(draftFitsUrl(long)).toBe(false);
});

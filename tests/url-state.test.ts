import { expect, it } from 'vitest';
import { urlParsers, toExplore } from '../src/lib/url-state';
import { defaultFarmer, farmerSchema } from '../src/lib/validation';
it('round-trips a farmer draft without losing unknowns or real zero values', () => {
  const draft = {
    ...defaultFarmer,
    soil: { ...defaultFarmer.soil, ph: 0, organic_carbon_percent: 0 },
  };
  const encoded = urlParsers.farm.serialize(draft);
  expect(urlParsers.farm.parse(encoded)).toEqual(draft);
});
it('rejects malformed saved answers instead of trusting them', () => {
  expect(() => farmerSchema.parse({ ...defaultFarmer, water_supply: 'unlimited' })).toThrow();
  expect(() =>
    farmerSchema.parse({
      ...defaultFarmer,
      baseline_sequence: [
        defaultFarmer.baseline_sequence[0],
        defaultFarmer.baseline_sequence[0],
        defaultFarmer.baseline_sequence[0],
      ],
    }),
  ).toThrow();
});
it('maps the query values to the backend contract', () => {
  expect(
    toExplore({
      area: 'eastern_mbale',
      from: '2024-01-01',
      to: '2024-02-29',
      topics: ['rainfall'],
      interval: 'monthly',
    }),
  ).toEqual({
    location_id: 'eastern_mbale',
    start_date: '2024-01-01',
    end_date: '2024-02-29',
    categories: ['rainfall'],
    interval: 'monthly',
  });
});

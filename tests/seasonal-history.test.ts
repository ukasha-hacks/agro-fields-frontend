import { expect, it } from 'vitest';
import type { ExploreResponse } from '../src/lib/api';
import { completeMonth, rainfallWindow, monthHistory } from '../src/lib/seasonal-history';

type Point = ExploreResponse['panels'][number]['series'][number]['points'][number];
function month(year: number, index: number, value: number | null): Point {
  const days = new Date(Date.UTC(year, index, 0)).getUTCDate();
  const prefix = `${year}-${String(index).padStart(2, '0')}`;
  return {
    period_start: `${prefix}-01`,
    period_end: `${prefix}-${days}`,
    value,
    valid_days: value === null ? 0 : days,
    expected_days: days,
    coverage_fraction: value === null ? 0 : 1,
    partial_calendar_month: false,
  };
}
it('uses only complete three-month windows and shows the real denominator', () => {
  const points = [3, 4, 5].flatMap((m) => [
    month(2016, m, 10),
    month(2017, m, 30),
    month(2018, m, null),
  ]);
  const result = rainfallWindow(points, [3, 4, 5]);
  expect(result.years).toBe(2);
  expect(result.mean).toBe(60);
  expect(result.below).toBe(1);
  expect(result.totals).toEqual([
    { year: 2016, total: 30 },
    { year: 2017, total: 90 },
  ]);
});
it('does not call tied rainfall below average and preserves real zero', () => {
  const points = [3, 4, 5].flatMap((m) => [month(2016, m, 0), month(2017, m, 0)]);
  expect(rainfallWindow(points, [3, 4, 5])).toMatchObject({ mean: 0, below: 0, years: 2 });
});
it('rejects partial months and handles leap-year coverage', () => {
  expect(completeMonth(month(2024, 2, 20))).toBe(true);
  expect(completeMonth({ ...month(2024, 2, 20), valid_days: 28 })).toBe(false);
  expect(completeMonth({ ...month(2024, 2, 20), partial_calendar_month: true })).toBe(false);
});
it('keeps an unavailable calendar month empty rather than making it zero', () => {
  const data = {
    panels: [
      {
        series: [
          { series_id: 'rainfall_total_mm', points: [month(2016, 1, 10), month(2017, 1, 30)] },
        ],
      },
    ],
  } as ExploreResponse;
  const result = monthHistory(data);
  expect(result[0].rain).toEqual({ value: 20, years: 2 });
  expect(result[1].rain).toEqual({ value: null, years: 0 });
  expect(result[0].heat).toEqual({ value: null, years: 0 });
});

import type { ExploreResponse } from './api';

type Point = ExploreResponse['panels'][number]['series'][number]['points'][number];
export function completeMonth(point: Point) {
  const date = new Date(point.period_start + 'T00:00:00Z');
  const days = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  return (
    point.value !== null &&
    !point.partial_calendar_month &&
    point.valid_days === days &&
    point.expected_days === days
  );
}
export function rainfallWindow(points: Point[], months: number[]) {
  const years = Array.from({ length: 10 }, (_, i) => 2016 + i);
  const totals = years.flatMap((year) => {
    const selected = months.map((month) =>
      points.find((point) => point.period_start === `${year}-${String(month).padStart(2, '0')}-01`),
    );
    if (!selected.every((point) => point && completeMonth(point))) return [];
    return [{ year, total: selected.reduce((sum, point) => sum + point!.value!, 0) }];
  });
  if (!totals.length) return { years: 0, mean: null, below: 0, totals };
  const mean = totals.reduce((sum, item) => sum + item.total, 0) / totals.length;
  return {
    years: totals.length,
    mean,
    below: totals.filter((item) => item.total < mean - 1e-9).length,
    totals,
  };
}

export function monthHistory(data: ExploreResponse) {
  const find = (id: string) =>
    data.panels.flatMap((panel) => panel.series).find((series) => series.series_id === id)
      ?.points ?? [];
  const rain = find('rainfall_total_mm');
  const heat = find('temperature_mean_c');
  const wetness = find('surface_soil_wetness');
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const average = (points: Point[]) => {
      const values = points.filter(
        (point) => Number(point.period_start.slice(5, 7)) === month && completeMonth(point),
      );
      return {
        years: values.length,
        value: values.length
          ? values.reduce((sum, point) => sum + point.value!, 0) / values.length
          : null,
      };
    };
    return { month, rain: average(rain), heat: average(heat), wetness: average(wetness) };
  });
}

import { parseAsArrayOf, parseAsInteger, parseAsJson, parseAsString, parseAsStringEnum } from 'nuqs';
import { farmerSchema, type FarmerValues, type ExploreValues } from './validation';

export const urlParsers = {
  area: parseAsString.withDefault('northern_gulu'),
  from: parseAsString.withDefault('2024-01-01'),
  to: parseAsString.withDefault('2024-12-31'),
  topics: parseAsArrayOf(parseAsStringEnum(['rainfall', 'temperature', 'soil_wetness'])).withDefault(['rainfall', 'temperature', 'soil_wetness']),
  interval: parseAsStringEnum(['daily', 'monthly']).withDefault('monthly'),
  view: parseAsStringEnum(['map', 'history', 'farm', 'results']).withDefault('map'),
  chart: parseAsStringEnum(['line', 'bar']).withDefault('line'),
  cursor: parseAsInteger.withDefault(-1),
  farm: parseAsJson<FarmerValues>((value) => farmerSchema.parse(value)),
};
export type UrlValues = { area: string; from: string; to: string; topics: string[]; interval: string };
export function toExplore(state: UrlValues): ExploreValues {
  return { location_id: state.area, start_date: state.from, end_date: state.to, categories: state.topics as ExploreValues['categories'], interval: state.interval as 'daily' | 'monthly' };
}

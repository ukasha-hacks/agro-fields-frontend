export const criterionNames: Record<string, string> = {
  farmer_exclusions: 'Crops you avoid',
  crop_reference_coverage: 'Crop information',
  calendar_overlap: 'Season dates',
  growing_window_suitability: 'Growing season',
  agricultural_rule_coverage: 'Rotation evidence',
  priority_evidence: 'Your priority',
  mixed_crop_feasibility: 'Crops grown together',
  cropping_system: 'Crops grown together',
  maize_soil_ph: 'Maize · Soil pH range',
  beans_soil_ph: 'Beans · Soil pH range',
  groundnut_soil_ph: 'Groundnut · Soil pH range',
  sorghum_soil_ph: 'Sorghum · Soil pH range',
  maize_minimum_cycle_days: 'Maize · Minimum growing time',
  beans_minimum_cycle_days: 'Beans · Minimum growing time',
  groundnut_minimum_cycle_days: 'Groundnut · Minimum growing time',
  sorghum_minimum_cycle_days: 'Sorghum · Minimum growing time',
  maize_historical_temperature: 'Maize · Past temperature context',
  beans_historical_temperature: 'Beans · Past temperature context',
  groundnut_historical_temperature: 'Groundnut · Past temperature context',
  sorghum_historical_temperature: 'Sorghum · Past temperature context',
};
const messages: Record<string, string> = {
  'No reviewed agricultural rules are configured; species references alone do not validate rotations.':
    'Reviewed rotation rules are still needed. Basic crop information cannot confirm a good rotation on its own.',
  'Local maturity periods and season-specific climate/water rules are not supplied; historical context is descriptive.':
    'Local growing times and seasonal water needs are still needed. Past weather only gives context.',
  'Planting and harvest dates are needed to check season overlap.':
    'Add planting and harvest dates to check whether seasons overlap.',
  'Reviewed agricultural rules do not cover the full sequence.':
    'The available rules do not cover the whole crop sequence.',
  'Soil-benefit rules and locally relevant soil information are needed.':
    'Local soil information and reviewed soil benefit rules are needed.',
  'No additional adequately supported alternative is available.':
    'There is not enough evidence to show another option yet.',
};
export function plainReason(message: string) {
  return messages[message] ?? message;
}

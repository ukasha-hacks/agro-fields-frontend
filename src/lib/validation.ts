import { z } from 'zod';

export const categories = ['rainfall', 'temperature', 'soil_wetness'] as const;
export const dateText = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a full date.')
  .refine((s) => {
    const date = new Date(s + 'T00:00:00Z');
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === s;
  }, 'Choose a valid date.');
export const exploreSchema = z
  .object({
    location_id: z.string().min(1, 'Choose an area.'),
    start_date: dateText,
    end_date: dateText,
    categories: z.array(z.enum(categories)).min(1, 'Choose at least one topic.').max(3),
    interval: z.enum(['daily', 'monthly']),
  })
  .superRefine((v, context) => {
    if (v.start_date > v.end_date)
      context.addIssue({
        code: 'custom',
        path: ['end_date'],
        message: 'End date must come after the start date.',
      });
    if (v.start_date < '2016-01-01')
      context.addIssue({
        code: 'custom',
        path: ['start_date'],
        message: 'The archive starts on 1 January 2016.',
      });
    if (v.end_date > '2025-12-31')
      context.addIssue({
        code: 'custom',
        path: ['end_date'],
        message: 'The archive ends on 31 December 2025.',
      });
    const days = (Date.parse(v.end_date) - Date.parse(v.start_date)) / 86400000 + 1;
    if (v.interval === 'daily' && days > 366)
      context.addIssue({
        code: 'custom',
        path: ['interval'],
        message: 'Use monthly for more than 366 days.',
      });
  });
export type ExploreValues = z.infer<typeof exploreSchema>;

const cropChoice = z.string().trim().toLowerCase().min(1).max(80);
const history = z.object({
  season_label: z.string().trim().min(1, 'Name this season.').max(100),
  crops: z.array(cropChoice).max(12),
});
const season = z
  .object({
    season: z.number().int().min(1).max(3),
    season_label: z.string().max(100),
    crops: z.array(cropChoice).max(12),
    planned_days: z.number().int('Use whole days.').min(1).max(3660).nullable().optional(),
    planting_date: dateText.nullable(),
    harvest_date: dateText.nullable(),
  })
  .refine((s) => !s.planting_date || !s.harvest_date || s.planting_date <= s.harvest_date, {
    path: ['harvest_date'],
    message: 'Harvest must come after planting.',
  });
export const farmerSchema = z
  .object({
    crop_history: z.array(history).min(1).max(20),
    baseline_sequence: z.array(season).length(3),
    water_supply: z.enum(['rainfall_only', 'limited_irrigation', 'reliable_irrigation', 'unknown']),
    priority: z.enum(['improve_soil', 'conserve_water', 'reduce_pests', 'income', 'general']),
    excluded_crops: z.array(cropChoice).max(30),
    preferred_crops: z.array(cropChoice).max(30),
    soil: z.object({
      use_area_estimate: z.boolean().optional(),
      ph: z
        .number()
        .min(0, 'Use a pH between 0 and 14.')
        .max(14, 'Use a pH between 0 and 14.')
        .nullable(),
      texture: z.string().max(100).nullable(),
      organic_carbon_percent: z.number().min(0).max(100).nullable(),
    }),
    repeats: z.boolean(),
  })
  .superRefine((v, context) => {
    if (v.excluded_crops.some((crop) => v.preferred_crops.includes(crop)))
      context.addIssue({
        code: 'custom',
        path: ['preferred_crops'],
        message: 'A crop cannot be both preferred and excluded.',
      });
    if (v.baseline_sequence.some((season, index) => season.season !== index + 1))
      context.addIssue({
        code: 'custom',
        path: ['baseline_sequence'],
        message: 'Keep seasons 1, 2 and 3 in order.',
      });
    [...v.crop_history, ...v.baseline_sequence].forEach((s, index) => {
      const path = [
        index < v.crop_history.length ? 'crop_history' : 'baseline_sequence',
        index < v.crop_history.length ? index : index - v.crop_history.length,
        'crops',
      ];
      if (new Set(s.crops).size !== s.crops.length)
        context.addIssue({
          code: 'custom',
          path,
          message: 'Choose each crop only once in a season.',
        });
      if (s.crops.includes('unknown') && s.crops.length > 1)
        context.addIssue({
          code: 'custom',
          path: [
            index < v.crop_history.length ? 'crop_history' : 'baseline_sequence',
            index < v.crop_history.length ? index : index - v.crop_history.length,
            'crops',
          ],
          message: 'Choose unknown on its own.',
        });
    });
  });
export type FarmerValues = z.infer<typeof farmerSchema>;
export const defaultFarmer: FarmerValues = {
  crop_history: [{ season_label: 'Last season', crops: ['unknown'] }],
  baseline_sequence: [1, 2, 3].map((season) => ({
    season,
    season_label: `Season ${season}`,
    crops: ['unknown'],
    planned_days: null,
    planting_date: null,
    harvest_date: null,
  })),
  water_supply: 'unknown',
  priority: 'general',
  excluded_crops: [],
  preferred_crops: [],
  soil: { ph: null, texture: null, organic_carbon_percent: null, use_area_estimate: true },
  repeats: false,
};

export function optionalNumber(value: unknown): number | null {
  return value === '' || value === null || value === undefined ? null : Number(value);
}
export function draftFitsUrl(value: FarmerValues): boolean {
  return encodeURIComponent(JSON.stringify(value)).length <= 6500;
}

// Incomplete drafts can be saved, but cannot be submitted as a finished plan.
export function missingPlannedSeasons(value: FarmerValues): number[] {
  return value.baseline_sequence.flatMap((season, index) =>
    season.crops.includes('unknown') ? [index] : [],
  );
}

export function farmerSubmitIssue(value: unknown): { step: number; message: string } | null {
  const parsed = farmerSchema.safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const [section, index] = issue.path;
    const step =
      section === 'crop_history'
        ? 1
        : section === 'baseline_sequence' || section === 'repeats'
          ? 3
          : 2;
    const label =
      section === 'baseline_sequence' && typeof index === 'number'
        ? `Season ${index + 1}`
        : step === 1
          ? 'Past crops'
          : step === 2
            ? 'Farm details'
            : 'Next seasons';
    return { step, message: `${label}: ${issue.message}` };
  }
  const missing = missingPlannedSeasons(parsed.data);
  if (missing.length) {
    const label = missing.length === 1 ? 'season' : 'seasons';
    return {
      step: 3,
      message: `Choose crops or Fallow for ${label} ${missing.map((index) => index + 1).join(', ')}.`,
    };
  }
  return null;
}

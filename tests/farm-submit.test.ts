import { expect, it } from 'vitest';
import { defaultFarmer, farmerSubmitIssue } from '../src/lib/validation';

function completePlan() {
  const draft = structuredClone(defaultFarmer);
  draft.baseline_sequence.forEach((season) => {
    season.crops = ['beans'];
  });
  return draft;
}

it('names unfinished planned seasons without blocking unknown past crops', () => {
  const draft = completePlan();
  expect(farmerSubmitIssue(draft)).toBeNull();
  draft.baseline_sequence[2].crops = ['unknown'];
  expect(farmerSubmitIssue(draft)).toEqual({
    step: 3,
    message: 'Choose crops or Fallow for season 3.',
  });
  draft.baseline_sequence[0].crops = ['unknown'];
  expect(farmerSubmitIssue(draft)?.message).toContain('seasons 1, 3');
});

it('allows an explicit fallow choice through submission', () => {
  const draft = completePlan();
  draft.baseline_sequence[1].crops = [];
  expect(farmerSubmitIssue(draft)).toBeNull();
});

it('points to an invalid date even when the farmer is on another step', () => {
  const draft = completePlan();
  draft.baseline_sequence[1].planting_date = '2027-06-01';
  draft.baseline_sequence[1].harvest_date = '2027-05-01';
  expect(farmerSubmitIssue(draft)).toEqual({
    step: 3,
    message: 'Season 2: Harvest must come after planting.',
  });
});

it('routes a hidden soil error back to farm details', () => {
  const draft = completePlan();
  draft.soil.ph = 16;
  expect(farmerSubmitIssue(draft)).toEqual({
    step: 2,
    message: 'Farm details: Use a pH between 0 and 14.',
  });
});

it('routes a missing past-season label to the first step', () => {
  const draft = completePlan();
  draft.crop_history[0].season_label = '';
  expect(farmerSubmitIssue(draft)).toEqual({ step: 1, message: 'Past crops: Name this season.' });
});

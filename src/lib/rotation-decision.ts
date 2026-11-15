import type { Category, Panel, RotationResponse } from './api';

type Assessment = Pick<
  RotationResponse,
  'status' | 'baseline' | 'alternatives' | 'missing_information'
> &
  Partial<Pick<RotationResponse, 'conclusion'>>;

// A passed individual check must never become a claim that the whole plan is suitable.
export function rotationDecision(result: Assessment) {
  if (result.conclusion) {
    const { title, detail, tone } = result.conclusion;
    return { title, detail, tone };
  }
  if (result.status === 'needs_input') {
    return {
      tone: 'attention',
      title: 'Complete your crop choices',
      detail: 'Choose a crop or Fallow for every planned season before comparing this plan.',
    };
  }
  if (
    result.baseline.feasibility_status === 'infeasible' ||
    result.baseline.checks.some((check) => check.status === 'fail')
  ) {
    return {
      tone: 'attention',
      title: 'Your starting plan needs changes',
      detail: 'Fix the listed conflicts before using this plan. Local advice is still needed.',
    };
  }
  if (result.status === 'insufficient_evidence' || result.alternatives.length === 0) {
    return {
      tone: 'review',
      title: 'No reliable rotation recommendation yet',
      detail:
        'Your plan is recorded. Reviewed local rules are needed before we can recommend a rotation.',
    };
  }
  if (result.status === 'reference_only') {
    return {
      tone: 'review',
      title: `${result.alternatives.length} reference-based options to discuss`,
      detail:
        'These options use the saved crop ranges. Crop order, seasonal water needs and expected benefits still need local review.',
    };
  }
  const strategies = [result.baseline, ...result.alternatives];
  if (
    result.status === 'provisional' ||
    result.missing_information.length > 0 ||
    strategies.some(
      (strategy) =>
        strategy.feasibility_status !== 'feasible_for_declared_checks' ||
        strategy.checks.some((check) => check.status !== 'pass'),
    )
  ) {
    return {
      tone: 'review',
      title: 'These options need local review',
      detail:
        'These are provisional options. A local adviser must review the remaining evidence gaps.',
    };
  }
  return {
    tone: 'complete',
    title: 'Listed checks are complete',
    detail:
      'These options meet only the listed checks. Local suitability and expected benefits still need review.',
  };
}

export function rotationEvidenceCategory(
  panels: Panel[],
  selected: Category | null,
  priority: string,
) {
  const preferred = priority === 'improve_soil' ? 'soil_wetness' : 'rainfall';
  return (
    panels.find((panel) => panel.category === selected)?.category ??
    panels.find((panel) => panel.category === preferred)?.category ??
    panels[0]?.category
  );
}

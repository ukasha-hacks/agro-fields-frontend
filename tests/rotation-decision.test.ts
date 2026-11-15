import { expect, it } from 'vitest';
import type { Panel, RotationResponse } from '../src/lib/api';
import { rotationDecision, rotationEvidenceCategory } from '../src/lib/rotation-decision';

type Assessment = Parameters<typeof rotationDecision>[0];
// Synthetic checks exercise wording decisions, not real agricultural recommendations.
function strategy(status: 'pass' | 'fail' | 'unknown'): RotationResponse['baseline'] {
  return {
    strategy_id: 'test',
    sequence: [],
    feasibility_status:
      status === 'pass'
        ? 'feasible_for_declared_checks'
        : status === 'fail'
          ? 'infeasible'
          : 'unknown',
    checks: [{ criterion: 'test', status, reason: 'Synthetic test check' }],
    explanations: [],
    local_review_required: true,
  };
}
function assessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    status: 'insufficient_evidence',
    baseline: strategy('unknown'),
    alternatives: [],
    missing_information: ['Reviewed rules are missing'],
    ...overrides,
  };
}
it('gives a direct missing-evidence answer rather than calling the baseline suitable', () => {
  expect(rotationDecision(assessment()).title).toBe('No reliable rotation recommendation yet');
});
it('puts a known baseline conflict ahead of an overall missing-evidence status', () => {
  expect(rotationDecision(assessment({ baseline: strategy('fail') }))).toMatchObject({
    tone: 'attention',
    title: 'Your starting plan needs changes',
  });
});
it('keeps partial options provisional even if the response says assessed', () => {
  expect(
    rotationDecision(
      assessment({
        status: 'assessed',
        baseline: strategy('pass'),
        alternatives: [strategy('unknown')],
        missing_information: [],
      }),
    ).title,
  ).toBe('These options need local review');
});
it('does not turn completed declared checks into a farm-suitability claim', () => {
  const result = rotationDecision(
    assessment({
      status: 'assessed',
      baseline: strategy('pass'),
      alternatives: [strategy('pass')],
      missing_information: [],
    }),
  );
  expect(result.title).toBe('Listed checks are complete');
  expect(result.detail).toContain('Local suitability and expected benefits still need review');
});
it('does not accept an assessed status without any supported alternatives', () => {
  expect(
    rotationDecision(
      assessment({ status: 'assessed', baseline: strategy('pass'), missing_information: [] }),
    ).tone,
  ).toBe('review');
  expect(
    rotationDecision(
      assessment({ status: 'assessed', baseline: strategy('pass'), missing_information: [] }),
    ).title,
  ).toBe('No reliable rotation recommendation yet');
});
it('uses the selected graph or a relevant available topic without inventing a missing panel', () => {
  const panels = [{ category: 'rainfall' }, { category: 'soil_wetness' }] as Panel[];
  expect(rotationEvidenceCategory(panels, null, 'improve_soil')).toBe('soil_wetness');
  expect(rotationEvidenceCategory(panels, 'rainfall', 'improve_soil')).toBe('rainfall');
  expect(rotationEvidenceCategory(panels, 'temperature', 'general')).toBe('rainfall');
  expect(rotationEvidenceCategory([], null, 'general')).toBeUndefined();
});

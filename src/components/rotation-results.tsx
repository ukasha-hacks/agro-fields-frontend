'use client';
import { useState } from 'react';
import { useQueryStates } from 'nuqs';
import { ArrowLeft, ArrowRight, Download, LoaderCircle } from 'lucide-react';
import { urlParsers, toExplore } from '@/lib/url-state';
import { exploreSchema } from '@/lib/validation';
import {
  downloadReport,
  type Location,
  type RotationRequest,
  type RotationResponse,
} from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { humanize } from '@/lib/utils';
import { rotationDecision } from '@/lib/rotation-decision';
import { Button } from './ui/button';
import { StatusMessage } from './status-message';
import { RotationEvidence } from './rotation-evidence';
import { RotationChecks } from './rotation-checks';

export function RotationResults({ locations }: { locations: Location[] }) {
  const [state, setState] = useQueryStates(urlParsers, { history: 'replace', shallow: true });
  const exploration = toExplore(state);
  const valid =
    !!state.farm &&
    exploreSchema.safeParse(exploration).success &&
    locations.some((location) => location.location_id === state.area);
  const request: RotationRequest | undefined = state.farm
    ? {
        ...state.farm,
        exploration,
        soil: { ...state.farm.soil, use_area_estimate: state.farm.soil.use_area_estimate ?? true },
      }
    : undefined;
  const result = useApi<RotationResponse>('rotation-comparisons', request, valid);
  const data = result.data;
  const decision = data ? rotationDecision(data) : undefined;
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  async function exportPdf() {
    if (!request) return;
    setExporting(true);
    setExportError('');
    try {
      await downloadReport(exploration, request);
    } catch (error) {
      setExportError((error as Error).message);
    } finally {
      setExporting(false);
    }
  }
  function editAnswers() {
    const phNeeded = data?.baseline.checks.some(
      (check) => check.gap_type === 'farmer_input' && check.criterion.endsWith('soil_ph'),
    );
    void setState({ view: 'farm', step: phNeeded ? 2 : 3 });
  }
  if (!valid)
    return (
      <div className="insight-block m-6">
        <h3 className="text-xl">Add your farm details first</h3>
        <p>Choose your crops and a valid history period.</p>
        <Button className="mt-5" onClick={() => void setState({ view: 'farm' })}>
          Add farm details <ArrowRight />
        </Button>
      </div>
    );
  return (
    <div className="rotation-result-layout">
      <div
        className="rotation-result-scroll space-y-6"
        role="region"
        aria-label="Rotation evidence and checks"
        tabIndex={0}
      >
        <StatusMessage
          loading={result.loading}
          error={result.error}
          retry={result.refetch}
          kind="assessment"
        />
        {data && decision && (
          <>
            <section className="assessment-banner">
              <p className="eyebrow">
                Your result ·{' '}
                {data.status === 'reference_only' ? 'Reference checks' : 'Farm checks'}
              </p>
              <h3>{decision.title}</h3>
              <p>{decision.detail}</p>
              {!!data.conclusion?.next_steps.length && (
                <ul className="plain-list">
                  {data.conclusion.next_steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              )}
            </section>
            <section>
              <div className="flex items-center justify-between">
                <h3 className="form-section-title">Your starting plan</h3>
                <Button variant="ghost" size="small" onClick={editAnswers}>
                  Edit answers
                </Button>
              </div>
              <div className="rotation-sequence mt-4">
                {data.baseline.sequence.map((season, index) => (
                  <div key={season.season}>
                    <span>Season {season.season}</span>
                    <strong>
                      {season.crops.length
                        ? season.crops
                            .map((crop) => (crop === 'unknown' ? 'Not sure' : humanize(crop)))
                            .join(' + ')
                        : 'Fallow'}
                    </strong>
                    {index < 2 && <ArrowRight size={16} />}
                  </div>
                ))}
              </div>
            </section>
            {!!data.alternatives.length && (
              <section>
                <h3 className="form-section-title">Other rotation options</h3>
                <div className="alternative-grid">
                  {data.alternatives.map((option, index) => (
                    <article className="alternative-card" key={option.strategy_id}>
                      <p className="eyebrow">Option {index + 1} · For review</p>
                      <h4 className="mt-3 font-medium">
                        {option.sequence
                          .map((season) => season.crops.map(humanize).join(' + '))
                          .join(' → ')}
                      </h4>
                      <p className="mt-3 text-sm text-muted">
                        {option.summary ?? 'This option passed some available checks.'}
                      </p>
                      <p className="mt-2 text-sm">
                        {option.next_step ?? 'Review the remaining checks before choosing.'}
                      </p>
                      <details className="source-details mt-4">
                        <summary>See checks and sources</summary>
                        <RotationChecks checks={option.checks} />
                      </details>
                    </article>
                  ))}
                </div>
              </section>
            )}
            <details id="rotation-checks" className="source-details">
              <summary>Starting plan: checks and missing details</summary>
              <RotationChecks checks={data.baseline.checks} />
            </details>
            <details className="source-details">
              <summary>View past rainfall, temperature and soil wetness</summary>
              <RotationEvidence
                context={data.environmental_context}
                priority={data.priority}
                selected={state.focus}
                onSelect={(category) => void setState({ focus: category })}
                onOpenHistory={(category) =>
                  void setState(
                    { view: 'history', topics: [category], focus: category, cursor: -1 },
                    { history: 'push' },
                  )
                }
              />
            </details>
            <details className="source-details">
              <summary>Sources and remaining limits</summary>
              {data.sources.map((source) => (
                <p key={source.source_id}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.name} ↗
                  </a>
                  <span>{source.limitations}</span>
                </p>
              ))}
              {data.missing_information.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </details>
          </>
        )}
      </div>
      {data && decision && (
        <section className={`rotation-decision ${decision.tone}`} aria-label="Your rotation result">
          <div role="status" aria-live="polite">
            <p className="eyebrow">Your result</p>
            <h3>{decision.title}</h3>
            <p className="decision-detail">{decision.detail}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="small" onClick={exportPdf} disabled={exporting}>
              {exporting ? <LoaderCircle className="animate-spin" /> : <Download />}
              {exporting ? 'Making PDF…' : 'Download report'}
            </Button>
            <Button size="small" variant="secondary" onClick={editAnswers}>
              <ArrowLeft /> Edit answers
            </Button>
          </div>
          {exportError && (
            <p className="field-error mt-2" role="alert">
              {exportError}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

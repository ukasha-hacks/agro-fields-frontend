'use client';
import { useState } from 'react';
import { useQueryStates } from 'nuqs';
import { ArrowLeft, ArrowRight, Check, CircleHelp, Download, TriangleAlert } from 'lucide-react';
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
import { criterionNames, plainReason } from '@/lib/plain-language';
import { Button } from './ui/button';
import { HelpTip } from './help-tip';
import { StatusMessage } from './status-message';

export function RotationResults({ locations }: { locations: Location[] }) {
  const [state, setState] = useQueryStates(urlParsers, { history: 'replace', shallow: true });
  const exploration = toExplore(state);
  const valid =
    !!state.farm &&
    exploreSchema.safeParse(exploration).success &&
    locations.some((l) => l.location_id === state.area);
  const request: RotationRequest | undefined = state.farm
    ? { ...state.farm, exploration }
    : undefined;
  const result = useApi<RotationResponse>('rotation-comparisons', request, valid);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  async function exportPdf() {
    if (!request) return;
    setExporting(true);
    setExportError('');
    try {
      await downloadReport(exploration, request);
    } catch (e) {
      setExportError((e as Error).message);
    } finally {
      setExporting(false);
    }
  }
  if (!valid)
    return (
      <div className="insight-block">
        <h3 className="text-xl">Let’s check your starting point</h3>
        <p>Add your farm answers and a valid history selection before viewing an assessment.</p>
        <Button
          className="mt-5"
          onClick={() => {
            void setState({ view: 'farm' });
          }}
        >
          Add farm details
          <ArrowRight />
        </Button>
      </div>
    );
  return (
    <div className="space-y-6">
      <StatusMessage loading={result.loading} error={result.error} retry={result.refetch} />
      {result.data && (
        <>
          <section className="assessment-banner">
            <span className="assessment-icon">
              {result.data.status === 'insufficient_evidence' ? (
                <CircleHelp size={24} />
              ) : (
                <SproutIcon />
              )}
            </span>
            <p className="eyebrow">
              {result.data.status === 'insufficient_evidence'
                ? 'More evidence needed'
                : result.data.status === 'provisional'
                  ? 'For local review'
                  : 'Configured checks complete'}
            </p>
            <h3>
              {result.data.status === 'insufficient_evidence'
                ? 'A useful starting point.\nA few missing pieces.'
                : 'Options to discuss,\nwith the checks in view.'}
            </h3>
            <p>
              {result.data.status === 'insufficient_evidence'
                ? 'Your plan is recorded below. We need reviewed farming rules before we can suggest reliable alternatives.'
                : 'These results only cover the listed checks. Ask a local farming expert to review the full plan.'}
            </p>
            <HelpTip label="Why no best crop score?">
              The data service does not have reviewed local rules for every crop, season, or
              priority. A score would suggest more certainty than the evidence supports.
            </HelpTip>
          </section>
          <section>
            <div className="flex items-center justify-between">
              <h3 className="form-section-title">Your starting rotation</h3>
              <Button
                variant="ghost"
                size="small"
                onClick={() => {
                  void setState({ view: 'farm' });
                }}
              >
                Edit answers
              </Button>
            </div>
            <p className="mt-2 mb-4 text-xs text-muted">
              Your priority:{' '}
              {(
                {
                  improve_soil: 'Improve the soil',
                  conserve_water: 'Save water',
                  reduce_pests: 'Reduce pests',
                  income: 'Support farm income',
                  general: 'Explore my options',
                } as Record<string, string>
              )[result.data.priority] ?? humanize(result.data.priority)}
            </p>
            <div className="rotation-sequence">
              {result.data.baseline.sequence.map((s, index) => (
                <div key={s.season}>
                  <span>Season {s.season}</span>
                  <strong>
                    {s.crops.length
                      ? s.crops
                          .map((crop) => (crop === 'unknown' ? 'Not sure' : humanize(crop)))
                          .join(' + ')
                      : 'Fallow'}
                  </strong>
                  {index < 2 && <ArrowRight size={16} />}
                </div>
              ))}
            </div>
          </section>
          <section>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">What we could check</h3>
              <HelpTip label="Reading the checks">
                A passed check covers only that item. It does not mean the whole rotation is
                suitable. Not checked means more data or reviewed rules are needed.
              </HelpTip>
            </div>
            <div className="criteria-list">
              {result.data.baseline.checks.map((check) => (
                <div key={check.criterion}>
                  <span className={`check-icon ${check.status}`}>
                    {check.status === 'pass' ? (
                      <Check size={17} />
                    ) : check.status === 'fail' ? (
                      <TriangleAlert size={16} />
                    ) : (
                      <CircleHelp size={16} />
                    )}
                  </span>
                  <div>
                    <p className="font-medium">
                      {criterionNames[check.criterion] ?? humanize(check.criterion)}
                    </p>
                    <p className="check-reason">{plainReason(check.reason)}</p>
                    {check.source_url && (
                      <a
                        className="text-xs underline"
                        href={check.source_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Read rule source ↗
                      </a>
                    )}
                  </div>
                  <span className="check-label-text">
                    {check.status === 'pass'
                      ? 'Meets this check'
                      : check.status === 'fail'
                        ? 'Needs attention'
                        : 'Not checked yet'}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3 className="form-section-title">Other rotation options</h3>
            <div className="alternative-grid">
              {result.data.alternatives.map((alternative, index) => (
                <div className="alternative-card" key={alternative.strategy_id}>
                  <p className="eyebrow">Option {index + 1} · For review</p>
                  <p className="mt-3 font-medium">
                    {alternative.sequence.map((s) => s.crops.join(' + ') || 'Fallow').join(' → ')}
                  </p>
                  <ul className="plain-list">
                    {alternative.explanations.map((text) => (
                      <li key={text}>{plainReason(text)}</li>
                    ))}
                  </ul>
                  <details className="mt-3 text-xs">
                    <summary>Checks and tradeoffs</summary>
                    {alternative.checks.map((check) => (
                      <p key={check.criterion} className="mt-2">
                        {criterionNames[check.criterion] ?? humanize(check.criterion)}:{' '}
                        {humanize(check.status)}. {plainReason(check.reason)}
                      </p>
                    ))}
                    {alternative.potential_benefits?.map((text) => (
                      <p className="mt-2" key={text}>
                        {text}
                      </p>
                    ))}
                    {alternative.tradeoffs?.map((text) => (
                      <p className="mt-2" key={text}>
                        {text}
                      </p>
                    ))}
                  </details>
                </div>
              ))}
              {result.data.unfilled_alternative_slots.map((slot, index) => (
                <div key={slot.strategy_id} className="alternative-card empty">
                  <p className="eyebrow">Option {result.data!.alternatives.length + index + 1}</p>
                  <p className="mt-4 text-sm">{plainReason(slot.reason)}</p>
                  <span className="mt-4 block text-xs text-muted">
                    Waiting for supporting evidence
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="insight-block">
            <p className="eyebrow">Bring local knowledge</p>
            <h3 className="mt-3 text-xl tracking-tight">
              Useful questions for your next conversation
            </h3>
            <ul className="plain-list">
              {result.data.missing_information.map((message) => (
                <li key={message}>{plainReason(message)}</li>
              ))}
            </ul>
          </section>
          <p className="text-xs leading-relaxed text-muted">
            This assessment does not predict yield, income, or soil improvement. Local review is
            still needed. Your selected past weather period is context, not a forecast for the
            planned seasons.
          </p>
          <details className="source-details">
            <summary>Sources and evidence notes</summary>
            {result.data.sources.map((source) => (
              <p key={source.source_id}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.name} ↗
                </a>
                <span>{source.limitations}</span>
              </p>
            ))}
            {result.data.warnings.map((warning) => (
              <p className="text-xs text-muted" key={warning.code}>
                {warning.message}
              </p>
            ))}
          </details>
          <div className="flex flex-wrap gap-3">
            <Button onClick={exportPdf} disabled={exporting}>
              <Download />
              {exporting ? 'Making PDF…' : 'Download full report'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void setState({ view: 'farm' });
              }}
            >
              <ArrowLeft />
              Edit farm answers
            </Button>
          </div>
          {exportError && (
            <p className="field-error" role="alert">
              {exportError}
            </p>
          )}
        </>
      )}
    </div>
  );
}
function SproutIcon() {
  return <Check size={24} />;
}

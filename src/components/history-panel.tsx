'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Download, LoaderCircle, Pause, Play } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { useQueryStates } from 'nuqs';
import { urlParsers, toExplore } from '@/lib/url-state';
import { exploreSchema, type ExploreValues } from '@/lib/validation';
import { downloadReport, type ExploreResponse, type Location } from '@/lib/api';
import { formatValue } from '@/lib/utils';
import { useApi } from '@/lib/use-api';
import { HistoryChart } from './history-chart';
import { HelpTip } from './help-tip';
import { Button } from './ui/button';
import { StatusMessage } from './status-message';
import { PeriodSummary } from './period-summary';
import { SeasonalHistory } from './seasonal-history';

export function HistoryPanel({ locations }: { locations: Location[] }) {
  const [state, setState] = useQueryStates(urlParsers, { history: 'replace', shallow: true });
  const selection = toExplore(state);
  const valid = exploreSchema.safeParse(selection);
  const form = useForm<ExploreValues>({
    resolver: zodResolver(exploreSchema),
    values: selection,
    mode: 'onBlur',
  });
  const { data, loading, error, refetch } = useApi<ExploreResponse>(
    'explore',
    selection,
    valid.success && locations.some((l) => l.location_id === state.area),
  );
  const [playing, setPlaying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const reducedMotion = useReducedMotion();
  const points = data?.panels[0]?.series[0]?.points ?? [];
  const max = Math.max(0, points.length - 1);
  const cursor = state.cursor > max ? -1 : state.cursor;
  const selectionKey = JSON.stringify(selection);
  useEffect(() => {
    if (data && state.focus)
      document.getElementById(`evidence-${state.focus}`)?.scrollIntoView({ block: 'start' });
  }, [data, state.focus]);
  useEffect(() => {
    setPlaying(false);
  }, [selectionKey]);
  useEffect(() => {
    if (!playing || points.length < 2) return;
    const timer = setInterval(() => {
      void setState({ cursor: state.cursor >= max ? 0 : state.cursor + 1 });
    }, 1400);
    return () => clearInterval(timer);
  }, [playing, state.cursor, max, points.length, setState]);
  async function exportPdf() {
    setExporting(true);
    setExportError('');
    try {
      await downloadReport(selection);
    } catch (e) {
      setExportError((e as Error).message);
    } finally {
      setExporting(false);
    }
  }
  const fieldError = (key: keyof ExploreValues) => form.formState.errors[key]?.message;
  return (
    <div className="space-y-7">
      <form
        onSubmit={form.handleSubmit(() => {
          void setState({ cursor: -1, focus: null });
        })}
        className="space-y-4"
        noValidate
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="field">
            <label htmlFor="start-date">From</label>
            <input
              id="start-date"
              type="date"
              min="2016-01-01"
              max="2025-12-31"
              {...form.register('start_date', {
                onChange: (e) => {
                  void setState({ from: e.target.value, cursor: -1, focus: null });
                },
              })}
              aria-invalid={!!fieldError('start_date')}
              aria-describedby="start-error"
            />
            <p className="field-error" id="start-error">
              {fieldError('start_date')}
            </p>
          </div>
          <div className="field">
            <label htmlFor="end-date">To</label>
            <input
              id="end-date"
              type="date"
              min="2016-01-01"
              max="2025-12-31"
              {...form.register('end_date', {
                onChange: (e) => {
                  void setState({ to: e.target.value, cursor: -1, focus: null });
                },
              })}
              aria-invalid={!!fieldError('end_date')}
              aria-describedby="end-error"
            />
            <p className="field-error" id="end-error">
              {fieldError('end_date')}
            </p>
          </div>
        </div>
        <fieldset>
          <legend className="mb-2 flex items-center gap-1 text-sm font-medium">
            What would you like to see?
            <HelpTip label="Choose topics">
              Each topic has its own graph and unit. This keeps rainfall, temperature, and wetness
              easy to compare without mixing scales.
            </HelpTip>
          </legend>
          <div className="topic-options">
            {(['rainfall', 'temperature', 'soil_wetness'] as const).map((topic) => (
              <label key={topic}>
                <input
                  type="checkbox"
                  value={topic}
                  checked={state.topics.includes(topic)}
                  onChange={(e) => {
                    void setState({
                      topics: e.target.checked
                        ? [...state.topics, topic]
                        : state.topics.filter((v) => v !== topic),
                      cursor: -1,
                      focus: null,
                    });
                  }}
                />
                <span>
                  {topic === 'soil_wetness'
                    ? 'Soil wetness'
                    : topic[0].toUpperCase() + topic.slice(1)}
                </span>
              </label>
            ))}
          </div>
          {!valid.success && (
            <p className="field-error" role="alert">
              {valid.error.issues[0].message}
            </p>
          )}
        </fieldset>
        <div className="flex flex-wrap items-center gap-4">
          <div className="field flex-1">
            <label htmlFor="interval">Group values by</label>
            <select
              id="interval"
              {...form.register('interval', {
                onChange: (e) => {
                  void setState({ interval: e.target.value, cursor: -1, focus: null });
                },
              })}
            >
              <option value="monthly">Month</option>
              <option value="daily">Day</option>
            </select>
            <p className="field-error">{fieldError('interval')}</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Graph style</p>
            <div className="segmented">
              <button
                type="button"
                aria-pressed={state.chart === 'line'}
                onClick={() => {
                  void setState({ chart: 'line' });
                }}
              >
                Line
              </button>
              <button
                type="button"
                aria-pressed={state.chart === 'bar'}
                onClick={() => {
                  void setState({ chart: 'bar' });
                }}
              >
                Bar
              </button>
            </div>
          </div>
        </div>
      </form>
      <StatusMessage loading={loading} error={error} retry={refetch} kind="history" />
      {data && (
        <>
          <PeriodSummary statistics={data.statistics} />
          <div className="replay">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">Walk through the past</p>
              <HelpTip label="Historical replay">
                Move the slider to read a past period. The line marks that period on every graph.
                This is a replay of observations, not a forecast. The country colour does not change
                with weather.
              </HelpTip>
              <span className="ml-auto text-xs text-muted">
                {cursor >= 0
                  ? `${points[cursor]?.period_start} to ${points[cursor]?.period_end}`
                  : 'Full selected period'}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Button
                variant="secondary"
                size="icon"
                disabled={points.length < 2 || !!reducedMotion}
                aria-label={playing ? 'Pause replay' : 'Play replay'}
                onClick={() => setPlaying(!playing)}
              >
                {playing ? <Pause /> : <Play />}
              </Button>
              <input
                className="replay-slider"
                type="range"
                aria-label="Historical period"
                min={0}
                max={max}
                value={Math.max(0, cursor)}
                onChange={(e) => {
                  setPlaying(false);
                  void setState({ cursor: Number(e.target.value) });
                }}
              />
              <button
                className="text-xs underline"
                onClick={() => {
                  setPlaying(false);
                  void setState({ cursor: -1, focus: null });
                }}
              >
                All
              </button>
            </div>
            {reducedMotion && (
              <p className="mt-2 text-xs text-muted">
                Use the slider to move through periods at your own pace.
              </p>
            )}
            {cursor >= 0 && (
              <div className="replay-values">
                {data.panels.map((panel) => (
                  <div key={panel.category}>
                    <span>{panel.title}</span>
                    <strong>
                      {formatValue(
                        panel.series[0]?.points[cursor]?.value ?? null,
                        panel.category === 'soil_wetness' ? 3 : 1,
                      )}{' '}
                      {panel.category === 'temperature'
                        ? '°C'
                        : panel.category === 'rainfall'
                          ? 'mm'
                          : '/ 1'}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-7">
            {data.panels.map((panel) => (
              <HistoryChart key={panel.category} panel={panel} type={state.chart} cursor={cursor} />
            ))}
          </div>
          <SeasonalHistory area={state.area} />
          <section className="insight-block">
            <p className="eyebrow">What the archive shows</p>
            {data.descriptions.map((item) => (
              <p key={item.text}>{item.text}</p>
            ))}
          </section>
          <section>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Read with care</h3>
              <HelpTip label="What these values mean">
                The archive gives context for a conversation with a farmer or local expert. It does
                not predict yields, diagnose soil health, or replace a farm visit.
              </HelpTip>
            </div>
            <ul className="plain-list">
              {data.warnings.map((w) => (
                <li key={w.code}>{w.message}</li>
              ))}
            </ul>
          </section>
          <details className="source-details">
            <summary>Sources and method</summary>
            {data.sources.map((source) => (
              <p key={source.source_id}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.name} ↗
                </a>
                <span>
                  {source.period}. {source.limitations}
                </span>
              </p>
            ))}
            <p className="text-xs text-muted">
              Data version {data.data_version} · Method {data.methods_version}
            </p>
          </details>
          <div className="flex flex-wrap gap-3">
            <Button onClick={exportPdf} disabled={exporting}>
              {exporting ? <LoaderCircle className="animate-spin" /> : <Download />}
              {exporting ? 'Making PDF…' : 'Download PDF'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void setState({ view: 'farm' }, { history: 'push' });
              }}
            >
              Add your farm details
            </Button>
          </div>
          {exportError && (
            <p role="alert" className="field-error">
              {exportError}
            </p>
          )}
        </>
      )}
    </div>
  );
}

'use client';
import type { Category, ExploreResponse } from '@/lib/api';
import { rotationEvidenceCategory } from '@/lib/rotation-decision';
import { HistoryChart } from './history-chart';
import { Button } from './ui/button';

export function RotationEvidence({
  context,
  priority,
  selected,
  onSelect,
  onOpenHistory,
}: {
  context: ExploreResponse;
  priority: string;
  selected: Category | null;
  onSelect: (category: Category) => void;
  onOpenHistory: (category: Category) => void;
}) {
  const category = rotationEvidenceCategory(context.panels, selected, priority);
  const panel = context.panels.find((item) => item.category === category);
  return (
    <section className="rotation-evidence" aria-label="Historical evidence for this assessment">
      <h3 className="form-section-title">Past conditions behind this assessment</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {context.location.name}: {context.request.start_date} to {context.request.end_date}. These
        are historical grid estimates near the sample point, not measurements from your farm or a
        forecast for your planned seasons.
      </p>
      {panel ? (
        <>
          <div className="segmented mt-4" role="group" aria-label="Historical graph topic">
            {context.panels.map((item) => (
              <button
                type="button"
                key={item.category}
                aria-pressed={category === item.category}
                onClick={() => onSelect(item.category)}
              >
                {item.category === 'soil_wetness'
                  ? 'Soil wetness'
                  : item.category === 'temperature'
                    ? 'Temperature'
                    : 'Rainfall'}
              </button>
            ))}
          </div>
          <HistoryChart
            key={panel.category}
            panel={panel}
            type="line"
            cursor={-1}
            interval={context.request.interval}
          />
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Changing crop or soil answers does not change these past records. The graph does not
            predict yield, income, water savings or soil improvement.
          </p>
          <Button
            className="mt-3"
            variant="secondary"
            size="small"
            onClick={() => onOpenHistory(panel.category)}
          >
            Open full history
          </Button>
        </>
      ) : (
        <p className="field-error mt-3">No historical graph is available for this assessment.</p>
      )}
      <details className="source-details mt-5">
        <summary>How your farm answers affect this result</summary>
        <p>Your answers come from you. Satellite records do not verify your farm details.</p>
        <ul className="plain-list">
          <li>The plan and crops you avoid feed the listed constraint checks.</li>
          <li>Planting and harvest dates allow a check for overlapping seasons.</li>
          <li>
            Crop history, water supply and pH need applicable reviewed rules for agricultural
            checks.
          </li>
          <li>
            Soil texture and organic carbon are recorded for adviser review. The current engine does
            not score them.
          </li>
          <li>
            Crop preferences can order eligible options. They do not measure which option performs
            best.
          </li>
          <li>
            Your main priority identifies the evidence still needed, rather than estimating a
            benefit.
          </li>
        </ul>
      </details>
    </section>
  );
}

import { Check, CircleHelp, TriangleAlert } from 'lucide-react';
import type { RotationResponse } from '@/lib/api';
import { criterionLabel, plainReason } from '@/lib/plain-language';
type Checks = RotationResponse['baseline']['checks'];
export function RotationChecks({ checks }: { checks: Checks }) {
  return (
    <div className="criteria-list">
      {checks.map((check) => (
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
            <p className="font-medium">{criterionLabel(check.criterion)}</p>
            <p className="check-reason">{plainReason(check.reason)}</p>
            {check.source_url && (
              <a
                className="text-xs underline"
                href={check.source_url}
                target="_blank"
                rel="noreferrer"
              >
                Source ↗
              </a>
            )}
          </div>
          <span className="check-label-text">
            {check.status === 'pass'
              ? 'Checked'
              : check.status === 'fail'
                ? 'Conflict'
                : check.gap_type === 'farmer_input'
                  ? 'Add your details'
                  : check.gap_type === 'missing_reference'
                    ? 'Reference missing'
                    : check.gap_type === 'missing_observation'
                      ? 'Data missing'
                      : 'Needs review'}
          </span>
        </div>
      ))}
    </div>
  );
}

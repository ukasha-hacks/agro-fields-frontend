import type { ExploreResponse } from '@/lib/api';
import { formatValue } from '@/lib/utils';
import { HelpTip } from './help-tip';

const groups = [
  {
    title: 'Rainfall',
    prefix: 'rainfall_',
    help: 'Rainfall totals add the selected daily depths. Daily averages and highest days use mm per day.',
  },
  {
    title: 'Air temperature',
    prefix: 'temperature_',
    help: 'The average uses daily mean air temperature. The low and high come from daily minimum and maximum temperature.',
  },
  {
    title: 'Surface wetness',
    prefix: 'surface_soil_wetness_',
    help: 'Modelled wetness near the soil surface, on a 0–1 scale. It is not a soil fertility measurement.',
  },
  {
    title: 'Root-zone wetness',
    prefix: 'root_zone_soil_wetness_',
    help: 'Modelled wetness in the root zone, on a 0–1 scale. It may differ from a measurement on your field.',
  },
];
export function simpleUnit(unit: string) {
  return unit === 'dimensionless_index' ? '/ 1' : unit === 'degC' ? '°C' : unit;
}
export function shortDate(date: string) {
  return new Date(date + 'T00:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
function label(metric: ExploreResponse['statistics'][number]) {
  if (metric.unit !== 'dimensionless_index') return metric.label;
  return metric.aggregation === 'mean'
    ? 'Average'
    : metric.aggregation === 'min'
      ? 'Lowest daily value'
      : 'Highest daily value';
}
export function PeriodSummary({ statistics }: { statistics: ExploreResponse['statistics'] }) {
  return (
    <section aria-labelledby="period-summary-title">
      <h3 className="font-medium" id="period-summary-title">
        Your selected period, at a glance
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Downloaded NASA-derived records. Each count shows available days out of the days you
        selected.
      </p>
      <div className="period-headlines">
        {groups.map((group) => {
          const stat = statistics.find(
            (item) =>
              item.metric_id.startsWith(group.prefix) && ['sum', 'mean'].includes(item.aggregation),
          );
          if (!stat) return null;
          return (
            <div key={group.prefix}>
              <p>
                {group.title}
                {group.prefix === 'rainfall_' ? ' total' : ' average'}
                <HelpTip label={group.title}>{group.help}</HelpTip>
              </p>
              <strong>
                {formatValue(stat.value, stat.unit === 'dimensionless_index' ? 3 : 1)}{' '}
                <small>{simpleUnit(stat.unit)}</small>
              </strong>
              <span>
                {stat.valid_days} of {stat.expected_days} days present
              </span>
            </div>
          );
        })}
      </div>
      <details className="period-details">
        <summary>See lows, highs and dates</summary>
        <div className="stat-groups">
          {groups.map((group) => {
            const values = statistics.filter((stat) => stat.metric_id.startsWith(group.prefix));
            if (!values.length) return null;
            return (
              <article key={group.prefix}>
                <h4 className="flex items-center gap-2 font-medium">
                  {group.title}
                  <HelpTip label={group.title}>{group.help}</HelpTip>
                </h4>
                <dl>
                  {values.map((stat) => (
                    <div className="stat-row" key={stat.metric_id}>
                      <dt>{label(stat)}</dt>
                      <dd>
                        <strong>
                          {formatValue(stat.value, stat.unit === 'dimensionless_index' ? 3 : 1)}{' '}
                          <small>{simpleUnit(stat.unit)}</small>
                        </strong>
                        {stat.date && <span>{shortDate(stat.date)}</span>}
                        <span>
                          {stat.valid_days} of {stat.expected_days} days present
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })}
        </div>
        {statistics.some((stat) => stat.note) && (
          <p className="mt-3 text-xs text-muted">
            If a lowest or highest value occurs on several days, we show the first date.
          </p>
        )}
      </details>
    </section>
  );
}

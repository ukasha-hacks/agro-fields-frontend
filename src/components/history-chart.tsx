'use client';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Panel } from '@/lib/api';
import { formatValue } from '@/lib/utils';
import { historyDateLabel, replayPeriodLabel } from '@/lib/history-dates';
import { HelpTip } from './help-tip';
const colors = ['var(--chart-green)', 'var(--chart-blue)', 'var(--chart-amber)'];
export function HistoryChart({
  panel,
  type,
  cursor,
  interval,
}: {
  panel: Panel;
  type: 'line' | 'bar';
  cursor: number;
  interval: 'daily' | 'monthly';
}) {
  const [showTable, setShowTable] = useState(false);
  const series = panel.series.filter((item) => item.visible_by_default);
  const points = series[0]?.points ?? [];
  const data = points.map((point, index) => ({
    date: point.period_start,
    end: point.period_end,
    partial: point.partial_calendar_month,
    valid: point.valid_days,
    expected: point.expected_days,
    ...Object.fromEntries(
      series.map((item) => [item.series_id, item.points[index]?.value ?? null]),
    ),
  }));
  const showYear = new Set(points.map((point) => point.period_start.slice(0, 4))).size > 1;
  const label = (date: string) => historyDateLabel(date, interval, showYear);
  const Common = type === 'bar' ? BarChart : LineChart;
  const help =
    panel.category === 'soil_wetness'
      ? 'A modelled wetness index from 0 to 1. It is not a soil fertility test. Surface and root-zone wetness are separate series.'
      : panel.category === 'rainfall'
        ? 'Monthly values add the selected days of rain. Daily values are daily rainfall. A missing observation stays empty; it is not zero.'
        : 'Monthly values show mean air temperature over the selected days. Values come from a gridded historical dataset, not a thermometer on the farm.';
  return (
    <section className="history-chart" id={`evidence-${panel.category}`}>
      <div className="flex items-center gap-2">
        <h3 className="font-medium">{panel.title}</h3>
        <HelpTip label={panel.title}>{help}</HelpTip>
        <span className="ml-auto text-xs text-muted">{panel.y_axis_label}</span>
      </div>
      <div
        className="chart-canvas"
        role="img"
        aria-label={`${panel.title} by date. A data table is available below.`}
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <Common
            data={data}
            margin={{ top: 16, right: 8, left: -22, bottom: 4 }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} stroke="var(--line)" strokeOpacity={0.6} />
            <XAxis
              dataKey="date"
              tickFormatter={label}
              axisLine={false}
              tickLine={false}
              minTickGap={35}
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
            />
            <YAxis
              domain={
                panel.category === 'soil_wetness'
                  ? [0, 1]
                  : type === 'bar'
                    ? [(minimum: number) => Math.min(0, minimum), 'auto']
                    : ['auto', 'auto']
              }
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
            />
            <Tooltip
              content={({ active, label }) => {
                const index = points.findIndex((point) => point.period_start === String(label));
                if (!active || index < 0) return null;
                const point = points[index];
                return (
                  <div className="chart-tooltip">
                    <p>
                      {replayPeriodLabel(point.period_start, point.period_end, interval)}
                      {point.partial_calendar_month ? ' · partial month' : ''}
                    </p>
                    {series.map((item, seriesIndex) => {
                      const value = item.points[index];
                      return (
                        <div key={item.series_id}>
                          <span style={{ color: colors[seriesIndex] }}>{item.label}</span>
                          <strong>
                            {formatValue(
                              value?.value ?? null,
                              panel.category === 'soil_wetness' ? 3 : 1,
                            )}{' '}
                            {item.unit === 'dimensionless_index'
                              ? '/ 1'
                              : item.unit === 'degC'
                                ? '°C'
                                : item.unit}
                          </strong>
                          <small>
                            {value?.valid_days ?? 0}/{value?.expected_days ?? 0} days present
                          </small>
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
            {cursor >= 0 && cursor < points.length && (
              <ReferenceLine
                x={points[cursor].period_start}
                stroke="var(--green)"
                strokeDasharray="3 4"
              />
            )}
            {series.length > 1 && (
              <Legend
                iconType="plainline"
                wrapperStyle={{ fontSize: 11 }}
                formatter={(id) => series.find((item) => item.series_id === id)?.label ?? id}
              />
            )}
            {series.map((item, index) =>
              type === 'bar' ? (
                <Bar
                  key={item.series_id}
                  dataKey={item.series_id}
                  name={item.series_id}
                  fill={colors[index]}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                  isAnimationActive={false}
                />
              ) : (
                <Line
                  key={item.series_id}
                  dataKey={item.series_id}
                  name={item.series_id}
                  stroke={colors[index]}
                  strokeWidth={2}
                  type="linear"
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ),
            )}
          </Common>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">Period (UTC)</span>
        <button
          className="text-xs underline underline-offset-4"
          onClick={() => setShowTable(!showTable)}
          aria-expanded={showTable}
        >
          {showTable ? 'Hide values' : 'View values'}
        </button>
      </div>
      {showTable && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                {series.map((item) => (
                  <th key={item.series_id}>
                    {item.label} ({item.unit === 'dimensionless_index' ? '0–1' : item.unit})
                  </th>
                ))}
                <th>Days present</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point, index) => (
                <tr key={point.period_start}>
                  <td>
                    {point.period_start} to {point.period_end}
                    {point.partial_calendar_month && ' (partial)'}
                  </td>
                  {series.map((item) => (
                    <td key={item.series_id}>
                      {formatValue(item.points[index]?.value ?? null, 3)}
                    </td>
                  ))}
                  <td>
                    {series.map((item) => (
                      <div key={item.series_id}>
                        {series.length > 1 ? `${item.label}: ` : ''}
                        {item.points[index]?.valid_days ?? 0}/
                        {item.points[index]?.expected_days ?? 0}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

'use client';
import { useState } from 'react';
import { useQueryStates } from 'nuqs';
import type { ExploreResponse } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { urlParsers } from '@/lib/url-state';
import { monthHistory, rainfallWindow } from '@/lib/seasonal-history';
import { formatValue } from '@/lib/utils';
import { StatusMessage } from './status-message';
import { Button } from './ui/button';

export function SeasonalHistory({ area }: { area: string }) {
  const [open, setOpen] = useState(false);
  const [, setState] = useQueryStates(urlParsers);
  const archive = useApi<ExploreResponse>(
    'explore',
    {
      location_id: area,
      start_date: '2016-01-01',
      end_date: '2025-12-31',
      categories: ['rainfall', 'temperature', 'soil_wetness'],
      interval: 'monthly',
    },
    open,
  );
  const rain =
    archive.data?.panels.find((panel) => panel.category === 'rainfall')?.series[0]?.points ?? [];
  return (
    <details
      className="source-details seasonal-history"
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>Seasonal history across 2016–2025</summary>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        This view always uses the full ten-year archive for the selected sample point. Calendar
        windows are for comparison. Confirm your actual growing seasons locally.
      </p>
      <StatusMessage
        loading={archive.loading}
        error={archive.error}
        retry={archive.refetch}
        kind="history"
      />
      {archive.data && (
        <>
          <div className="season-windows">
            {[
              { label: 'March–May', months: [3, 4, 5] },
              { label: 'September–November', months: [9, 10, 11] },
            ].map((window) => {
              const result = rainfallWindow(rain, window.months);
              return (
                <article key={window.label}>
                  <h4 className="font-medium">{window.label}</h4>
                  <p>
                    {result.years
                      ? `${result.below} of ${result.years} complete years had less rain than this window’s archive average.`
                      : 'No complete years are available for this window.'}
                  </p>
                  {result.mean !== null && (
                    <p className="text-xs text-muted">
                      Window average: {formatValue(result.mean)} mm. This is a comparison with the
                      sample’s own past, not a drought diagnosis.
                    </p>
                  )}
                  <details className="mt-3 text-xs">
                    <summary>Year-by-year totals</summary>
                    <ul className="plain-list">
                      {result.totals.map((item) => (
                        <li key={item.year}>
                          {item.year}: {formatValue(item.total)} mm
                        </li>
                      ))}
                    </ul>
                  </details>
                </article>
              );
            })}
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <caption>Typical calendar months at {archive.data.location.name}, 2016–2025</caption>
              <thead>
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col">Rainfall average (mm)</th>
                  <th scope="col">Air temperature average (°C)</th>
                  <th scope="col">Surface wetness average (0–1)</th>
                </tr>
              </thead>
              <tbody>
                {monthHistory(archive.data).map((month) => (
                  <tr key={month.month}>
                    <th scope="row">
                      {new Date(Date.UTC(2024, month.month - 1, 1)).toLocaleDateString('en-GB', {
                        month: 'short',
                        timeZone: 'UTC',
                      })}
                    </th>
                    {[month.rain, month.heat, month.wetness].map((value, index) => (
                      <td key={index}>
                        {formatValue(value.value, index === 2 ? 3 : 1)}
                        <small className="block text-muted">{value.years} complete years</small>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Bare-field dates and crop stress remain unknown. The archive has no field cover
            observations or reviewed crop-stage heat, frost or water thresholds.
          </p>
          <Button
            variant="secondary"
            size="small"
            className="mt-4"
            onClick={() =>
              void setState({
                from: '2016-01-01',
                to: '2025-12-31',
                interval: 'monthly',
                topics: ['rainfall', 'temperature', 'soil_wetness'],
                cursor: -1,
                focus: null,
              })
            }
          >
            Open the full archive in the graphs
          </Button>
        </>
      )}
    </details>
  );
}

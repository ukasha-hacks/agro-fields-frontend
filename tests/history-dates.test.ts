import { expect, it } from 'vitest';
import { historyDateLabel, replayPeriodLabel } from '../src/lib/history-dates';

it('distinguishes dates in short daily graphs', () => {
  expect(historyDateLabel('2024-01-02', 'daily', false)).toBe('2 Jan');
  expect(historyDateLabel('2024-01-03', 'daily', false)).toBe('3 Jan');
});
it('reads a daily replay as one date in words', () => {
  expect(replayPeriodLabel('2024-05-02', '2024-05-02', 'daily')).toBe('2 May 2024');
});
it('names a whole month but preserves the bounds of a partial or cross-year period', () => {
  expect(replayPeriodLabel('2024-02-01', '2024-02-29', 'monthly')).toBe('February 2024');
  expect(replayPeriodLabel('2024-02-02', '2024-02-29', 'monthly')).toBe(
    '2 February 2024 to 29 February 2024',
  );
  expect(replayPeriodLabel('2024-12-31', '2025-01-01', 'daily')).toBe(
    '31 December 2024 to 1 January 2025',
  );
});
it('distinguishes the same month across years without adding a day to monthly data', () => {
  expect(historyDateLabel('2023-01-01', 'monthly', true)).toBe('Jan 23');
  expect(historyDateLabel('2024-01-01', 'monthly', true)).toBe('Jan 24');
});

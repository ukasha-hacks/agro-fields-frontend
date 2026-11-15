import { expect, it } from 'vitest';
import { historyDateLabel } from '../src/lib/history-dates';

it('distinguishes dates in short daily graphs', () => {
  expect(historyDateLabel('2024-01-02', 'daily', false)).toBe('2 Jan');
  expect(historyDateLabel('2024-01-03', 'daily', false)).toBe('3 Jan');
});
it('distinguishes the same month across years without adding a day to monthly data', () => {
  expect(historyDateLabel('2023-01-01', 'monthly', true)).toBe('Jan 23');
  expect(historyDateLabel('2024-01-01', 'monthly', true)).toBe('Jan 24');
});

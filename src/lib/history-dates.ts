export function historyDateLabel(date: string, interval: 'daily' | 'monthly', showYear: boolean) {
  return new Date(date + 'T00:00:00Z').toLocaleDateString('en-GB', {
    month: 'short',
    day: interval === 'daily' ? 'numeric' : undefined,
    year: showYear ? '2-digit' : undefined,
    timeZone: 'UTC',
  });
}

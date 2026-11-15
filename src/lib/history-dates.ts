export function historyDateLabel(date: string, interval: 'daily' | 'monthly', showYear: boolean) {
  return new Date(date + 'T00:00:00Z').toLocaleDateString('en-GB', {
    month: 'short',
    day: interval === 'daily' ? 'numeric' : undefined,
    year: showYear ? '2-digit' : undefined,
    timeZone: 'UTC',
  });
}

export function replayPeriodLabel(start: string, end: string, interval: 'daily' | 'monthly') {
  const first = new Date(start + 'T00:00:00Z');
  const last = new Date(end + 'T00:00:00Z');
  const format = (date: Date) =>
    date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  if (start === end) return format(first);
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0));
  if (interval === 'monthly' && first.getUTCDate() === 1 && last.getTime() === lastDay.getTime()) {
    return first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  }
  return `${format(first)} to ${format(last)}`;
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...values: ClassValue[]) { return twMerge(clsx(values)); }
export function humanize(value: string) { return value.replaceAll('_', ' '); }
export function formatValue(value: number | null, digits = 1) {
  return value === null ? 'No data' : new Intl.NumberFormat('en-UG', { maximumFractionDigits: digits }).format(value);
}

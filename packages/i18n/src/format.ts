import { type Locale } from '@mailmind/contracts';

/** Format a date string using Intl.DateTimeFormat */
export function formatDate(date: Date | string, locale: Locale = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/** Format a datetime string using Intl.DateTimeFormat */
export function formatDateTime(date: Date | string, locale: Locale = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/** Format a number using Intl.NumberFormat */
export function formatNumber(num: number, locale: Locale = 'en'): string {
  return new Intl.NumberFormat(locale).format(num);
}

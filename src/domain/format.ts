import type { Kpi } from './kpi';

const LOCALE = 'en-US';

function number(value: number, maximumFractionDigits: number): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits }).format(value);
}

export function formatValue(value: number, kpi: Pick<Kpi, 'unit' | 'currency'>): string {
  switch (kpi.unit) {
    case 'percent':
      return new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 1 }).format(
        value / 100,
      );
    case 'currency':
      return new Intl.NumberFormat(LOCALE, {
        style: 'currency',
        currency: kpi.currency ?? 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case 'duration_ms':
      return value >= 1000 ? `${number(value / 1000, 2)} s` : `${number(value, 0)} ms`;
    case 'number':
      return number(value, 2);
  }
}

export function formatChange(ratio: number | null): string {
  if (ratio === null) return '—';
  return new Intl.NumberFormat(LOCALE, {
    style: 'percent',
    maximumFractionDigits: 1,
    signDisplay: 'exceptZero',
  }).format(ratio);
}

export function formatDateTime(iso: string): string {
  const formatted = new Intl.DateTimeFormat(LOCALE, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(iso));
  return `${formatted} UTC`;
}

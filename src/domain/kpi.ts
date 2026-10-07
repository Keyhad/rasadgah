export const KPI_UNITS = ['number', 'percent', 'currency', 'duration_ms'] as const;
export type KpiUnit = (typeof KPI_UNITS)[number];

export const KPI_DIRECTIONS = ['higher_is_better', 'lower_is_better'] as const;
export type KpiDirection = (typeof KPI_DIRECTIONS)[number];

export interface Kpi {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly unit: KpiUnit;
  readonly direction: KpiDirection;
  readonly previousValue?: number;
  readonly target?: number;
  /** ISO 4217 code, only meaningful when unit is `currency`. */
  readonly currency?: string;
}

export interface KpiReport {
  readonly generatedAt?: string;
  readonly kpis: readonly Kpi[];
}

export type Trend = 'up' | 'down' | 'flat';
export type Assessment = 'positive' | 'negative' | 'neutral';
export type TargetStatus = 'met' | 'missed' | 'none';

export function changeRatio(kpi: Kpi): number | null {
  if (kpi.previousValue === undefined || kpi.previousValue === 0) return null;
  return (kpi.value - kpi.previousValue) / Math.abs(kpi.previousValue);
}

export function trendOf(kpi: Kpi): Trend {
  if (kpi.previousValue === undefined || kpi.value === kpi.previousValue) return 'flat';
  return kpi.value > kpi.previousValue ? 'up' : 'down';
}

export function assess(kpi: Kpi): Assessment {
  const trend = trendOf(kpi);
  if (trend === 'flat') return 'neutral';
  return (trend === 'up') === (kpi.direction === 'higher_is_better') ? 'positive' : 'negative';
}

export function targetStatus(kpi: Kpi): TargetStatus {
  if (kpi.target === undefined) return 'none';
  const met =
    kpi.direction === 'higher_is_better' ? kpi.value >= kpi.target : kpi.value <= kpi.target;
  return met ? 'met' : 'missed';
}

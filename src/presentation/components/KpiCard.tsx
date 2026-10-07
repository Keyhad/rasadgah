import type { KpiCardViewModel } from '@/application/useCases';

const TREND_SYMBOL = { up: '▲', down: '▼', flat: '■' } as const;
const TARGET_LABEL = { met: 'On target', missed: 'Off target' } as const;

export function KpiCard({ kpi }: { kpi: KpiCardViewModel }) {
  const labelId = `kpi-${kpi.id}-label`;
  return (
    <article className="kpi-card" aria-labelledby={labelId} data-assessment={kpi.assessment}>
      <h3 id={labelId} className="kpi-card__label">
        {kpi.label}
      </h3>
      <p className="kpi-card__value">{kpi.value}</p>
      <p className="kpi-card__change">
        <span aria-hidden="true">{TREND_SYMBOL[kpi.trend]}</span> {kpi.change}
        <span className="visually-hidden"> change, trend {kpi.trend}</span>
      </p>
      {kpi.targetStatus !== 'none' && (
        <p className="kpi-card__target" data-status={kpi.targetStatus}>
          {TARGET_LABEL[kpi.targetStatus]} · target {kpi.target}
        </p>
      )}
    </article>
  );
}

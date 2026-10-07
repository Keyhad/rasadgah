import type { KpiCardViewModel } from '@/application/useCases';
import { KpiCard } from './KpiCard';

export function KpiGrid({
  kpis,
  emptyMessage,
}: {
  kpis: readonly KpiCardViewModel[];
  emptyMessage: string;
}) {
  if (kpis.length === 0) return <p className="panel empty">{emptyMessage}</p>;
  return (
    <section aria-label="Key performance indicators" className="kpi-grid">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </section>
  );
}

import type { DashboardViewModel } from '@/application/useCases';
import { Freshness } from './Freshness';
import { KpiGrid } from './KpiGrid';

/** Read-token view: only the KPIs and how fresh they are. */
export function SharedDashboardView({ dashboard }: { dashboard: DashboardViewModel }) {
  return (
    <>
      <Freshness updated={dashboard.updated} dataAsOf={dashboard.dataAsOf} />
      {dashboard.updated && (
        <KpiGrid kpis={dashboard.kpis} emptyMessage="The latest upload contains no KPIs." />
      )}
    </>
  );
}

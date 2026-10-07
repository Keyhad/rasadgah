import type { DashboardViewModel } from '@/application/useCases';
import { KpiCard } from './KpiCard';
import { UploadForm } from './UploadForm';

export function DashboardView({ token, dashboard }: { token: string; dashboard: DashboardViewModel }) {
  const { kpis, summary } = dashboard;
  return (
    <>
      <section className="panel" aria-labelledby="status-heading">
        <h2 id="status-heading">Dashboard</h2>
        <dl className="meta">
          <div>
            <dt>Last upload</dt>
            <dd>{dashboard.updatedAt ?? 'Never'}</dd>
          </div>
          <div>
            <dt>Token expires</dt>
            <dd>{dashboard.expiresAt}</dd>
          </div>
          {summary.withTarget > 0 && (
            <div>
              <dt>On target</dt>
              <dd>
                {summary.onTarget} / {summary.withTarget}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {kpis.length > 0 ? (
        <section aria-label="Key performance indicators" className="kpi-grid">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </section>
      ) : (
        <p className="panel empty">No KPIs uploaded yet. Upload a JSON file to see them here.</p>
      )}

      <section className="panel" aria-labelledby="upload-heading">
        <h2 id="upload-heading">Update KPIs</h2>
        <p>Every upload extends the token lifetime by one week.</p>
        <UploadForm token={token} />
      </section>
    </>
  );
}

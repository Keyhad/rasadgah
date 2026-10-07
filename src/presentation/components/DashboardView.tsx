import type { DashboardViewModel } from '@/application/useCases';
import { CopyField } from './CopyField';
import { JsonEditor, KPI_TEMPLATE } from './JsonEditor';
import { KpiGrid } from './KpiGrid';
import { UploadForm } from './UploadForm';

/** Write-token view: status, share link, KPIs and the upload form. */
export function DashboardView({ token, dashboard }: { token: string; dashboard: DashboardViewModel }) {
  const { summary, updated } = dashboard;
  return (
    <>
      <section className="panel" aria-labelledby="status-heading">
        <h2 id="status-heading">Editor</h2>
        <dl className="meta">
          <div>
            <dt>Last upload</dt>
            <dd>{updated ? `${updated.label} (${updated.age})` : 'Never'}</dd>
          </div>
          <div>
            <dt>Tokens expire</dt>
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
        {dashboard.readToken && (
          <CopyField
            label="Share link (read-only)"
            value={`/?token=${dashboard.readToken}`}
            isLink
            testId="share-link"
          />
        )}
      </section>

      <KpiGrid
        kpis={dashboard.kpis}
        emptyMessage="No KPIs uploaded yet. Upload a JSON file to see them here."
      />

      <section className="panel" aria-labelledby="upload-heading">
        <h2 id="upload-heading">Update KPIs</h2>
        <p>Every upload extends the lifetime of both tokens by one week.</p>
        <UploadForm token={token} />
      </section>

      <section className="panel" aria-labelledby="editor-heading">
        <h2 id="editor-heading">Edit JSON</h2>
        <p>
          {dashboard.reportJson
            ? 'Change the current KPIs and save to publish them.'
            : 'Nothing uploaded yet. Start from this template and save to publish.'}
        </p>
        <JsonEditor token={token} initialJson={dashboard.reportJson ?? KPI_TEMPLATE} />
      </section>
    </>
  );
}

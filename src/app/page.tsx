import { headers } from 'next/headers';
import { isAppError } from '@/application/errors';
import { DashboardView } from '@/presentation/components/DashboardView';
import { Notice } from '@/presentation/components/Notice';
import { TokenPanel } from '@/presentation/components/TokenPanel';
import { UploadForm } from '@/presentation/components/UploadForm';
import { clientIp } from '@/presentation/http/handlers';
import { formatDateTime } from '@/domain/format';
import { container } from '@/server/container';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;

  if (typeof token === 'string' && token.length > 0) {
    const dashboard = await container.getDashboard(token).catch((error: unknown) => {
      if (isAppError(error, 'TOKEN_INVALID')) return null;
      throw error;
    });
    return dashboard ? (
      <DashboardView token={token} dashboard={dashboard} />
    ) : (
      <Notice title="Token expired or unknown">
        <p>Tokens expire one week after the last KPI upload.</p>
      </Notice>
    );
  }

  if (!container.tokenRateLimiter.take(clientIp(await headers()))) {
    return (
      <Notice title="Too many requests">
        <p>Too many tokens were requested from your network. Please try again later.</p>
      </Notice>
    );
  }

  const issued = await container.issueToken();
  return (
    <>
      <TokenPanel token={issued.token} expiresAt={formatDateTime(issued.expiresAt)} />
      <section className="panel" aria-labelledby="upload-heading">
        <h2 id="upload-heading">Upload KPIs</h2>
        <p>
          Upload a JSON file in the expected format (
          <a href="/kpis.example.json" download>
            download an example
          </a>
          ).
        </p>
        <UploadForm token={issued.token} />
      </section>
    </>
  );
}

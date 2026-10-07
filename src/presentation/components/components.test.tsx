// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardViewModel, KpiCardViewModel } from '@/application/useCases';
import { CopyField } from './CopyField';
import { DashboardView } from './DashboardView';
import { KpiCard } from './KpiCard';
import { Notice } from './Notice';
import { SharedDashboardView } from './SharedDashboardView';
import { TokenPanel } from './TokenPanel';
import { UploadForm } from './UploadForm';

const router = { push: vi.fn(), refresh: vi.fn() };
vi.mock('next/navigation', () => ({ useRouter: () => router }));

const TOKEN = 'T'.repeat(32);
const READ = 'R'.repeat(32);

const card = (overrides: Partial<KpiCardViewModel> = {}): KpiCardViewModel => ({
  id: 'rev',
  label: 'Revenue',
  value: '$120',
  change: '+20%',
  trend: 'up',
  assessment: 'positive',
  targetStatus: 'met',
  target: '$110',
  ...overrides,
});

const EMPTY_SUMMARY = { total: 0, withTarget: 0, onTarget: 0 };

const dashboard = (overrides: Partial<DashboardViewModel> = {}): DashboardViewModel => ({
  access: 'write',
  readToken: READ,
  expiresAt: 'Oct 8, 2026, 12:00 AM UTC',
  updated: { iso: '2026-10-01T00:00:00.000Z', label: 'Oct 1, 2026, 12:00 AM UTC', age: '3 hours ago' },
  dataAsOf: null,
  kpis: [card(), card({ id: 'nps', label: 'NPS', targetStatus: 'none', target: null })],
  summary: { total: 2, withTarget: 1, onTarget: 1 },
  ...overrides,
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

describe('KpiCard', () => {
  it('renders value, change and target', () => {
    render(<KpiCard kpi={card()} />);
    const article = screen.getByRole('article', { name: 'Revenue' });
    expect(article).toHaveAttribute('data-assessment', 'positive');
    expect(within(article).getByText('$120')).toBeInTheDocument();
    expect(article).toHaveTextContent('+20%');
    expect(article).toHaveTextContent('On target · target $110');
  });

  it('omits the target line without a target', () => {
    render(<KpiCard kpi={card({ targetStatus: 'none', target: null })} />);
    expect(screen.queryByText(/target/)).not.toBeInTheDocument();
  });

  it('flags missed targets', () => {
    render(<KpiCard kpi={card({ targetStatus: 'missed' })} />);
    expect(screen.getByText(/Off target/)).toHaveAttribute('data-status', 'missed');
  });
});

describe('DashboardView (write token)', () => {
  it('renders status, share link, cards and the upload form', () => {
    render(<DashboardView token={TOKEN} dashboard={dashboard()} />);
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByText('Oct 1, 2026, 12:00 AM UTC (3 hours ago)')).toBeInTheDocument();
    expect(screen.getByText('Oct 8, 2026, 12:00 AM UTC')).toBeInTheDocument();
    expect(screen.getByText('1 / 1')).toBeInTheDocument();
    expect(screen.getByTestId('share-link')).toHaveTextContent(`/?token=${READ}`);
    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute('href', `/?token=${READ}`);
    expect(screen.getByLabelText('KPI file (JSON)')).toBeInTheDocument();
  });

  it('renders an empty state before the first upload', () => {
    render(
      <DashboardView
        token={TOKEN}
        dashboard={dashboard({ updated: null, readToken: null, kpis: [], summary: EMPTY_SUMMARY })}
      />,
    );
    expect(screen.getByText('Never')).toBeInTheDocument();
    expect(screen.getByText(/No KPIs uploaded yet/)).toBeInTheDocument();
    expect(screen.queryByText('On target')).not.toBeInTheDocument();
    expect(screen.queryByTestId('share-link')).not.toBeInTheDocument();
  });
});

describe('SharedDashboardView (read token)', () => {
  const shared = (overrides: Partial<DashboardViewModel> = {}) =>
    dashboard({ access: 'read', readToken: null, ...overrides });

  it('shows only the KPIs and their freshness', () => {
    render(<SharedDashboardView dashboard={shared({ dataAsOf: 'Sep 30, 2026, 6:00 PM UTC' })} />);
    expect(screen.getAllByRole('article')).toHaveLength(2);
    const freshness = screen.getByTestId('freshness');
    expect(freshness).toHaveTextContent(
      'Updated 3 hours ago (Oct 1, 2026, 12:00 AM UTC) · data as of Sep 30, 2026, 6:00 PM UTC',
    );
    expect(within(freshness).getByText('3 hours ago')).toHaveAttribute('datetime', '2026-10-01T00:00:00.000Z');
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/expire/i)).not.toBeInTheDocument();
    expect(screen.queryByText(TOKEN)).not.toBeInTheDocument();
  });

  it('says when nothing has been published', () => {
    render(<SharedDashboardView dashboard={shared({ updated: null, kpis: [], summary: EMPTY_SUMMARY })} />);
    expect(screen.getByText('No KPIs published yet.')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('says when the latest upload is empty', () => {
    render(<SharedDashboardView dashboard={shared({ kpis: [], summary: EMPTY_SUMMARY })} />);
    expect(screen.getByText('The latest upload contains no KPIs.')).toBeInTheDocument();
  });
});

describe('Notice', () => {
  it('offers a way to get a new token', () => {
    render(<Notice title="Expired">body</Notice>);
    expect(screen.getByRole('alert')).toHaveTextContent('Expired');
    expect(screen.getByRole('link', { name: 'Get a new token' })).toHaveAttribute('href', '/');
  });
});

describe('CopyField', () => {
  it('copies plain values', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    render(<CopyField label="Token" value={TOKEN} />);
    await user.click(screen.getByRole('button', { name: 'Copy Token' }));
    expect(writeText).toHaveBeenCalledWith(TOKEN);
    expect(screen.getByRole('button', { name: 'Copied Token' })).toHaveTextContent('Copied');
  });

  it('copies links as absolute URLs', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    render(<CopyField label="Link" value={`/?token=${READ}`} isLink />);
    await user.click(screen.getByRole('button', { name: 'Copy Link' }));
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/?token=${READ}`);
  });

  it('stays usable when the clipboard is unavailable', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
    render(<CopyField label="Token" value={TOKEN} />);
    await user.click(screen.getByRole('button', { name: 'Copy Token' }));
    expect(screen.getByRole('button', { name: 'Copy Token' })).toBeInTheDocument();
  });
});

describe('TokenPanel', () => {
  it('shows both tokens with links to the editor and the shared view', () => {
    render(<TokenPanel writeToken={TOKEN} readToken={READ} expiresAt="Oct 8, 2026" />);
    expect(screen.getByTestId('write-token')).toHaveTextContent(TOKEN);
    expect(screen.getByTestId('read-token')).toHaveTextContent(READ);
    expect(screen.getByRole('link', { name: 'Open editor' })).toHaveAttribute('href', `/?token=${TOKEN}`);
    expect(screen.getByRole('link', { name: 'Open shared view' })).toHaveAttribute('href', `/?token=${READ}`);
    expect(screen.getByText('Oct 8, 2026')).toBeInTheDocument();
  });
});

describe('UploadForm', () => {
  const fetchMock = vi.fn<typeof fetch>();
  const file = (content: string) => new File([content], 'kpis.json', { type: 'application/json' });

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    router.push.mockReset();
    router.refresh.mockReset();
  });

  async function upload(content?: string) {
    const user = userEvent.setup();
    render(<UploadForm token={TOKEN} />);
    if (content !== undefined) await user.upload(screen.getByLabelText('KPI file (JSON)'), file(content));
    await user.click(screen.getByRole('button', { name: 'Upload' }));
  }

  it('requires a file', async () => {
    await upload();
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a JSON file to upload.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uploads the file with the bearer token and opens the dashboard', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));
    await upload('{"kpis":[]}');

    expect(fetchMock).toHaveBeenCalledWith('/api/kpis', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: '{"kpis":[]}',
    });
    expect(await screen.findByRole('status')).toHaveTextContent('Upload successful.');
    expect(router.push).toHaveBeenCalledWith(`/?token=${TOKEN}`);
    expect(router.refresh).toHaveBeenCalled();
  });

  it('shows validation details from the server', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'Bad file', details: ['kpis: required'] }, 422));
    await upload('{}');
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Bad file');
    expect(within(alert).getByRole('listitem')).toHaveTextContent('kpis: required');
    expect(router.push).not.toHaveBeenCalled();
  });

  it('falls back to the HTTP status for non-JSON errors', async () => {
    fetchMock.mockResolvedValue(new Response('oops', { status: 502 }));
    await upload('{}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Upload failed (HTTP 502).');
  });

  it('reports network failures', async () => {
    fetchMock.mockRejectedValue(new TypeError('offline'));
    await upload('{}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Network error. Please try again.');
  });
});

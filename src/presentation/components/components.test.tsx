// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardViewModel, KpiCardViewModel } from '@/application/useCases';
import { DashboardView } from './DashboardView';
import { KpiCard } from './KpiCard';
import { Notice } from './Notice';
import { TokenPanel } from './TokenPanel';
import { UploadForm } from './UploadForm';

const router = { push: vi.fn(), refresh: vi.fn() };
vi.mock('next/navigation', () => ({ useRouter: () => router }));

const TOKEN = 'T'.repeat(32);

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

const dashboard = (overrides: Partial<DashboardViewModel> = {}): DashboardViewModel => ({
  expiresAt: 'Oct 8, 2026, 12:00 AM UTC',
  updatedAt: 'Oct 1, 2026, 12:00 AM UTC',
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

describe('DashboardView', () => {
  it('renders metadata and a card per KPI', () => {
    render(<DashboardView token={TOKEN} dashboard={dashboard()} />);
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByText('Oct 1, 2026, 12:00 AM UTC')).toBeInTheDocument();
    expect(screen.getByText('Oct 8, 2026, 12:00 AM UTC')).toBeInTheDocument();
    expect(screen.getByText('1 / 1')).toBeInTheDocument();
  });

  it('renders an empty state before the first upload', () => {
    render(
      <DashboardView
        token={TOKEN}
        dashboard={dashboard({ updatedAt: null, kpis: [], summary: { total: 0, withTarget: 0, onTarget: 0 } })}
      />,
    );
    expect(screen.getByText('Never')).toBeInTheDocument();
    expect(screen.getByText(/No KPIs uploaded yet/)).toBeInTheDocument();
    expect(screen.queryByText('On target')).not.toBeInTheDocument();
  });
});

describe('Notice', () => {
  it('offers a way to get a new token', () => {
    render(<Notice title="Expired">body</Notice>);
    expect(screen.getByRole('alert')).toHaveTextContent('Expired');
    expect(screen.getByRole('link', { name: 'Get a new token' })).toHaveAttribute('href', '/');
  });
});

describe('TokenPanel', () => {
  it('shows the token with a dashboard link and copies it', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    render(<TokenPanel token={TOKEN} expiresAt="Oct 8, 2026" />);

    expect(screen.getByTestId('token')).toHaveTextContent(TOKEN);
    expect(screen.getByRole('link', { name: 'Open my dashboard' })).toHaveAttribute('href', `/?token=${TOKEN}`);

    await user.click(screen.getByRole('button', { name: 'Copy' }));
    expect(writeText).toHaveBeenCalledWith(TOKEN);
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('stays usable when the clipboard is unavailable', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
    render(<TokenPanel token={TOKEN} expiresAt="Oct 8, 2026" />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
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

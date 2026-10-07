import { beforeEach, describe, expect, it } from 'vitest';
import { TOKEN_LIFETIME_MS } from '@/domain/session';
import { createMemorySessionStore } from '@/infrastructure/memorySessionStore';
import { AppError, isAppError } from './errors';
import {
  createGetDashboard,
  createGetReport,
  createIssueToken,
  createUploadReport,
  type Deps,
} from './useCases';

const TOKEN = 'T'.repeat(32);
const report = {
  kpis: [
    { id: 'rev', label: 'Revenue', value: 120, previousValue: 100, target: 110, unit: 'currency' },
    { id: 'lat', label: 'Latency', value: 300, unit: 'duration_ms', direction: 'lower_is_better', target: 250 },
    { id: 'nps', label: 'NPS', value: 40, unit: 'number' },
  ],
};

function setup() {
  let now = new Date('2026-10-01T00:00:00Z');
  const store = createMemorySessionStore();
  const deps: Deps = { store, tokens: { generate: () => TOKEN }, clock: { now: () => now } };
  return {
    store,
    advance: (ms: number) => {
      now = new Date(now.getTime() + ms);
    },
    issueToken: createIssueToken(deps),
    uploadReport: createUploadReport(deps),
    getReport: createGetReport(deps),
    getDashboard: createGetDashboard(deps),
  };
}

async function expectAppError(promise: Promise<unknown>, code: AppError['code']) {
  await expect(promise).rejects.toBeInstanceOf(AppError);
  await expect(promise).rejects.toMatchObject({ code });
}

describe('isAppError', () => {
  it('matches structurally and optionally by code', () => {
    const error = new AppError('TOKEN_INVALID', 'x');
    const foreign = Object.assign(new Error('x'), { name: 'AppError', code: 'TOKEN_INVALID' });
    expect(isAppError(error)).toBe(true);
    expect(isAppError(foreign, 'TOKEN_INVALID')).toBe(true);
    expect(isAppError(error, 'REPORT_INVALID')).toBe(false);
    expect(isAppError(new Error('x'))).toBe(false);
    expect(isAppError('AppError')).toBe(false);
  });
});

describe('use cases', () => {
  let app: ReturnType<typeof setup>;
  beforeEach(() => {
    app = setup();
  });

  it('issues a token that expires in one week', async () => {
    await expect(app.issueToken()).resolves.toEqual({
      token: TOKEN,
      expiresAt: '2026-10-08T00:00:00.000Z',
    });
    expect(app.store.size).toBe(1);
  });

  it('returns an empty report for a fresh token', async () => {
    await app.issueToken();
    await expect(app.getReport(TOKEN)).resolves.toEqual({
      report: null,
      updatedAt: null,
      expiresAt: '2026-10-08T00:00:00.000Z',
    });
  });

  it('stores an uploaded report and extends the lifetime', async () => {
    await app.issueToken();
    app.advance(TOKEN_LIFETIME_MS - 1);
    const stored = await app.uploadReport(TOKEN, report);
    expect(stored.report?.kpis).toHaveLength(3);
    expect(stored.updatedAt).toBe('2026-10-07T23:59:59.999Z');
    expect(stored.expiresAt).toBe('2026-10-14T23:59:59.999Z');

    app.advance(TOKEN_LIFETIME_MS - 1);
    await expect(app.getReport(TOKEN)).resolves.toMatchObject({ updatedAt: stored.updatedAt });
  });

  it('rejects invalid reports with readable details', async () => {
    await app.issueToken();
    const promise = app.uploadReport(TOKEN, { kpis: [{ id: 'x' }] });
    await expectAppError(promise, 'REPORT_INVALID');
    const error = (await promise.catch((e: unknown) => e)) as AppError;
    expect(error.details).toEqual(expect.arrayContaining([expect.stringMatching(/^kpis\.0\.label: /)]));

    const rootError = (await app.uploadReport(TOKEN, 'nope').catch((e: unknown) => e)) as AppError;
    expect(rootError.details[0]).toMatch(/^\(root\): /);
  });

  it.each([undefined, 'malformed', 'U'.repeat(32)])('rejects unknown token %s', async (token) => {
    await expectAppError(app.getReport(token), 'TOKEN_INVALID');
    await expectAppError(app.uploadReport(token, report), 'TOKEN_INVALID');
    await expectAppError(app.getDashboard(token), 'TOKEN_INVALID');
  });

  it('expires idle tokens and deletes their data', async () => {
    await app.issueToken();
    app.advance(TOKEN_LIFETIME_MS);
    await expectAppError(app.getDashboard(TOKEN), 'TOKEN_INVALID');
    expect(app.store.size).toBe(0);
  });

  it('builds a dashboard view model', async () => {
    await app.issueToken();
    await app.uploadReport(TOKEN, report);
    const dashboard = await app.getDashboard(TOKEN);
    expect(dashboard).toMatchObject({
      updatedAt: 'Oct 1, 2026, 12:00 AM UTC',
      expiresAt: 'Oct 8, 2026, 12:00 AM UTC',
      summary: { total: 3, withTarget: 2, onTarget: 1 },
    });
    expect(dashboard.kpis[0]).toEqual({
      id: 'rev',
      label: 'Revenue',
      value: '$120',
      change: '+20%',
      trend: 'up',
      assessment: 'positive',
      targetStatus: 'met',
      target: '$110',
    });
    expect(dashboard.kpis[2]).toMatchObject({ change: '—', target: null, targetStatus: 'none' });
  });

  it('builds an empty dashboard before the first upload', async () => {
    await app.issueToken();
    await expect(app.getDashboard(TOKEN)).resolves.toMatchObject({
      updatedAt: null,
      kpis: [],
      summary: { total: 0, withTarget: 0, onTarget: 0 },
    });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '@/application/errors';
import type { StoredReport } from '@/application/useCases';
import { bearerToken, clientIp, createKpiHandlers, createTokenHandlers, type HttpDeps } from './handlers';

const TOKEN = 'T'.repeat(32);
const READ = 'R'.repeat(32);
const stored: StoredReport = {
  access: 'write',
  report: { kpis: [] },
  updatedAt: null,
  expiresAt: '2026-10-08T00:00:00.000Z',
};
const issued = { writeToken: TOKEN, readToken: READ, expiresAt: stored.expiresAt };

function deps(overrides: Partial<HttpDeps> = {}): HttpDeps {
  return {
    issueTokens: vi.fn(async () => issued),
    uploadReport: vi.fn(async () => stored),
    getReport: vi.fn(async () => stored),
    tokenRateLimiter: { take: vi.fn(() => true) },
    maxUploadBytes: 64,
    ...overrides,
  };
}

const put = (body: string, headers: Record<string, string> = {}) =>
  new Request('http://test/api/kpis', {
    method: 'PUT',
    body,
    headers: { authorization: `Bearer ${TOKEN}`, ...headers },
  });

describe('header helpers', () => {
  it('extracts bearer tokens', () => {
    expect(bearerToken(new Headers({ authorization: `bearer ${TOKEN}` }))).toBe(TOKEN);
    expect(bearerToken(new Headers({ authorization: `Basic ${TOKEN}` }))).toBeNull();
    expect(bearerToken(new Headers())).toBeNull();
  });

  it('extracts the client IP from the proxy header', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' }))).toBe('1.2.3.4');
    expect(clientIp(new Headers())).toBe('unknown');
  });
});

describe('POST /api/tokens', () => {
  it('issues a write and a read token', async () => {
    const response = await createTokenHandlers(deps()).POST(new Request('http://test', { method: 'POST' }));
    expect(response.status).toBe(201);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual(issued);
  });

  it('rate limits per client', async () => {
    const d = deps({ tokenRateLimiter: { take: () => false } });
    const response = await createTokenHandlers(d).POST(new Request('http://test', { method: 'POST' }));
    expect(response.status).toBe(429);
    expect(d.issueTokens).not.toHaveBeenCalled();
  });

  it('hides unexpected errors', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const d = deps({ issueTokens: async () => Promise.reject(new Error('disk full')) });
    const response = await createTokenHandlers(d).POST(new Request('http://test', { method: 'POST' }));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Unexpected server error.' });
    spy.mockRestore();
  });
});

describe('/api/kpis', () => {
  let d: HttpDeps;
  beforeEach(() => {
    d = deps();
  });

  it('GET returns the stored report for the bearer token', async () => {
    const response = await createKpiHandlers(d).GET(
      new Request('http://test', { headers: { authorization: `Bearer ${TOKEN}` } }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(stored);
    expect(d.getReport).toHaveBeenCalledWith(TOKEN);
  });

  it('GET maps invalid tokens to 401', async () => {
    d = deps({ getReport: async () => Promise.reject(new AppError('TOKEN_INVALID', 'nope')) });
    const response = await createKpiHandlers(d).GET(new Request('http://test'));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'nope' });
  });

  it('PUT uploads parsed JSON', async () => {
    const response = await createKpiHandlers(d).PUT(put('{"kpis":[]}'));
    expect(response.status).toBe(200);
    expect(d.uploadReport).toHaveBeenCalledWith(TOKEN, { kpis: [] });
  });

  it('PUT rejects invalid JSON', async () => {
    const response = await createKpiHandlers(d).PUT(put('{'));
    expect(response.status).toBe(400);
    expect(d.uploadReport).not.toHaveBeenCalled();
  });

  it('PUT rejects oversized bodies by header and by actual size', async () => {
    const big = JSON.stringify({ kpis: 'x'.repeat(100) });
    expect((await createKpiHandlers(d).PUT(put('{}', { 'content-length': '1000' }))).status).toBe(413);
    expect((await createKpiHandlers(d).PUT(put(big))).status).toBe(413);
    expect(d.uploadReport).not.toHaveBeenCalled();
  });

  it('PUT maps validation errors to 422 with details', async () => {
    d = deps({
      uploadReport: async () => Promise.reject(new AppError('REPORT_INVALID', 'bad', ['kpis: required'])),
    });
    const response = await createKpiHandlers(d).PUT(put('{}'));
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ error: 'bad', details: ['kpis: required'] });
  });

  it('PUT maps read-only tokens to 403', async () => {
    d = deps({
      uploadReport: async () => Promise.reject(new AppError('TOKEN_READ_ONLY', 'read only')),
    });
    const response = await createKpiHandlers(d).PUT(put('{}'));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'read only' });
  });
});

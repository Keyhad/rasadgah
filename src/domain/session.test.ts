import { describe, expect, it } from 'vitest';
import {
  TOKEN_LIFETIME_MS,
  expiresAt,
  isExpired,
  isWellFormedToken,
  newSession,
  withReport,
} from './session';

const t0 = new Date('2026-10-01T00:00:00Z');
const later = (ms: number) => new Date(t0.getTime() + ms);

describe('isWellFormedToken', () => {
  it('accepts 32 base64url characters', () => {
    expect(isWellFormedToken('abcdefghijklmnopqrstuvwxyz012-_A')).toBe(true);
  });

  it.each([undefined, 42, '', 'short', '../../../../etc/passwd/aaaaaaaaaaa', 'a'.repeat(33)])(
    'rejects %s',
    (value) => {
      expect(isWellFormedToken(value)).toBe(false);
    },
  );
});

describe('session lifetime', () => {
  it('expires one week after creation when nothing was uploaded', () => {
    const session = newSession(t0);
    expect(session).toEqual({ createdAt: t0.toISOString(), lastUploadAt: null, report: null });
    expect(expiresAt(session)).toEqual(later(TOKEN_LIFETIME_MS));
    expect(isExpired(session, later(TOKEN_LIFETIME_MS - 1))).toBe(false);
    expect(isExpired(session, later(TOKEN_LIFETIME_MS))).toBe(true);
  });

  it('slides forward on upload', () => {
    const uploadTime = later(TOKEN_LIFETIME_MS - 1000);
    const session = withReport(newSession(t0), { kpis: [] }, uploadTime);
    expect(session.lastUploadAt).toBe(uploadTime.toISOString());
    expect(session.report).toEqual({ kpis: [] });
    expect(isExpired(session, later(TOKEN_LIFETIME_MS + 1000))).toBe(false);
    expect(expiresAt(session)).toEqual(new Date(uploadTime.getTime() + TOKEN_LIFETIME_MS));
  });
});

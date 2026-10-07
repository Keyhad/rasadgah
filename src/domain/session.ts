import type { KpiReport } from './kpi';

export const TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32}$/;

/** `write` tokens may upload; `read` tokens may only view. */
export type Access = 'read' | 'write';

/** State attached to an access token; the token itself is never part of the record. */
export interface Session {
  readonly createdAt: string;
  readonly lastUploadAt: string | null;
  readonly report: KpiReport | null;
}

export function isWellFormedToken(value: unknown): value is string {
  return typeof value === 'string' && TOKEN_PATTERN.test(value);
}

export function newSession(now: Date): Session {
  return { createdAt: now.toISOString(), lastUploadAt: null, report: null };
}

export function withReport(session: Session, report: KpiReport, now: Date): Session {
  return { ...session, lastUploadAt: now.toISOString(), report };
}

/** Lifetime slides forward on every upload. */
export function expiresAt(session: Session): Date {
  return new Date(Date.parse(session.lastUploadAt ?? session.createdAt) + TOKEN_LIFETIME_MS);
}

export function isExpired(session: Session, now: Date): boolean {
  return now.getTime() >= expiresAt(session).getTime();
}

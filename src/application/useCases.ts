import { assess, changeRatio, targetStatus, trendOf } from '@/domain/kpi';
import type { Assessment, Kpi, KpiReport, TargetStatus, Trend } from '@/domain/kpi';
import { formatAge, formatChange, formatDateTime, formatValue } from '@/domain/format';
import { expiresAt, isExpired, isWellFormedToken, newSession, withReport } from '@/domain/session';
import type { Access, Session } from '@/domain/session';
import { AppError } from './errors';
import { kpiReportSchema } from './kpiReportSchema';
import type { Clock, SessionStore, TokenGenerator } from './ports';

export interface Deps {
  readonly store: SessionStore;
  readonly tokens: TokenGenerator;
  readonly clock: Clock;
}

export interface IssuedTokens {
  readonly writeToken: string;
  readonly readToken: string;
  readonly expiresAt: string;
}

export interface KpiCardViewModel {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly change: string;
  readonly trend: Trend;
  readonly assessment: Assessment;
  readonly targetStatus: TargetStatus;
  readonly target: string | null;
}

export interface Freshness {
  readonly iso: string;
  /** Absolute UTC time, e.g. "Oct 7, 2026, 8:30 AM UTC". */
  readonly label: string;
  /** Relative age at render time, e.g. "3 hours ago". */
  readonly age: string;
}

export interface DashboardViewModel {
  readonly access: Access;
  /** Only exposed to write-token holders, who may share it. */
  readonly readToken: string | null;
  readonly expiresAt: string;
  readonly updated: Freshness | null;
  /** `generatedAt` from the KPI file, when provided. */
  readonly dataAsOf: string | null;
  /** Stored report as pretty-printed JSON; only for write-token holders. */
  readonly reportJson: string | null;
  readonly kpis: readonly KpiCardViewModel[];
  readonly summary: { readonly total: number; readonly withTarget: number; readonly onTarget: number };
}

export interface StoredReport {
  readonly access: Access;
  readonly report: KpiReport | null;
  readonly updatedAt: string | null;
  readonly expiresAt: string;
}

const INVALID_TOKEN_MESSAGE = 'Token is invalid or has expired. Request a new one.';

interface ResolvedSession {
  readonly access: Access;
  /** Storage key: always the read token. */
  readonly key: string;
  readonly session: Session;
}

async function resolveSession({ store, tokens, clock }: Deps, token: unknown): Promise<ResolvedSession> {
  if (!isWellFormedToken(token)) throw new AppError('TOKEN_INVALID', INVALID_TOKEN_MESSAGE);
  const candidates: readonly [Access, string][] = [
    ['write', tokens.readTokenFor(token)],
    ['read', token],
  ];
  for (const [access, key] of candidates) {
    const session = await store.find(key);
    if (!session) continue;
    if (isExpired(session, clock.now())) {
      await store.delete(key);
      break;
    }
    return { access, key, session };
  }
  throw new AppError('TOKEN_INVALID', INVALID_TOKEN_MESSAGE);
}

function toStoredReport(access: Access, session: Session): StoredReport {
  return {
    access,
    report: session.report,
    updatedAt: session.lastUploadAt,
    expiresAt: expiresAt(session).toISOString(),
  };
}

export function toKpiCard(kpi: Kpi): KpiCardViewModel {
  return {
    id: kpi.id,
    label: kpi.label,
    value: formatValue(kpi.value, kpi),
    change: formatChange(changeRatio(kpi)),
    trend: trendOf(kpi),
    assessment: assess(kpi),
    targetStatus: targetStatus(kpi),
    target: kpi.target === undefined ? null : formatValue(kpi.target, kpi),
  };
}

export function createIssueTokens(deps: Deps) {
  return async function issueTokens(): Promise<IssuedTokens> {
    const writeToken = deps.tokens.generate();
    const readToken = deps.tokens.readTokenFor(writeToken);
    const session = newSession(deps.clock.now());
    await deps.store.save(readToken, session);
    return { writeToken, readToken, expiresAt: expiresAt(session).toISOString() };
  };
}

export function createUploadReport(deps: Deps) {
  return async function uploadReport(token: unknown, payload: unknown): Promise<StoredReport> {
    const { access, key, session } = await resolveSession(deps, token);
    if (access !== 'write') {
      throw new AppError('TOKEN_READ_ONLY', 'This is a read token. Use the write token to upload.');
    }
    const parsed = kpiReportSchema.safeParse(payload);
    if (!parsed.success) {
      const details = parsed.error.issues.map(
        (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
      );
      throw new AppError('REPORT_INVALID', 'KPI file does not match the expected format.', details);
    }
    const updated = withReport(session, parsed.data, deps.clock.now());
    await deps.store.save(key, updated);
    return toStoredReport(access, updated);
  };
}

export function createGetReport(deps: Deps) {
  return async function getReport(token: unknown): Promise<StoredReport> {
    const { access, session } = await resolveSession(deps, token);
    return toStoredReport(access, session);
  };
}

export function createGetDashboard(deps: Deps) {
  return async function getDashboard(token: unknown): Promise<DashboardViewModel> {
    const { access, key, session } = await resolveSession(deps, token);
    const cards = (session.report?.kpis ?? []).map(toKpiCard);
    const generatedAt = session.report?.generatedAt;
    return {
      access,
      readToken: access === 'write' ? key : null,
      expiresAt: formatDateTime(expiresAt(session).toISOString()),
      updated: session.lastUploadAt
        ? {
            iso: session.lastUploadAt,
            label: formatDateTime(session.lastUploadAt),
            age: formatAge(session.lastUploadAt, deps.clock.now()),
          }
        : null,
      dataAsOf: generatedAt ? formatDateTime(generatedAt) : null,
      reportJson:
        access === 'write' && session.report ? JSON.stringify(session.report, null, 2) : null,
      kpis: cards,
      summary: {
        total: cards.length,
        withTarget: cards.filter((c) => c.targetStatus !== 'none').length,
        onTarget: cards.filter((c) => c.targetStatus === 'met').length,
      },
    };
  };
}

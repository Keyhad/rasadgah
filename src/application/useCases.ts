import { assess, changeRatio, targetStatus, trendOf } from '@/domain/kpi';
import type { Assessment, Kpi, KpiReport, TargetStatus, Trend } from '@/domain/kpi';
import { formatChange, formatDateTime, formatValue } from '@/domain/format';
import { expiresAt, isExpired, isWellFormedToken, newSession, withReport } from '@/domain/session';
import type { Session } from '@/domain/session';
import { AppError } from './errors';
import { kpiReportSchema } from './kpiReportSchema';
import type { Clock, SessionStore, TokenGenerator } from './ports';

export interface Deps {
  readonly store: SessionStore;
  readonly tokens: TokenGenerator;
  readonly clock: Clock;
}

export interface IssuedToken {
  readonly token: string;
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

export interface DashboardViewModel {
  readonly expiresAt: string;
  readonly updatedAt: string | null;
  readonly kpis: readonly KpiCardViewModel[];
  readonly summary: { readonly total: number; readonly withTarget: number; readonly onTarget: number };
}

export interface StoredReport {
  readonly report: KpiReport | null;
  readonly updatedAt: string | null;
  readonly expiresAt: string;
}

const INVALID_TOKEN_MESSAGE = 'Token is invalid or has expired. Request a new one.';

async function requireActiveSession({ store, clock }: Deps, token: unknown): Promise<Session> {
  if (!isWellFormedToken(token)) throw new AppError('TOKEN_INVALID', INVALID_TOKEN_MESSAGE);
  const session = await store.find(token);
  if (!session) throw new AppError('TOKEN_INVALID', INVALID_TOKEN_MESSAGE);
  if (isExpired(session, clock.now())) {
    await store.delete(token);
    throw new AppError('TOKEN_INVALID', INVALID_TOKEN_MESSAGE);
  }
  return session;
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

export function createIssueToken(deps: Deps) {
  return async function issueToken(): Promise<IssuedToken> {
    const token = deps.tokens.generate();
    const session = newSession(deps.clock.now());
    await deps.store.save(token, session);
    return { token, expiresAt: expiresAt(session).toISOString() };
  };
}

export function createUploadReport(deps: Deps) {
  return async function uploadReport(token: unknown, payload: unknown): Promise<StoredReport> {
    const session = await requireActiveSession(deps, token);
    const parsed = kpiReportSchema.safeParse(payload);
    if (!parsed.success) {
      const details = parsed.error.issues.map(
        (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
      );
      throw new AppError('REPORT_INVALID', 'KPI file does not match the expected format.', details);
    }
    const updated = withReport(session, parsed.data, deps.clock.now());
    await deps.store.save(token as string, updated);
    return {
      report: updated.report,
      updatedAt: updated.lastUploadAt,
      expiresAt: expiresAt(updated).toISOString(),
    };
  };
}

export function createGetReport(deps: Deps) {
  return async function getReport(token: unknown): Promise<StoredReport> {
    const session = await requireActiveSession(deps, token);
    return {
      report: session.report,
      updatedAt: session.lastUploadAt,
      expiresAt: expiresAt(session).toISOString(),
    };
  };
}

export function createGetDashboard(deps: Deps) {
  return async function getDashboard(token: unknown): Promise<DashboardViewModel> {
    const session = await requireActiveSession(deps, token);
    const kpis = session.report?.kpis ?? [];
    const cards = kpis.map(toKpiCard);
    return {
      expiresAt: formatDateTime(expiresAt(session).toISOString()),
      updatedAt: session.lastUploadAt && formatDateTime(session.lastUploadAt),
      kpis: cards,
      summary: {
        total: cards.length,
        withTarget: cards.filter((c) => c.targetStatus !== 'none').length,
        onTarget: cards.filter((c) => c.targetStatus === 'met').length,
      },
    };
  };
}

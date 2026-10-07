import path from 'node:path';
import {
  createGetDashboard,
  createGetReport,
  createIssueToken,
  createUploadReport,
  type Deps,
} from '@/application/useCases';
import { createFileSessionStore } from '@/infrastructure/fileSessionStore';
import { createFixedWindowRateLimiter } from '@/infrastructure/rateLimiter';
import { cryptoTokenGenerator, systemClock } from '@/infrastructure/system';

const HOUR_MS = 60 * 60 * 1000;

function intFromEnv(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function buildContainer() {
  const deps: Deps = {
    store: createFileSessionStore(process.env.DATA_DIR ?? path.join(process.cwd(), '.data')),
    tokens: cryptoTokenGenerator,
    clock: systemClock,
  };
  return {
    issueToken: createIssueToken(deps),
    uploadReport: createUploadReport(deps),
    getReport: createGetReport(deps),
    getDashboard: createGetDashboard(deps),
    purgeExpired: () => deps.store.purgeExpired(deps.clock.now()),
    tokenRateLimiter: createFixedWindowRateLimiter({
      limit: intFromEnv('TOKENS_PER_HOUR', 30),
      windowMs: HOUR_MS,
      clock: deps.clock,
    }),
    maxUploadBytes: intFromEnv('MAX_UPLOAD_BYTES', 256 * 1024),
  };
}

export type Container = ReturnType<typeof buildContainer>;

// Next.js may evaluate this module once per route bundle; keep a single process-wide instance.
const globalRef = globalThis as typeof globalThis & { __rasadgahContainer?: Container };
export const container: Container = (globalRef.__rasadgahContainer ??= buildContainer());

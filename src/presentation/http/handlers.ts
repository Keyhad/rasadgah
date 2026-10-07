import { isAppError } from '@/application/errors';
import type { IssuedToken, StoredReport } from '@/application/useCases';
import type { RateLimiter } from '@/infrastructure/rateLimiter';

export interface HttpDeps {
  issueToken(): Promise<IssuedToken>;
  uploadReport(token: unknown, payload: unknown): Promise<StoredReport>;
  getReport(token: unknown): Promise<StoredReport>;
  tokenRateLimiter: RateLimiter;
  maxUploadBytes: number;
}

const NO_STORE = { 'Cache-Control': 'no-store' };

function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return Response.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

function problem(status: number, error: string, details?: readonly string[]): Response {
  return json(details?.length ? { error, details } : { error }, status);
}

/** Relies on the reverse proxy overwriting X-Forwarded-For; the app is never exposed directly. */
export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export function bearerToken(headers: Headers): string | null {
  const match = /^Bearer\s+(\S+)$/i.exec(headers.get('authorization') ?? '');
  return match?.[1] ?? null;
}

function handleError(error: unknown): Response {
  if (isAppError(error)) {
    const status = error.code === 'TOKEN_INVALID' ? 401 : 422;
    return problem(status, error.message, error.details);
  }
  console.error(error);
  return problem(500, 'Unexpected server error.');
}

export function createTokenHandlers(deps: HttpDeps) {
  return {
    async POST(request: Request): Promise<Response> {
      if (!deps.tokenRateLimiter.take(clientIp(request.headers))) {
        return problem(429, 'Too many tokens requested. Try again later.');
      }
      try {
        return json(await deps.issueToken(), 201);
      } catch (error) {
        return handleError(error);
      }
    },
  };
}

export function createKpiHandlers(deps: HttpDeps) {
  return {
    async GET(request: Request): Promise<Response> {
      try {
        return json(await deps.getReport(bearerToken(request.headers)));
      } catch (error) {
        return handleError(error);
      }
    },

    async PUT(request: Request): Promise<Response> {
      const tooLarge = () => problem(413, `KPI file must be at most ${deps.maxUploadBytes} bytes.`);
      if (Number(request.headers.get('content-length') ?? 0) > deps.maxUploadBytes) return tooLarge();

      const body = await request.text();
      if (Buffer.byteLength(body) > deps.maxUploadBytes) return tooLarge();

      let payload: unknown;
      try {
        payload = JSON.parse(body);
      } catch {
        return problem(400, 'Request body must be valid JSON.');
      }

      try {
        return json(await deps.uploadReport(bearerToken(request.headers), payload));
      } catch (error) {
        return handleError(error);
      }
    },
  };
}

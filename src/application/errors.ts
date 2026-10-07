export type AppErrorCode = 'TOKEN_INVALID' | 'TOKEN_READ_ONLY' | 'REPORT_INVALID';

export class AppError extends Error {
  constructor(
    readonly code: AppErrorCode,
    message: string,
    readonly details: readonly string[] = [],
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** Structural check: `instanceof` breaks when Next.js bundles this module more than once. */
export function isAppError(error: unknown, code?: AppErrorCode): error is AppError {
  return (
    error instanceof Error &&
    error.name === 'AppError' &&
    (code === undefined || (error as AppError).code === code)
  );
}

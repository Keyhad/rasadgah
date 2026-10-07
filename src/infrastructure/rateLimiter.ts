import type { Clock } from '@/application/ports';

export interface RateLimiter {
  /** Returns false when `key` has exhausted its quota for the current window. */
  take(key: string): boolean;
}

export function createFixedWindowRateLimiter(options: {
  limit: number;
  windowMs: number;
  clock: Clock;
  maxKeys?: number;
}): RateLimiter {
  const { limit, windowMs, clock, maxKeys = 10_000 } = options;
  const windows = new Map<string, { count: number; resetAt: number }>();

  function prune(now: number) {
    for (const [key, window] of windows) if (window.resetAt <= now) windows.delete(key);
  }

  return {
    take(key) {
      const now = clock.now().getTime();
      if (windows.size >= maxKeys) prune(now);
      const current = windows.get(key);
      if (!current || current.resetAt <= now) {
        windows.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }
      if (current.count >= limit) return false;
      current.count += 1;
      return true;
    },
  };
}

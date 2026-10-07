import { describe, expect, it } from 'vitest';
import { TOKEN_LIFETIME_MS, newSession } from '@/domain/session';
import { createMemorySessionStore } from './memorySessionStore';
import { createFixedWindowRateLimiter } from './rateLimiter';
import { cryptoTokenGenerator, systemClock } from './system';

describe('cryptoTokenGenerator', () => {
  it('generates unique, well-formed tokens', () => {
    const tokens = new Set(Array.from({ length: 100 }, () => cryptoTokenGenerator.generate()));
    expect(tokens.size).toBe(100);
    for (const token of tokens) expect(token).toMatch(/^[A-Za-z0-9_-]{32}$/);
  });
});

describe('systemClock', () => {
  it('returns the current time', () => {
    expect(Math.abs(systemClock.now().getTime() - Date.now())).toBeLessThan(1000);
  });
});

describe('memorySessionStore', () => {
  it('supports the full store contract', async () => {
    const store = createMemorySessionStore();
    const t0 = new Date('2026-10-01T00:00:00Z');
    await store.save('a', newSession(t0));
    await store.save('b', newSession(new Date(t0.getTime() + 1000)));
    expect(await store.find('a')).not.toBeNull();
    expect(await store.purgeExpired(new Date(t0.getTime() + TOKEN_LIFETIME_MS))).toBe(1);
    expect(await store.find('a')).toBeNull();
    await store.delete('b');
    expect(store.size).toBe(0);
  });
});

describe('fixedWindowRateLimiter', () => {
  it('limits per key and resets after the window', () => {
    let now = 0;
    const limiter = createFixedWindowRateLimiter({
      limit: 2,
      windowMs: 1000,
      clock: { now: () => new Date(now) },
    });
    expect([limiter.take('a'), limiter.take('a'), limiter.take('a')]).toEqual([true, true, false]);
    expect(limiter.take('b')).toBe(true);
    now = 1000;
    expect(limiter.take('a')).toBe(true);
  });

  it('prunes stale keys when the table is full', () => {
    let now = 0;
    const limiter = createFixedWindowRateLimiter({
      limit: 1,
      windowMs: 10,
      clock: { now: () => new Date(now) },
      maxKeys: 2,
    });
    limiter.take('a');
    limiter.take('b');
    now = 5;
    expect(limiter.take('c')).toBe(true);
    now = 20;
    expect(limiter.take('d')).toBe(true);
    expect(limiter.take('a')).toBe(true);
  });
});

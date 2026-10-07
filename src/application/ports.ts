import type { Session } from '@/domain/session';

export interface SessionStore {
  find(token: string): Promise<Session | null>;
  save(token: string, session: Session): Promise<void>;
  delete(token: string): Promise<void>;
  /** Removes expired sessions and returns how many were removed. */
  purgeExpired(now: Date): Promise<number>;
}

export interface TokenGenerator {
  /** A new write token. */
  generate(): string;
  /** Derives the read token; must be one-way and never return its input. */
  readTokenFor(writeToken: string): string;
}

export interface Clock {
  now(): Date;
}

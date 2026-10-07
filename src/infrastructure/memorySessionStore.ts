import type { SessionStore } from '@/application/ports';
import { isExpired, type Session } from '@/domain/session';

export function createMemorySessionStore(): SessionStore & { readonly size: number } {
  const sessions = new Map<string, Session>();
  return {
    get size() {
      return sessions.size;
    },
    find: async (token) => sessions.get(token) ?? null,
    save: async (token, session) => {
      sessions.set(token, session);
    },
    delete: async (token) => {
      sessions.delete(token);
    },
    purgeExpired: async (now) => {
      let removed = 0;
      for (const [token, session] of sessions) {
        if (isExpired(session, now)) {
          sessions.delete(token);
          removed += 1;
        }
      }
      return removed;
    },
  };
}

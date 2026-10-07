import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { SessionStore } from '@/application/ports';
import { isExpired, type Session } from '@/domain/session';

function isNotFound(error: unknown): boolean {
  return (error as NodeJS.ErrnoException)?.code === 'ENOENT';
}

/**
 * Persists one JSON file per session. Files are named after the SHA-256 of the token,
 * so raw tokens never touch the disk and cannot be used for path traversal.
 */
export function createFileSessionStore(directory: string): SessionStore {
  let ready: Promise<unknown> | undefined;
  const ensureDirectory = () => (ready ??= mkdir(directory, { recursive: true, mode: 0o700 }));
  const fileFor = (token: string) =>
    path.join(directory, `${createHash('sha256').update(token).digest('hex')}.json`);

  async function read(file: string): Promise<Session | null> {
    try {
      return JSON.parse(await readFile(file, 'utf8')) as Session;
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  return {
    find: (token) => read(fileFor(token)),

    async save(token, session) {
      await ensureDirectory();
      const file = fileFor(token);
      const temp = `${file}.${randomUUID()}.tmp`;
      await writeFile(temp, JSON.stringify(session), { mode: 0o600 });
      await rename(temp, file);
    },

    async delete(token) {
      await rm(fileFor(token), { force: true });
    },

    async purgeExpired(now) {
      let entries: string[];
      try {
        entries = await readdir(directory);
      } catch (error) {
        if (isNotFound(error)) return 0;
        throw error;
      }
      let removed = 0;
      for (const entry of entries.filter((name) => name.endsWith('.json'))) {
        const file = path.join(directory, entry);
        const session = await read(file).catch(() => null);
        if (session && isExpired(session, now)) {
          await rm(file, { force: true });
          removed += 1;
        }
      }
      return removed;
    },
  };
}

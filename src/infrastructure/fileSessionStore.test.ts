import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TOKEN_LIFETIME_MS, newSession, withReport } from '@/domain/session';
import { createFileSessionStore } from './fileSessionStore';

const TOKEN = 'a'.repeat(32);
const t0 = new Date('2026-10-01T00:00:00Z');

describe('fileSessionStore', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'rasadgah-'));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('round-trips sessions and creates the directory lazily', async () => {
    const store = createFileSessionStore(path.join(dir, 'nested'));
    expect(await store.find(TOKEN)).toBeNull();

    const session = withReport(newSession(t0), { kpis: [] }, t0);
    await store.save(TOKEN, session);
    expect(await store.find(TOKEN)).toEqual(session);
  });

  it('never writes the raw token to disk', async () => {
    const store = createFileSessionStore(dir);
    await store.save(TOKEN, newSession(t0));
    const [file] = await readdir(dir);
    expect(file).toMatch(/^[0-9a-f]{64}\.json$/);
    expect(await readFile(path.join(dir, file!), 'utf8')).not.toContain(TOKEN);
  });

  it('deletes sessions idempotently', async () => {
    const store = createFileSessionStore(dir);
    await store.save(TOKEN, newSession(t0));
    await store.delete(TOKEN);
    await store.delete(TOKEN);
    expect(await store.find(TOKEN)).toBeNull();
  });

  it('purges only expired sessions and skips foreign or corrupt files', async () => {
    const store = createFileSessionStore(dir);
    await store.save('old'.padEnd(32, 'x'), newSession(t0));
    await store.save('new'.padEnd(32, 'x'), newSession(new Date(t0.getTime() + TOKEN_LIFETIME_MS)));
    await writeFile(path.join(dir, 'corrupt.json'), '{');
    await writeFile(path.join(dir, 'notes.txt'), 'keep');

    expect(await store.purgeExpired(new Date(t0.getTime() + TOKEN_LIFETIME_MS))).toBe(1);
    expect(await store.find('old'.padEnd(32, 'x'))).toBeNull();
    expect(await store.find('new'.padEnd(32, 'x'))).not.toBeNull();
    expect((await readdir(dir)).sort()).toHaveLength(3);
  });

  it('purges nothing when the directory does not exist yet', async () => {
    expect(await createFileSessionStore(path.join(dir, 'missing')).purgeExpired(t0)).toBe(0);
  });

  it('propagates unexpected filesystem errors', async () => {
    const file = path.join(dir, 'file');
    await writeFile(file, '');
    const store = createFileSessionStore(file);
    await expect(store.purgeExpired(t0)).rejects.toMatchObject({ code: 'ENOTDIR' });
    await expect(store.find(TOKEN)).rejects.toMatchObject({ code: 'ENOTDIR' });
  });
});

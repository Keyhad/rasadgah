const HOUR_MS = 60 * 60 * 1000;

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { container } = await import('./server/container');
  const purge = () =>
    container.purgeExpired().catch((error: unknown) => console.error('Session purge failed', error));
  void purge();
  setInterval(purge, HOUR_MS).unref();
}

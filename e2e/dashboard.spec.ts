import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const exampleFile = path.join(__dirname, '..', 'public', 'kpis.example.json');
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32}$/;

async function readTokens(page: Page) {
  const write = (await page.getByTestId('write-token').textContent())?.trim() ?? '';
  const read = (await page.getByTestId('read-token').textContent())?.trim() ?? '';
  return { write, read };
}

test('write token uploads and edits; read token shows a clean, read-only page', async ({ page }) => {
  await page.goto('/');
  const { write, read } = await readTokens(page);
  expect(write).toMatch(TOKEN_PATTERN);
  expect(read).toMatch(TOKEN_PATTERN);
  expect(read).not.toBe(write);

  await page.getByLabel('KPI file (JSON)').setInputFiles(exampleFile);
  await page.getByRole('button', { name: 'Upload', exact: true }).click();

  await expect(page).toHaveURL(`/?token=${write}`);
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(page.getByRole('article', { name: 'Monthly revenue' })).toContainText('$128,400');
  await expect(page.getByText('2 / 4')).toBeVisible();
  await expect(page.getByTestId('share-link')).toHaveText(`/?token=${read}`);

  await page.goto(`/?token=${read}`);
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(page.getByRole('article', { name: 'API latency (p95)' })).toContainText('245 ms');
  await expect(page.getByTestId('freshness')).toContainText('Updated just now');
  await expect(page.getByTestId('freshness')).toContainText('data as of Oct 7, 2026, 8:00 AM UTC');
  await expect(page.getByLabel('KPI file (JSON)')).toHaveCount(0);
  await expect(page.getByRole('button')).toHaveCount(0);
  await expect(page.getByText(write)).toHaveCount(0);
});

test('each fresh visit issues different tokens', async ({ page }) => {
  await page.goto('/');
  const first = await readTokens(page);
  await page.goto('/');
  const second = await readTokens(page);
  expect(second.write).not.toBe(first.write);
  expect(second.read).not.toBe(first.read);
});

test('unknown tokens prompt for a new one', async ({ page }) => {
  await page.goto(`/?token=${'x'.repeat(32)}`);
  await expect(page.getByRole('alert').filter({ hasText: 'Token expired or unknown' })).toBeVisible();
  await page.getByRole('link', { name: 'Get a new token' }).click();
  await expect(page.getByTestId('write-token')).toBeVisible();
});

test('invalid uploads show validation errors', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('KPI file (JSON)').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"kpis":[{"id":"x"}]}'),
  });
  await page.getByRole('button', { name: 'Upload', exact: true }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'KPI file does not match the expected format.' }),
  ).toBeVisible();
});

test('API: read token can read but not upload; write token can do both', async ({ request }) => {
  const issued = await request.post('/api/tokens');
  expect(issued.status()).toBe(201);
  const { writeToken, readToken } = (await issued.json()) as { writeToken: string; readToken: string };
  const writeAuth = { Authorization: `Bearer ${writeToken}` };
  const readAuth = { Authorization: `Bearer ${readToken}` };
  const data = { kpis: [{ id: 'a', label: 'A', value: 1, unit: 'number' }] };

  expect((await request.get('/api/kpis')).status()).toBe(401);
  expect((await request.get('/api/kpis', { headers: { Authorization: 'Bearer bogus' } })).status()).toBe(401);

  expect((await request.put('/api/kpis', { headers: readAuth, data })).status()).toBe(403);
  expect((await request.put('/api/kpis', { headers: writeAuth, data })).status()).toBe(200);

  const asReader = await (await request.get('/api/kpis', { headers: readAuth })).json();
  expect(asReader).toMatchObject({ access: 'read' });
  expect(asReader.report.kpis).toHaveLength(1);
  const asWriter = await (await request.get('/api/kpis', { headers: writeAuth })).json();
  expect(asWriter).toMatchObject({ access: 'write', expiresAt: asReader.expiresAt });
});

test('responses carry security headers', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.headers()['referrer-policy']).toBe('no-referrer');
  expect(response.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(response.headers()['x-powered-by']).toBeUndefined();
});

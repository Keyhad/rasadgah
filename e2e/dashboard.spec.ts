import path from 'node:path';
import { expect, test } from '@playwright/test';

const exampleFile = path.join(__dirname, '..', 'public', 'kpis.example.json');

test('first visit issues a token, upload renders the KPIs, revisit keeps them', async ({ page }) => {
  await page.goto('/');
  const token = (await page.getByTestId('token').textContent())?.trim() ?? '';
  expect(token).toMatch(/^[A-Za-z0-9_-]{32}$/);

  await page.getByLabel('KPI file (JSON)').setInputFiles(exampleFile);
  await page.getByRole('button', { name: 'Upload' }).click();

  await expect(page).toHaveURL(`/?token=${token}`);
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(page.getByRole('article', { name: 'Monthly revenue' })).toContainText('$128,400');

  await page.goto(`/?token=${token}`);
  await expect(page.getByRole('article', { name: 'API latency (p95)' })).toContainText('245 ms');
  await expect(page.getByText('2 / 4')).toBeVisible();
});

test('each fresh visit issues a different token', async ({ page }) => {
  await page.goto('/');
  const first = await page.getByTestId('token').textContent();
  await page.goto('/');
  expect(await page.getByTestId('token').textContent()).not.toBe(first);
});

test('unknown tokens prompt for a new one', async ({ page }) => {
  await page.goto(`/?token=${'x'.repeat(32)}`);
  await expect(page.getByRole('alert')).toContainText('Token expired or unknown');
  await page.getByRole('link', { name: 'Get a new token' }).click();
  await expect(page.getByTestId('token')).toBeVisible();
});

test('invalid uploads show validation errors', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('KPI file (JSON)').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"kpis":[{"id":"x"}]}'),
  });
  await page.getByRole('button', { name: 'Upload' }).click();
  await expect(page.getByRole('alert')).toContainText('KPI file does not match the expected format.');
});

test('API supports token issuance and bearer-authenticated uploads', async ({ request }) => {
  const issued = await request.post('/api/tokens');
  expect(issued.status()).toBe(201);
  const { token } = (await issued.json()) as { token: string };
  const auth = { Authorization: `Bearer ${token}` };

  expect((await request.get('/api/kpis')).status()).toBe(401);
  expect((await request.get('/api/kpis', { headers: { Authorization: 'Bearer bogus' } })).status()).toBe(401);
  expect((await request.get('/api/kpis', { headers: auth })).status()).toBe(200);

  const upload = await request.put('/api/kpis', {
    headers: auth,
    data: { kpis: [{ id: 'a', label: 'A', value: 1, unit: 'number' }] },
  });
  expect(upload.status()).toBe(200);

  const stored = await (await request.get('/api/kpis', { headers: auth })).json();
  expect(stored.report.kpis).toHaveLength(1);
});

test('responses carry security headers', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.headers()['referrer-policy']).toBe('no-referrer');
  expect(response.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(response.headers()['x-powered-by']).toBeUndefined();
});

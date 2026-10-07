import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const externalBaseUrl = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: externalBaseUrl ?? `http://localhost:${PORT}`,
    // Caddy serves a locally-trusted certificate when running against docker compose.
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: 'npm run build && npm start',
        url: `http://localhost:${PORT}/api/health`,
        env: {
          PORT: String(PORT),
          HOSTNAME: '127.0.0.1',
          DATA_DIR: '.data/e2e',
          TOKENS_PER_HOUR: '1000',
        },
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
      },
});

import { defineConfig, devices } from '@playwright/test';

// Tests run against the real build served by wrangler, so `_headers` are the real ones.
// SMOKE_URL points the smoke test at the live site instead.
const PORT = 8798;
const live = process.env.SMOKE_URL;

export default defineConfig({
  testDir: 'e2e',
  outputDir: '.cache/e2e',
  fullyParallel: true,
  workers: 2,
  reporter: 'dot',
  timeout: 45_000,
  use: { baseURL: live ?? `http://localhost:${PORT}/cuanto-vale-tu-voto/`, locale: 'es-ES' },
  projects: live
    ? [{ name: 'smoke', testMatch: /smoke\.spec\.ts/, use: devices['Pixel 7'] }]
    : [
        { name: 'mobile', testIgnore: /smoke\.spec\.ts/, use: devices['Pixel 7'] },
        { name: 'desktop', testIgnore: /smoke\.spec\.ts/, use: { viewport: { width: 1280, height: 900 } } }
      ],
  webServer: live
    ? undefined
    : { command: `npx wrangler dev --port ${PORT}`, url: `http://localhost:${PORT}/cuanto-vale-tu-voto/`, reuseExistingServer: true, timeout: 60_000 }
});

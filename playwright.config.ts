import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * E2E tests against a real Home Assistant dashboard (Lovelace).
 *
 * 1. Put PLAYWRIGHT_HA_ORIGIN (and optional PLAYWRIGHT_HA_PATH / PLAYWRIGHT_HA_BACKGROUND_PATH) in `.env`.
 * 2. Record auth: `yarn test:e2e:auth` — log in, then close the browser.
 * 3. Run tests: `yarn test:e2e` (uses PLAYWRIGHT_HA_STORAGE_STATE from `.env` if set).
 *
 * Workers: each worker is a full browser stack against the same HA host. Multiple workers
 * often time out — one HA instance is usually the bottleneck (CPU, WS, Lovelace). Default
 * `workers: 1`. Override with `PLAYWRIGHT_WORKERS`; if you raise it, increase
 * `PLAYWRIGHT_TEST_TIMEOUT` as well.
 */
const haOrigin = process.env.PLAYWRIGHT_HA_ORIGIN;

/** ms — whole test budget (default 5s; override if HA or network is slow). */
const testTimeoutMs = Number(process.env.PLAYWRIGHT_TEST_TIMEOUT ?? 20000);

const workers = Number(process.env.PLAYWRIGHT_WORKERS ?? 1);

export default defineConfig({
  testDir: './e2e',
  /** Each test is isolated, but HA still prefers serial runs — see workers note above. */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  timeout: testTimeoutMs,
  workers: Number.isFinite(workers) && workers > 0 ? workers : 1,
  expect: {
    timeout: testTimeoutMs,
  },
  use: {
    baseURL: haOrigin,
    screenshot: 'on',
    trace: 'on-first-retry',
    actionTimeout: testTimeoutMs,
    navigationTimeout: testTimeoutMs,
    storageState: process.env.PLAYWRIGHT_HA_STORAGE_STATE || undefined,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});

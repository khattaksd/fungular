import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end suite for the demo application.
 *
 * `BASE_URL` is what makes this suite worth having: unset it and Playwright boots
 * the full Cloudflare stack locally — the production bundle served by `wrangler
 * pages dev`, with `/api/*` answered by the Pages Functions mock — and tests it;
 * set it to a deployed preview URL and the *same* specs run against the real
 * deployed bundle, which is the only place production optimisation, hashed
 * assets and hosting rewrites are actually exercised.
 *
 * Written as `.mts` so Node forces ESM regardless of the workspace `type`.
 * Playwright routes `.mts` through its ESM loader, and Nx's native TS strip loads
 * it directly.
 */
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './e2e' }),

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Retried once in CI only. A retry that quietly passes locally hides a flake from
  // the person who just introduced it.
  retries: process.env['CI'] ? 1 : 0,
  forbidOnly: !!process.env['CI'],

  // Nothing to serve when the target is already deployed.
  webServer: process.env['BASE_URL']
    ? undefined
    : {
        // The production bundle plus the Pages Functions mock, served exactly as
        // Cloudflare will serve it.
        command:
          'sh -c "npx nx build demo-app --configuration=production && WRANGLER_SEND_METRICS=false npx wrangler pages dev dist/apps/demo-app/browser --port 4200"',
        url: 'http://localhost:4200',
        reuseExistingServer: !process.env['CI'],
        cwd: workspaceRoot,
        timeout: 180_000,
      },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // The header collapses into a burger menu below the `md` breakpoint, so mobile
    // exercises a different code path rather than the same one at a smaller size.
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
});

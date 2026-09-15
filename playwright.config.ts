import { defineConfig } from '@playwright/test';

// The project ships no Node type definitions; this is the only Node global the config reads.
declare const process: { env: Record<string, string | undefined> };

// Dedicated port and no server reuse: if the port is taken (for example by another checkout's dev server),
// Playwright stops with "is already used" instead of silently testing the wrong project.
const port = Number(process.env.E2E_PORT ?? 4337);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: 'tests/e2e',
  globalSetup: './tests/e2e/verify-origin.mjs',
  use: { baseURL },
  webServer: {
    command: `npx astro build && npx astro preview --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});

import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e-pilot',
  outputDir: '../work/playwright-pilot',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4178',
    channel: process.env.PLAYWRIGHT_CHANNEL,
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 4178',
    url: 'http://127.0.0.1:4178',
    reuseExistingServer: false,
    env: {
      VITE_APP_MODE: 'pilot',
      VITE_SUPABASE_URL: 'https://auth.nextage.test',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_browser_test',
    },
  },
})

import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4177',
    channel: process.env.PLAYWRIGHT_CHANNEL,
    headless: true,
    viewport: { width: 1440, height: 1000 },
    timezoneId: 'America/Los_Angeles',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 4177',
    url: 'http://127.0.0.1:4177',
    reuseExistingServer: false,
  },
})

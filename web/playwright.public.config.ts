import { defineConfig } from '@playwright/test'

const localURL = 'http://127.0.0.1:4189/nextage-class/'
const publicURL = process.env.PUBLIC_DEMO_URL

export default defineConfig({
  testDir: './e2e-public',
  outputDir: '../work/playwright-public',
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: publicURL ? `${publicURL.replace(/\/+$/, '')}/` : localURL,
    channel: process.env.PLAYWRIGHT_CHANNEL,
    viewport: { width: 1440, height: 1000 },
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
  },
  webServer: publicURL
    ? undefined
    : {
        command: 'npm run preview -- --mode public-demo --host 127.0.0.1 --port 4189',
        url: localURL,
        reuseExistingServer: false,
      },
})

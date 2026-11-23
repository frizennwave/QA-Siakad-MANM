// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { BASE_URL, VIEWPORT, WS_ENDPOINT } = require('./lib/env');

// Test latihan hanya dijalankan saat menargetkan aplikasi demo (npm run demo).
const IS_DEMO = /localhost:4173|127\.0\.0\.1:4173/.test(BASE_URL);

module.exports = defineConfig({
  testDir: './tests',
  testIgnore: IS_DEMO ? [] : ['**/latihan/**'],
  globalSetup: require.resolve('./lib/global-setup.js'),
  outputDir: './results/artifacts',
  fullyParallel: false, // berurutan: bukti screenshot lebih mudah ditelusuri
  workers: 1,
  retries: 0, // QA: jangan menyembunyikan kegagalan dengan retry otomatis
  timeout: 30_000,
  reporter: [
    ['list'],
    ['json', { outputFile: 'results/test-results.json' }],
    ['html', { outputFolder: 'results/html', open: 'never' }],
  ],
  use: {
    baseURL: BASE_URL,
    viewport: VIEWPORT,
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
    trace: 'retain-on-failure',
    screenshot: 'off', // screenshot bukti diambil oleh fixture `evidence`
    // Remote browser (Browserless, dsb.) jika BROWSER_WS_ENDPOINT diisi
    ...(WS_ENDPOINT ? { connectOptions: { wsEndpoint: WS_ENDPOINT } } : {}),
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: VIEWPORT } },
    // Aktifkan jika responsive testing termasuk scope:
    // { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
});

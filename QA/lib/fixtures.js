// Fixture Playwright untuk workspace QA.
//  - tc(meta)            : metadata traceability
//  - evidence.snap(desc) : screenshot bukti
//  - role fixture        : set via test.use({ role: 'ADMIN' }) for storageState reuse
// Semua bukti berasal dari browser aktual.
const fs = require('fs');
const path = require('path');
const base = require('@playwright/test');
const { ROOT } = require('./env');
const { ensureAuthState } = require('./filament');

const SHOT_DIR = path.join(ROOT, 'screenshots');
const RESULT_DIR = path.join(ROOT, 'results');

const slug = (s, fallback) =>
  (String(s || fallback || '').normalize('NFKD').replace(/[^\w]+/g, '_').replace(/^_|_$/g, '').toUpperCase() || fallback);

function appendJsonl(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify(obj) + '\n');
}

function finalStatus(testInfo) {
  if (testInfo.status === 'skipped') {
    const reason = testInfo.annotations.find((a) => a.type === 'skip')?.description || '';
    return /^BLOCKED/i.test(reason) ? 'BLOCKED' : 'NOT_TESTED';
  }
  return testInfo.status === testInfo.expectedStatus ? 'PASS' : 'FAIL';
}

const test = base.test.extend({
  role: [null, { option: true }],

  storageState: async ({ role }, use) => {
    if (!role) return use(undefined);
    const file = await ensureAuthState(role);
    return use(file);
  },

  tc: async ({}, use, testInfo) => {
    await use((meta = {}) => {
      for (const [type, value] of Object.entries(meta)) {
        if (value !== undefined && value !== null && value !== '') {
          testInfo.annotations.push({ type, description: String(value) });
        }
      }
    });
  },

  evidence: async ({ page }, use, testInfo) => {
    const ann = (t) => testInfo.annotations.find((a) => a.type === t)?.description;
    const tcId = (testInfo.title.match(/^(TC[-_]?[A-Z0-9-]*\d+)/i) || [])[1]?.toUpperCase() || 'TCXXX';
    const shots = [];
    const consoleErrors = [];
    const failedRequests = [];

    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); });
    page.on('pageerror', (e) => consoleErrors.push(`Uncaught: ${e.message}`.slice(0, 300)));
    page.on('requestfailed', (r) => failedRequests.push(`FAILED ${r.method()} ${r.url()} (${r.failure()?.errorText})`));
    page.on('response', (r) => { if (r.status() >= 400) failedRequests.push(`HTTP ${r.status()} ${r.request().method()} ${r.url()}`); });

    fs.mkdirSync(SHOT_DIR, { recursive: true });

    const snap = async (description, { fullPage = true, mask = [] } = {}) => {
      const step = String(shots.length + 1).padStart(2, '0');
      const tmp = path.join(SHOT_DIR, `.tmp_${tcId}_${step}_${Date.now()}.png`);
      await page.screenshot({
        path: tmp,
        fullPage,
        mask: [page.locator('input[type="password"]'), ...mask],
      });
      shots.push({ tmp, step, description, url: page.url(), timestamp: new Date().toISOString() });
    };

    await use({ snap, consoleErrors, failedRequests });

    const status = finalStatus(testInfo);
    if (status === 'FAIL' && !page.isClosed()) {
      try { await snap('Kondisi halaman saat test gagal'); } catch { /* halaman tidak tersedia */ }
    }

    const role = slug(ann('role'), 'PUBLIC');
    const feature = slug(ann('featureName') || ann('feature'), 'GENERAL');
    for (const s of shots) {
      const file = `${tcId}_${role}_${feature}_STEP${s.step}_${status}.png`;
      const dest = path.join(SHOT_DIR, file);
      fs.renameSync(s.tmp, dest);
      await testInfo.attach(file, { path: dest, contentType: 'image/png' });
      appendJsonl(path.join(RESULT_DIR, 'evidence.jsonl'), {
        test_case_id: tcId,
        title: testInfo.title,
        feature_id: ann('feature') || '',
        role,
        page: s.url,
        step: s.step,
        description: s.description,
        timestamp: s.timestamp,
        result: status,
        file: `screenshots/${file}`,
      });
    }

    appendJsonl(path.join(RESULT_DIR, 'logs.jsonl'), {
      test_case_id: tcId,
      status,
      console_errors: consoleErrors,
      failed_requests: failedRequests,
    });
  },
});

module.exports = { test, expect: base.expect };

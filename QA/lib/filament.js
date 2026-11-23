// Helper login untuk panel Filament (Livewire). Login once per role, reuse storageState.
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const { credentials, ROOT, BASE_URL } = require('./env');

const AUTH_DIR = path.join(ROOT, 'auth');

function statePath(role) {
  return path.join(AUTH_DIR, `${role.toLowerCase()}.json`);
}

async function ensureAuthState(role) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const file = statePath(role);
  if (fs.existsSync(file)) return file;

  const { user, pass } = credentials(role);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: BASE_URL, viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  await page.goto('/dashboard/login', { waitUntil: 'networkidle' });
  await page.locator('input[type="email"]').first().fill(user);
  await page.locator('input[type="password"]').first().fill(pass);
  await page.locator('button[type="submit"]').click();
  try {
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20000 });
  } catch (e) {
    const body = await page.locator('body').innerText().catch(() => '');
    await browser.close();
    throw new Error(`Gagal login role ${role}: ${body.slice(0,200)}`);
  }
  await page.waitForLoadState('networkidle').catch(() => {});
  await context.storageState({ path: file });
  await browser.close();
  return file;
}

async function loginAs(page, role) {
  const file = statePath(role);
  if (fs.existsSync(file)) {
    // If we already have state, page context may not have it; navigate and check.
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => {});
    if (!page.url().includes('/login')) {
      await page.waitForLoadState('networkidle').catch(() => {});
      return;
    }
  }

  // Fallback UI login (used by TC-AUTH tests or when state invalid)
  const { user, pass } = credentials(role);
  await page.goto('/dashboard/login', { waitUntil: 'networkidle' });
  await page.locator('input[type="email"]').first().fill(user);
  await page.locator('input[type="password"]').first().fill(pass);
  await page.locator('button[type="submit"]').click();
  try {
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20000 });
  } catch (e) {
    const body = await page.locator('body').innerText().catch(() => '');
    if (/too many|throttle|terlalu banyak/i.test(body)) {
      await page.waitForTimeout(61000);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20000 });
    } else {
      throw e;
    }
  }
  await page.waitForLoadState('networkidle').catch(() => {});
  // Save state for reuse
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  await page.context().storageState({ path: file }).catch(() => {});
}

module.exports = { loginAs, ensureAuthState, statePath, AUTH_DIR };

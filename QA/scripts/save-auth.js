#!/usr/bin/env node
// Simpan sesi login (cookie + localStorage) ke auth/<role>.json dengan LOGIN MANUAL.
// Password diketik sendiri oleh penguji di browser, sehingga tidak ada kredensial di skrip.
//   npm run auth:save -- admin
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { chromium } = require('@playwright/test');
const { BASE_URL, VIEWPORT, AUTH_DIR } = require('../lib/env');

const role = (process.argv[2] || '').toLowerCase();
if (!role) { console.error('Pemakaian: npm run auth:save -- <role>   (contoh: admin)'); process.exit(1); }

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  await page.goto(BASE_URL);
  console.log(`\n1) Login sebagai "${role}" di jendela browser yang terbuka.`);
  console.log('2) Setelah berhasil masuk, kembali ke terminal ini dan tekan ENTER.\n');
  await new Promise((r) => readline.createInterface({ input: process.stdin }).once('line', r));
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const file = path.join(AUTH_DIR, `${role}.json`);
  await context.storageState({ path: file });
  await browser.close();
  console.log(`Sesi tersimpan: auth/${role}.json (RAHASIA, sudah di-.gitignore)`);
  process.exit(0);
})();

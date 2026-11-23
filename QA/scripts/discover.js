#!/usr/bin/env node
// PHASE 1.1 Page Discovery (read-only crawler).
// Mengunjungi halaman satu origin lewat link <a href>, TIDAK mengisi/men-submit form,
// TIDAK mengeklik tombol, dan melewati URL yang cocok dengan DISCOVERY_SKIP.
//
// Pemakaian:
//   npm run discover                      # sebagai pengunjung publik
//   npm run discover -- --role admin      # pakai sesi auth/admin.json (dari npm run auth:save)
//   npm run discover -- --start /dashboard.html --max 50
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const { ROOT, BASE_URL, VIEWPORT, WS_ENDPOINT, AUTH_DIR, env } = require('../lib/env');

const args = process.argv.slice(2);
const arg = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const ROLE = (arg('role', 'public') || 'public').toLowerCase();
const START = arg('start', '/');
const MAX = parseInt(arg('max', env('DISCOVERY_MAX_PAGES', '30')), 10);
const SKIP = env('DISCOVERY_SKIP', 'logout,keluar,delete,hapus,destroy,remove').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
const SKIP_EXT = /\.(pdf|zip|rar|docx?|xlsx?|pptx?|jpe?g|png|gif|svg|mp4|mp3|webp|ico|css|js)$/i;

const OUT = path.join(ROOT, 'discovery');
const SHOT_DIR = path.join(OUT, 'screenshots');
const DATA_DIR = path.join(OUT, 'data');

const origin = new URL(BASE_URL).origin;
const normalize = (href) => {
  try {
    const u = new URL(href, BASE_URL + '/');
    if (u.origin !== origin) return null;
    u.hash = '';
    return u.toString();
  } catch { return null; }
};
const skipped = (url) => SKIP.some((p) => url.toLowerCase().includes(p)) || SKIP_EXT.test(new URL(url).pathname);

async function extract(page) {
  return page.evaluate(() => {
    const txt = (el) => (el?.innerText || el?.textContent || '').replace(/\s+/g, ' ').trim();
    const labelFor = (el) => {
      if (el.id) { const l = document.querySelector(`label[for="${CSS.escape(el.id)}"]`); if (l) return txt(l); }
      return txt(el.closest('label')) || el.getAttribute('aria-label') || el.placeholder || '';
    };
    const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    return {
      title: document.title,
      headings: [...document.querySelectorAll('h1,h2,h3')].filter(visible).map((h) => `${h.tagName}: ${txt(h)}`).slice(0, 20),
      navigation: [...document.querySelectorAll('nav a, header a, aside a, [role=navigation] a')].filter(visible)
        .map((a) => ({ text: txt(a), href: a.getAttribute('href') })).slice(0, 40),
      links: [...document.querySelectorAll('a[href]')].map((a) => ({ text: txt(a), href: a.href })),
      forms: [...document.querySelectorAll('form')].map((f, i) => ({
        form_index: i + 1,
        id: f.id || null,
        method: (f.getAttribute('method') || 'GET').toUpperCase(),
        action: f.getAttribute('action'),
        fields: [...f.querySelectorAll('input,select,textarea')].filter((e) => e.type !== 'hidden').map((e) => ({
          tag: e.tagName.toLowerCase(), type: e.type || null, name: e.name || null, id: e.id || null,
          label: labelFor(e), required: e.required, maxlength: e.maxLength > 0 ? e.maxLength : null,
          pattern: e.getAttribute('pattern'), placeholder: e.placeholder || null,
          options: e.tagName === 'SELECT' ? [...e.options].map((o) => txt(o)) : undefined,
        })),
        buttons: [...f.querySelectorAll('button, input[type=submit]')].map((b) => txt(b) || b.value),
      })),
      buttons: [...document.querySelectorAll('button, a.btn, [role=button]')].filter(visible).map(txt).filter(Boolean).slice(0, 40),
      tables: [...document.querySelectorAll('table')].map((t) => ({
        headers: [...t.querySelectorAll('th')].map(txt),
        row_count: t.querySelectorAll('tbody tr').length,
      })),
      alerts: [...document.querySelectorAll('.alert, [role=alert]')].filter(visible).map(txt),
    };
  });
}

(async () => {
  const statePath = path.join(AUTH_DIR, `${ROLE}.json`);
  if (ROLE !== 'public' && !fs.existsSync(statePath)) {
    console.error(`Sesi untuk role "${ROLE}" belum ada. Jalankan dulu: npm run auth:save -- ${ROLE}`);
    process.exit(1);
  }
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const browser = WS_ENDPOINT ? await chromium.connect(WS_ENDPOINT) : await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    locale: 'id-ID',
    ...(ROLE !== 'public' ? { storageState: statePath } : {}),
  });
  const page = await context.newPage();

  const queue = [normalize(START)];
  const seen = new Set(queue);
  const pages = [];
  const tag = ROLE.toUpperCase();

  while (queue.length && pages.length < MAX) {
    const url = queue.shift();
    const consoleErrors = [];
    const failed = [];
    const onConsole = (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); };
    const onPageErr = (e) => consoleErrors.push(`Uncaught: ${e.message}`.slice(0, 300));
    const onResp = (r) => { if (r.status() >= 400) failed.push(`HTTP ${r.status()} ${r.url()}`); };
    page.on('console', onConsole); page.on('pageerror', onPageErr); page.on('response', onResp);

    const id = `P${String(pages.length + 1).padStart(3, '0')}`;
    const rec = { page_id: id, role: tag, requested_url: url, discovery_status: 'Discovered' };
    try {
      const resp = await page.goto(url, { waitUntil: 'load', timeout: 20000 });
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      rec.http_status = resp?.status() ?? null;
      rec.final_url = page.url();
      rec.redirected = normalize(rec.final_url) !== url;
      Object.assign(rec, await extract(page));
      const name = new URL(rec.final_url).pathname.replace(/^\/|\/$/g, '').replace(/[^\w]+/g, '-') || 'home';
      rec.screenshot = `discovery/screenshots/${id}_${tag}_${name}.png`;
      await page.screenshot({ path: path.join(ROOT, rec.screenshot), fullPage: true, mask: [page.locator('input[type="password"]')] });

      for (const l of rec.links) {
        const n = normalize(l.href);
        if (!n || seen.has(n)) continue;
        seen.add(n);
        if (skipped(n)) { rec.skipped_links = [...(rec.skipped_links || []), n]; continue; }
        queue.push(n);
      }
      rec.links = rec.links.map((l) => ({ text: l.text, href: l.href }));
      if (rec.http_status >= 400) rec.discovery_status = 'Inaccessible';
    } catch (e) {
      rec.discovery_status = 'Inaccessible';
      rec.error = e.message.split('\n')[0];
    }
    rec.console_errors = consoleErrors;
    rec.failed_requests = failed;
    page.off('console', onConsole); page.off('pageerror', onPageErr); page.off('response', onResp);
    pages.push(rec);
    console.log(`${id} [${rec.discovery_status}] ${url}${rec.redirected ? `  →  ${rec.final_url}` : ''}`);
  }

  await browser.close();

  const out = {
    generated_at: new Date().toISOString(),
    base_url: BASE_URL,
    role: tag,
    method: 'Playwright read-only crawler (link traversal, tanpa submit form)',
    max_pages: MAX,
    skip_patterns: SKIP,
    unvisited_in_queue: queue,
    pages,
  };
  const file = path.join(DATA_DIR, `discovery-${ROLE}.json`);
  fs.writeFileSync(file, JSON.stringify(out, null, 2));

  // Ringkasan Markdown untuk dibaca manusia / Claude
  const md = [
    `# Ringkasan Discovery (${tag})`, '',
    `- Base URL: ${BASE_URL}`, `- Waktu: ${out.generated_at}`, `- Jumlah halaman: ${pages.length}`,
    queue.length ? `- **Belum dikunjungi (batas ${MAX} tercapai): ${queue.length} URL**` : '- Semua link yang ditemukan sudah dikunjungi', '',
    '| Page ID | Judul | URL akhir | Status | Form | Tabel | Console error |', '|---|---|---|---|---|---|---|',
    ...pages.map((p) => `| ${p.page_id} | ${p.title || '-'} | ${(p.final_url || p.requested_url).replace(origin, '')} | ${p.discovery_status}${p.redirected ? ' (redirect)' : ''} | ${p.forms?.length || 0} | ${p.tables?.length || 0} | ${p.console_errors.length} |`),
    '', '> Status "Discovered" = halaman terbuka & teramati (Observed), BUKAN berarti fiturnya sudah Verified.',
  ].join('\n');
  fs.writeFileSync(path.join(DATA_DIR, `discovery-${ROLE}.md`), md + '\n');
  console.log(`\nSelesai: ${pages.length} halaman → ${path.relative(ROOT, file)}`);
})().catch((e) => { console.error(e); process.exit(1); });

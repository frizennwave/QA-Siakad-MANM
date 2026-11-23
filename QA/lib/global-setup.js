// Sebelum setiap eksekusi test: arsipkan bukti run sebelumnya agar
// perbandingan sebelum/sesudah (retest & regression) tetap tersedia.
const fs = require('fs');
const path = require('path');
const { ROOT, BASE_URL, TEST_ENV, WS_ENDPOINT } = require('./env');

module.exports = async () => {
  const shots = path.join(ROOT, 'screenshots');
  const results = path.join(ROOT, 'results');
  const items = [
    shots,
    path.join(results, 'evidence.jsonl'),
    path.join(results, 'logs.jsonl'),
    path.join(results, 'test-results.json'),
  ].filter((p) => fs.existsSync(p) && !(fs.statSync(p).isDirectory() && fs.readdirSync(p).length === 0));

  if (items.length) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const dest = path.join(ROOT, 'archive', stamp);
    fs.mkdirSync(dest, { recursive: true });
    for (const p of items) fs.renameSync(p, path.join(dest, path.basename(p)));
    console.log(`[QA] Bukti run sebelumnya diarsipkan ke archive/${stamp}`);
  }

  fs.mkdirSync(results, { recursive: true });
  fs.writeFileSync(
    path.join(results, 'run-info.json'),
    JSON.stringify({
      started_at: new Date().toISOString(),
      base_url: BASE_URL,
      environment: TEST_ENV,
      browser: WS_ENDPOINT ? 'Chromium (remote browser)' : 'Chromium (lokal)',
      node: process.version,
    }, null, 2),
  );
  console.log(`[QA] Target: ${BASE_URL} | env: ${TEST_ENV} | browser: ${WS_ENDPOINT ? 'remote' : 'lokal'}`);
};

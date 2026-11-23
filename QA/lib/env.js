// Memuat .env tanpa dependensi tambahan (Node >= 20.6).
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envFile);
}

const env = (key, fallback = '') => (process.env[key] ?? fallback).toString().trim();

/** Ambil kredensial role dari env. Tidak pernah dicetak ke log. */
function credentials(role) {
  const r = role.toUpperCase();
  const user = env(`${r}_USER`);
  const pass = env(`${r}_PASS`);
  if (!user || !pass) {
    throw new Error(`Kredensial untuk role ${r} belum diisi di .env (${r}_USER / ${r}_PASS).`);
  }
  return { user, pass };
}

module.exports = {
  ROOT,
  env,
  credentials,
  BASE_URL: env('BASE_URL', 'http://localhost:4173').replace(/\/$/, ''),
  APP_NAME: env('APP_NAME', 'Aplikasi Web'),
  TEST_ENV: env('TEST_ENV', 'local'),
  IS_PRODUCTION: env('TEST_ENV').toLowerCase() === 'production',
  VIEWPORT: {
    width: parseInt(env('VIEWPORT_WIDTH', '1366'), 10),
    height: parseInt(env('VIEWPORT_HEIGHT', '768'), 10),
  },
  WS_ENDPOINT: env('BROWSER_WS_ENDPOINT'),
  AUTH_DIR: path.join(ROOT, 'auth'),
};

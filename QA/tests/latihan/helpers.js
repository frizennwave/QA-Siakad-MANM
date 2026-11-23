// Helper khusus aplikasi demo SIAKAD Mini.
// Pada proyek nyata, buat helper serupa sesuai halaman login aplikasi Anda.
const { credentials } = require('../../lib/env');

async function login(page, role) {
  const { user, pass } = credentials(role); // dari .env, tidak pernah di-hardcode
  await page.goto('/login.html');
  await page.getByLabel('Username').fill(user);
  await page.getByLabel('Password').fill(pass);
  await page.getByRole('button', { name: 'Masuk' }).click();
  await page.waitForURL('**/dashboard.html');
}

module.exports = { login };

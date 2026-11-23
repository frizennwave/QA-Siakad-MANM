// Contoh test hasil TAHAP 2 untuk aplikasi demo (modul M01 Autentikasi & Navigasi).
// Acuan expected behavior: latihan/SPESIFIKASI_DEMO.md
const { test, expect } = require('../../lib/fixtures');
const { login } = require('./helpers');

test.describe('M01 Autentikasi & Navigasi', () => {
  test('TC001 Pengunjung membuka Beranda dan Tentang', async ({ page, tc, evidence }) => {
    tc({ module: 'M01', feature: 'F01', featureName: 'BERANDA', requirement: 'REQ-01', role: 'PUBLIC',
      type: 'Positive', priority: 'Medium', objective: 'Halaman publik dapat dibuka tanpa login',
      expected: 'Beranda dan Tentang tampil tanpa diminta login' });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Selamat datang di SIAKAD Mini');
    await evidence.snap('Beranda tampil untuk pengunjung');
    await page.getByRole('link', { name: 'Tentang', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tentang Aplikasi');
    await evidence.snap('Halaman Tentang tampil');
  });

  test('TC002 Login admin dengan kredensial valid', async ({ page, tc, evidence }) => {
    tc({ module: 'M01', feature: 'F02', featureName: 'LOGIN', requirement: 'REQ-02', role: 'ADMIN',
      type: 'Positive', priority: 'Critical', objective: 'Admin dapat masuk ke sistem',
      expected: 'Diarahkan ke Dashboard dengan sapaan sesuai role admin' });
    await page.goto('/login.html');
    await evidence.snap('Form login sebelum diisi');
    await login(page, 'ADMIN');
    await expect(page.locator('#sapaan')).toContainText('role: admin');
    await evidence.snap('Dashboard admin setelah login');
  });

  test('TC003 Login dengan password salah ditolak', async ({ page, tc, evidence }) => {
    tc({ module: 'M01', feature: 'F02', featureName: 'LOGIN', requirement: 'REQ-02', role: 'PUBLIC',
      type: 'Negative', priority: 'High', objective: 'Kredensial salah tidak dapat masuk',
      expected: 'Pesan "Username atau password salah." dan tetap di halaman Login' });
    await page.goto('/login.html');
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('password-yang-salah');
    await page.getByRole('button', { name: 'Masuk' }).click();
    await expect(page.locator('#pesan')).toHaveText('Username atau password salah.');
    await expect(page).toHaveURL(/login\.html/);
    await evidence.snap('Pesan error kredensial salah');
  });

  test('TC004 Login dengan field kosong ditolak', async ({ page, tc, evidence }) => {
    tc({ module: 'M01', feature: 'F02', featureName: 'LOGIN', requirement: 'REQ-03', role: 'PUBLIC',
      type: 'Negative', priority: 'Medium', objective: 'Validasi field wajib pada login',
      expected: 'Pesan "Username dan password wajib diisi."' });
    await page.goto('/login.html');
    await page.getByRole('button', { name: 'Masuk' }).click();
    await expect(page.locator('#pesan')).toHaveText('Username dan password wajib diisi.');
    await evidence.snap('Pesan validasi field kosong');
  });

  test('TC005 Akses Dashboard tanpa login dialihkan ke Login', async ({ page, tc, evidence }) => {
    tc({ module: 'M01', feature: 'F03', featureName: 'AKSES', requirement: 'REQ-04', role: 'PUBLIC',
      type: 'Access Control', priority: 'Critical', objective: 'Halaman internal terlindungi',
      expected: 'Diarahkan ke Login dengan pesan "Silakan login terlebih dahulu."' });
    await page.goto('/dashboard.html');
    await expect(page).toHaveURL(/login\.html\?pesan=login-dulu/);
    await expect(page.locator('#pesan')).toHaveText('Silakan login terlebih dahulu.');
    await evidence.snap('Redirect ke Login saat belum login');
  });

  test('TC006 Logout mengakhiri sesi', async ({ page, tc, evidence }) => {
    tc({ module: 'M01', feature: 'F04', featureName: 'LOGOUT', requirement: 'REQ-11', role: 'ADMIN',
      type: 'Positive', priority: 'High', objective: 'Sesi berakhir setelah logout',
      expected: 'Kembali ke Beranda; membuka Dashboard lagi dialihkan ke Login' });
    await login(page, 'ADMIN');
    await page.getByRole('link', { name: /Logout/ }).click();
    await expect(page).toHaveURL(/index\.html/);
    await evidence.snap('Kembali ke Beranda setelah logout');
    await page.goto('/dashboard.html');
    await expect(page).toHaveURL(/login\.html/);
    await evidence.snap('Dashboard tidak bisa diakses setelah logout');
  });
});

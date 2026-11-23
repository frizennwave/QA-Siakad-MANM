const { test, expect } = require('../lib/fixtures');
const { loginAs } = require('../lib/filament');

test.describe('MOD-AUTH - Authentication', () => {
  test('TC-AUTH-001 Redirect guest ke login', async ({ page, tc, evidence }) => {
    tc({
      module: 'MOD-AUTH', feature: 'F-001', featureName: 'AUTH_REDIRECT', requirement: 'REQ-AUTH-001',
      role: 'GUEST', type: 'Positive/Functional', priority: 'High',
      objective: 'Memastikan guest yang mengakses dashboard diarahkan ke login',
      expected: 'User diarahkan ke /dashboard/login; halaman login tampil',
    });
    await page.context().clearCookies();
    const resp = await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await evidence.snap('Akses dashboard sebagai guest');
    expect(resp).not.toBeNull();
    expect(page.url()).toContain('/dashboard/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('TC-AUTH-002 Login valid Admin', async ({ page, tc, evidence }) => {
    tc({
      module: 'MOD-AUTH', feature: 'F-002', featureName: 'LOGIN_ADMIN', requirement: 'REQ-AUTH-002',
      role: 'ADMIN', type: 'Positive/Functional', priority: 'Critical',
      objective: 'Memastikan login valid Admin berhasil',
      expected: 'Login berhasil; URL /dashboard; welcome menampilkan identitas Admin; tidak ada error login',
    });
    await loginAs(page, 'ADMIN');
    await evidence.snap('Dashboard setelah login Admin');
    expect(page.url()).toContain('/dashboard');
    await expect(page).toHaveTitle(/Dashboard/);
    await expect(page.locator('body')).toContainText(/Welcome/i);
    await expect(page.locator('body')).toContainText(/Administrator|Admin/i);
  });

  test('TC-AUTH-003 Login valid Guru + menu sesuai role', async ({ page, tc, evidence }) => {
    tc({
      module: 'MOD-AUTH', feature: 'F-002', featureName: 'LOGIN_GURU', requirement: 'REQ-AUTH-002',
      role: 'GURU', type: 'Positive/Functional/Access', priority: 'Critical',
      objective: 'Memastikan login valid Guru berhasil dan menu sesuai role',
      expected: 'Login berhasil; welcome menampilkan nama Guru; sidebar hanya menampilkan Dashboard (baseline teramati)',
    });
    await loginAs(page, 'GURU');
    await evidence.snap('Dashboard setelah login Guru');
    expect(page.url()).toContain('/dashboard');
    await expect(page.locator('body')).toContainText(/Welcome/i);
    await expect(page.locator('body')).toContainText(/Guru A|Guru/i);
    const navLinks = page.locator('.fi-sidebar a[href*="/dashboard"]');
    const texts = await navLinks.allTextContents();
    expect(texts.join(' | ')).toMatch(/Dashboard/i);
    expect(texts.join(' | ')).not.toMatch(/Tahun Ajaran|Jurusan|Mata Pelajaran|Guru & Tendik|Siswa|Kelas|Student Enrollments|Roles/i);
  });

  test('TC-AUTH-004 Login valid Murid + menu sesuai role', async ({ page, tc, evidence }) => {
    tc({
      module: 'MOD-AUTH', feature: 'F-002', featureName: 'LOGIN_MURID', requirement: 'REQ-AUTH-002',
      role: 'MURID', type: 'Positive/Functional/Access', priority: 'Critical',
      objective: 'Memastikan login valid Murid berhasil dan menu sesuai role',
      expected: 'Login berhasil; welcome menampilkan nama Murid; sidebar hanya menampilkan Dashboard (baseline teramati)',
    });
    await loginAs(page, 'MURID');
    await evidence.snap('Dashboard setelah login Murid');
    expect(page.url()).toContain('/dashboard');
    await expect(page.locator('body')).toContainText(/Welcome/i);
    await expect(page.locator('body')).toContainText(/Budi|Murid/i);
    const navLinks = page.locator('.fi-sidebar a[href*="/dashboard"]');
    const texts = await navLinks.allTextContents();
    expect(texts.join(' | ')).toMatch(/Dashboard/i);
    expect(texts.join(' | ')).not.toMatch(/Tahun Ajaran|Jurusan|Mata Pelajaran|Guru & Tendik|Siswa|Kelas|Student Enrollments|Roles/i);
  });

  test('TC-AUTH-005 Field wajib login kosong ditolak', async ({ page, tc, evidence }) => {
    tc({
      module: 'MOD-AUTH', feature: 'F-002', featureName: 'LOGIN_REQUIRED', requirement: 'REQ-AUTH-003',
      role: 'GUEST', type: 'Negative/Boundary/Validation', priority: 'High',
      objective: 'Memastikan field wajib login tidak dapat disubmit kosong',
      expected: "Submit ditolak; validasi required teramati; user tetap di /dashboard/login; tidak login",
    });
    await page.goto('/dashboard/login', { waitUntil: 'networkidle' });
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(800);
    await evidence.snap('Submit login kosong');
    const email = page.locator('#form\\.email, input[type="email"]').first();
    const pass = page.locator('#form\\.password, input[type="password"]').first();
    await expect(email).toHaveJSProperty('required', true);
    await expect(pass).toHaveJSProperty('required', true);
    const emailValid = await email.evaluate((e) => e.checkValidity());
    const passValid = await pass.evaluate((e) => e.checkValidity());
    expect(emailValid).toBe(false);
    expect(passValid).toBe(false);
    expect(page.url()).toContain('/dashboard/login');
  });

  test('TC-AUTH-006 Kredensial invalid ditolak', async ({ page, tc, evidence }) => {
    tc({
      module: 'MOD-AUTH', feature: 'F-002', featureName: 'LOGIN_INVALID', requirement: 'REQ-AUTH-003',
      role: 'GUEST', type: 'Negative/Security', priority: 'High',
      objective: 'Memastikan kredensial invalid tidak memberikan akses dashboard',
      expected: 'Login gagal; user tetap di login atau mendapat error autentikasi; tidak masuk /dashboard',
    });
    await page.goto('/dashboard/login', { waitUntil: 'networkidle' });
    await page.locator('input[type="email"]').first().fill('admin@manmuhammad.sch.id');
    await page.locator('input[type="password"]').first().fill('password-salah-QA-invalid');
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1500);
    await evidence.snap('Setelah submit kredensial invalid');
    expect(page.url()).toContain('/dashboard/login');
    await expect(page.locator('body')).not.toContainText(/Welcome\s+Administrator/i);
  });
});

const { test, expect } = require('../lib/fixtures');

test.describe('MOD-NAV/MOD-ACCESS - Navigation & Access Control', () => {
  test.describe('Admin', () => {
    test.use({ role: 'ADMIN' });
    test('TC-NAV-001 Sidebar Admin menampilkan menu baseline', async ({ page, tc, evidence }) => {
      tc({
        module: 'MOD-NAV', feature: 'F-004', featureName: 'SIDEBAR_ADMIN', requirement: 'REQ-NAV-001',
        role: 'ADMIN', type: 'Positive/Functional', priority: 'Critical',
        objective: 'Memastikan sidebar Admin menampilkan menu yang teramati',
        expected: 'Sidebar menampilkan Dashboard, Tahun Ajaran, Jurusan, Mata Pelajaran, Guru & Tendik, Siswa, Kelas, Student Enrollments, Roles',
      });
      await page.goto('/dashboard', { waitUntil: 'networkidle' });
      await evidence.snap('Sidebar Admin');
      const nav = page.locator('.fi-sidebar');
      for (const label of ['Dashboard', 'Tahun Ajaran', 'Jurusan', 'Mata Pelajaran', 'Guru & Tendik', 'Siswa', 'Kelas', 'Student Enrollments', 'Roles']) {
        await expect(nav).toContainText(label);
      }
    });
  });

  test.describe('Guru', () => {
    test.use({ role: 'GURU' });
    test('TC-ACC-001 Guru tidak dapat akses URL admin-only secara langsung', async ({ page, tc, evidence }) => {
      tc({
        module: 'MOD-ACCESS', feature: 'F-024', featureName: 'DIRECT_URL_GURU', requirement: 'REQ-ACC-001',
        role: 'GURU', type: 'Negative/Access Control', priority: 'Critical',
        objective: 'Memastikan Guru tidak dapat mengakses URL admin-only secara langsung',
        expected: 'Akses ditolak/403/redirect sesuai policy; data guru tidak ditampilkan. Expected detail perlu konfirmasi (C-010).',
      });
      const resp = await page.goto('/dashboard/teachers', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await evidence.snap('Guru akses langsung /dashboard/teachers');
      const status = resp?.status();
      const url = page.url();
      const body = await page.locator('body').innerText();
      const deniedByStatus = status === 403;
      const deniedByRedirect = !url.includes('/dashboard/teachers');
      const deniedByBody = /403|forbidden|unauthorized/i.test(body) && !/Mata Pelajaran\s*,\s*Kelas/i.test(body);
      expect(deniedByStatus || deniedByRedirect || deniedByBody, `Guru seharusnya ditolak; status=${status} url=${url}`).toBeTruthy();
      expect(/NIP|Email|Jabatan|Jenis Kelamin/i.test(body) && /Teachers/i.test(body) && !deniedByRedirect).toBeFalsy();
    });
  });

  test.describe('Murid', () => {
    test.use({ role: 'MURID' });
    test('TC-ACC-002 Murid tidak dapat akses Shield Roles secara langsung', async ({ page, tc, evidence }) => {
      tc({
        module: 'MOD-ACCESS', feature: 'F-024', featureName: 'DIRECT_URL_MURID', requirement: 'REQ-ACC-001',
        role: 'MURID', type: 'Negative/Access Control', priority: 'Critical',
        objective: 'Memastikan Murid tidak dapat mengakses Shield Roles secara langsung',
        expected: 'Akses ditolak/403/redirect sesuai policy; data role/permission tidak terbuka.',
      });
      const resp = await page.goto('/dashboard/shield/roles', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await evidence.snap('Murid akses langsung /dashboard/shield/roles');
      const status = resp?.status();
      const url = page.url();
      const body = await page.locator('body').innerText();
      const deniedByStatus = status === 403;
      const deniedByRedirect = !url.includes('/dashboard/shield/roles');
      const deniedByBody = /403|forbidden|unauthorized/i.test(body);
      expect(deniedByStatus || deniedByRedirect || deniedByBody, `Murid seharusnya ditolak; status=${status} url=${url}`).toBeTruthy();
      expect(/Guard Name|Permissions|New Role/i.test(body) && url.includes('/dashboard/shield/roles')).toBeFalsy();
    });
  });
});

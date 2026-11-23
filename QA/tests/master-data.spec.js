const { test, expect } = require('../lib/fixtures');

test.describe('MOD-MASTER - Master Data', () => {
  test.use({ role: 'ADMIN' });

  test('TC-MST-001 List Tahun Ajaran menampilkan kolom utama', async ({ page, tc, evidence }) => {
    tc({
      module: 'MOD-MASTER', feature: 'F-007', featureName: 'ACADEMIC_YEARS_LIST', requirement: 'REQ-MST-001',
      role: 'ADMIN', type: 'Positive/Functional', priority: 'High',
      objective: 'Memastikan halaman list Tahun Ajaran dapat dibuka dan menampilkan kolom utama',
      expected: 'Halaman terbuka; tabel memuat kolom Tahun Ajaran dan Status; tidak ada error fatal',
    });
    await page.goto('/dashboard/academic-years', { waitUntil: 'networkidle' });
    await evidence.snap('List Tahun Ajaran');
    await expect(page).toHaveTitle(/Academic Years/i);
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
    await expect(table).toContainText(/Tahun Ajaran/i);
    await expect(table).toContainText(/Status/i);
  });

  test('TC-MST-002 Detail Guru menampilkan relasi pengajaran', async ({ page, tc, evidence }) => {
    tc({
      module: 'MOD-MASTER', feature: 'F-014', featureName: 'TEACHER_DETAIL', requirement: 'REQ-MST-002',
      role: 'ADMIN', type: 'Positive/Workflow/Data Relation', priority: 'Medium',
      objective: 'Memastikan detail Guru menampilkan relasi pengajaran',
      expected: 'Detail guru tampil; tabel relasi memuat Mata Pelajaran, Kelas, Tahun Ajaran, Semester; filter terlihat; empty state ditangani jika tidak ada relasi',
    });
    await page.goto('/dashboard/teachers', { waitUntil: 'networkidle' });
    await evidence.snap('List Guru sebelum buka detail');
    await page.goto('/dashboard/teachers/1', { waitUntil: 'networkidle' });
    await evidence.snap('Detail Guru id 1');
    await expect(page).toHaveTitle(/View teacher/i);
    const body = page.locator('body');
    for (const col of ['Mata Pelajaran', 'Kelas', 'Tahun Ajaran', 'Semester']) {
      await expect(body).toContainText(col);
    }
    await expect(body).toContainText(/Filter/i);
  });
});

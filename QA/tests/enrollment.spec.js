const { test, expect } = require('../lib/fixtures');

test.describe('MOD-ENROLLMENT - Student Enrollment', () => {
  test.use({ role: 'ADMIN' });

  test('TC-ENR-001 List Student Enrollments menampilkan kolom utama', async ({ page, tc, evidence }) => {
    tc({
      module: 'MOD-ENROLLMENT', feature: 'F-021', featureName: 'ENROLLMENT_LIST', requirement: 'REQ-ENR-001',
      role: 'ADMIN', type: 'Positive/Functional', priority: 'High',
      objective: 'Memastikan list Student Enrollments menampilkan kolom utama',
      expected: 'Tabel menampilkan Siswa, Kelas, Tahun Ajaran, Tanggal Mulai, Tanggal Selesai, Status; data sampel tampil',
    });
    await page.goto('/dashboard/student-enrollments', { waitUntil: 'networkidle' });
    await evidence.snap('List Student Enrollments');
    await expect(page).toHaveTitle(/Student Enrollments/i);
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
    for (const col of ['Siswa', 'Kelas', 'Tahun Ajaran', 'Tanggal Mulai', 'Tanggal Selesai', 'Status']) {
      await expect(table).toContainText(col);
    }
  });

  test.skip('TC-CRUD-001 Create/Update/Delete master data (BLOCKED - butuh izin tulis & data dummy)', async ({ page, tc, evidence }) => {
    tc({
      module: 'MOD-MASTER', feature: 'F-CRUD', featureName: 'CRUD_MASTER', requirement: 'REQ-CRUD-001',
      role: 'ADMIN', type: 'Functional/CRUD', priority: 'Critical',
      objective: 'Memvalidasi operasi tulis data master',
      expected: 'Data berhasil dibuat/diubah/dihapus sesuai aturan; validasi & notifikasi benar',
    });
  });

  test.skip('TC-CRUD-002 Bulk delete/select all (BLOCKED - destruktif, butuh izin)', async ({ page, tc, evidence }) => {
    tc({
      module: 'MOD-MASTER', feature: 'F-CRUD', featureName: 'BULK_DELETE', requirement: 'REQ-CRUD-002',
      role: 'ADMIN', type: 'Functional/Destructive', priority: 'High',
      objective: 'Memvalidasi aksi massal destruktif',
      expected: 'Hanya record terpilih terpengaruh; konfirmasi tampil; data konsisten',
    });
  });
});

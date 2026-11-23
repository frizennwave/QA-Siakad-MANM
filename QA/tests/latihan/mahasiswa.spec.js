// Contoh test hasil TAHAP 2 untuk aplikasi demo (modul M02 Data Mahasiswa).
const { test, expect } = require('../../lib/fixtures');
const { login } = require('./helpers');

async function isiForm(page, { nim, nama, prodi }) {
  await page.goto('/mahasiswa-tambah.html');
  if (nim !== undefined) await page.getByLabel('NIM').fill(nim);
  if (nama !== undefined) await page.getByLabel('Nama Lengkap').fill(nama);
  if (prodi) await page.getByLabel('Program Studi').selectOption(prodi);
}

test.describe('M02 Data Mahasiswa', () => {
  test('TC007 Admin melihat dan mencari data mahasiswa', async ({ page, tc, evidence }) => {
    tc({ module: 'M02', feature: 'F05', featureName: 'DAFTAR_MHS', requirement: 'REQ-05', role: 'ADMIN',
      type: 'Positive', priority: 'High', objective: 'Tabel tampil dan pencarian berfungsi',
      expected: 'Tabel menampilkan data; kata kunci "Siti" hanya menyisakan baris yang cocok' });
    await login(page, 'ADMIN');
    await page.goto('/mahasiswa.html');
    await expect(page.locator('#tabel-mhs tr')).toHaveCount(2);
    await evidence.snap('Tabel data mahasiswa');
    await page.getByLabel('Cari nama / NIM').fill('Siti');
    await expect(page.locator('#tabel-mhs tr')).toHaveCount(1);
    await expect(page.locator('#tabel-mhs')).toContainText('Siti Aminah');
    await evidence.snap('Hasil pencarian "Siti"');
  });

  test('TC008 Admin menambah mahasiswa dengan data valid', async ({ page, tc, evidence }) => {
    tc({ module: 'M02', feature: 'F06', featureName: 'TAMBAH_MHS', requirement: 'REQ-06', role: 'ADMIN',
      type: 'Positive', priority: 'Critical', objective: 'Data baru tersimpan dan tampil di tabel',
      expected: 'Pesan sukses tampil DAN baris NIM baru ada di tabel' });
    await login(page, 'ADMIN');
    await isiForm(page, { nim: '2023010099', nama: 'Budi Santoso', prodi: 'Teknik Informatika' });
    await evidence.snap('Form tambah terisi data valid');
    await page.getByRole('button', { name: 'Simpan' }).click();
    await expect(page.locator('#pesan')).toHaveText('Data mahasiswa berhasil disimpan.');
    // Jangan percaya notifikasi saja: verifikasi data benar-benar ada di tabel
    await expect(page.locator('#tabel-mhs')).toContainText('2023010099');
    await expect(page.locator('#tabel-mhs tr')).toHaveCount(3);
    await evidence.snap('Data baru tampil di tabel');
  });

  test('TC009 NIM 9 digit ditolak (batas bawah)', async ({ page, tc, evidence }) => {
    tc({ module: 'M02', feature: 'F06', featureName: 'TAMBAH_MHS', requirement: 'REQ-07', role: 'ADMIN',
      type: 'Boundary', priority: 'High', objective: 'NIM harus tepat 10 digit',
      expected: 'NIM 9 digit ditolak dengan pesan "NIM harus 10 digit angka."' });
    await login(page, 'ADMIN');
    await isiForm(page, { nim: '202301009', nama: 'Uji Batas Bawah', prodi: 'Sistem Informasi' });
    await page.getByRole('button', { name: 'Simpan' }).click();
    await evidence.snap('Respons setelah simpan NIM 9 digit');
    await expect(page.locator('#pesan')).toHaveText('NIM harus 10 digit angka.');
  });

  test('TC010 NIM 11 digit ditolak (batas atas)', async ({ page, tc, evidence }) => {
    tc({ module: 'M02', feature: 'F06', featureName: 'TAMBAH_MHS', requirement: 'REQ-07', role: 'ADMIN',
      type: 'Boundary', priority: 'High', objective: 'NIM harus tepat 10 digit',
      expected: 'NIM 11 digit ditolak dengan pesan "NIM harus 10 digit angka."' });
    await login(page, 'ADMIN');
    await isiForm(page, { nim: '20230100999', nama: 'Uji Batas Atas', prodi: 'Sistem Informasi' });
    await page.getByRole('button', { name: 'Simpan' }).click();
    await expect(page.locator('#pesan')).toHaveText('NIM harus 10 digit angka.');
    await evidence.snap('Pesan validasi NIM 11 digit');
  });

  test('TC011 NIM duplikat ditolak', async ({ page, tc, evidence }) => {
    tc({ module: 'M02', feature: 'F06', featureName: 'TAMBAH_MHS', requirement: 'REQ-08', role: 'ADMIN',
      type: 'Negative', priority: 'High', objective: 'NIM bersifat unik',
      expected: 'Pesan "NIM sudah terdaftar." dan data tidak bertambah' });
    await login(page, 'ADMIN');
    await isiForm(page, { nim: '2023010001', nama: 'Duplikat', prodi: 'Teknik Informatika' });
    await page.getByRole('button', { name: 'Simpan' }).click();
    await expect(page.locator('#pesan')).toHaveText('NIM sudah terdaftar.');
    await evidence.snap('Pesan NIM duplikat');
  });

  test('TC012 Dosen tidak dapat menambah mahasiswa', async ({ page, tc, evidence }) => {
    tc({ module: 'M02', feature: 'F07', featureName: 'HAK_AKSES', requirement: 'REQ-10', role: 'DOSEN',
      type: 'Access Control', priority: 'Critical', objective: 'Pembatasan aksi untuk role Dosen',
      expected: 'Tombol Tambah tidak tampil; akses langsung ke form menampilkan "Akses ditolak"' });
    await login(page, 'DOSEN');
    await page.goto('/mahasiswa.html');
    await expect(page.getByRole('link', { name: '+ Tambah Mahasiswa' })).toBeHidden();
    await evidence.snap('Tabel tanpa tombol Tambah (role Dosen)');
    await page.goto('/mahasiswa-tambah.html');
    await expect(page.locator('#pesan')).toContainText('Akses ditolak');
    await expect(page.locator('#form-mhs')).toHaveCount(0);
    await evidence.snap('Akses langsung ke form ditolak');
  });
});

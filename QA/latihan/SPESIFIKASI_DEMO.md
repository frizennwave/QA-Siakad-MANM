# Spesifikasi Fungsional: SIAKAD Mini (Aplikasi Demo Latihan)

> Dokumen ini berperan sebagai "dokumen dari pemilik proyek" yang diserahkan
> kepada tim QA. Gunakan sebagai sumber **Documented** saat discovery dan sebagai
> *expected behavior* saat pengujian. Jangan membaca kode `demo-app/` untuk
> mencari bug. Temukan lewat pengujian, seperti QA sungguhan.

## 1. Identitas

| Item | Nilai |
|---|---|
| Nama aplikasi | SIAKAD Mini |
| Jenis | Administration System (sistem informasi akademik) |
| URL latihan | http://localhost:4173 (`npm run demo`) |
| Pengguna | Pengunjung publik, Admin, Dosen |

## 2. Role & Hak Akses

| Role | Login | Lihat data mahasiswa | Tambah mahasiswa |
|---|---|---|---|
| Pengunjung | Tidak | Tidak | Tidak |
| Admin | Ya | Ya | Ya |
| Dosen | Ya | Ya | **Tidak**, harus ditolak |

## 3. Kebutuhan Fungsional

| ID | Kebutuhan |
|---|---|
| REQ-01 | Pengunjung dapat membuka Beranda dan halaman Tentang tanpa login. |
| REQ-02 | Pengguna login dengan username & password. Kredensial salah menampilkan pesan *"Username atau password salah."* |
| REQ-03 | Field username/password kosong menampilkan pesan wajib diisi. |
| REQ-04 | Halaman Dashboard dan Data Mahasiswa hanya dapat diakses setelah login; jika belum login diarahkan ke halaman Login. |
| REQ-05 | Data Mahasiswa menampilkan tabel NIM, Nama, Program Studi dan dapat dicari berdasarkan nama atau NIM. |
| REQ-06 | Admin dapat menambah mahasiswa melalui form Tambah Mahasiswa. Setelah tersimpan, data tampil di tabel dengan pesan sukses. |
| REQ-07 | **NIM wajib tepat 10 digit angka.** NIM selain itu ditolak dengan pesan *"NIM harus 10 digit angka."* |
| REQ-08 | NIM bersifat unik; NIM yang sudah ada ditolak dengan pesan *"NIM sudah terdaftar."* |
| REQ-09 | NIM, Nama, dan Program Studi wajib diisi. Nama maksimal 100 karakter. |
| REQ-10 | Dosen tidak boleh menambah data; membuka halaman Tambah Mahasiswa menampilkan *"Akses ditolak"*. |
| REQ-11 | Logout mengakhiri sesi dan kembali ke Beranda. |

## 4. Catatan Teknis yang Diketahui

- Aplikasi demo bersifat statis; data tersimpan di `localStorage` browser
  (setiap sesi browser Playwright mulai dari data awal 2 mahasiswa).
- Tidak ada backend/API. Konsekuensinya, kontrol akses hanya bisa diamati di
  sisi frontend. Ini harus dicatat sebagai **keterbatasan** di laporan.

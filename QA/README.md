# QA Testing: SIAKAD MA Nur Muhammad

Pengujian kualitas (QA) berbasis Playwright dan Claude Code pada antarmuka web **Sistem Informasi Akademik MA Nur Muhammad** (panel Filament di `/dashboard`).

## Dokumen yang dikumpulkan

| Dokumen | Lokasi |
|---|---|
| Laporan QA (PDF) | [`reports/Website_QA_Testing_Report.pdf`](reports/Website_QA_Testing_Report.pdf) |
| Panduan pengguna (PDF) | [`reports/Website_User_Tutorial.pdf`](reports/Website_User_Tutorial.pdf) |
| Katalog test case | [`reports/Test_Case_Catalogue.xlsx`](reports/Test_Case_Catalogue.xlsx) |
| Daftar bug | [`bugs/bugs.json`](bugs/bugs.json) (kosong, tidak ada bug aplikasi terkonfirmasi) |
| Handover QA | [`discovery/documents/QA_Handover.md`](discovery/documents/QA_Handover.md) |
| Test otomatis | [`tests/`](tests/) |

Versi DOCX laporan dan tutorial juga tersedia di folder `reports/`.

## Aplikasi yang diuji

- **Aplikasi:** SIAKAD MA Nur Muhammad (Laravel 13, panel admin Filament).
- **Lingkungan:** lokal, dijalankan dengan Docker (Laravel Sail), `http://localhost`.
- **Role yang diuji:** Admin, Guru, Murid (akun uji lokal).
- **Modul yang diuji:** Autentikasi, Master Data (Tahun Ajaran, Guru), Student Enrollment, Navigasi, dan Kontrol Akses.

### Di luar scope
- REST API (endpoint `/`, hanya mengembalikan JSON versi Laravel) karena proyek API belum selesai.
- Pengujian performa, load, keamanan mendalam, dan verifikasi database langsung.
- Operasi tulis (create, edit, delete, bulk delete) belum dijalankan dan ditandai BLOCKED.

## Ringkasan hasil

Sumber: `results/test-results.json` pada run terakhir.

| Metrik | Nilai |
|---|---|
| Test case terdaftar | 15 |
| Dieksekusi (PASS + FAIL) | 13 |
| PASS | 13 |
| FAIL | 0 |
| BLOCKED | 2 |
| Pass Rate (PASS / (PASS + FAIL)) | 100% (denominator 13) |
| Bug terkonfirmasi | 0 |

Pass Rate 100% hanya berlaku untuk 13 test yang dieksekusi dan bersifat read-only. Angka ini **tidak** berarti aplikasi bebas bug. Detail ada di bagian Keterbatasan laporan.

### Daftar test case

| ID | Deskripsi | Hasil |
|---|---|---|
| TC000 | Validasi environment | PASS |
| TC-AUTH-001 | Redirect guest ke login | PASS |
| TC-AUTH-002 | Login valid Admin | PASS |
| TC-AUTH-003 | Login valid Guru dan menu sesuai role | PASS |
| TC-AUTH-004 | Login valid Murid dan menu sesuai role | PASS |
| TC-AUTH-005 | Field wajib login kosong ditolak | PASS |
| TC-AUTH-006 | Kredensial invalid ditolak | PASS |
| TC-ENR-001 | List Student Enrollments menampilkan kolom utama | PASS |
| TC-MST-001 | List Tahun Ajaran menampilkan kolom utama | PASS |
| TC-MST-002 | Detail Guru menampilkan relasi pengajaran | PASS |
| TC-NAV-001 | Sidebar Admin menampilkan menu baseline | PASS |
| TC-ACC-001 | Guru tidak dapat akses URL admin-only langsung | PASS |
| TC-ACC-002 | Murid tidak dapat akses Shield Roles langsung | PASS |
| TC-CRUD-001 | Create/Update/Delete master data | BLOCKED |
| TC-CRUD-002 | Bulk delete / select all | BLOCKED |

## Temuan penting

Pada run awal, 3 test (TC-MST-001, TC-MST-002, TC-NAV-001) gagal karena timeout saat login Admin berulang melalui UI. Penyebabnya **diduga** pembatasan percobaan login Filament (sekitar 5 kali per menit), dan ini bukan bug fungsional aplikasi. Perbaikannya ada di sisi test: login satu kali per role dengan sesi tersimpan (`storageState`), sementara test TC-AUTH tetap login lewat UI. Setelah itu seluruh test lulus pada run berikutnya.

## Struktur repositori

```
.
├── QA/                       (atau root repositori ini)
│   ├── tests/                test Playwright, satu file per modul
│   ├── lib/                  fixture, helper login Filament, setup
│   ├── scripts/              skrip discovery dan pembuat laporan
│   ├── discovery/            data dan dokumen hasil discovery
│   ├── screenshots/          bukti screenshot tiap test case
│   ├── bugs/bugs.json        daftar bug
│   ├── reports/              laporan, tutorial, katalog test case
│   ├── .env.example          contoh konfigurasi (tanpa kredensial)
│   └── playwright.config.js
```

Folder `results/`, `archive/`, `auth/`, dan file `.env` tidak disertakan di repositori karena berisi data lokal atau sesi login.

## Cara menjalankan ulang

Prasyarat: Node.js 20.6 atau lebih baru, Python 3.9+, aplikasi target berjalan di `http://localhost`.

```bash
cd QA
npm install
npx playwright install chromium
cp .env.example .env        # isi BASE_URL dan akun uji tiap role
npm run test:env            # validasi environment (TC000)
npm test                    # jalankan semua test
```

Membangun ulang laporan:

```bash
python3 scripts/build_report.py
python3 scripts/build_tutorial.py
```

## Etika dan keamanan

- Kredensial hanya berada di `.env` lokal dan tidak pernah di-commit.
- Pengujian dilakukan pada lingkungan lokal dengan akun uji, bukan data production.
- Tidak ada brute force, eksploitasi keamanan, atau load test.
- Hasil test tidak diubah agar lulus: kegagalan dicatat sebagai temuan.
- Password pada screenshot ditutup (masking) oleh fixture test.

## Alat

Playwright (Chromium), Node.js, Python (`python-docx`, `openpyxl`), LibreOffice (ekspor PDF), dan Claude Code dengan skill `application-discovery-qa-documentation` dan `website-qa-automation-architect` dari [SKILL-VIBE-CODE](https://github.com/LurreDev-Official/SKILL-VIBE-CODE).

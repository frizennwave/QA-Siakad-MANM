# MODUL TUTORIAL
## Quality Assurance Aplikasi Web dengan Claude Code + Playwright
### Menggunakan Skill dari Repo `SKILL-VIBE-CODE`

> Sumber skill: <https://github.com/LurreDev-Official/SKILL-VIBE-CODE.git>
> Modul ini dijalankan **di dalam proyek web Anda**, pada folder `QA/`.

---

## Daftar Isi

1. [Informasi Modul](#1-informasi-modul)
2. [Gambaran Alur Kerja](#2-gambaran-alur-kerja)
3. [Persiapan Lingkungan](#3-persiapan-lingkungan)
4. [Langkah 1–6: Memasang Folder QA dan Skill ke Proyek](#4-langkah-16-memasang-folder-qa-dan-skill-ke-proyek)
5. [Praktikum 1: Application Discovery](#5-praktikum-1-application-discovery-skill-tahap-1)
6. [Praktikum 2: Perencanaan Pengujian](#6-praktikum-2-perencanaan-pengujian-test-plan)
7. [Praktikum 3: Eksekusi Test & Bukti Screenshot](#7-praktikum-3-eksekusi-test--bukti-screenshot)
8. [Praktikum 4: Analisis Hasil & Bug Report](#8-praktikum-4-analisis-hasil--bug-report)
9. [Praktikum 5: Laporan QA & Tutorial Pengguna (DOCX)](#9-praktikum-5-laporan-qa--tutorial-pengguna-docx)
10. [Praktikum 6: Retest & Regression](#10-praktikum-6-retest--regression)
11. [Menerapkan ke Proyek Nyata](#11-menerapkan-ke-proyek-nyata)
12. [Troubleshooting](#12-troubleshooting)
13. [Tugas Mandiri & Rubrik Penilaian](#13-tugas-mandiri--rubrik-penilaian)
14. [Lampiran](#14-lampiran)

---

## 1. Informasi Modul

| Item | Keterangan |
|---|---|
| Topik | Application Discovery & QA Automation berbasis AI |
| Alat | Claude Code, Playwright (Chromium), Node.js, Python (python-docx, openpyxl) |
| Skill | `application-discovery-qa-documentation` dan `website-qa-automation-architect` |
| Objek latihan | **SIAKAD Mini**, aplikasi demo yang sudah disertakan (`QA/latihan/`) |
| Estimasi waktu | 3 × 150 menit (bisa dibagi 3 pertemuan) |

**Capaian pembelajaran.** Setelah menyelesaikan modul ini, mahasiswa mampu:

1. Memasang skill Claude Code dari repositori GitHub ke dalam proyek.
2. Melakukan *application discovery* berbasis bukti (halaman, fitur, role, alur).
3. Menyusun test case yang dapat ditelusuri (Requirement → Test Case → Bukti → Bug).
4. Menjalankan test otomatis Playwright dan mengumpulkan screenshot bukti.
5. Membedakan PASS / FAIL / BLOCKED, *bug* / *discrepancy* / *enhancement*.
6. Menghasilkan Laporan QA dan Tutorial Pengguna dalam format DOCX.

---

## 2. Gambaran Alur Kerja

Repo `SKILL-VIBE-CODE` berisi dua file skill yang bekerja **berurutan**:

| File di repo | Nama skill (frontmatter) | Peran |
|---|---|---|
| `skill-application-discovery-qa-documentation.md` | `application-discovery-qa-documentation` | **Tahap 1:** memahami & mendokumentasikan aplikasi |
| `skill-QA Engineer.md` | `website-qa-automation-architect` | **Tahap 2:** menguji aplikasi berdasarkan hasil Tahap 1 |

```
 ┌──────────────────────── TAHAP 1: DISCOVERY ────────────────────────┐
 │ Pahami proyek → Crawl halaman → Fitur & role → Alur → QA Requirement │
 │        (Gate 1)        (Gate 2)          (Gate 3–4)     (Gate 5: handover)
 └──────────────────────────────┬─────────────────────────────────────┘
                                ▼  discovery/ (JSON, DOCX, XLSX, PNG, Mermaid)
 ┌──────────────────────── TAHAP 2: QA AUTOMATION ────────────────────┐
 │ Scope → Test Plan → Eksekusi Playwright → Temuan → Laporan → Serah   │
 │ (Gate 1)  (Gate 2)       (Gate 3)          (Gate 4)  (Gate 5)  (Gate 6)
 └─────────────────────────────────────────────────────────────────────┘
                                ▼  reports/ (Laporan QA & Tutorial DOCX)
```

**Pembagian kerja di dalam folder `QA/`:**

- **Claude** (dipandu skill): merencanakan, menulis test, menganalisis, dan menulis dokumen.
- **Playwright** (skrip di folder ini): membuka browser sungguhan, mengklik, dan mengambil screenshot.
- **Anda** (QA engineer): menyetujui setiap *gate*, memeriksa bukti, dan memutuskan.

> **Prinsip kedua skill:** *Test what actually exists. Never fabricate test results.*
> Status PASS/FAIL hanya boleh berasal dari eksekusi nyata, bukan dugaan.

---

## 3. Persiapan Lingkungan

Pasang alat berikut sekali saja di komputer Anda:

| Alat | Versi | Cek dengan |
|---|---|---|
| Git | terbaru | `git --version` |
| Node.js | **20.6 atau lebih baru** | `node -v` |
| Python | 3.9+ | `python --version` / `python3 --version` |
| Claude Code | terbaru | `claude --version` |

Panduan instalasi Claude Code: <https://docs.claude.com/en/docs/claude-code>

Pasang pustaka Python untuk pembuatan dokumen:

```bash
pip install python-docx openpyxl
```

---

## 4. Langkah 1–6: Memasang Folder QA dan Skill ke Proyek

### Langkah 1: Siapkan proyek web Anda

Gunakan proyek web yang sudah ada (Laravel, CodeIgniter, WordPress, React, dll.).
Untuk latihan, buat folder proyek kosong:

```bash
mkdir projek-latihan-qa
cd projek-latihan-qa
git init
```

### Langkah 2: Letakkan folder `QA/` di root proyek

Ekstrak `QA-workspace.zip` ke **root proyek** sehingga strukturnya menjadi:

```
projek-latihan-qa/        ← root proyek Anda
├── (kode aplikasi Anda: app/, public/, src/, ...)
└── QA/                   ← workspace QA dari modul ini
    ├── .claude/skills/   ← tempat skill dipasang (Langkah 3)
    ├── CLAUDE.md         ← instruksi kerja untuk Claude di folder QA
    ├── MODUL_TUTORIAL.md ← dokumen ini
    ├── lib/  scripts/  tests/  latihan/
    ├── .env.example
    ├── package.json
    └── playwright.config.js
```

> **Mengapa folder terpisah?** Dependensi QA (Playwright, laporan, screenshot) tidak
> tercampur dengan kode aplikasi, dan folder `QA/` bisa dipindah ke proyek lain.

### Langkah 3: Pasang skill dari repo `SKILL-VIBE-CODE`

Claude Code membaca skill proyek dari `.claude/skills/<nama-skill>/SKILL.md`.
Dua file `.md` dari repo harus dipasang ke lokasi tersebut. Pilih salah satu cara:

**Cara A: otomatis (disarankan)**

```bash
cd QA
npm run skills:install
```

Skrip `scripts/install-skills.js` akan meng-*clone* repo, membaca `name:` di
frontmatter tiap file, lalu menyalinnya. Output yang benar:

```
✓ skill-QA Engineer.md  →  .claude/skills/website-qa-automation-architect/SKILL.md
✓ skill-application-discovery-qa-documentation.md  →  .claude/skills/application-discovery-qa-documentation/SKILL.md
2 skill terpasang.
```

Jalankan perintah yang sama kapan saja untuk **memperbarui** skill bila repo berubah.

**Cara B: manual (Linux/macOS, Git Bash)**

```bash
cd QA
git clone --depth 1 https://github.com/LurreDev-Official/SKILL-VIBE-CODE.git /tmp/skill-src
mkdir -p .claude/skills/application-discovery-qa-documentation .claude/skills/website-qa-automation-architect
cp /tmp/skill-src/skill-application-discovery-qa-documentation.md .claude/skills/application-discovery-qa-documentation/SKILL.md
cp "/tmp/skill-src/skill-QA Engineer.md" .claude/skills/website-qa-automation-architect/SKILL.md
```

**Cara B: manual (Windows PowerShell)**

```powershell
cd QA
git clone --depth 1 https://github.com/LurreDev-Official/SKILL-VIBE-CODE.git $env:TEMP\skill-src
New-Item -ItemType Directory -Force .claude\skills\application-discovery-qa-documentation, .claude\skills\website-qa-automation-architect | Out-Null
Copy-Item "$env:TEMP\skill-src\skill-application-discovery-qa-documentation.md" .claude\skills\application-discovery-qa-documentation\SKILL.md
Copy-Item "$env:TEMP\skill-src\skill-QA Engineer.md" .claude\skills\website-qa-automation-architect\SKILL.md
```

> ⚠️ Nama file **harus** `SKILL.md` (huruf besar) dan nama foldernya sama dengan
> `name:` di frontmatter. Jika tidak, skill tidak terdeteksi.

### Langkah 4: Pasang dependensi QA

```bash
npm run setup        # = npm install + npx playwright install chromium
```

### Langkah 5: Konfigurasi `.env`

```bash
cp .env.example .env         # Windows: copy .env.example .env
```

Isi minimal untuk latihan sudah benar (`BASE_URL=http://localhost:4173` dan akun demo
`ADMIN_*`, `DOSEN_*`). Aturan penting:

- Kredensial **hanya** di `.env`, tidak pernah ditulis di kode, log, screenshot, atau laporan.
- `.env` dan `auth/` sudah masuk `.gitignore`, jadi jangan di-commit.
- Untuk aplikasi production, isi `TEST_ENV=production` agar pengujian bersifat read-only.

### Langkah 6: Jalankan aplikasi target & validasi environment

Buka **terminal 1** dan biarkan tetap berjalan:

```bash
npm run demo
# SIAKAD Mini (demo) berjalan di http://localhost:4173
```

Di **terminal 2**:

```bash
npm run test:env
```

Hasil yang diharapkan: `✓ TC000 Validasi environment: aplikasi dapat diakses` dan file
`screenshots/TC000_PUBLIC_ENVIRONMENT_STEP01_PASS.png` terbentuk.

### Langkah 7: Buka Claude Code di folder QA

```bash
claude
```

> Jalankan `claude` **dari dalam folder `QA/`**, bukan dari root proyek, supaya
> `QA/CLAUDE.md` dan `QA/.claude/skills/` terbaca.

Pastikan skill terbaca dengan mengetik:

```
Skill apa saja yang tersedia di proyek ini? Jelaskan urutan pemakaiannya.
```

Claude harus menyebut kedua skill dan urutan **Discovery → QA Automation**. Bila tidak,
lihat [Troubleshooting](#12-troubleshooting).

✅ **Checkpoint 1:** skill terpasang, demo berjalan, TC000 PASS.

---

## 5. Praktikum 1: Application Discovery (Skill Tahap 1)

**Tujuan:** menghasilkan dokumentasi aplikasi yang menjadi *baseline* pengujian.
Bahan dari "pemilik proyek": `latihan/SPESIFIKASI_DEMO.md`.

### 5.1 Gate 1: Project Understanding

Prompt ke Claude:

```
Gunakan skill application-discovery-qa-documentation.
Target: BASE_URL di .env. Dokumen dari pemilik proyek: latihan/SPESIFIKASI_DEMO.md.
Lakukan PHASE 0 (Project Understanding & Classification) dan tampilkan hasilnya
untuk GATE 1. Jangan membaca kode di latihan/demo-app/, cukup amati lewat browser.
```

Periksa jawaban Claude: jenis aplikasi, tujuan, pengguna, model akses.
Jika sudah tepat, balas: `Gate 1 disetujui, lanjut eksplorasi.`

### 5.2 Eksplorasi halaman (crawler read-only)

Claude akan menjalankan crawler. Anda juga bisa menjalankannya sendiri:

```bash
npm run discover                         # sebagai pengunjung publik
```

Untuk halaman yang memerlukan login, simpan sesi **dengan login manual** (password Anda
ketik sendiri di browser, tidak lewat skrip):

```bash
npm run auth:save -- admin               # login di browser, lalu tekan ENTER di terminal
npm run auth:save -- dosen
npm run discover -- --role admin --start /dashboard.html
npm run discover -- --role dosen --start /dashboard.html
```

Hasil:

| File | Isi |
|---|---|
| `discovery/data/discovery-<role>.json` | halaman, form, field, tabel, tombol, redirect, console error |
| `discovery/data/discovery-<role>.md` | ringkasan tabel per halaman |
| `discovery/screenshots/P001_<ROLE>_<halaman>.png` | screenshot aktual tiap halaman |

> Crawler hanya mengikuti link `<a href>`; **tidak** mengisi form, **tidak** mengeklik
> tombol, dan melewati URL `logout`, `delete`, `hapus`, dll. (atur di `DISCOVERY_SKIP`).

### 5.3 Gate 2: Discovery Review

```
Analisis semua file di discovery/data/. Susun daftar halaman (Page ID global),
fitur (Feature ID), role, dan user journey yang ditemukan. Bandingkan dengan
SPESIFIKASI_DEMO.md dan beri label Verified/Observed/Documented/Inferred/Unknown.
Tampilkan untuk GATE 2.
```

Yang harus Anda periksa:

- Tidak ada halaman/fitur/role **fiktif** (semua punya bukti screenshot atau sumber dokumen).
- *Observed* tidak disamakan dengan *Verified*.
- Kontrol akses yang hanya terlihat di frontend dicatat sebagai **keterbatasan**.

### 5.4 Gate 3–4: Dokumen Discovery

```
GATE 2 disetujui. Untuk GATE 3, usulkan dokumen discovery yang relevan saja
beserta alasannya. Setelah saya setujui, buat dokumen tersebut di discovery/documents/
(DOCX dengan python-docx, XLSX dengan openpyxl, diagram Mermaid di discovery/diagrams/).
Tulis skrip pembuatnya di scripts/ agar bisa dijalankan ulang.
```

Contoh hasil yang wajar untuk SIAKAD Mini (bukan wajib persis):

- `Application_Overview.docx` (profil, klasifikasi, keterbatasan)
- `Feature_Inventory.xlsx` (halaman, fitur, field form, status bukti)
- `Role_Permission_Matrix.xlsx` (Pengunjung / Admin / Dosen)
- `QA_Requirement_Specification.docx` (REQ → skenario positif/negatif/boundary/akses)
- `discovery/diagrams/alur-login.mmd`, `alur-tambah-mahasiswa.mmd`

### 5.5 Gate 5: QA Handover

```
Siapkan GATE 5 QA Handover: daftar fitur siap uji, expected behavior,
preconditions, business rules, dependency, keterbatasan, dan hal yang
butuh konfirmasi. Simpan sebagai discovery/documents/QA_Handover.md.
```

✅ **Checkpoint 2:** folder `discovery/` berisi data JSON, screenshot, dokumen, dan handover.

---

## 6. Praktikum 2: Perencanaan Pengujian (Test Plan)

### 6.1 Gate 1: Test Scope

```
Gunakan skill website-qa-automation-architect.
Baseline: discovery/documents/QA_Handover.md dan latihan/SPESIFIKASI_DEMO.md.
Lakukan Discovery Validation (2.2) lalu PHASE 2 Test Scope Identification.
Beri status tiap fitur: Ready for Testing / Partially Testable / Blocked /
Not in Scope / Not Applicable. Tampilkan untuk GATE 1.
```

### 6.2 Gate 2: Test Plan

```
GATE 1 disetujui. Susun test case (PHASE 3) dengan struktur skill: Test Case ID,
Module ID, Feature ID, Requirement ID, Role, Objective, Type, Preconditions,
Test Data, Steps, Expected Result, Priority. Sertakan skenario positif, negatif,
boundary, workflow, dan hak akses yang relevan. Simpan juga sebagai
reports/Test_Case_Catalogue.xlsx. Tampilkan untuk GATE 2.
```

Periksa: setiap requirement REQ-01 s.d. REQ-11 memiliki minimal satu test case,
dan batasan (*boundary*) hanya dibuat dari aturan yang **tertulis** (misalnya NIM 10 digit),
bukan karangan.

> 📌 Folder `tests/latihan/` sudah berisi **contoh jawaban** 12 test case (TC001–TC012).
> Bandingkan rencana Anda dengan contoh tersebut setelah Gate 2 selesai, bukan sebelumnya.

---

## 7. Praktikum 3: Eksekusi Test & Bukti Screenshot

### 7.1 Cara menulis test di workspace ini

Semua test memakai fixture dari `lib/fixtures.js`:

```js
const { test, expect } = require('../lib/fixtures');
const { credentials } = require('../lib/env');

test('TC013 Contoh judul test', async ({ page, tc, evidence }) => {
  tc({                                   // metadata traceability
    module: 'M02', feature: 'F06', featureName: 'TAMBAH_MHS',
    requirement: 'REQ-09', role: 'ADMIN', type: 'Negative', priority: 'Medium',
    expected: 'Pesan "NIM, Nama, dan Program Studi wajib diisi."',
  });
  await page.goto('/mahasiswa-tambah.html');
  await evidence.snap('Form tambah kosong');        // screenshot bukti langkah
  // ... langkah & expect(...)
});
```

Yang dikerjakan fixture secara otomatis:

| Otomatis | Keterangan |
|---|---|
| Nama screenshot | `TC013_ADMIN_TAMBAH_MHS_STEP01_PASS.png` (status diberikan setelah test selesai) |
| Screenshot saat gagal | langkah terakhir "Kondisi halaman saat test gagal" |
| Masking password | semua `input[type=password]` ditutup pada screenshot |
| Metadata bukti | `results/evidence.jsonl` (TC, feature, role, halaman, waktu, hasil, file) |
| Console & network error | `results/logs.jsonl` per test case |
| Arsip run lama | `archive/<waktu>/` sebelum setiap eksekusi |

Fitur yang tidak bisa diuji ditandai, bukan dihapus:

```js
test.skip(true, 'BLOCKED: akun role keuangan belum diberikan');   // → status BLOCKED
```

### 7.2 Gate 3: Eksekusi

```
GATE 2 disetujui. Tulis test case ke tests/ (satu file per modul) memakai
lib/fixtures.js, lalu jalankan npm test. Jangan ubah expected result agar test lulus.
```

Atau jalankan sendiri:

```bash
npm test                 # semua test
npm run test:headed      # melihat browser bergerak (bagus untuk demo kelas)
npm run report:html      # laporan HTML Playwright
```

Contoh keluaran:

```
  ✓  TC008 Admin menambah mahasiswa dengan data valid
  ✘  TC0xx ...
  1 failed
  12 passed
```

> ⚠️ **Etika QA:** jika test gagal, **jangan** mengubah expected result atau menghapus
> test supaya hijau. Kegagalan adalah temuan. Laporkan.

✅ **Checkpoint 3:** `results/test-results.json`, `results/evidence.jsonl`, dan folder
`screenshots/` terisi.

---

## 8. Praktikum 4: Analisis Hasil & Bug Report

### 8.1 Gate 4: Findings Review

```
Analisis results/test-results.json, results/evidence.jsonl, results/logs.jsonl,
dan screenshot terkait (PHASE 8). Untuk setiap FAIL tentukan apakah ini
Confirmed Bug, Suspected Bug, Documentation Discrepancy, atau kesalahan test.
Tulis bug yang terkonfirmasi ke bugs/bugs.json dengan field skill bagian 13
(Bug ID, Title, Module, Feature, Page, Role, Environment, Severity, Priority,
Description, Preconditions, Steps to Reproduce, Expected, Actual, Evidence,
Technical Observation, Recommendation, Status=Open). Tampilkan untuk GATE 4.
```

Hal yang Anda verifikasi sendiri:

1. Buka screenshot `*_FAIL.png`. Apakah benar memperlihatkan perilaku yang salah?
2. Ulangi langkah reproduksi secara manual di browser. Apakah hasilnya sama?
3. Apakah **severity** (dampak) dan **priority** (urgensi) diberi alasan dan tidak disamakan?
4. Apakah *root cause* hanya ditulis bila benar-benar diketahui?

---

## 9. Praktikum 5: Laporan QA & Tutorial Pengguna (DOCX)

### 9.1 Gate 5: Report Review, Laporan QA

```
Buat reports/Website_QA_Testing_Report.docx sesuai skill bagian 15
(python-docx, A4, Arial 10–11pt, heading bertingkat, daftar isi, header/footer,
nomor halaman, caption screenshot). Data HANYA dari results/, screenshots/,
bugs/bugs.json, dan discovery/. Hitung Pass Rate = PASS / (PASS + FAIL) × 100%,
tampilkan denominator coverage, dan tulis keterbatasan pengujian.
Simpan skripnya sebagai scripts/build_report.py.
```

### 9.2 Tutorial Pengguna

```
Buat reports/Website_User_Tutorial.docx sesuai skill bagian 14 dan 16:
bagian terpisah untuk Pengunjung, Admin, dan Dosen; gunakan nama menu aktual
dan screenshot dari screenshots/ atau discovery/screenshots/; tanpa kredensial.
Tandai langkah yang belum terverifikasi. Simpan skripnya sebagai scripts/build_tutorial.py.
```

### 9.3 Checklist kualitas dokumen (skill bagian 21)

- [ ] DOCX bisa dibuka dan semua gambar tampil
- [ ] Angka statistik sama dengan `results/test-results.json`
- [ ] Setiap screenshot punya caption dan referensi Test Case ID
- [ ] Tidak ada password, token, atau isi `.env` di dokumen maupun screenshot
- [ ] Tidak ada klaim "100% coverage" atau "aplikasi bebas bug"
- [ ] Bug terpisah dari enhancement suggestion

✅ **Checkpoint 4 (Gate 6, Final Delivery):** `reports/` berisi laporan QA, tutorial
pengguna, dan katalog test case.

---

## 10. Praktikum 6: Retest & Regression

Simulasikan developer memperbaiki bug:

1. Perbaiki bug yang Anda temukan di `latihan/demo-app/` (peran sebagai developer).
2. Jalankan ulang test yang gagal saja, misalnya:
   ```bash
   npx playwright test -g "TC009"
   ```
3. Bukti run sebelumnya otomatis tersimpan di `archive/<waktu>/`, sehingga screenshot
   *sebelum* dan *sesudah* bisa dibandingkan.
4. Jalankan regresi modul terdampak: `npx playwright test tests/latihan/mahasiswa.spec.js`.
5. Minta Claude:
   ```
   Lakukan retest (skill bagian 19). Bandingkan bukti di archive/ dengan run terbaru,
   perbarui status bug di bugs/bugs.json (Fixed → Verified hanya jika retest PASS),
   dan buat ringkasan regression di reports/Regression_Report.docx.
   ```

---

## 11. Menerapkan ke Proyek Nyata

| Langkah | Tindakan |
|---|---|
| 1 | Hapus folder `tests/latihan/` dan `latihan/` (atau biarkan; test latihan otomatis diabaikan bila `BASE_URL` bukan `localhost:4173`). |
| 2 | Isi `BASE_URL` dengan URL **staging/testing**, bukan production bila memungkinkan. |
| 3 | Ganti `APP_NAME`, `TEST_ENV`, dan akun per role (`<ROLE>_USER`, `<ROLE>_PASS`) sesuai role aplikasi Anda. |
| 4 | Jalankan `npm run test:env`, lalu ulangi **Praktikum 1–5** dari awal. |
| 5 | Buat helper login sendiri (contoh: `tests/latihan/helpers.js`) sesuai halaman login aplikasi. |
| 6 | Remote browser (opsional): isi `BROWSER_WS_ENDPOINT` dari provider (mis. Browserless). |

Contoh untuk proyek Laravel lokal:

```bash
# terminal 1, di root proyek Laravel
php artisan serve                 # http://127.0.0.1:8000
# terminal 2, di folder QA
#   .env → BASE_URL=http://127.0.0.1:8000
npm run test:env && claude
```

**Batasan yang wajib dipatuhi** (dari kedua skill): tanpa brute force, tanpa eksploitasi
keamanan, tanpa load test, tanpa mengubah atau menghapus data production, dan tanpa
transaksi nyata kecuali ada izin tertulis.

---

## 12. Troubleshooting

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| Claude tidak mengenal skill | `claude` dijalankan di luar folder `QA/`, atau nama file bukan `SKILL.md` | `cd QA`, cek `.claude/skills/*/SKILL.md`, jalankan ulang `npm run skills:install`, mulai sesi baru |
| `npm run skills:install` gagal clone | Git belum terpasang / tidak ada internet | Pasang Git, cek koneksi, atau pakai Cara B manual |
| `process.loadEnvFile is not a function` | Node.js < 20.6 | Perbarui Node.js ke versi LTS terbaru |
| `browserType.launch: Executable doesn't exist` | Chromium Playwright belum terpasang | `npx playwright install chromium` |
| TC000 gagal `ECONNREFUSED` | Aplikasi target belum berjalan | Jalankan `npm run demo` / server aplikasi Anda |
| `Kredensial untuk role X belum diisi` | `.env` belum memuat `X_USER`/`X_PASS` | Lengkapi `.env` |
| `npm run discover -- --role admin` meminta auth | Sesi belum disimpan | `npm run auth:save -- admin` |
| Test latihan tidak ikut berjalan | `BASE_URL` bukan `localhost:4173` | Memang disengaja (lihat `playwright.config.js`) |
| Screenshot file `.tmp_*.png` tertinggal | Proses dihentikan paksa saat test | Aman dihapus; jalankan `npm run clean` |

---

## 13. Tugas Mandiri & Rubrik Penilaian

**Tugas:** terapkan folder `QA/` pada **aplikasi web hasil proyek Anda sendiri**
(minimal 2 modul dan 1 alur bisnis), lalu kumpulkan:

1. Folder `discovery/` (data, screenshot, dokumen, handover)
2. Folder `tests/` dengan minimal 10 test case (positif, negatif, boundary, akses)
3. `reports/Website_QA_Testing_Report.docx` dan `reports/Website_User_Tutorial.docx`
4. `bugs/bugs.json` (boleh kosong bila memang tidak ada bug, disertai alasan)
5. Video singkat (≤ 5 menit) `npm run test:headed` + penjelasan satu temuan

| Kriteria | Bobot | Indikator nilai penuh |
|---|---|---|
| Discovery berbasis bukti | 20% | Semua halaman/fitur punya screenshot atau sumber; label kepercayaan tepat |
| Kualitas test case & traceability | 25% | REQ → TC → bukti → bug dapat ditelusuri; skenario relevan |
| Eksekusi & bukti | 20% | Hasil nyata, screenshot lengkap, tidak ada kredensial |
| Analisis temuan | 15% | Bug/discrepancy/enhancement dipisah; severity & priority beralasan |
| Dokumen DOCX | 15% | Struktur sesuai skill, statistik benar, keterbatasan ditulis |
| Etika & keamanan | 5% | Mematuhi batasan, `.env`/`auth/` tidak ter-commit |

---

## 14. Lampiran

### A. Struktur folder lengkap setelah praktikum

```
QA/
├── .claude/skills/
│   ├── application-discovery-qa-documentation/SKILL.md
│   └── website-qa-automation-architect/SKILL.md
├── CLAUDE.md                  # aturan kerja Claude di workspace ini
├── MODUL_TUTORIAL.md          # modul ini
├── README.md
├── .env.example  .env         # .env tidak di-commit
├── package.json  playwright.config.js
├── lib/
│   ├── env.js                 # pemuat .env & kredensial
│   ├── fixtures.js            # tc() + evidence.snap() + log error
│   └── global-setup.js        # arsip run lama, info environment
├── scripts/
│   ├── install-skills.js      # pasang skill dari repo GitHub
│   ├── discover.js            # crawler read-only + screenshot
│   ├── save-auth.js           # simpan sesi login manual
│   └── clean.js
├── tests/
│   ├── 00-environment.spec.js
│   └── latihan/               # contoh jawaban untuk SIAKAD Mini
├── latihan/
│   ├── demo-app/              # aplikasi demo
│   ├── server.js
│   └── SPESIFIKASI_DEMO.md
├── auth/                      # (dibuat) sesi login, rahasia
├── discovery/                 # (dibuat) output Tahap 1
├── screenshots/               # (dibuat) bukti test
├── results/                   # (dibuat) JSON, JSONL, HTML report
├── bugs/                      # (dibuat) bugs.json
├── archive/                   # (dibuat) bukti run sebelumnya
└── reports/                   # (dibuat) DOCX/XLSX final
```

### B. Status hasil & rumus

| Status | Arti |
|---|---|
| PASS | actual = expected |
| FAIL | actual ≠ expected |
| BLOCKED | tidak dapat dilanjutkan (`test.skip(true, 'BLOCKED: ...')`) |
| NOT TESTED | belum dieksekusi |
| NOT APPLICABLE | tidak relevan |
| NEEDS REVIEW | butuh klarifikasi spesifikasi |

```
Pass Rate          = PASS / (PASS + FAIL) × 100%
Feature Coverage   = fitur diuji / fitur dalam scope
Requirement Cov.   = requirement diuji / requirement dalam scope
Execution Coverage = test case dieksekusi / test case direncanakan
```

### C. Ringkasan perintah

| Perintah | Fungsi |
|---|---|
| `npm run skills:install` | pasang/perbarui skill dari repo |
| `npm run setup` | install Playwright + Chromium |
| `npm run demo` | jalankan SIAKAD Mini (port 4173) |
| `npm run test:env` | validasi environment |
| `npm run auth:save -- <role>` | simpan sesi login manual |
| `npm run discover [-- --role r --start /path]` | crawler discovery |
| `npm test` / `npm run test:headed` | jalankan test |
| `npm run report:html` | buka laporan HTML Playwright |
| `npm run clean` | hapus results, screenshots, archive |

---

### Catatan untuk Dosen

Aplikasi demo sengaja memuat **satu bug** pada validasi form Tambah Mahasiswa yang
hanya terdeteksi oleh *boundary testing* terhadap REQ-07. Contoh test `TC009` di
`tests/latihan/mahasiswa.spec.js` menghasilkan FAIL dengan screenshot bukti. Mahasiswa
yang hanya menguji skenario positif tidak akan menemukannya. Ini bahan diskusi yang
baik tentang pentingnya test negatif/boundary yang diturunkan dari spesifikasi.
Selain itu, seluruh kontrol akses demo hanya di sisi frontend (tanpa backend). Ini
bahan diskusi *frontend visibility vs backend enforcement* (skill Tahap 1 bagian 5.1).

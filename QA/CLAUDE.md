# CLAUDE.md — Workspace QA

Folder ini adalah workspace QA untuk aplikasi web induknya (folder di atas `QA/`)
atau untuk aplikasi yang URL-nya diisi di `.env` (`BASE_URL`).

## Skill yang tersedia (di `.claude/skills/`)

1. `application-discovery-qa-documentation`: **TAHAP 1**, memahami & mendokumentasikan aplikasi.
2. `website-qa-automation-architect`: **TAHAP 2**, pengujian otomatis berbasis hasil discovery.

Urutan wajib: Discovery → QA Automation. Jika `discovery/` masih kosong saat diminta
QA, sarankan menjalankan Tahap 1 dulu (atau beri label *Exploratory Testing*).

## Perintah yang sudah tersedia (gunakan, jangan menulis ulang)

| Kebutuhan | Perintah |
|---|---|
| Pasang/perbarui skill dari repo | `npm run skills:install` |
| Jalankan aplikasi demo latihan | `npm run demo` (port 4173) |
| Simpan sesi login manual (opsional) | `npm run auth:save -- <role>` |
| Crawl halaman (read-only) + screenshot | `npm run discover [-- --role admin --start /path]` |
| Validasi environment | `npm run test:env` |
| Jalankan seluruh test | `npm test` |
| Laporan HTML Playwright | `npm run report:html` |

Dokumen DOCX/XLSX dibuat sesuai skill (python-docx / openpyxl) dari data nyata di
`discovery/data/`, `results/test-results.json`, `results/evidence.jsonl`, `results/logs.jsonl`,
dan `bugs/bugs.json`. Tulis skrip pembuatnya di `scripts/` agar bisa dijalankan ulang.

## Konvensi folder

```
QA/
├── discovery/            # output TAHAP 1
│   ├── data/discovery.json     (hasil crawler, jangan diedit manual)
│   ├── documents/              (DOCX/XLSX/MD discovery)
│   ├── diagrams/               (Mermaid .mmd)
│   └── screenshots/            (P001_*.png)
├── tests/                # spec Playwright TAHAP 2 (satu file per modul)
├── screenshots/          # bukti test: TC_ID_ROLE_FEATURE_STEPxx_STATUS.png
├── results/              # test-results.json, evidence.jsonl, html report
├── bugs/bugs.json        # bug yang SUDAH dianalisis (bukan otomatis)
├── archive/<waktu>/      # bukti run sebelumnya (untuk retest & regression)
└── reports/              # Website_QA_Testing_Report.docx, Website_User_Tutorial.docx
```

## Aturan menulis test

- Pakai fixture dari `lib/fixtures.js`: `const { test, expect } = require('../lib/fixtures');`
- Judul test diawali Test Case ID: `test('TC001 Login admin valid', ...)`.
- Isi metadata via `tc({...})` (module, feature, requirement, role, type, priority, expected).
- Ambil bukti dengan `await evidence.snap('deskripsi langkah')`. Nama file & status
  (PASS/FAIL) diberikan otomatis setelah test selesai. Field password otomatis di-mask.
- Kredensial hanya dari `.env` melalui `credentials('ROLE')`. Jangan menulis password di kode.
- Fitur yang terblokir: `test.skip(true, 'BLOCKED: alasan')` → tercatat BLOCKED.

## Batasan keamanan (dari kedua skill)

- Tidak brute force, tidak eksploitasi, tidak load test, tidak mengubah/menghapus data production.
- Jika `TEST_ENV=production`: hanya read-only; minta izin eksplisit sebelum aksi yang mengubah data.
- Jangan pernah mencetak isi `.env`, cookie, token, atau file di `auth/`.
- Jangan membuat hasil test, screenshot, atau bug fiktif. Status hanya dari eksekusi nyata.

## Approval gate

Ikuti gate di masing-masing skill. Untuk latihan/demo lokal, eksekusi read-only dan
penambahan data demo boleh berjalan tanpa konfirmasi per klik.

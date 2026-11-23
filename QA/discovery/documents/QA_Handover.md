# QA Handover — SIAKAD MA Nur Muhammad (Panel Dashboard)

**Dokumen:** GATE 5 — QA Handover  
**Tanggal:** 2026-11-23  
**Target:** `http://localhost/dashboard` (login: `/dashboard/login`)  
**Sumber:** Observasi browser Playwright read-only (Phase 0–GATE 2). Tidak ada dokumen spesifikasi; tidak membaca kode aplikasi.  
**Label evidence:** `Verified` | `Observed` | `Inferred` | `Unknown` (tanpa `Documented`).

## 1. Ruang Lingkup

| Item | Status | Evidence | Label |
|---|---|---|---|
| Panel Filament `/dashboard/**` | In scope | Crawl browser | Verified |
| Root `/` JSON `{"Laravel":"13.32.0"}` | Out of scope (REST API belum selesai) | Instruksi pengguna + HTTP probe | Verified |
| Aksi tulis/destruktif (create/edit/delete/bulk/submit bisnis) | Belum diuji; read-only boundary | Batasan eksekusi | Verified |
| API/backend/database internal | Tidak diverifikasi langsung | Tidak ada akses kode/DB | Verified |

## 2. Lingkungan & Akun Uji Teramati

| Role teramati | Akun uji | Hasil login | Menu teramati | Label |
|---|---|---|---|---|
| admin (Filament Shield) | Administrator | Berhasil | Dashboard, Tahun Ajaran, Jurusan, Mata Pelajaran, Guru & Tendik, Siswa, Kelas, Student Enrollments, Roles | Observed |
| teacher (Shield) | Guru A | Berhasil | Dashboard saja | Observed |
| student (Shield) | Budi | Berhasil | Dashboard saja | Observed |
| guest/unauthenticated | - | N/A | Login page; `/dashboard` redirect ke login | Verified |

**Catatan:** Pemetaan akun Guru A→teacher, Budi→student adalah *Inferred* dari nama akun/role Shield; enforcement backend belum diuji.

## 3. Daftar Fitur Siap Uji

Status kesiapan:
- **Siap uji (read-only/UI):** dapat diuji tanpa mengubah data.
- **Siap uji bersyarat:** perlu konfirmasi izin/data uji sebelum aksi tulis/destruktif.
- **Blocked/Belum siap:** butuh kredensial tambahan, spesifikasi, atau lingkungan khusus.

| Test ID | Fitur | Page/Route | Role | Kesiapan | Prioritas | Label |
|---|---|---|---|---|---|---|
| T-AUTH-001 | Redirect unauthenticated ke login | `/dashboard` → `/dashboard/login` | Guest | Siap uji | High | Verified |
| T-AUTH-002 | Login valid | `/dashboard/login` | Admin/Guru/Murid | Siap uji | Critical | Verified |
| T-AUTH-003 | Login invalid/field kosong | `/dashboard/login` | Guest | Siap uji (negative, non-destruktif) | High | Observed UI/Unknown outcome |
| T-AUTH-004 | Logout/Sign out | Dashboard semua role | Admin/Guru/Murid | Siap uji | High | Observed |
| T-NAV-001 | Sidebar menu sesuai role | `/dashboard` | Admin/Guru/Murid | Siap uji | Critical | Observed |
| T-NAV-002 | Akses langsung URL terlarang oleh role rendah | URL admin-only | Guru/Murid | Siap uji bersyarat (read-only) | Critical | Unknown |
| T-DASH-001 | Dashboard widget welcome/nama user | `/dashboard` | Semua role | Siap uji | Medium | Observed |
| T-MST-001 | List Tahun Ajaran | `/dashboard/academic-years` | Admin | Siap uji | High | Observed |
| T-MST-002 | List Jurusan | `/dashboard/majors` | Admin | Siap uji | High | Observed |
| T-MST-003 | List Mata Pelajaran | `/dashboard/subjects` | Admin | Siap uji | High | Observed |
| T-MST-004 | List Guru & Tendik | `/dashboard/teachers` | Admin | Siap uji | High | Observed |
| T-MST-005 | Detail Guru & relasi pengajaran | `/dashboard/teachers/{id}` | Admin | Siap uji | Medium | Observed |
| T-MST-006 | List Siswa | `/dashboard/students` | Admin | Siap uji | High | Observed |
| T-MST-007 | Detail Siswa & enrollment | `/dashboard/students/{id}` | Admin | Siap uji | Medium | Observed |
| T-MST-008 | List Kelas | `/dashboard/class-rooms` | Admin | Siap uji | High | Observed |
| T-ENR-001 | List Student Enrollments | `/dashboard/student-enrollments` | Admin | Siap uji | High | Observed |
| T-ROL-001 | List Roles Shield | `/dashboard/shield/roles` | Admin | Siap uji | Critical | Observed |
| T-ROL-002 | View/Create/Edit Role UI | `/dashboard/shield/roles/*` | Admin | Siap uji UI read-only; submit bersyarat | Critical | Observed |
| T-CRUD-001 | Create/Update/Delete master data | Resource create/edit/delete | Admin | Siap uji bersyarat (butuh izin tulis + data dummy) | Critical | Inferred dari tombol UI |
| T-CRUD-002 | Bulk delete/select all | List resources | Admin | Siap uji bersyarat (destruktif) | High | Observed UI |
| T-TBL-001 | Table controls (search/filter/columns/pagination) | List pages | Admin | Siap uji | Medium | Observed/Unknown perilaku |

## 4. Expected Behavior, Preconditions, dan Langkah Uji

### T-AUTH-001 — Redirect Unauthenticated
- **Preconditions:** Browser bersih/tanpa sesi aktif.
- **Steps:** Buka `http://localhost/dashboard`.
- **Expected:** Redirect ke `http://localhost/dashboard/login`; halaman login tampil.
- **Evidence:** URL final, screenshot.
- **Label:** Verified.

### T-AUTH-002 — Login Valid
- **Preconditions:** Akun uji aktif; kredensial valid.
- **Steps:** Buka login; isi email/password valid; klik Sign in.
- **Expected:** Masuk dashboard; title mengandung “Dashboard”; nama user/welcome sesuai akun; tidak ada error autentikasi.
- **Negative/Boundary:** password salah, email tidak terdaftar, field kosong, format email invalid — *perlu eksekusi*.
- **Label:** Verified (happy path 3 akun).

### T-AUTH-004 — Logout
- **Preconditions:** User sudah login.
- **Steps:** Klik “Sign out”.
- **Expected:** Sesi berakhir; akses `/dashboard` kembali diarahkan ke login; halaman terlindungi tidak dapat diakses via back button (perilaku harus diverifikasi).
- **Label:** Observed UI, Unknown outcome.

### T-NAV-001 — Role-Based Menu
- **Preconditions:** Akun per role tersedia.
- **Steps:** Login sebagai Admin/Guru/Murid; amati sidebar/nav.
- **Expected:** Menu sesuai hak akses role. Teramati: Admin 9 menu; Guru/Murid 1 menu (Dashboard).
- **Label:** Observed.

### T-NAV-002 — Direct URL Authorization
- **Preconditions:** Akun Guru/Murid login.
- **Steps:** Akses langsung URL admin-only (mis. `/dashboard/teachers`, `/dashboard/shield/roles`).
- **Expected:** Akses ditolak (403/redirect/handled error) sesuai policy; **tidak** menampilkan data sensitif. *Belum diverifikasi*.
- **Label:** Unknown.

### T-MST-001..008, T-ENR-001 — List/Detail Resource
- **Preconditions:** Login Admin; data ada (sampel teramati).
- **Steps:** Buka menu; amati kolom tabel, aksi, breadcrumb, filter/column controls; buka detail record.
- **Expected:** Halaman load tanpa error fatal; kolom sesuai data entity; aksi sesuai permission; data konsisten antar list-detail.
- **Label:** Observed.

### T-ROL-001..002 — Shield Roles
- **Preconditions:** Login Admin.
- **Steps:** Buka Roles; amati list; buka view/create/edit role.
- **Expected:** Role `admin`, `teacher`, `student` tampil; permission resources tampil; perubahan permission hanya jika diizinkan dan disubmit secara sadar. **Submit edit/create/delete role: bersyarat**.
- **Label:** Observed.

### T-CRUD-001..002 — Aksi Tulis/Destruktif
- **Preconditions:** Izin eksplisit; environment uji non-production atau data dummy; backup/rollback plan.
- **Steps:** Jalankan create/edit/delete/bulk delete pada resource yang disepakati.
- **Expected:** Validasi form berjalan; data tersimpan/terhapus sesuai aksi; notifikasi sesuai; list/detail ter-refresh; tidak ada side effect tak diinginkan.
- **Label:** Inferred (dari UI), Unknown (perilaku aktual).

## 5. Business Rules (Teramati/Belum Terkonfirmasi)

| BR ID | Aturan | Sumber | Status | Label |
|---|---|---|---|---|
| BR-001 | Akses `/dashboard` membutuhkan autentikasi; guest diarahkan ke login. | Observasi redirect | Teramati | Verified |
| BR-002 | User yang login melihat identitas/nama di welcome widget. | Dashboard widget | Teramati | Observed |
| BR-003 | Menu navigasi berbeda antar role (Admin vs Guru/Murid). | Sidebar per role | Teramati | Observed |
| BR-004 | Role Shield yang ada: `admin`, `teacher`, `student` (guard name/permission detail perlu konfirmasi). | Roles list/view | Teramati | Observed |
| BR-005 | Tahun ajaran memiliki status (contoh: 2026/2027 terlihat). | Academic Years list | Teramati | Observed |
| BR-006 | Enrollment menghubungkan Siswa, Kelas, Tahun Ajaran, tanggal mulai/selesai, status. | Enrollment table/detail | Teramati | Observed |
| BR-007 | Guru memiliki relasi pengajaran: Mata Pelajaran, Kelas, Tahun Ajaran, Semester. | Teacher detail | Teramati | Observed |
| BR-008 | Validasi field wajib/unik/format pada form create/edit. | Belum dieksekusi | Perlu konfirmasi | Unknown |
| BR-009 | Aturan transisi status (aktif/nonaktif/lulus/pindah/dll.). | Belum teramati | Perlu konfirmasi | Unknown |
| BR-010 | Batasan hak akses backend untuk direct URL/API. | Belum diuji | Perlu konfirmasi | Unknown |

## 6. Dependency

| Dep ID | Dependency | Dampak | Label |
|---|---|---|---|
| DEP-001 | Session/auth Laravel + Filament guard | Semua halaman protected bergantung pada login | Observed |
| DEP-002 | Master data (Tahun Ajaran, Jurusan, Mata Pelajaran, Guru, Siswa, Kelas) | Enrollment/detail relasi kemungkinan bergantung pada master data | Inferred |
| DEP-003 | Student Enrollment bergantung pada Siswa, Kelas, Tahun Ajaran | CRUD enrollment dapat gagal jika master tidak tersedia | Inferred |
| DEP-004 | Teacher detail bergantung pada relasi pengajaran/assignment | Tampilan relasi bisa kosong atau error jika relasi tidak ada | Observed (ada kasus "No teachers"/tabel kosong) |
| DEP-005 | Role/Permission Shield bergantung konfigurasi policy/permission | Akses menu/aksi dapat berubah berdasarkan permission | Inferred |
| DEP-006 | Data sampel environment lokal | Hasil uji bisa berbeda di env lain | Observed |

## 7. Keterbatasan Discovery

1. **Tidak ada spesifikasi/dokumen bisnis** — expected behavior formal belum dikonfirmasi pemilik produk.
2. **Read-only boundary** — tidak ada aksi create/edit/delete/bulk/submit bisnis; perilaku tulis hanya *Inferred* dari UI.
3. **Tidak membaca kode/schemas/DB** — struktur data dan enforcement backend tidak diverifikasi.
4. **Coverage role terbatas** — hanya 3 akun uji; role lain atau permission custom belum diketahui.
5. **Guru/Murid hanya Dashboard** — tidak diketahui apakah by design, by permission, atau keterbatasan akun uji.
6. **Environment lokal** — temuan bisa tidak mewakili staging/production.
7. **Data sampel terbatas** — tidak semua edge case/data kosong/data besar diuji.
8. **Aksesibilitas, performa, keamanan mendalam** tidak diuji.
9. **Root `/` API out of scope**.

## 8. Hal yang Butuh Konfirmasi

| ID | Pertanyaan/Konfirmasi | Dampak ke QA | Prioritas |
|---|---|---|---|
| C-001 | Apakah menu Guru/Murid memang hanya Dashboard? | Menentukan expected behavior & test scope role | High |
| C-002 | Apakah ada role lain (TU, Kepala Madrasah, Wali Kelas, Staff, dll.)? | Coverage role/permission matrix | High |
| C-003 | Bolehkan eksekusi aksi tulis pada data dummy/sandbox? Resource mana? | CRUD/negative/boundary testing | High |
| C-004 | Apakah ada aturan bisnis resmi untuk status enrollment/tahun ajaran/kelulusan/pindah? | Test case validasi & transisi status | High |
| C-005 | Apakah delete/bulk delete benar-benar diizinkan? Soft delete/hard delete? | Risk & expected behavior destruktif | Critical |
| C-006 | Apakah Guru/Murid akan punya modul nilai/absensi/jadwal/tugas? | Roadmap & out-of-scope saat ini | Medium |
| C-007 | Apakah ada integrasi (email, notifikasi, export, import, API eksternal)? | Integration testing scope | Medium |
| C-008 | Environment target QA berikutnya: lokal/staging/production-like? | Reproducibility & safety | High |
| C-009 | Kredensial uji resmi dan kebijakan data sensitif/screenshot? | Evidence handling | High |
| C-010 | Apakah expected behavior login error, validasi form, dan permission denied sudah didefinisikan? | Acceptance criteria | Medium |

## 9. Rekomendasi Prioritas Eksekusi QA

1. **P0/Critical:** Auth (login/logout/redirect), role-based menu, direct URL authorization, Shield roles access.
2. **P1/High:** List/detail master data & enrollment, validasi form utama, CRUD aman di sandbox.
3. **P2/Medium:** Table controls (search/filter/sort/columns/pagination), UI consistency, empty states.
4. **P3/Low:** Cosmetic/responsive minor, dokumentasi user.

## 10. Evidence Index

| Evidence | Lokasi | Catatan |
|---|---|---|
| Login attempts | `/tmp/opencode/discovery/login-attempts.json` | Hasil login 3 role |
| Crawl data per role | `/tmp/opencode/discovery/data/admin.json`, `guru.json`, `murid.json`, `all-roles.json` | Temuan halaman/nav/tabel/button |
| Screenshots | `/tmp/opencode/discovery/screenshots/*.png` | Bukti UI read-only |
| Dokumen ini | `QA/discovery/documents/QA_Handover.md` | GATE 5 handover |

## 11. Handover Statement

Dokumen ini siap digunakan sebagai **baseline QA handover awal** berbasis observasi read-only. QA Automation harus memvalidasi ulang perilaku aktual, memperlakukan temuan *Inferred/Unknown* sebagai hipotesis uji, dan membuat discrepancy report jika perilaku aktual berbeda dari ekspektasi yang nanti disetujui.

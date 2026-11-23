from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
from pathlib import Path

wb = Workbook()
ws = wb.active
ws.title = "Test Cases"

headers = [
"Test Case ID","Module ID","Feature ID","Requirement ID","Role/Actor","Objective","Test Type",
"Preconditions","Test Data","Steps","Expected Result","Priority","Scope Status","Evidence Baseline","Notes"
]
ws.append(headers)

rows = [
["TC-AUTH-001","MOD-AUTH","F-001","REQ-AUTH-001","Guest","Memastikan guest yang mengakses dashboard diarahkan ke login","Positive/Functional","Browser tanpa sesi aktif; target dapat diakses","URL: http://localhost/dashboard","1. Buka browser bersih.\n2. Akses http://localhost/dashboard.\n3. Amati URL final dan halaman.","User diarahkan ke /dashboard/login; halaman login tampil; tidak ada data dashboard terbuka.","High","Ready for Testing","Phase 0: redirect terverifikasi","Non-destruktif."],
["TC-AUTH-002","MOD-AUTH","F-002","REQ-AUTH-002","Admin","Memastikan login valid Admin berhasil","Positive/Functional","Akun Admin aktif; halaman login dapat diakses","Email/password Admin uji dari env","1. Buka /dashboard/login.\n2. Isi email & password valid Admin.\n3. Klik Sign in.\n4. Amati dashboard.","Login berhasil; URL /dashboard; title mengandung Dashboard; welcome menampilkan identitas Admin; tidak ada error login.","Critical","Ready for Testing","login-attempts.json: ADMIN success","Gunakan kredensial uji sah."],
["TC-AUTH-003","MOD-AUTH","F-002","REQ-AUTH-002","Guru","Memastikan login valid Guru berhasil dan menu sesuai role","Positive/Functional/Access","Akun Guru aktif","Email/password Guru uji","1. Login sebagai Guru.\n2. Amati dashboard dan sidebar.","Login berhasil; welcome menampilkan nama Guru; sidebar hanya menampilkan Dashboard (baseline teramati).","Critical","Ready for Testing","guru.json: nav Dashboard saja","Expected menu Guru perlu konfirmasi bisnis (C-001)."],
["TC-AUTH-004","MOD-AUTH","F-002","REQ-AUTH-002","Murid","Memastikan login valid Murid berhasil dan menu sesuai role","Positive/Functional/Access","Akun Murid aktif","Email/password Murid uji","1. Login sebagai Murid.\n2. Amati dashboard dan sidebar.","Login berhasil; welcome menampilkan nama Murid; sidebar hanya menampilkan Dashboard (baseline teramati).","Critical","Ready for Testing","murid.json: nav Dashboard saja","Expected menu Murid perlu konfirmasi bisnis (C-001)."],
["TC-AUTH-005","MOD-AUTH","F-002","REQ-AUTH-003","Guest","Memastikan field wajib login tidak dapat disubmit kosong","Negative/Boundary/Validation","Halaman login terbuka","Email: kosong; Password: kosong","1. Buka /dashboard/login.\n2. Kosongkan email dan password.\n3. Klik Sign in.\n4. Amati validasi.","Submit ditolak; browser/field menampilkan validasi required (teramati: 'Please fill out this field.'); user tetap di /dashboard/login; tidak login.","High","Ready for Testing","Observasi 2026-11-23: email/password required=true, checkValidity false","Boundary berasal dari atribut required teramati; pesan browser bisa berbeda per locale/browser."],
["TC-AUTH-006","MOD-AUTH","F-002","REQ-AUTH-003","Guest","Memastikan kredensial invalid tidak memberikan akses dashboard","Negative/Security","Halaman login terbuka","Email: admin@manmuhammad.sch.id; Password: password-salah (dummy invalid)","1. Buka /dashboard/login.\n2. Isi email valid format dengan password salah.\n3. Klik Sign in.\n4. Amati respons.","Login gagal; user tetap di login atau mendapat error autentikasi; tidak masuk /dashboard; tidak ada data dashboard terbuka.","High","Ready for Testing","Belum dieksekusi; berdasarkan perilaku login umum Filament","Gunakan kredensial invalid non-destruktif; jangan brute force."],
["TC-NAV-001","MOD-NAV","F-004","REQ-NAV-001","Admin","Memastikan sidebar Admin menampilkan menu yang teramati","Positive/Functional","Admin login","N/A","1. Login sebagai Admin.\n2. Amati sidebar.\n3. Bandingkan dengan baseline.","Sidebar menampilkan: Dashboard, Tahun Ajaran, Jurusan, Mata Pelajaran, Guru & Tendik, Siswa, Kelas, Student Enrollments, Roles.","Critical","Ready for Testing","admin.json nav 9 item","Jika menu berbeda, catat discrepancy."],
["TC-ACC-001","MOD-ACCESS","F-024","REQ-ACC-001","Guru","Memastikan Guru tidak dapat mengakses URL admin-only secara langsung","Negative/Access Control","Guru login","URL target: /dashboard/teachers","1. Login sebagai Guru.\n2. Akses langsung /dashboard/teachers.\n3. Amati respons.","Akses ditolak/redirect/403 sesuai policy; data guru tidak ditampilkan. Expected detail perlu konfirmasi (C-010).","Critical","Partially Testable","Belum diuji; Guru hanya lihat Dashboard","Read-only check; jangan bypass auth."],
["TC-ACC-002","MOD-ACCESS","F-024","REQ-ACC-001","Murid","Memastikan Murid tidak dapat mengakses Shield Roles secara langsung","Negative/Access Control","Murid login","URL target: /dashboard/shield/roles","1. Login sebagai Murid.\n2. Akses langsung /dashboard/shield/roles.\n3. Amati respons.","Akses ditolak/redirect/403 sesuai policy; permission/role data tidak terbuka.","Critical","Partially Testable","Belum diuji; Murid hanya lihat Dashboard","Read-only check; data sensitif permission."],
["TC-MST-001","MOD-MASTER","F-007","REQ-MST-001","Admin","Memastikan halaman list Tahun Ajaran dapat dibuka dan menampilkan kolom utama","Positive/Functional","Admin login","Menu Tahun Ajaran","1. Login Admin.\n2. Buka Tahun Ajaran.\n3. Amati tabel/aksi.","Halaman terbuka; tabel memuat kolom Tahun Ajaran dan Status (teramati); tombol/aksi list terlihat; tidak ada error fatal.","High","Ready for Testing","ADMIN-P002 screenshot/data","Tidak klik aksi tulis/destruktif."],
["TC-MST-002","MOD-MASTER","F-014","REQ-MST-002","Admin","Memastikan detail Guru menampilkan relasi pengajaran","Positive/Workflow/Data Relation","Admin login; data guru ada","URL /dashboard/teachers/1","1. Login Admin.\n2. Buka Guru & Tendik.\n3. Buka detail guru.\n4. Amati tabel relasi.","Detail guru tampil; tabel relasi memuat Mata Pelajaran, Kelas, Tahun Ajaran, Semester; filter terlihat; empty state ditangani jika tidak ada relasi.","Medium","Ready for Testing","ADMIN-P010..013","Boundary/empty state teramati pada teacher id 4 (No teachers)."],
["TC-ENR-001","MOD-ENROLLMENT","F-021","REQ-ENR-001","Admin","Memastikan list Student Enrollments menampilkan kolom utama","Positive/Functional","Admin login","Menu Student Enrollments","1. Login Admin.\n2. Buka Student Enrollments.\n3. Amati tabel.","Tabel menampilkan Siswa, Kelas, Tahun Ajaran, Tanggal Mulai, Tanggal Selesai, Status; data sampel tampil.","High","Ready for Testing","ADMIN-P008","Read-only."],
]

for r in rows: ws.append(r)

# styles
header_fill = PatternFill('solid',fgColor='1F4E79')
header_font = Font(color='FFFFFF', bold=True)
for c in ws[1]:
    c.fill = header_fill
    c.font = header_font
    c.alignment = Alignment(wrap_text=True, vertical='top')
ws.freeze_panes='A2'
ws.auto_filter.ref = ws.dimensions
widths = {'A':14,'B':14,'C':10,'D':14,'E':12,'F':34,'G':20,'H':28,'I':28,'J':40,'K':42,'L':10,'M':16,'N':28,'O':30}
for col,w in widths.items(): ws.column_dimensions[col].width=w
for row in ws.iter_rows(min_row=2):
    for cell in row:
        cell.alignment = Alignment(wrap_text=True, vertical='top')

# Summary sheet
ws2 = wb.create_sheet('Summary')
ws2.append(['Metric','Value'])
summary=[
    ['Total Test Cases',len(rows)],
    ['Ready for Testing',sum(1 for r in rows if r[12]=='Ready for Testing')],
    ['Partially Testable',sum(1 for r in rows if r[12]=='Partially Testable')],
    ['Blocked',sum(1 for r in rows if r[12]=='Blocked')],
    ['Positive',sum(1 for r in rows if 'Positive' in r[6])],
    ['Negative',sum(1 for r in rows if 'Negative' in r[6])],
    ['Boundary',sum(1 for r in rows if 'Boundary' in r[6])],
    ['Access Control',sum(1 for r in rows if 'Access' in r[6] or 'Security' in r[6])],
    ['Workflow/Data Relation',sum(1 for r in rows if 'Workflow' in r[6] or 'Data Relation' in r[6])],
]
for s in summary: ws2.append(s)
for c in ws2[1]: c.font=Font(bold=True)
ws2.column_dimensions['A'].width=28
ws2.column_dimensions['B'].width=12

out = Path('/home/skyson/Documents/siakad-manm/QA/reports/Test_Case_Catalogue.xlsx')
wb.save(out)
print(out)

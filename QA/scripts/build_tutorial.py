#!/usr/bin/env python3
"""Build Website_User_Tutorial.docx from discovery/screenshots.
Roles only those actually discovered: admin, teacher, student (Shield). No credentials.
"""
from __future__ import annotations
import datetime as dt
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
SCREENSHOTS = ROOT / 'screenshots'
DISCOVERY_SHOTS = ROOT / 'discovery' / 'screenshots'
OUT = ROOT / 'reports' / 'Website_User_Tutorial.docx'

ROLES = [
    {
        'id': 'admin', 'name': 'Administrator (admin)', 'label': 'Observed',
        'menus': ['Dashboard','Tahun Ajaran','Jurusan','Mata Pelajaran','Guru & Tendik','Siswa','Kelas','Student Enrollments','Roles'],
    },
    {
        'id': 'teacher', 'name': 'Guru (teacher)', 'label': 'Observed (pemetaan akun Guru A→teacher Inferred)',
        'menus': ['Dashboard'],
    },
    {
        'id': 'student', 'name': 'Murid (student)', 'label': 'Observed (pemetaan akun Budi→student Inferred)',
        'menus': ['Dashboard'],
    },
]

# Screenshot per menu/role dari discovery/screenshots/
ADMIN_MENU_SHOTS = {
    'Dashboard': 'P001_ADMIN_dashboard.png',
    'Tahun Ajaran': 'P002_ADMIN_dashboard-academic-years.png',
    'Jurusan': 'P003_ADMIN_dashboard-majors.png',
    'Mata Pelajaran': 'P004_ADMIN_dashboard-subjects.png',
    'Guru & Tendik': 'P005_ADMIN_dashboard-teachers.png',
    'Siswa': 'P006_ADMIN_dashboard-students.png',
    'Kelas': 'P007_ADMIN_dashboard-class-rooms.png',
    'Student Enrollments': 'P008_ADMIN_dashboard-student-enrollments.png',
    'Roles': 'P009_ADMIN_dashboard-shield-roles.png',
}
ROLE_DASHBOARD_SHOTS = {
    'admin': 'P001_ADMIN_dashboard.png',
    'teacher': 'P001_GURU_dashboard.png',
    'student': 'P001_MURID_dashboard.png',
}


def set_run_font(doc):
    style = doc.styles['Normal']
    style.font.name = 'Arial'
    style._element.rPr.rFonts.set(qn('w:eastAsia'), 'Arial')
    style.font.size = Pt(11)
    style.paragraph_format.space_after = Pt(6)
    style.paragraph_format.line_spacing = 1.15

def set_margins(doc):
    for s in doc.sections:
        s.page_width = Cm(21.0); s.page_height = Cm(29.7)
        s.left_margin = Cm(2.54); s.right_margin = Cm(2.54)
        s.top_margin = Cm(2.54); s.bottom_margin = Cm(2.54)

def add_page_number_footer(doc):
    for section in doc.sections:
        footer = section.footer
        footer.is_linked_to_previous = False
        p = footer.paragraphs[0] if footer.paragraphs else footer.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run('SIAKAD MA Nur Muhammad - User Tutorial | Halaman ')
        run.font.size = Pt(9)
        fld = OxmlElement('w:fldSimple'); fld.set(qn('w:instr'), 'PAGE')
        r = OxmlElement('w:r'); t = OxmlElement('w:t'); t.text='1'; r.append(t); fld.append(r); p._p.append(fld)
        r2=p.add_run(' dari '); r2.font.size=Pt(9)
        fld2=OxmlElement('w:fldSimple'); fld2.set(qn('w:instr'),'NUMPAGES')
        r3=OxmlElement('w:r'); t2=OxmlElement('w:t'); t2.text='1'; r3.append(t2); fld2.append(r3); p._p.append(fld2)

def style_table(table):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i,row in enumerate(table.rows):
        for cell in row.cells:
            for para in cell.paragraphs:
                for run in para.runs:
                    run.font.size = Pt(9); run.font.name='Arial'
                    run._element.rPr.rFonts.set(qn('w:eastAsia'),'Arial')
                    if i==0: run.bold=True
            shading = OxmlElement('w:shd')
            shading.set(qn('w:fill'),'D9E2F3' if i==0 else ('F2F2F2' if i%2==0 else 'FFFFFF'))
            cell._tc.get_or_add_tcPr().append(shading)

def add_caption(doc, text):
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=p.add_run(text); r.italic=True; r.font.size=Pt(9)

def add_toc(doc):
    doc.add_paragraph().add_run('Daftar Isi').bold=True
    doc.paragraphs[-1].runs[0].font.size=Pt(14)
    doc.add_paragraph('(Perbarui field di Word/LibreOffice: klik kanan daftar isi > Update Field)')
    p=doc.add_paragraph()
    fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'TOC \\o "1-3" \\h \\z \\u')
    p._p.append(fld)
    doc.add_page_break()

def find_screenshot(*patterns):
    for base in [DISCOVERY_SHOTS, SCREENSHOTS]:
        if not base.exists(): continue
        for pat in patterns:
            for p in base.glob(pat):
                return p
    return None

def add_img(doc, path, caption):
    if path and path.exists():
        doc.add_picture(str(path), width=Inches(6.5))
        add_caption(doc, caption)
    else:
        p=doc.add_paragraph()
        r=p.add_run(f"[Screenshot tidak tersedia: {caption}]"); r.italic=True; r.font.size=Pt(9)

def main():
    doc = Document()
    set_run_font(doc); set_margins(doc); add_page_number_footer(doc)

    for _ in range(2): doc.add_paragraph()
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=p.add_run('PANDUAN PENGGUNA WEBSITE\n'); r.bold=True; r.font.size=Pt(28); r.font.color.rgb=RGBColor(0x1F,0x4E,0x79)
    p2=doc.add_paragraph(); p2.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=p2.add_run('Sistem Informasi Akademik MA Nur Muhammad\n'); r.bold=True; r.font.size=Pt(20)
    p3=doc.add_paragraph(); p3.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=p3.add_run('Panel Dashboard Filament (/dashboard)\n'); r.font.size=Pt(14)
    doc.add_paragraph()
    t=doc.add_table(rows=1,cols=2); t.style='Table Grid'
    t.rows[0].cells[0].text='Field'; t.rows[0].cells[1].text='Value'
    for k,v in [
        ('Aplikasi','Sistem Informasi Akademik MA Nur Muhammad'),
        ('URL', 'http://localhost/dashboard'),
        ('Tanggal Dokumen', dt.date.today().isoformat()),
        ('Sumber', 'Discovery read-only + discovery/screenshots/'),
        ('Role Terdokumentasi', ', '.join(r['name'] for r in ROLES)),
        ('Kredensial', 'Tidak disertakan dalam dokumen ini.'),
    ]:
        row=t.add_row().cells; row[0].text=k; row[1].text=v
    style_table(t)
    doc.add_page_break()
    add_toc(doc)

    doc.add_heading('1. Pendahuluan',1)
    doc.add_paragraph('Dokumen ini menjelaskan panduan penggunaan dasar panel dashboard SIAKAD MA Nur Muhammad berdasarkan observasi aktual. Langkah yang belum diverifikasi diberi label [Belum Terverifikasi].')
    doc.add_heading('1.1 Role yang Ditemukan',2)
    t=doc.add_table(rows=1,cols=3); t.style='Table Grid'
    for i,h in enumerate(['Role','Menu Teramati','Label Evidence']): t.rows[0].cells[i].text=h
    for role in ROLES:
        r=t.add_row().cells
        r[0].text=role['name']; r[1].text=', '.join(role['menus']); r[2].text=role['label']
    style_table(t)
    doc.add_paragraph()

    doc.add_heading('2. Akses Aplikasi',1)
    doc.add_paragraph('1. Buka browser dan akses http://localhost/dashboard. [Terverifikasi: redirect ke login saat belum autentikasi]')
    doc.add_paragraph('2. Pada halaman login, masukkan Email address dan Password akun yang sah. [Terverifikasi: form login teramati]')
    doc.add_paragraph('3. Opsional: centang "Remember me". [Belum Terverifikasi: efek persistensi sesi]')
    doc.add_paragraph('4. Klik tombol "Sign in". [Terverifikasi: login berhasil untuk akun uji role yang ditemukan]')
    doc.add_paragraph('5. Untuk keluar, klik "Sign out" di dashboard. [Belum Terverifikasi: invalidasi sesi/logout lengkap]')
    login_img = find_screenshot('TC-AUTH-001_GUEST_AUTH_REDIRECT_STEP01_PASS.png')
    add_img(doc, login_img, 'Gambar - Halaman Login / Akses Dashboard')

    doc.add_heading('3. Panduan per Role',1)
    for idx, role in enumerate(ROLES, start=1):
        doc.add_heading(f"3.{idx} {role['name']}",2)
        doc.add_paragraph(f"Status evidence: {role['label']}.")
        doc.add_heading('Menu/Navigasi Teramati',3)
        for m in role['menus']:
            doc.add_paragraph(m, style='List Bullet')
        doc.add_paragraph('Catatan: Hanya menu yang benar-benar teramati saat discovery yang dicantumkan. [Belum Terverifikasi: apakah ada menu tambahan sesuai permission lain].')

        if role['id']=='admin':
            doc.add_heading('Fitur/Menu per Halaman (Teramati)',3)
            menu_desc = {
                'Dashboard': 'Melihat welcome widget dan informasi panel. [Terverifikasi: UI teramati]',
                'Tahun Ajaran': 'Melihat daftar tahun ajaran. Aksi tambah/edit/hapus terlihat. [Belum Terverifikasi: perilaku simpan/hapus]',
                'Jurusan': 'Melihat daftar jurusan. Aksi tambah/edit/hapus terlihat. [Belum Terverifikasi: perilaku simpan/hapus]',
                'Mata Pelajaran': 'Melihat daftar mata pelajaran. Aksi tambah/edit/hapus terlihat. [Belum Terverifikasi: perilaku simpan/hapus]',
                'Guru & Tendik': 'Melihat daftar/detail guru dan relasi pengajaran. Aksi tambah/edit/hapus terlihat. [Belum Terverifikasi: perilaku simpan/hapus]',
                'Siswa': 'Melihat daftar/detail siswa dan enrollment. Aksi tambah/edit/hapus terlihat. [Belum Terverifikasi: perilaku simpan/hapus]',
                'Kelas': 'Melihat daftar kelas. Aksi tambah terlihat. [Belum Terverifikasi: perilaku simpan/ubah/hapus]',
                'Student Enrollments': 'Melihat daftar enrollment siswa. Aksi tambah terlihat. [Belum Terverifikasi: perilaku simpan/ubah/hapus]',
                'Roles': 'Melihat daftar role/permission (Filament Shield). Aksi create/edit/delete terlihat. [Belum Terverifikasi: submit perubahan permission]',
            }
            for menu in role['menus']:
                doc.add_heading(menu,4)
                doc.add_paragraph(menu_desc.get(menu, 'Menu teramati. [Belum Terverifikasi]'))
                shot = find_screenshot(ADMIN_MENU_SHOTS.get(menu, ''))
                add_img(doc, shot, f"Gambar - Admin - Menu {menu} (discovery/screenshots)")
        else:
            doc.add_heading('Fitur/Menu per Halaman (Teramati)',3)
            doc.add_paragraph('Dashboard: menampilkan welcome widget dan identitas pengguna. [Terverifikasi: halaman dashboard tampil setelah login].')
            doc.add_paragraph('[Belum Terverifikasi] Apakah role ini memiliki akses modul lain di luar Dashboard pada konfigurasi/akun berbeda.')
            shot = find_screenshot(ROLE_DASHBOARD_SHOTS.get(role['id'],''))
            add_img(doc, shot, f"Gambar - {role['name']} - Dashboard (discovery/screenshots)")

    doc.add_heading('4. Troubleshooting / Catatan',1)
    notes=[
        'Jika setelah login tetap di halaman login, periksa kredensial dan status akun. [Belum Terverifikasi: pesan error spesifik untuk semua kasus].',
        'Jika akses URL tertentu ditolak, kemungkinan role tidak memiliki permission. [Terverifikasi sebagian: Guru/Murid mendapat 403 saat akses URL admin-only teramati].',
        'Aksi create/edit/delete/bulk delete belum diuji; jangan gunakan data produksi untuk percobaan. [Belum Terverifikasi].',
        'Root endpoint / bukan antarmuka web pengguna dan di luar scope tutorial ini.',
    ]
    for n in notes: doc.add_paragraph(n, style='List Bullet')

    doc.add_heading('5. Keterbatasan Dokumentasi',1)
    for l in [
        'Dokumen berbasis observasi read-only; tidak ada spesifikasi bisnis resmi.',
        'Tidak ada kredensial disertakan.',
        'Langkah/fitur yang belum dieksekusi ditandai [Belum Terverifikasi].',
        'Screenshot menu per role diambil dari discovery/screenshots/ sesuai temuan discovery.',
    ]:
        doc.add_paragraph(l, style='List Bullet')

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUT)
    print(OUT)

if __name__ == '__main__':
    main()

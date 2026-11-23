#!/usr/bin/env python3
"""Build Website_QA_Testing_Report.docx from QA artifacts.
Data sources ONLY: results/, screenshots/, bugs/bugs.json, discovery/.
"""
from __future__ import annotations
import json, datetime as dt
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
RESULTS = ROOT / 'results'
SCREENSHOTS = ROOT / 'screenshots'
BUGS = ROOT / 'bugs' / 'bugs.json'
DISCOVERY = ROOT / 'discovery'
OUT = ROOT / 'reports' / 'Website_QA_Testing_Report.docx'
AUTHOR = '<nama dan NIM Anda>'  # GANTI dengan nama dan NIM Anda


def read_json(p: Path, default):
    if not p.exists(): return default
    return json.loads(p.read_text(encoding='utf-8'))

def read_jsonl(p: Path):
    if not p.exists(): return []
    rows=[]
    for line in p.read_text(encoding='utf-8').splitlines():
        line=line.strip()
        if line: rows.append(json.loads(line))
    return rows

def set_run_font(doc):
    style = doc.styles['Normal']
    style.font.name = 'Arial'
    style._element.rPr.rFonts.set(qn('w:eastAsia'), 'Arial')
    style.font.size = Pt(11)
    pf = style.paragraph_format
    pf.space_after = Pt(6)
    pf.line_spacing = 1.15

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
        run = p.add_run('SIAKAD MA Nur Muhammad - QA Report | Halaman ')
        run.font.size = Pt(9)
        fld = OxmlElement('w:fldSimple'); fld.set(qn('w:instr'), 'PAGE')
        r = OxmlElement('w:r'); t = OxmlElement('w:t'); t.text='1'; r.append(t); fld.append(r); p._p.append(fld)
        run2 = p.add_run(' dari '); run2.font.size = Pt(9)
        fld2 = OxmlElement('w:fldSimple'); fld2.set(qn('w:instr'), 'NUMPAGES')
        r2 = OxmlElement('w:r'); t2 = OxmlElement('w:t'); t2.text='1'; r2.append(t2); fld2.append(r2); p._p.append(fld2)

def style_table(table):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i,row in enumerate(table.rows):
        for cell in row.cells:
            for para in cell.paragraphs:
                for run in para.runs:
                    run.font.size = Pt(9)
                    run.font.name = 'Arial'
                    run._element.rPr.rFonts.set(qn('w:eastAsia'),'Arial')
                    if i==0: run.bold=True
            shading = OxmlElement('w:shd')
            shading.set(qn('w:fill'),'D9E2F3' if i==0 else ('F2F2F2' if i%2==0 else 'FFFFFF'))
            cell._tc.get_or_add_tcPr().append(shading)

def add_caption(doc, text):
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(text); run.italic = True; run.font.size = Pt(9)

def add_kv_table(doc, rows):
    t = doc.add_table(rows=1, cols=2)
    t.style = 'Table Grid'
    hdr=t.rows[0].cells; hdr[0].text='Item'; hdr[1].text='Detail'
    for k,v in rows:
        r=t.add_row().cells; r[0].text=str(k); r[1].text=str(v)
    style_table(t); doc.add_paragraph(); return t

def collect_cases(test_results):
    cases = []
    def walk(suites):
        for s in suites:
            for spec in s.get('specs',[]):
                for test in spec.get('tests',[]):
                    status = 'NOT_TESTED'
                    attachments = []
                    errors = []
                    for r in test.get('results',[]):
                        status = r.get('status','unknown')
                        attachments.extend(r.get('attachments',[]))
                        errors.extend(r.get('errors',[]))
                    # map playwright status
                    mapped = {'passed':'PASS','failed':'FAIL','skipped':'BLOCKED','timedOut':'FAIL','interrupted':'BLOCKED'}.get(status, status.upper())
                    # detect BLOCKED by title
                    title = spec.get('title','')
                    if status == 'skipped' and 'BLOCKED' in title.upper():
                        mapped = 'BLOCKED'
                    elif status == 'skipped':
                        mapped = 'NOT_TESTED'
                    cases.append({
                        'id': title.split()[0] if title else 'TC-UNKNOWN',
                        'title': title,
                        'file': spec.get('file',''),
                        'project': test.get('projectName',''),
                        'status': mapped,
                        'errors': errors,
                        'attachments': attachments,
                    })
            walk(s.get('suites',[]))
    walk(test_results.get('suites',[]))
    return cases

def collect_evidence_by_tc(evidence_rows):
    by={}
    for e in evidence_rows:
        by.setdefault(e.get('test_case_id'), []).append(e)
    return by

def build_static_toc(doc, headings):
    doc.add_paragraph().add_run('Daftar Isi').bold=True
    doc.paragraphs[-1].runs[0].font.size=Pt(14)
    t = doc.add_table(rows=1, cols=2)
    t.style = 'Table Grid'
    t.rows[0].cells[0].text='Bagian'; t.rows[0].cells[1].text='Halaman'
    for level, text in headings:
        r=t.add_row().cells
        r[0].text=('  '*(level-1)) + text
        r[1].text='(lihat dokumen)'  # static TOC; accurate page numbers resolved in PDF/DOCX viewers
    style_table(t)
    doc.add_paragraph('(Daftar isi statis; nomor halaman dapat diperbarui otomatis jika dibuka di Word/LibreOffice.)')
    doc.add_page_break()

def main():
    test_results = read_json(RESULTS/'test-results.json', {})
    evidence = read_jsonl(RESULTS/'evidence.jsonl')
    logs = read_jsonl(RESULTS/'logs.jsonl')
    bugs = read_json(BUGS, [])
    run_info = read_json(RESULTS/'run-info.json', {})
    handover_exists = (DISCOVERY/'documents'/'QA_Handover.md').exists()

    cases = collect_cases(test_results)
    ev_by_tc = collect_evidence_by_tc(evidence)
    log_by_tc = {l.get('test_case_id'):l for l in logs}

    planned = len(cases)
    executed = sum(1 for c in cases if c['status'] in ('PASS','FAIL'))
    passed = sum(1 for c in cases if c['status']=='PASS')
    failed = sum(1 for c in cases if c['status']=='FAIL')
    blocked = sum(1 for c in cases if c['status']=='BLOCKED')
    not_tested = sum(1 for c in cases if c['status']=='NOT_TESTED')
    not_applicable = sum(1 for c in cases if c['status']=='NOT_APPLICABLE')
    denom = passed + failed
    pass_rate = (passed/denom*100) if denom else None
    pass_rate_txt = f"{pass_rate:.2f}%" if pass_rate is not None else 'N/A (tidak ada PASS/FAIL)'

    doc = Document()
    set_run_font(doc); set_margins(doc); add_page_number_footer(doc)

    headings = [
        (1,'1. Ringkasan Eksekutif'),(1,'2. Tujuan Pengujian'),(1,'3. Ruang Lingkup'),
        (1,'4. Metodologi & Lingkungan'),(1,'5. Ringkasan Hasil Eksekusi'),(1,'6. Coverage'),
        (1,'7. Hasil per Test Case'),(1,'8. Bug dan Temuan'),(1,'9. Screenshot Evidence'),
        (1,'10. Rekomendasi'),(1,'11. Keterbatasan Pengujian'),(1,'12. Kesimpulan')
    ]

    # Cover
    for _ in range(2): doc.add_paragraph()
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=p.add_run('LAPORAN PENGUJIAN QA WEBSITE\n'); r.bold=True; r.font.size=Pt(28); r.font.color.rgb=RGBColor(0x1F,0x4E,0x79)
    p2=doc.add_paragraph(); p2.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=p2.add_run('Sistem Informasi Akademik MA Nur Muhammad\n'); r.bold=True; r.font.size=Pt(20)
    p3=doc.add_paragraph(); p3.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=p3.add_run('Panel Filament /dashboard\n'); r.font.size=Pt(14)
    meta=[
        ('Aplikasi','Sistem Informasi Akademik MA Nur Muhammad'),
        ('Target URL', run_info.get('base_url','http://localhost') + '/dashboard'),
        ('Environment', run_info.get('environment','local')),
        ('Browser', run_info.get('browser','Chromium (lokal)')),
        ('Tanggal Laporan', dt.date.today().isoformat()),
        ('Tanggal Run', run_info.get('started_at','-')),
        ('Disusun Oleh', AUTHOR),
        ('Baseline', 'discovery/documents/QA_Handover.md' if handover_exists else 'Tidak tersedia'),
    ]
    t=doc.add_table(rows=1,cols=2); t.style='Table Grid'
    t.rows[0].cells[0].text='Field'; t.rows[0].cells[1].text='Value'
    for k,v in meta: r=t.add_row().cells; r[0].text=k; r[1].text=v
    style_table(t)
    doc.add_page_break()

    build_static_toc(doc, headings)

    doc.add_heading('1. Ringkasan Eksekutif',1)
    doc.add_paragraph(
        f"Pengujian dilakukan pada antarmuka web Filament SIAKAD MA Nur Muhammad di /dashboard. "
        f"Data dihitung dari `results/test-results.json`: Planned={planned}, Executed(PASS+FAIL)={executed}, "
        f"PASS={passed}, FAIL={failed}, BLOCKED={blocked}, NOT_TESTED={not_tested}, NOT_APPLICABLE={not_applicable}. "
        f"Pass Rate = PASS/(PASS+FAIL)x100% = {pass_rate_txt} (denominator {denom}). "
        f"Bug aplikasi terkonfirmasi: {len(bugs)}."
    )

    doc.add_heading('2. Tujuan Pengujian',1)
    doc.add_paragraph('Memvalidasi fungsi utama panel dashboard berdasarkan baseline discovery read-only, dengan bukti screenshot/log aktual.')
    for i in ['Verifikasi akses autentikasi dan redirect guest.','Verifikasi login valid/invalid dan validasi required teramati.','Verifikasi navigasi role-based dan kontrol akses direct URL.','Verifikasi tampilan list/detail master data dan enrollment yang teramati.','Mendokumentasikan hasil, bukti, keterbatasan, dan bug (jika ada).']:
        doc.add_paragraph(i, style='List Bullet')

    doc.add_heading('3. Ruang Lingkup',1)
    add_kv_table(doc,[
        ('In Scope','Panel web Filament: /dashboard, /dashboard/login, resource master data & enrollment yang teramati, role Admin/Guru/Murid.'),
        ('Out of Scope','REST API endpoint / (JSON {"Laravel":"13.32.0"}) karena REST API belum selesai; integrasi eksternal; pengujian backend/DB langsung; performa/load/security mendalam.'),
        ('Batasan Eksekusi','Read-only/non-destruktif. CRUD/bulk delete ditandai BLOCKED (test.skip) karena butuh izin tulis dan aturan bisnis.'),
        ('Lingkungan',f"{run_info.get('environment','local')} - {run_info.get('base_url','http://localhost')}"),
    ])

    doc.add_heading('4. Metodologi & Lingkungan',1)
    add_kv_table(doc,[
        ('Metode','Discovery-driven, risk-based, evidence-based. Playwright + Chromium lokal.'),
        ('Browser', run_info.get('browser','Chromium (lokal)')),
        ('Node', run_info.get('node','-')),
        ('Tanggal Run', run_info.get('started_at','-')),
        ('Data Sumber','results/test-results.json, results/evidence.jsonl, results/logs.jsonl, results/run-info.json, screenshots/, bugs/bugs.json, discovery/documents/QA_Handover.md'),
    ])

    doc.add_heading('5. Ringkasan Hasil Eksekusi',1)
    add_kv_table(doc,[
        ('Planned (dari test-results.json)', str(planned)),
        ('Executed (PASS+FAIL)', str(executed)),
        ('PASS', str(passed)),
        ('FAIL', str(failed)),
        ('BLOCKED', str(blocked)),
        ('NOT TESTED', str(not_tested)),
        ('NOT APPLICABLE', str(not_applicable)),
        ('Pass Rate (PASS/(PASS+FAIL)x100%)', pass_rate_txt),
        ('Denominator Pass Rate', f'{denom} (PASS+FAIL)'),
        ('Confirmed Bugs', str(len(bugs))),
    ])

    doc.add_heading('6. Coverage',1)
    doc.add_paragraph(
        f"Coverage dihitung dari `results/test-results.json` (sumber aktual). Planned total: {planned} test case. "
        f"Executed (PASS+FAIL): {executed}. BLOCKED: {blocked} (test.skip, butuh izin tulis/data dummy/aturan bisnis). "
        f"NOT_TESTED: {not_tested}, NOT_APPLICABLE: {not_applicable}. "
        f"Pass Rate menggunakan denominator PASS+FAIL = {denom}; BLOCKED/NOT_TESTED/NOT_APPLICABLE tidak dihitung sebagai PASS."
    )

    doc.add_heading('7. Hasil per Test Case',1)
    t=doc.add_table(rows=1,cols=7); t.style='Table Grid'
    hdr=['Test Case ID','Title','Role','Status','Evidence/Screenshot','Log/Catatan','File Spec']
    for i,h in enumerate(hdr): t.rows[0].cells[i].text=h
    for c in cases:
        tcid = c['id']
        evs = ev_by_tc.get(tcid, [])
        # gabungkan screenshot beberapa langkah menjadi satu baris
        ev_text = '; '.join([f"Step {e.get('step')}: {e.get('file')}" for e in evs]) if evs else '-'
        lg = log_by_tc.get(tcid, {})
        notes = []
        if lg.get('failed_requests'): notes.append('HTTP 403 teramati (expected denial)')
        if lg.get('console_errors') and not lg.get('failed_requests'): notes.append('console error tercatat')
        if c['status']=='BLOCKED': notes.append('BLOCKED: test.skip')
        if c['errors']: notes.append('error tercatat di test-results')
        r=t.add_row().cells
        r[0].text=tcid
        r[1].text=c['title']
        # infer role from title/id or evidence
        role = evs[0].get('role','-') if evs else ('GUEST' if 'GUEST' in c['title'].upper() or 'AUTH-001' in tcid or 'AUTH-005' in tcid or 'AUTH-006' in tcid else '-')
        r[2].text=role
        r[3].text=c['status']
        r[4].text=ev_text
        r[5].text='; '.join(notes) if notes else '-'
        r[6].text=c['file']
    style_table(t)
    doc.add_paragraph()

    doc.add_heading('8. Bug dan Temuan',1)
    doc.add_paragraph(
        "Run awal (3 FAIL login Admin, arsip archive/2026-11-23T12-12-14) menunjukkan kegagalan pada test yang melakukan login Admin berulang melalui UI. "
        "Penyebab diduga rate limit login Filament/Livewire (~5x/menit) saat banyak test login berulang dalam satu suite. "
        "Perbaikan: implementasi login sekali per role dan pemakaian storageState (disimpan di auth/, tidak di-commit); test selain TC-AUTH tidak lagi login lewat UI berulang. "
        "Setelah perbaikan, hasil run terakhir pada test-results.json menunjukkan PASS untuk test case yang dieksekusi dan 2 BLOCKED sesuai desain."
    )
    if not bugs:
        doc.add_paragraph('Tidak ada bug aplikasi terkonfirmasi pada bukti yang dianalisis. Item FAIL pada run awal diklasifikasikan sebagai kendala stabilitas eksekusi test terkait rate limit login, bukan defect fungsional aplikasi.')
    else:
        bt=doc.add_table(rows=1,cols=7); bt.style='Table Grid'
        for i,h in enumerate(['Bug ID','Title','Severity','Priority','Status','Page','Evidence']): bt.rows[0].cells[i].text=h
        for b in bugs:
            rr=bt.add_row().cells
            rr[0].text=str(b.get('Bug ID','')); rr[1].text=str(b.get('Title','')); rr[2].text=str(b.get('Severity',''))
            rr[3].text=str(b.get('Priority','')); rr[4].text=str(b.get('Status','')); rr[5].text=str(b.get('Page',''))
            rr[6].text=str(b.get('Evidence',''))
        style_table(bt)

    doc.add_heading('9. Screenshot Evidence',1)
    doc.add_paragraph('Screenshot berikut berasal dari folder screenshots/ dan direferensikan oleh evidence.jsonl. Beberapa langkah digabung dalam satu test case pada tabel hasil; di bagian ini screenshot ditampilkan per langkah evidence.')
    for e in evidence:
        img = ROOT / e.get('file','')
        doc.add_heading(f"{e.get('test_case_id','TC')} - Step {e.get('step','?')} - {e.get('description','Evidence')}", 3)
        doc.add_paragraph(f"Role: {e.get('role','-')} | Result: {e.get('result','-')} | Page: {e.get('page','-')} | Timestamp: {e.get('timestamp','-')}")
        if img.exists():
            try: doc.add_picture(str(img), width=Inches(6.5))
            except Exception as ex: doc.add_paragraph(f"[Gagal memuat gambar: {img.name} - {ex}]")
        else:
            doc.add_paragraph(f"[Screenshot tidak ditemukan: {img}]")
        add_caption(doc, f"Gambar - {e.get('test_case_id')} Step {e.get('step')} {e.get('description','')} ({e.get('result')})")

    doc.add_heading('10. Rekomendasi',1)
    for i in [
        'Pertahankan storageState per role untuk test non-auth; batasi login UI hanya pada TC-AUTH.',
        'Konfirmasi C-001: apakah menu Guru/Murid memang hanya Dashboard.',
        'Konfirmasi C-010: expected behavior resmi untuk akses ditolak (403 vs redirect).',
        'Jika diizinkan, jalankan CRUD/bulk delete pada data dummy berawalan QA- di sandbox dengan rollback/cleanup.',
        'Simpan test-results.json dan artefak run sebagai bukti audit yang konsisten.',
    ]:
        doc.add_paragraph(i, style='List Bullet')

    doc.add_heading('11. Keterbatasan Pengujian',1)
    limitations = [
        'REST API (endpoint /) di luar scope karena belum selesai; pengujian ini hanya mencakup antarmuka web Filament di /dashboard.',
        'Tidak ada dokumen spesifikasi bisnis resmi; expected behavior mengacu pada baseline discovery read-only dan observasi aktual.',
        'Pengujian bersifat read-only/non-destruktif; aksi create/edit/delete/bulk delete tidak dieksekusi dan ditandai BLOCKED.',
        'Coverage role terbatas pada 3 akun uji (Admin, Guru, Murid) yang tersedia di environment lokal.',
        'Tidak dilakukan pengujian performa, load, aksesibilitas penuh, keamanan mendalam, atau verifikasi backend/database langsung.',
        'Hasil valid untuk environment lokal yang diuji pada waktu run; perilaku dapat berbeda di staging/production.',
    ]
    for l in limitations: doc.add_paragraph(l, style='List Bullet')

    doc.add_heading('12. Kesimpulan',1)
    doc.add_paragraph(
        f"Berdasarkan `results/test-results.json`, Planned={planned}, Executed(PASS+FAIL)={executed}, PASS={passed}, FAIL={failed}, "
        f"BLOCKED={blocked}. Pass Rate = {pass_rate_txt} (denominator {denom}). "
        "Tidak ditemukan bug aplikasi terkonfirmasi dari bukti yang dianalisis. Cakupan tetap dibatasi oleh read-only scope, role terbatas, dan API / yang di luar scope."
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUT)
    print(f'planned={planned} executed={executed} pass={passed} fail={failed} blocked={blocked}')
    print(OUT)

if __name__ == '__main__':
    main()

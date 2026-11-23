// SIAKAD Mini — aplikasi DEMO untuk latihan QA. Bukan aplikasi produksi.
// Catatan: autentikasi di demo ini hanya di sisi frontend (disengaja, untuk bahan diskusi QA).
const USERS = { admin: { pass: 'admin123', role: 'admin', nama: 'Administrator Akademik' },
                dosen: { pass: 'dosen123', role: 'dosen', nama: 'Dosen Wali' } };
const SEED = [ { nim: '2023010001', nama: 'Ahmad Fauzi', prodi: 'Teknik Informatika' },
               { nim: '2023010002', nama: 'Siti Aminah', prodi: 'Sistem Informasi' } ];

const store = {
  get session() { try { return JSON.parse(localStorage.getItem('siakad_session')); } catch { return null; } },
  set session(v) { v ? localStorage.setItem('siakad_session', JSON.stringify(v)) : localStorage.removeItem('siakad_session'); },
  get mhs() { const v = localStorage.getItem('siakad_mhs'); return v ? JSON.parse(v) : SEED.slice(); },
  set mhs(v) { localStorage.setItem('siakad_mhs', JSON.stringify(v)); },
};

function renderHeader() {
  const s = store.session; const h = document.querySelector('header nav'); if (!h) return;
  h.innerHTML = s
    ? `<a href="dashboard.html">Dashboard</a><a href="mahasiswa.html">Data Mahasiswa</a><a href="logout.html" id="nav-logout">Logout (${s.username})</a>`
    : `<a href="index.html">Beranda</a><a href="tentang.html">Tentang</a><a href="login.html" id="nav-login">Login</a>`;
}
function requireLogin() { if (!store.session) { location.href = 'login.html?pesan=login-dulu'; return null; } return store.session; }
function alertBox(el, type, msg) { el.className = 'alert ' + type; el.textContent = msg; el.hidden = false; }
document.addEventListener('DOMContentLoaded', renderHeader);

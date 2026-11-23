// Server statis tanpa dependensi untuk aplikasi demo latihan.
// Jalankan: npm run demo  → http://localhost:4173
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'demo-app');
const PORT = parseInt(process.env.DEMO_PORT || '4173', 10);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const file = path.resolve(ROOT, rel);
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end('<h1>404 - Halaman tidak ditemukan</h1>'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`SIAKAD Mini (demo) berjalan di http://localhost:${PORT}`));

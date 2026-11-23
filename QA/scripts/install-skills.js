#!/usr/bin/env node
// Pasang / perbarui skill dari repo GitHub ke QA/.claude/skills/<nama-skill>/SKILL.md
//   npm run skills:install
//   npm run skills:install -- https://github.com/<akun>/<repo-lain>.git
// Nama folder skill diambil dari field `name:` di frontmatter tiap file .md.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { ROOT } = require('../lib/env');

const REPO = process.argv[2] || 'https://github.com/LurreDev-Official/SKILL-VIBE-CODE.git';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-src-'));

try {
  console.log(`Mengambil skill dari ${REPO} ...`);
  execFileSync('git', ['clone', '--depth', '1', REPO, tmp], { stdio: 'inherit' });

  const files = fs.readdirSync(tmp).filter((f) => f.toLowerCase().endsWith('.md') && f.toLowerCase() !== 'readme.md');
  let count = 0;
  for (const f of files) {
    const text = fs.readFileSync(path.join(tmp, f), 'utf8');
    const name = (text.match(/^---\s*[\r\n]+[\s\S]*?^name:\s*([\w-]+)/m) || [])[1];
    if (!name) { console.warn(`  lewati ${f} (tidak ada frontmatter name:)`); continue; }
    const dir = path.join(ROOT, '.claude', 'skills', name);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), text);
    console.log(`  ✓ ${f}  →  .claude/skills/${name}/SKILL.md`);
    count++;
  }
  console.log(`\n${count} skill terpasang. Mulai ulang sesi Claude Code agar skill terbaca.`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

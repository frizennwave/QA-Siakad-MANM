#!/usr/bin/env node
// Hapus hasil run (results/, screenshots/, archive/). Discovery & reports tidak disentuh.
const fs = require('fs');
const path = require('path');
const { ROOT } = require('../lib/env');

for (const d of ['results', 'screenshots', 'archive']) {
  fs.rmSync(path.join(ROOT, d), { recursive: true, force: true });
  console.log(`dihapus: ${d}/`);
}

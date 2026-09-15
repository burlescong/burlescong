// Parses every JSON file in the repository so malformed ones fail the lint
// step instead of the browser's manifest loader.
const fs = require('fs');
const path = require('path');

const SKIP = new Set(['node_modules', 'dist', 'build', '.git', 'gh-pages']);

let failed = 0;

function check(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      check(file);
    } else if (entry.name.endsWith('.json')) {
      try {
        JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch (e) {
        console.error(`${file}: ${e.message}`);
        failed++;
      }
    }
  }
}

check('.');
process.exit(failed > 0 ? 1 : 0);

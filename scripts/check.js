// Quick checks before you share the app: every file parses, and the copy rules hold.
// Run: npm run check
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    if (f === 'node_modules' || f.startsWith('.')) continue;
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(js|css|html|md)$/.test(f)) files.push(p);
  }
})(root);

// en dash (8211) and em dash (8212), built from char codes so this file has none
const DASHES = new RegExp('[' + String.fromCharCode(8211, 8212) + ']');
let bad = 0;
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  if (f.endsWith('.js')) {
    try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
    catch (e) { bad++; console.log('Does not parse:', path.relative(root, f), String(e.stderr).split('\n')[0]); }
  }
  text.split('\n').forEach((line, i) => {
    if (DASHES.test(line)) { bad++; console.log(`Dash at ${path.relative(root, f)}:${i + 1}`); }
    if (/passive income/i.test(line) && !f.endsWith('check.js')) { bad++; console.log(`"passive income" at ${path.relative(root, f)}:${i + 1}`); }
  });
}
console.log(bad ? `${bad} problem(s) found.` : `All good: ${files.length} files checked.`);
process.exit(bad ? 1 : 0);

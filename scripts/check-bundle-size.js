// Fails the build when the gzipped JavaScript the browser downloads exceeds its budget.
// "Initial" is what index.html loads up front; lazy route chunks are budgeted separately.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = { initial: 160, lazyChunk: 25, css: 12 };
const dist = 'dist';
const assets = join(dist, 'assets');

const gz = (file) => gzipSync(readFileSync(file), { level: 9 }).length / 1024;
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const initialNames = new Set([...html.matchAll(/assets\/([\w.-]+\.js)/g)].map((m) => m[1]));

const rows = [];
let initial = 0;
let failed = false;
for (const name of readdirSync(assets).sort()) {
  const size = gz(join(assets, name));
  if (name.endsWith('.js')) {
    const isInitial = initialNames.has(name);
    if (isInitial) initial += size;
    const over = !isInitial && size > BUDGET_KB.lazyChunk;
    failed ||= over;
    rows.push({
      file: name,
      kind: isInitial ? 'initial' : 'lazy',
      'gzip KB': size.toFixed(1),
      ok: over ? '✗' : '✓',
    });
  } else if (name.endsWith('.css')) {
    const over = size > BUDGET_KB.css;
    failed ||= over;
    rows.push({ file: name, kind: 'css', 'gzip KB': size.toFixed(1), ok: over ? '✗' : '✓' });
  }
}
console.table(rows);
const initialOver = initial > BUDGET_KB.initial;
console.log(
  `Initial JS: ${initial.toFixed(1)} KB gzip (budget ${BUDGET_KB.initial} KB) ${initialOver ? '✗' : '✓'}`,
);
if (failed || initialOver) {
  console.error('Bundle budget exceeded.');
  process.exit(1);
}

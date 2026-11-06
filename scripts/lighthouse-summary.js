// Prints the median Lighthouse run as a Markdown table (used for the CI job summary).
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = '.lighthouseci';
const runs = readdirSync(dir)
  .filter((f) => f.startsWith('lhr-') && f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
  .sort((a, b) => a.categories.performance.score - b.categories.performance.score);
const median = runs[Math.floor(runs.length / 2)];
if (!median) {
  console.log('No Lighthouse results found.');
  process.exit(0);
}
const score = (k) => Math.round(median.categories[k].score * 100);
const metric = (k) => median.audits[k].displayValue;
console.log('### Lighthouse (median of %d runs)\n', runs.length);
console.log('| Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |');
console.log('|---|---|---|---|---|---|---|');
console.log(
  `| ${score('performance')} | ${score('accessibility')} | ${score('best-practices')} | ${score('seo')} | ${metric('largest-contentful-paint')} | ${metric('total-blocking-time')} | ${metric('cumulative-layout-shift')} |`,
);

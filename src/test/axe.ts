import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Runs axe-core against rendered markup. Color contrast needs real layout, so it is checked
 * in the browser by the Playwright and Lighthouse runs instead; "region" is a page-level rule.
 */
export async function expectNoAxeViolations(container: Element): Promise<void> {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
}

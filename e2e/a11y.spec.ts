import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = [
  { path: './#/', heading: /Sprint 24/ },
  { path: './#/team', heading: 'Team' },
  { path: './#/backlog', heading: 'Backlog' },
];

for (const theme of ['light', 'dark'] as const) {
  for (const { path, heading } of pages) {
    test(`${path} has no WCAG 2.2 AA violations in ${theme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
      ).toEqual([]);
    });
  }
}

test('the backlog form error state is accessible', async ({ page }) => {
  await page.goto('./#/backlog');
  await page.getByRole('button', { name: 'Add item' }).click();
  await page.getByRole('form', { name: 'Add work item' }).getByRole('button', { name: 'Add item' }).click();
  await expect(page.getByText('Use at least 3 characters')).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});

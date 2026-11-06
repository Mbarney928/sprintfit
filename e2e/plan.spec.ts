import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1, name: /Sprint 24/ })).toBeVisible();
});

test('a new critical backlog item lands in the plan and survives a reload', async ({ page }) => {
  await page.getByRole('link', { name: 'Backlog' }).click();
  await page.getByRole('button', { name: 'Add item' }).click();
  const form = page.getByRole('form', { name: 'Add work item' });
  await form.getByRole('textbox', { name: 'Title' }).fill('Gift card redemption');
  await form.getByRole('spinbutton', { name: 'Estimate (hours)' }).fill('4');
  await form.getByRole('combobox', { name: 'Priority' }).selectOption('critical');
  await form.getByRole('combobox', { name: 'Skill' }).selectOption('frontend');
  await form.getByRole('button', { name: 'Add item' }).click();
  await expect(page.getByRole('rowheader', { name: 'Gift card redemption' })).toBeVisible();

  await page.getByRole('link', { name: 'Plan' }).click();
  const committed = page.getByRole('region', { name: 'Committed items' });
  await expect(committed.getByRole('rowheader', { name: 'Gift card redemption' })).toBeVisible();

  await page.reload();
  await expect(
    page
      .getByRole('region', { name: 'Committed items' })
      .getByRole('rowheader', { name: 'Gift card redemption' }),
  ).toBeVisible();
});

test('the chart is usable from the keyboard', async ({ page }) => {
  const bar = page.getByRole('button', { name: /Jonah Vale: .* planned of .* capacity/ });
  await bar.focus();
  await expect(page.getByRole('tooltip')).toContainText('Jonah Vale');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await page.getByRole('button', { name: 'Show table' }).click();
  await expect(page.getByRole('region', { name: 'Capacity table' })).toBeVisible();
});

test('theme choice persists across reloads', async ({ page }) => {
  await page.getByRole('radio', { name: 'Dark' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('a skip link moves focus to the main content', async ({ page }) => {
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page).toHaveURL(/#\/?$|#main/);
});

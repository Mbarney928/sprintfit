import { readFileSync } from 'node:fs';

import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

interface StoryIndex {
  entries: Record<string, { id: string; type: string; title: string; name: string }>;
}

/** Storybook's a11y addon runs its own axe pass on load; wait for it rather than collide with it. */
async function analyzeWhenIdle(builder: AxeBuilder, page: Page) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await builder.analyze();
    } catch (error) {
      if (attempt >= 10 || !String(error).includes('Axe is already running')) throw error;
      await page.waitForTimeout(250);
    }
  }
}

const index = JSON.parse(readFileSync('storybook-static/index.json', 'utf8')) as StoryIndex;
const stories = Object.values(index.entries).filter((e) => e.type === 'story');

for (const story of stories) {
  for (const theme of ['light', 'dark'] as const) {
    test(`${story.title} / ${story.name} (${theme}) passes axe`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`);
      await page.locator('#storybook-root').waitFor();
      const builder = new AxeBuilder({ page })
        .include('#storybook-root')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        // A single isolated component is not a full page.
        .disableRules(['region', 'landmark-one-main', 'page-has-heading-one']);
      const results = await analyzeWhenIdle(builder, page);
      expect(
        results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
      ).toEqual([]);
    });
  }
}

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PAGES, vote } from './helpers';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const scan = async (page: import('@playwright/test').Page) =>
  (await new AxeBuilder({ page }).withTags(TAGS).analyze()).violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);

test('WCAG 2.2 AA: welcome tour and content pages', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto('./' + path);
    if (!path) await page.locator('dialog:modal').waitFor();
    expect(await scan(page), path || 'home').toEqual([]);
  }
});

test('WCAG 2.2 AA: calculator with a vote chosen', async ({ page }) => {
  await vote(page);
  await page.getByTestId('verdict').waitFor();
  expect(await scan(page)).toEqual([]);
});

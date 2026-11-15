import { expect, test } from '@playwright/test';
import pkg from '../package.json' with { type: 'json' };
import { PAGES } from './helpers';

// Against the live site: `npm run smoke`.
test('the live site serves this version, every page and its headers', async ({ page, request }) => {
  for (const p of PAGES) expect((await request.get('./' + p)).status(), p).toBe(200);
  expect((await request.get('./')).headers()['strict-transport-security']).toBeTruthy();
  await page.goto('./');
  await page.locator('dialog:modal').waitFor();
  await page.keyboard.press('Escape');
  await page.selectOption('#prov', { label: 'Teruel' });
  await expect(page.getByTestId('power')).toBeVisible();
  await expect(page.getByTestId('version')).toContainText(`v${pkg.version}`, { useInnerText: false });
});

import type { Page } from '@playwright/test';

export const PAGES = ['', 'how-spain-votes/', 'faq/', 'methodology/', 'privacy/', 'terms/'];

/** Opens the calculator and closes the welcome tour, which shows on every visit. */
export async function open(page: Page, query = '') {
  await page.goto('./' + query);
  await page.locator('dialog:modal').waitFor();
  await page.keyboard.press('Escape');
  await page.locator('dialog:modal').waitFor({ state: 'detached' }).catch(() => {});
}

export async function vote(page: Page, province = 'Teruel') {
  await open(page);
  await page.selectOption('#prov', { label: province });
  await page.locator('.parties .chip').first().click();
}

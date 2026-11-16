import { expect, test } from '@playwright/test';
import { open, PAGES, vote } from './helpers';

test('the tour greets every visit and nothing is stored', async ({ page }) => {
  await page.goto('./');
  const tour = page.locator('dialog:modal');
  await expect(tour).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tour).toHaveCount(0);
  await page.selectOption('#prov', { label: 'Teruel' });
  await page.locator('.parties .chip').first().click();
  await expect(page.getByTestId('verdict')).toBeVisible();
  const stored = await page.evaluate(async () => ({
    local: localStorage.length,
    session: sessionStorage.length,
    cookies: document.cookie,
    dbs: (await indexedDB.databases()).length,
    url: location.search
  }));
  expect(stored).toEqual({ local: 0, session: 0, cookies: '', dbs: 0, url: '' });
  await page.reload();
  await expect(page.locator('dialog:modal')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('verdict')).toHaveCount(0);
});

test('a vote gets its verdict, its power-up and the privacy promise', async ({ page }) => {
  await vote(page);
  await expect(page.getByTestId('private')).toContainText('pestaña');
  await expect(page.getByTestId('verdict')).not.toBeEmpty();
  await expect(page.getByTestId('power')).toContainText('×3');
  await expect(page.getByTestId('power')).toContainText(/potenciador/i);
  await page.selectOption('#prov', { label: 'Madrid' });
  await expect(page.getByTestId('power')).toContainText(/freno/i);
});

test('the value ladder ranks every place and list', async ({ page }) => {
  await vote(page);
  const rows = page.locator('section[aria-labelledby="value-title"] ol > li:not(.gap)');
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThanOrEqual(10);
  await expect(page.locator('section[aria-labelledby="value-title"] li.me')).toHaveCount(1);
});

test('hemicycle: sides, counting rules and time travel', async ({ page }) => {
  await vote(page);
  const sec = page.locator('section[aria-labelledby="chamber-title"]');
  await sec.scrollIntoViewIfNeeded();
  await expect(sec.locator('circle.seat')).toHaveCount(350);
  await expect(sec.locator('.half')).toBeVisible();
  const race = sec.getByTestId('race');
  const sides = async () => (await race.locator('strong').allTextContents()).map(Number);
  const [l0, r0] = await sides();
  expect(l0 + r0).toBeLessThanOrEqual(350);
  // The controls sit above the picture.
  const ctl = await sec.locator('#system').boundingBox();
  const svg = await sec.locator('figure svg').boundingBox();
  expect(ctl!.y).toBeLessThan(svg!.y);
  await sec.locator('#system').selectOption({ index: 1 });
  await expect(sec.locator('circle.seat')).toHaveCount(350);
  await sec.locator('#system').selectOption({ index: 0 });
  await sec.locator('#time').fill('0');
  await expect(sec.getByTestId('frame')).toContainText('2019');
  await expect(sec.locator('circle.seat')).toHaveCount(350);
  const [l1] = await sides();
  expect(l1).not.toBe(l0);
});

test('playing with the polls moves the hemicycle next to it', async ({ page }) => {
  await vote(page);
  const sec = page.locator('section[aria-labelledby="chamber-title"]');
  const lab = sec.locator('section.lab');
  await expect(lab).toBeVisible();
  const row = sec.locator('table.data tbody tr').first();
  const before = await row.locator('.st').textContent();
  for (let i = 0; i < 8; i++) await lab.locator('.step').nth(1).click();
  await expect(row.locator('.st')).not.toHaveText(before!);
  await lab.getByRole('button', { name: /↺/ }).click();
  await expect(row.locator('.st')).toHaveText(before!);
  // Poll controls make no sense on a real result.
  await sec.locator('#time').fill('0');
  await expect(lab).toBeHidden();
  await expect(page.getByRole('button', { name: /Compartir|Descargar/ })).toHaveCount(0);
});

test('a link opens the same vote', async ({ page }) => {
  await open(page, '?e=e2023&p=44&v=pp');
  await expect(page.locator('#prov')).toHaveValue('44');
  await expect(page.getByTestId('verdict')).toBeVisible();
});

test('every page renders, without errors or sideways scroll', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  for (const path of PAGES) {
    await page.goto('./' + path);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), path).toBeLessThanOrEqual(0);
  }
  await page.goto('./how-spain-votes/');
  await expect(page.locator('.flow').first()).toBeVisible();
  await expect(page.locator('table.dh td.win')).toHaveCount(5);
  await expect(page.locator('.bars li').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('security headers and noindex (labs experiment)', async ({ request }) => {
  const r = await request.get('./');
  const h = r.headers();
  expect(h['strict-transport-security']).toContain('max-age=31536000');
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['referrer-policy']).toBe('no-referrer');
  expect(h['content-security-policy']).toContain("frame-ancestors 'self'");
  expect(h['x-robots-tag']).toBe('noindex, nofollow');
  expect(await r.text()).toContain('<meta name="robots" content="noindex, nofollow"');
  expect((await request.get('./sitemap.xml')).status()).toBe(404);
});

import { expect, test, type Page, type Route } from '@playwright/test';
import { skipDemos } from './helpers';

const openParent = async (page: Page): Promise<void> => {
  const b = (await page.locator('.parent-btn').boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(3300);
  await page.mouse.up();
  await expect(page.locator('[data-testid="parent-panel"]')).toBeVisible();
};

test.describe('első indítás', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test('új telepítésnél egyszer megjelenik a (kihagyható) játékosnév-kártya, utána többé nem', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="welcome"]')).toBeVisible();
    await page.locator('[data-act="w-skip"]').click();
    await expect(page.locator('[data-testid="welcome"]')).toHaveCount(0);
    await page.reload();
    await expect(page.locator('.tile').first()).toBeVisible();
    await expect(page.locator('[data-testid="welcome"]')).toHaveCount(0);
  });
});

test('játékosok: új (helyi) játékos, saját haladás, visszaváltás; a régi haladás megmarad', async ({ page }) => {
  await skipDemos(page);
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('egyszer')) {
      sessionStorage.setItem('egyszer', '1');
      const s = JSON.parse(localStorage.getItem('szinkorong:v1') ?? '{}');
      s.done = { 'minta:0': { at: Date.now(), tries: 1 } };
      localStorage.setItem('szinkorong:v1', JSON.stringify(s));
    }
  });
  await page.goto('/');
  await expect(page.locator('.tile[data-topic="minta"] .dots i.on')).toHaveCount(1);

  await openParent(page);
  await page.locator('[data-act="players"]').click();
  await page.locator('[data-act="p-new"]').click();
  await page.locator('[data-f="name"]').fill('Tesó1'); // 1 számjegy: hibás
  await page.locator('[data-act="p-save"]').click();
  await expect(page.locator('.pmsg')).toContainText('2 számjegy');
  await page.locator('[data-f="name"]').fill('Tesó12');
  await page.locator('[data-act="p-save"]').click();
  await expect(page.locator('.pnote').first()).toContainText('Tesó12');
  await page.screenshot({ path: `screenshots/${test.info().project.name}-jatekosok.png` });
  await page.locator('[data-act="p-back"]').click();
  await page.locator('[data-act="close"]').click();
  // Az új játékosnak még nincs kész lapja.
  await expect(page.locator('.tile[data-topic="minta"] .dots i.on')).toHaveCount(0);

  // Vissza az alapprofilra: a régi haladás megvan.
  await openParent(page);
  await page.locator('[data-act="players"]').click();
  await page.locator('input[name="pprof"][value="helyi"]').check();
  await page.locator('[data-act="p-back"]').click();
  await page.locator('[data-act="close"]').click();
  await expect(page.locator('.tile[data-topic="minta"] .dots i.on')).toHaveCount(1);
});

test('a szinkron nincs beállítva: a felület ezt jelzi, és nem küld semmit a hálózatra', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost:4173')) requests.push(r.url());
  });
  await page.route('**/*', (route: Route) => route.continue());
  await page.goto('/');
  await openParent(page);
  await page.locator('[data-act="players"]').click();
  await expect(page.locator('.pcard')).toContainText('még nincs beállítva');
  expect(requests).toEqual([]);
});

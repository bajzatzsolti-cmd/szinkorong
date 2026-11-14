import { expect, test } from '@playwright/test';

test.describe('PWA', () => {
  test('manifest: standalone, saját ikon, orientation any', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest');
    expect(res.ok()).toBe(true);
    const m = (await res.json()) as {
      display: string;
      orientation: string;
      lang: string;
      icons: { src: string; purpose?: string }[];
    };
    expect(m.display).toBe('standalone');
    expect(m.orientation).toBe('any');
    expect(m.lang).toBe('hu');
    expect(m.icons.some((i) => i.purpose === 'maskable')).toBe(true);
    for (const icon of m.icons) {
      const r = await request.get(`/${icon.src}`);
      expect(r.ok(), icon.src).toBe(true);
    }
  });

  test('offline: az első betöltés után hálózat nélkül is elindul és játszható', async ({ page, context }) => {
    await page.goto('/');
    const hasSw = await page.evaluate(() => 'serviceWorker' in navigator);
    test.skip(!hasSw, 'Ebben a böngészőben nincs service worker.');

    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, undefined, { timeout: 15_000 });

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('.tile')).toBeVisible();
    await page.locator('.tile').click();
    await page.locator('.card[data-index="0"]').click();
    await expect(page.locator('.sheet')).toBeVisible();
    await expect(page.locator('.dbtn')).toHaveCount(6);
    await context.setOffline(false);
  });
});

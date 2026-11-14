import { expect, test } from '@playwright/test';
import { dragDisc } from './helpers';

// Az animált, szöveg nélküli bemutató a nehezebb logikai témakörök első lapja előtt.
test.describe('bemutató (demo)', () => {
  test('a Mátrix első lapja előtt lejátszódik, utána a rendes lap jön; másodszor már nem indul el magától', async ({ page }, info) => {
    await page.goto('/');
    await page.locator('.tile[data-topic="matrix"]').click();
    await page.locator('.card[data-index="0"]').click();

    const sheet = page.locator('.sheet');
    await expect(sheet).toHaveAttribute('data-demo', '1');
    await expect(sheet).toHaveAttribute('data-n', '2');
    await expect(page.locator('.demo-hand')).toHaveCount(1);

    // A bemutató alatt a gyerek nem tud belenyúlni: a korong nem húzható, a pipa nem él.
    await dragDisc(page, 0, 0).catch(() => undefined);
    await page.locator('.go').click();
    await expect(page.locator('.go')).toHaveAttribute('data-mode', 'check');

    // Felvillan egy feladat, majd a hozzá illő megoldás.
    await expect(page.locator('.task.demo-pulse')).toHaveCount(1, { timeout: 8000 });
    await expect(page.locator('.row.demo-pulse')).toHaveCount(1, { timeout: 8000 });
    await page.screenshot({ path: `screenshots/${info.project.name}-demo-matrix.png` });

    // A kéz mindkét korongot a helyére húzza, megnyomja a pipát: minden sor zöld.
    await expect(page.locator('.go')).toHaveAttribute('data-mode', 'next', { timeout: 40_000 });
    await expect(page.locator('.row.ok')).toHaveCount(2);
    await expect(page.locator('.demo-hand')).toHaveCount(0);

    // A bemutató nem számít a haladásba.
    const done = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('szinkorong:v1') ?? '{"done":{}}').done ?? {}).length);
    expect(done).toBe(0);

    // A ➜ gombbal a rendes 1. lap nyílik meg (4 korong).
    await page.locator('.go').click();
    await expect(sheet).not.toHaveAttribute('data-demo', '1');
    await expect(sheet).toHaveAttribute('data-index', '0');
    await expect(sheet).toHaveAttribute('data-n', '4');

    // Másodszor már rögtön a lap jön.
    await page.locator('[data-act="back"]').click();
    await page.locator('.card[data-index="0"]').click();
    await expect(page.locator('.sheet')).not.toHaveAttribute('data-demo', '1');

    // A ▶ gombbal bármikor újra megnézhető; a vissza gomb megszakítja, a kéz eltűnik.
    await page.locator('[data-act="demo"]').click();
    await expect(page.locator('.sheet')).toHaveAttribute('data-demo', '1');
    await page.locator('[data-act="back"]').click();
    await expect(page.locator('.map')).toBeVisible();
    await expect(page.locator('.demo-hand')).toHaveCount(0);
  });

  test('az Analógiának is van bemutatója; a többi (nem logikai) témakörnek nincs', async ({ page }) => {
    await page.goto('/');
    await page.locator('.tile[data-topic="analogia"]').click();
    await page.locator('.card[data-index="0"]').click();
    await expect(page.locator('.sheet')).toHaveAttribute('data-demo', '1');
    await page.locator('[data-act="back"]').click();
    await page.locator('[data-act="home"]').click();

    await page.locator('.tile[data-topic="arnyek"]').click();
    await page.locator('.card[data-index="0"]').click();
    await expect(page.locator('.sheet')).not.toHaveAttribute('data-demo', '1');
    await expect(page.locator('[data-act="demo"]')).toHaveCount(0);
  });
});

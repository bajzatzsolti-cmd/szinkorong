import { expect, test } from '@playwright/test';
import { TILES, TOPICS } from '../../src/topics';
import { measureLayout, mode, openSheet, sheetOf, solve } from './helpers';

// Minden témakör: egy könnyű (1.), egy közepes (6.) és egy nehéz (11.) lap megnyitása, méretek, képernyőkép;
// a könnyű lap teljes megoldása végigjátszva (húzás, ellenőrzés, "kész", továbblépés).
const INDEXES = [0, 5, 10];

for (const topic of TOPICS) {
  test.describe(`${topic.nameHu}`, () => {
    for (const index of INDEXES) {
      test(`${index + 1}. lap: nem lóg ki semmi, a korong ≥ 56 px, az üres hely ≥ 52 px, a képek felismerhető méretűek`, async ({ page }, info) => {
        await openSheet(page, index, topic.id);
        await page.waitForTimeout(250);
        const m = await measureLayout(page);
        console.log(`[${info.project.name}] ${topic.id} ${index + 1}. lap ${JSON.stringify(m)}`);

        expect(m.minDisc).toBeGreaterThanOrEqual(56);
        expect(m.minSlot).toBeGreaterThanOrEqual(52);
        expect(m.allInViewport).toBe(true);
        expect(m.rowsInPaper).toBe(true);
        expect(m.noScroll).toBe(true);
        expect(m.parentOverlaps).toBe(0);
        expect(m.minRowH).toBeGreaterThan(40);
        expect(m.minImgH).toBeGreaterThanOrEqual(36);

        await page.screenshot({ path: `screenshots/${info.project.name}-${topic.id}-lap${index + 1}.png` });
      });
    }

    test('az 1. lap végigjátszható: húzás, ellenőrzés, kész, következő', async ({ page }) => {
      const sheet = sheetOf(0, topic.id);
      await openSheet(page, 0, topic.id);
      await solve(page, sheet);
      await page.locator('.go').click();
      expect(await mode(page)).toBe('next');
      await expect(page.locator('.row.ok')).toHaveCount(sheet.answers.length);
      await page.locator('.go').click();
      await expect(page.locator('.sheet')).toHaveAttribute('data-index', '1');
    });
  });
}

test('a kezdőlapon mind a négy témakör látszik, a lapválasztók képernyőképe', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.locator('.tile')).toHaveCount(TILES.length);
  // Minden csempe teljes egészében a képernyőn van (a lap nem görgethető, ami kilóg, az elérhetetlen).
  const vp = page.viewportSize()!;
  for (const tile of await page.locator('.tile').all()) {
    const b = (await tile.boundingBox())!;
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.y).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width).toBeLessThanOrEqual(vp.width);
    expect(b.y + b.height).toBeLessThanOrEqual(vp.height);
  }
  await page.screenshot({ path: `screenshots/${info.project.name}-kezdolap.png` });
  await page.locator('.tile[data-topic="arnyek"]').click();
  await page.locator('.card').first().waitFor();
  await page.screenshot({ path: `screenshots/${info.project.name}-lapvalaszto.png` });
});

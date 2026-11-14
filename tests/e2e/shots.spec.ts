import { test } from '@playwright/test';
import { dragDisc, openSheet, sheetOf } from './helpers';

// Képernyőképek az átnézéshez (a screenshots/ mappába, nincs benne állítás).
test('képernyőképek: hibás ellenőrzés és szülői menü', async ({ page }, info) => {
  const sheet = sheetOf(5);
  await openSheet(page, 5);
  await dragDisc(page, sheet.answers[1]!.disc, 0); // rossz
  await dragDisc(page, sheet.answers[1]!.disc, 1); // jó
  await dragDisc(page, sheet.answers[2]!.disc, 2); // jó
  await page.locator('.go').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `screenshots/${info.project.name}-ellenorzes.png` });

  const b = (await page.locator('.parent-btn').boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `screenshots/${info.project.name}-szuloi-gomb-nyomva.png` });
  await page.waitForTimeout(1800);
  await page.mouse.up();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `screenshots/${info.project.name}-szuloi-menu.png` });
});

import { expect, test } from '@playwright/test';

// Nyomtatás a szülői menüből (számítógépről): a nyomtatási ablakot kicseréljük, és nyomtatási nézetben nézzük meg a lapokat.
test('Nyomtatás: a kiválasztott témakör lapjai A4-re, megoldókulccsal; nyomtatási nézetben csak a lapok látszanak', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => {
    (window as unknown as { __printed: number }).__printed = 0;
    window.print = () => void ((window as unknown as { __printed: number }).__printed += 1);
  });
  const b = (await page.locator('.parent-btn').boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(3300);
  await page.mouse.up();
  await expect(page.locator('[data-testid="parent-panel"]')).toBeVisible();

  // Hallás utáni témakör nincs a listában.
  const options = await page.locator('[data-print="topic"] option').evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value));
  expect(options).not.toContain('holvan');
  expect(options).toContain('kodfejto');

  await page.locator('[data-print="topic"]').selectOption('arnyek');
  await page.locator('[data-print="lvl"][value="1"]').uncheck();
  await page.locator('[data-print="lvl"][value="2"]').uncheck();
  await page.locator('input[name="pkey"][value="back"]').check();
  await page.locator('[data-act="print"]').click();
  expect(await page.evaluate(() => (window as unknown as { __printed: number }).__printed)).toBe(1);
  await expect(page.locator('#print-root section.pp')).toHaveCount(10); // 5 lap + 5 kulcs

  // Nyomtatási nézet: az app eltűnik, a lapok megjelennek; A4 arányú képernyőképek.
  await page.setViewportSize({ width: 794, height: 1123 });
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.pov')).toBeHidden();
  await expect(page.locator('#print-root')).toBeVisible();
  await page.locator('#print-root section.pp').nth(0).screenshot({ path: `screenshots/${test.info().project.name}-nyomtatas-lap.png` });
  await page.locator('#print-root section.pp').nth(1).screenshot({ path: `screenshots/${test.info().project.name}-nyomtatas-kulcs.png` });

  // Kódfejtő a jelkulccsal, végén kulccsal.
  await page.emulateMedia({ media: 'screen' });
  await page.evaluate(() => document.getElementById('print-root')?.remove());
  await page.locator('[data-print="topic"]').selectOption('kodfejto');
  await page.locator('[data-print="lvl"][value="2"]').check();
  await page.locator('input[name="pkey"][value="end"]').check();
  await page.locator('[data-act="print"]').click();
  await page.emulateMedia({ media: 'print' });
  await page.locator('#print-root section.pp').nth(5).screenshot({ path: `screenshots/${test.info().project.name}-nyomtatas-kodfejto.png` });
  await page.locator('#print-root section.pp-keyend').screenshot({ path: `screenshots/${test.info().project.name}-nyomtatas-kulcs-vegen.png` });
});

import { expect, test } from '@playwright/test';
import manifest from '../../content/audio/manifest.json' with { type: 'json' };

// A szülői menü Hangpróba oldala: minden hangszöveg listázva, „rossz” jelölés, a lista kimásolható.
test('Hangpróba: minden szöveg látszik, a jelölés megmarad, a lista kimásolható', async ({ page }) => {
  await page.goto('./');
  const open = async () => {
    const b = (await page.locator('.parent-btn').boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(3300);
    await page.mouse.up();
    await expect(page.locator('[data-testid="parent-panel"]')).toBeVisible();
  };

  await open();
  await page.locator('[data-act="hangproba"]').click();
  const rows = page.locator('.hrow');
  await expect(rows).toHaveCount(Object.keys(manifest).length);

  // Egy klip „rossz”-nak jelölése: a számláló nő, a sor megjelölt lesz.
  const row = page.locator('.hrow[data-id="szo-alma"]');
  await row.locator('input[data-act="mark"]').check();
  await expect(row).toHaveClass(/bad/);
  await expect(page.locator('[data-count]')).toHaveText('1');

  // Lista másolása: a megjelölt azonosítók JSON-listája megjelenik (és a vágólapra kerül, ha engedélyezett).
  await page.locator('[data-act="copy"]').click();
  await expect(page.locator('.hcopy')).toHaveValue('["szo-alma"]');

  // Vissza a beállításokhoz, majd újra a Hangpróbára: a jelölés megmaradt.
  await page.locator('[data-act="back"]').click();
  await page.locator('[data-act="hangproba"]').click();
  await expect(page.locator('.hrow[data-id="szo-alma"] input[data-act="mark"]')).toBeChecked();
  await page.screenshot({ path: `screenshots/${test.info().project.name}-hangproba.png` });
});

import { expect, test } from '@playwright/test';
import { buildMemory } from '../../src/games/memoria/generate';
import { skipDemos } from './helpers';

// A Memória (nem korongos játék): az időt a Playwright órája gyorsítja, így a megmutatás ideje nem lassítja a tesztet.
for (const index of [0, 6, 11]) {
  test(`Memória ${index + 1}. lap: 5 kör végigjátszható, hibás koppintás után is, a végén „kész”`, async ({ page }) => {
    const sheet = buildMemory(index);
    await page.clock.install();
    await skipDemos(page);
    await page.goto('/');
    await page.locator('.tile[data-topic="memoria"]').click();
    await page.locator(`.card[data-index="${index}"]`).click();
    await page.locator('.memory').waitFor();

    // Minden kártya a képernyőn belül van, nincs görgetés.
    const fits = await page.evaluate(() => {
      const vw = innerWidth;
      const vh = innerHeight;
      return [...document.querySelectorAll('.mcard')].every((c) => {
        const r = c.getBoundingClientRect();
        return r.left >= 0 && r.top >= 0 && r.right <= vw && r.bottom <= vh;
      }) && document.documentElement.scrollHeight <= vh;
    });
    expect(fits).toBe(true);

    for (const [ri, rd] of sheet.rounds.entries()) {
      // Megmutatás alatt a lehetőségek még rejtve vannak.
      await expect(page.locator('.mem-options')).not.toHaveClass(/shown/);
      if (ri === 0) await page.screenshot({ path: `screenshots/${test.info().project.name}-memoria-lap${index + 1}-mutat.png` });
      await page.clock.runFor(sheet.showMs + 50);
      await expect(page.locator('.mem-options')).toHaveClass(/shown/);
      await expect(page.locator('.mem-row .mcard.down')).toHaveCount(rd.shown.length);
      if (ri === 0) await page.screenshot({ path: `screenshots/${test.info().project.name}-memoria-lap${index + 1}-kerdes.png` });

      const opt = (id: string) => page.locator(`.mem-options .mcard[data-id="${id}"]`);
      if (rd.mode === 'sorrend') {
        // Először egy rossz koppintás (a második kép az első helyett), aztán a helyes sorrend.
        await opt(rd.shown[1]!).click();
        await expect(opt(rd.shown[1]!)).toHaveClass(/bad/);
        for (const id of rd.shown) await opt(id).click();
      } else {
        const right = rd.mode === 'melyik' ? rd.options.find((o) => rd.shown.includes(o))! : rd.shown[rd.target!]!;
        const wrong = rd.options.find((o) => o !== right)!;
        await opt(wrong).click();
        await expect(opt(wrong)).toHaveClass(/off/);
        await opt(right).click();
        await expect(opt(right)).toHaveClass(/ok/);
      }
      await page.clock.runFor(1500);
    }
    await expect(page.locator('.memory .go')).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-memoria-lap${index + 1}-kesz.png` });

    // A lap kész jelölést kap.
    await page.locator('.memory .sbar [data-act="back"]').click();
    await expect(page.locator(`.card[data-index="${index}"]`)).toHaveClass(/done/);
  });
}

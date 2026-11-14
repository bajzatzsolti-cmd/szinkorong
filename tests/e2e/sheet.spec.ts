import { expect, test } from '@playwright/test';
import { disc, dragDisc, dragTo, mode, openSheet, sheetOf, slot, solve } from './helpers';

// A játékmenet részletes tesztjei a Sorminta témakörön (a méretek és a képernyőképek: topics.spec.ts).
test.describe('játékmenet', () => {
  test('húzás, ellenőrzés, hibajavítás, továbblépés, haladás megmarad', async ({ page }) => {
    const sheet = sheetOf(0);
    await openSheet(page, 0);
    expect(await mode(page)).toBe('check');

    // Hibás kitöltés: az első két megoldásnál felcseréljük a korongokat.
    const a0 = sheet.answers[0]!.disc;
    const a1 = sheet.answers[1]!.disc;
    await dragDisc(page, a1, 0);
    await dragDisc(page, a0, 1);
    for (let j = 2; j < sheet.answers.length; j++) await dragDisc(page, sheet.answers[j]!.disc, j);

    await page.locator('.go').click();
    expect(await mode(page)).toBe('retry');
    await expect(page.locator('.row.bad')).toHaveCount(2);
    await expect(page.locator('.row.ok')).toHaveCount(sheet.answers.length - 2);
    await expect(page.locator('.paper.shown')).toHaveCount(1);
    // Minden sor mellett megjelenik a helyes szín (kulcs).
    await expect(page.locator('.key .disc')).toHaveCount(sheet.answers.length);

    // Újra: a hibás korongok visszamennek a tálcára, a jók a helyükön maradnak.
    await page.locator('.go').click();
    expect(await mode(page)).toBe('check');
    await expect(page.locator('.homes .dbtn')).toHaveCount(2);
    await expect(page.locator('.slot .dbtn')).toHaveCount(sheet.answers.length - 2);
    await expect(page.locator('.paper.shown')).toHaveCount(0);

    // Javítás.
    await dragDisc(page, a0, 0);
    await dragDisc(page, a1, 1);
    await page.locator('.go').click();
    expect(await mode(page)).toBe('next');
    await expect(page.locator('.row.ok')).toHaveCount(sheet.answers.length);
    await expect(page.locator('.sheet.solved')).toHaveCount(1);

    // Továbblépés a következő lapra.
    await page.locator('.go').click();
    await expect(page.locator('.sheet')).toHaveAttribute('data-index', '1');

    // A haladás újratöltés után is megvan.
    await page.reload();
    await page.locator('.tile[data-topic="minta"]').click();
    await expect(page.locator('.card.done')).toHaveCount(1);
    await expect(page.locator('.card.done')).toHaveAttribute('data-index', '0');
    await expect(page.locator('.card.next')).toHaveAttribute('data-index', '1');
  });

  test('a lap teljes megoldása: ünneplés és "kész" jelölés', async ({ page }) => {
    const sheet = sheetOf(10); // a legnehezebb: 10 korong, sor közepéről hiányzó elem
    await openSheet(page, 10);
    await solve(page, sheet);
    await page.locator('.go').click();
    expect(await mode(page)).toBe('next');
    await expect(page.locator('.party')).toHaveCount(1);
    await page.locator('.go').click();
    await expect(page.locator('.sheet')).toHaveAttribute('data-index', '11');
  });

  test('alternatív vezérlés: koppintás a korongra, majd a sorra', async ({ page }) => {
    const sheet = sheetOf(0);
    await openSheet(page, 0);
    const d = sheet.answers[2]!.disc;
    await disc(page, d).click();
    await expect(disc(page, d)).toHaveClass(/sel/);
    await page.locator('.row').nth(2).click({ position: { x: 5, y: 5 } });
    await expect(slot(page, 2).locator('.dbtn')).toHaveCount(1);
    await expect(disc(page, d)).not.toHaveClass(/sel/);
  });

  test('foglalt helyre húzva az előző korong visszamegy a tálcára', async ({ page }) => {
    const sheet = sheetOf(0);
    await openSheet(page, 0);
    const first = sheet.answers[0]!.disc;
    const second = sheet.answers[1]!.disc;
    await dragDisc(page, first, 0);
    await expect(slot(page, 0).locator('.dbtn')).toHaveAttribute('data-disc', String(first));
    await dragDisc(page, second, 0);
    await expect(slot(page, 0).locator('.dbtn')).toHaveAttribute('data-disc', String(second));
    await expect(page.locator(`.homes .dbtn[data-disc="${first}"]`)).toHaveCount(1);
  });

  test('érvénytelen helyen elengedve a korong visszamegy', async ({ page }) => {
    const sheet = sheetOf(0);
    await openSheet(page, 0);
    const d = sheet.answers[0]!.disc;
    // A bal felső sarok a feladatok sávja fölött/mellett: nem érvényes hely.
    await dragTo(page, disc(page, d), 3, 3);
    await expect(page.locator(`.homes .dbtn[data-disc="${d}"]`)).toHaveCount(1);
    await expect(page.locator('.slot .dbtn')).toHaveCount(0);
  });

  test('áthelyezés két hely között, majd vissza a tálcára koppintással', async ({ page }) => {
    const sheet = sheetOf(0);
    await openSheet(page, 0);
    const d = sheet.answers[0]!.disc;
    await dragDisc(page, d, 0);
    await dragDisc(page, d, 3);
    await expect(slot(page, 0).locator('.dbtn')).toHaveCount(0);
    await expect(slot(page, 3).locator('.dbtn')).toHaveCount(1);
    await disc(page, d).click(); // kijelöli
    await page.locator('.homes').click({ position: { x: 4, y: 4 } });
    await expect(page.locator(`.homes .dbtn[data-disc="${d}"]`)).toHaveCount(1);
  });

  test('az ellenőrzés utáni korongok nem mozgathatók, amíg nincs "újra"', async ({ page }) => {
    const sheet = sheetOf(0);
    await openSheet(page, 0);
    await dragDisc(page, sheet.answers[0]!.disc, 0);
    await page.locator('.go').click();
    expect(await mode(page)).toBe('retry');
    const before = await page.locator('.slot .dbtn').count();
    await dragDisc(page, sheet.answers[1]!.disc, 1);
    expect(await page.locator('.slot .dbtn').count()).toBe(before);
  });
});

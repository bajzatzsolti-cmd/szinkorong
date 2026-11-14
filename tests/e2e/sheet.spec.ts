import { expect, test } from '@playwright/test';
import { disc, dragDisc, dragTo, mode, openSheet, sheetOf, slot, solve } from './helpers';

const INDEXES = [0, 5, 10]; // könnyű (6), közepes (8), nehéz (10)

test.describe('lap megnyitása, méretek, képernyőképek', () => {
  for (const index of INDEXES) {
    test(`${index + 1}. lap: nem lóg ki semmi, a korong ≥ 56 px, az üres hely ≥ 52 px`, async ({ page }, info) => {
      await openSheet(page, index);
      await page.waitForTimeout(200);

      const m = await page.evaluate(() => {
        const rect = (e: Element) => e.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const discs = [...document.querySelectorAll('.dbtn')].map(rect);
        const slots = [...document.querySelectorAll('.slot')].map(rect);
        const homes = [...document.querySelectorAll('.home')].map(rect);
        const rows = [...document.querySelectorAll('.row')].map(rect);
        const tasks = [...document.querySelectorAll('.task')].map(rect);
        const paper = rect(document.querySelector('.paper')!);
        const parent = rect(document.querySelector('.parent-btn')!);
        const interactive = [...document.querySelectorAll('.dbtn, .go, .rb, .row, .task')].map(rect);
        const overlaps = interactive.filter(
          (r) => r.left < parent.right && r.right > parent.left && r.top < parent.bottom && r.bottom > parent.top,
        ).length;
        const inside = (r: DOMRect, o: DOMRect) =>
          r.left >= o.left - 1 && r.right <= o.right + 1 && r.top >= o.top - 1 && r.bottom <= o.bottom + 1;
        const el = document.documentElement;
        return {
          vw,
          vh,
          n: Number((document.querySelector('.sheet') as HTMLElement).dataset.n),
          minDisc: Math.min(...discs.map((r) => Math.min(r.width, r.height))),
          minSlot: Math.min(...slots.map((r) => Math.min(r.width, r.height))),
          minRowH: Math.min(...rows.map((r) => r.height)),
          minTaskH: Math.min(...tasks.map((r) => r.height)),
          twoCol: document.querySelector('.answers')!.classList.contains('two-col'),
          trayRows: new Set(homes.map((r) => Math.round(r.top))).size,
          allInViewport: [paper, ...homes, ...rows, ...tasks].every((r) => r.left >= -1 && r.top >= -1 && r.right <= vw + 1 && r.bottom <= vh + 1),
          rowsInPaper: [...rows, ...tasks].every((r) => inside(r, paper)),
          noScroll: el.scrollHeight <= vh && el.scrollWidth <= vw,
          parentOverlaps: overlaps,
        };
      });

      console.log(`[${info.project.name}] ${index + 1}. lap (n=${m.n}) ${JSON.stringify(m)}`);
      expect(m.minDisc).toBeGreaterThanOrEqual(56);
      expect(m.minSlot).toBeGreaterThanOrEqual(52);
      expect(m.allInViewport).toBe(true);
      expect(m.rowsInPaper).toBe(true);
      expect(m.noScroll).toBe(true);
      expect(m.parentOverlaps).toBe(0);
      expect(m.minRowH).toBeGreaterThan(40);

      await page.screenshot({ path: `screenshots/${info.project.name}-lap${index + 1}.png` });
    });
  }

  test('kezdőlap és lapválasztó képernyőképe', async ({ page }, info) => {
    await page.goto('/');
    await page.locator('.tile').waitFor();
    await page.screenshot({ path: `screenshots/${info.project.name}-kezdolap.png` });
    await page.locator('.tile').click();
    await page.locator('.card').first().waitFor();
    await page.screenshot({ path: `screenshots/${info.project.name}-lapvalaszto.png` });
  });
});

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
    await page.locator('.tile').click();
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
    await page.locator('.go').click(); // az utolsó előtti lap után a következő lap
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

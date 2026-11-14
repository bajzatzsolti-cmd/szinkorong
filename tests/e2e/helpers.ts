import type { Locator, Page } from '@playwright/test';
import { buildSheet } from '../../src/topics';
import { minta } from '../../src/topics/minta';
import type { Sheet } from '../../src/engine/sheet';

export const sheetOf = (index: number): Sheet => buildSheet(minta, index);

/** Kezdőlap → témakör → lap (a gyerek útvonala). */
export async function openSheet(page: Page, index: number): Promise<void> {
  await page.goto('/');
  await page.locator('.tile[data-topic="minta"]').click();
  await page.locator(`.card[data-index="${index}"]`).click();
  await page.locator('.sheet').waitFor();
  await page.locator('.sheet').evaluate((el) => (el as HTMLElement).dataset.index);
}

export const disc = (page: Page, id: number): Locator => page.locator(`.dbtn[data-disc="${id}"]`);
export const slot = (page: Page, j: number): Locator => page.locator('.slot').nth(j);

/** Egérrel (Pointer Events) áthúzza a korongot a megadott pontra. */
export async function dragTo(page: Page, from: Locator, x: number, y: number): Promise<void> {
  // Várunk, amíg a korongok pattanó animációja lefut (különben mozgó korongot kapnánk el).
  await page.waitForFunction(() => !document.querySelector('.flying'));
  const a = (await from.boundingBox())!;
  const sx = a.x + a.width / 2;
  const sy = a.y + a.height / 2;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(sx + 14, sy + 14, { steps: 2 });
  await page.mouse.move(x, y, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(280); // a pattanó animáció lefutása
}

export async function dragDisc(page: Page, id: number, j: number): Promise<void> {
  const b = (await slot(page, j).boundingBox())!;
  await dragTo(page, disc(page, id), b.x + b.width / 2, b.y + b.height / 2);
}

/** A lap helyes megoldása: minden korong a saját megoldása mellé. */
export async function solve(page: Page, sheet: Sheet): Promise<void> {
  for (let j = 0; j < sheet.answers.length; j++) {
    await dragDisc(page, sheet.answers[j]!.disc, j);
  }
}

export const mode = (page: Page): Promise<string | null> => page.locator('.go').getAttribute('data-mode');

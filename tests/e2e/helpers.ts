import type { Locator, Page } from '@playwright/test';
import { buildSheet, getTopic } from '../../src/topics';
import type { Sheet } from '../../src/engine/sheet';

export const sheetOf = (index: number, topicId = 'minta'): Sheet => buildSheet(getTopic(topicId), index);

/** Kezdőlap → témakör → lap (a gyerek útvonala). */
export async function openSheet(page: Page, index: number, topicId = 'minta'): Promise<void> {
  await page.goto('/');
  await page.locator(`.tile[data-topic="${topicId}"]`).click();
  await page.locator(`.card[data-index="${index}"]`).click();
  await page.locator('.sheet').waitFor();
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

/** Az elrendezés mérése: méretek, kilóg-e valami, takarja-e valamit a szülői gomb. */
export function measureLayout(page: Page) {
  return page.evaluate(() => {
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
    // Minden kép (svg) a saját dobozán belül marad-e és legalább 36 px széles/magas-e
    const imgs = [...document.querySelectorAll('.vis-wrap > .vis')].map(rect);
    return {
      vw,
      vh,
      n: Number((document.querySelector('.sheet') as HTMLElement).dataset.n),
      minDisc: Math.min(...discs.map((r) => Math.min(r.width, r.height))),
      minSlot: Math.min(...slots.map((r) => Math.min(r.width, r.height))),
      minRowH: Math.min(...rows.map((r) => r.height)),
      minTaskH: Math.min(...tasks.map((r) => r.height)),
      minImgH: Math.min(...imgs.map((r) => r.height)),
      twoCol: document.querySelector('.answers')!.classList.contains('two-col'),
      trayRows: new Set(homes.map((r) => Math.round(r.top))).size,
      allInViewport: [paper, ...homes, ...rows, ...tasks].every(
        (r) => r.left >= -1 && r.top >= -1 && r.right <= vw + 1 && r.bottom <= vh + 1,
      ),
      rowsInPaper: [...rows, ...tasks].every((r) => inside(r, paper)),
      noScroll: el.scrollHeight <= vh && el.scrollWidth <= vw,
      parentOverlaps: overlaps,
    };
  });
}

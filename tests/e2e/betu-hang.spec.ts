import { expect, test } from '@playwright/test';
import { openSheet, sheetOf } from './helpers';

// Betűkereső: bármelyik betűre koppintva elhangzik a neve („Pé betű.”), és a betű röviden kiemelkedik.
test('Betűkereső: a betűre koppintva elhangzik a neve', async ({ page }) => {
  // Lejátszás helyett feljegyezzük, mi szólna: hangfájl (mp3) vagy a készülék hangja (szöveg).
  await page.addInitScript(() => {
    const w = window as unknown as { __said: string[] };
    w.__said = [];
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      w.__said.push(this.src);
      return Promise.resolve();
    };
    // A teszt-WebKitben nincs beszédszintézis: helyette egy feljegyző utánzat.
    const g = window as unknown as Record<string, unknown>;
    g.SpeechSynthesisUtterance = class {
      lang = '';
      rate = 1;
      volume = 1;
      voice: unknown = null;
      constructor(public text: string) {}
    };
    g.speechSynthesis = { speak: (u: { text: string }) => void w.__said.push(u.text), cancel: () => undefined, getVoices: () => [] };
  });
  await openSheet(page, 0, 'betu');
  const sheet = sheetOf(0, 'betu');
  const said = (): Promise<string[]> => page.evaluate(() => (window as unknown as { __said: string[] }).__said);

  // Az első feladat mezőjének első betűje (a keretes keresett betű után).
  const letter = page.locator('.task').first().locator('.vsay').nth(1);
  const id = await letter.getAttribute('data-say');
  const seq = sheet.tasks[0]!.visual as { items: [unknown, { items: { ch: string; say: string }[] }] };
  expect(id).toBe(seq.items[1].items[0]!.say);

  const before = (await said()).length;
  await letter.click();
  await expect(letter).toHaveClass(/said/);
  await expect.poll(async () => (await said()).length).toBeGreaterThan(before);
  const last = (await said()).at(-1)!;
  // Ha már van legyártott hangfájl, az szól; különben a készülék hangja mondja a nevet.
  expect(last.endsWith('.mp3') || /^[A-ZÁÉÖÜ][a-zé]? betű\.$/.test(last), last).toBe(true);

  // A keretes, keresett betűre koppintva is.
  const target = page.locator('.task').first().locator('.vsay').first();
  const n = (await said()).length;
  await target.click();
  await expect.poll(async () => (await said()).length).toBeGreaterThan(n);
});

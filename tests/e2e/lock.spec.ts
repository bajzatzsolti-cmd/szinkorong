import { expect, test } from '@playwright/test';
import { openSheet } from './helpers';

test.describe('gyerekzár', () => {
  test('nincs kijelölés, helyi menü, nagyítás; a lap nem görgethet', async ({ page }) => {
    await openSheet(page, 0);

    const css = await page.evaluate(async () => {
      const cs = getComputedStyle(document.body);
      const prop = (n: string) => cs.getPropertyValue(n);
      // A -webkit-touch-callout (csak iOS) és az overscroll-behavior értékét a tesztböngésző nem adja
      // vissza, ezért a kész stíluslap szövegében ellenőrizzük, hogy benne van-e.
      const href = (document.querySelector('link[rel="stylesheet"]') as HTMLLinkElement).href;
      const source = await (await fetch(href)).text();
      return {
        userSelect: prop('user-select') || prop('-webkit-user-select'),
        callout: /-webkit-touch-callout:\s*none/.test(source) ? 'none' : 'hiányzik',
        overscroll: /overscroll-behavior:\s*none/.test(source) ? 'none' : 'hiányzik',
        touchAction: prop('touch-action'),
        position: cs.position,
        overflow: cs.overflow,
      };
    });
    expect(css.userSelect).toBe('none');
    expect(css.callout).toBe('none');
    expect(css.overscroll).toContain('none');
    expect(css.touchAction).toBe('none');
    expect(css.position).toBe('fixed');
    expect(css.overflow).toBe('hidden');

    const prevented = await page.evaluate(() => {
      const fire = (type: string) => {
        const e = new Event(type, { cancelable: true, bubbles: true });
        document.body.dispatchEvent(e);
        return e.defaultPrevented;
      };
      return {
        contextmenu: fire('contextmenu'),
        selectstart: fire('selectstart'),
        dragstart: fire('dragstart'),
        gesturestart: fire('gesturestart'),
        gesturechange: fire('gesturechange'),
        dblclick: fire('dblclick'),
      };
    });
    expect(prevented).toEqual({
      contextmenu: true,
      selectstart: true,
      dragstart: true,
      gesturestart: true,
      gesturechange: true,
      dblclick: true,
    });

    // Háromszoros koppintás sem jelöl ki szöveget.
    await page.locator('.paper').click({ clickCount: 3 });
    expect(await page.evaluate(() => window.getSelection()?.toString() ?? '')).toBe('');

    // A lap nem görgethető.
    // (A mobil WebKit nem támogatja a mouse.wheel-t, ezért programból próbálunk görgetni.)
    const scrolled = await page.evaluate(() => {
      window.scrollTo(0, 400);
      document.scrollingElement!.scrollTop = 400;
      return [window.scrollX, window.scrollY, document.scrollingElement!.scrollTop];
    });
    expect(scrolled).toEqual([0, 0, 0]);
  });

  test('a viewport meta tiltja a nagyítást, és nincs kifelé mutató link egyik képernyőn sem', async ({ page }) => {
    await page.goto('/');
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('user-scalable=no');
    expect(viewport).toContain('viewport-fit=cover');

    const hrefs = async () => page.evaluate(() => document.querySelectorAll('a[href]').length);
    expect(await hrefs()).toBe(0);
    await page.locator('.tile[data-topic="minta"]').click();
    expect(await hrefs()).toBe(0);
    await page.locator('.card').first().click();
    expect(await hrefs()).toBe(0);
  });

  test('nincs szöveg a gyerekfelületen (csak ikon, szám, kép)', async ({ page }) => {
    await page.goto('/');
    const visibleText = async () =>
      page.evaluate(() => {
        const out: string[] = [];
        document.querySelectorAll('#app *').forEach((e) => {
          const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent!.trim()).join('');
          if (own && getComputedStyle(e).display !== 'none' && !e.closest('.sr-only')) out.push(own);
        });
        return out;
      });
    // A kezdőlapon csak a témakör-csempe képe látszik (benne a "?" jel az SVG-ben), szó nem.
    expect((await visibleText()).filter((t) => t !== '?')).toEqual([]);
    await page.locator('.tile[data-topic="minta"]').click();
    // A lapválasztón csak a lapok sorszámai látszanak.
    const map = (await visibleText()).filter((t) => t !== '?'); // a "?" a témakör ikonjában van
    expect(map.every((t) => /^\d+$/.test(t))).toBe(true);
    await page.locator('.card').first().click();
    // A lapon csak a "?" jel látszhat (az SVG-ben), szó nem.
    expect((await visibleText()).filter((t) => !/^[?\d]+$/.test(t))).toEqual([]);
  });
});

test.describe('szülői menü', () => {
  test('rövid nyomásra nem nyílik, 3 másodperces hosszú nyomásra igen', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('.parent-btn');
    const b = (await btn.boundingBox())!;
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.waitForTimeout(700);
    await expect(btn).toHaveClass(/holding/);
    await page.mouse.up();
    await page.waitForTimeout(3300); // ha a számláló nem állt le, ennyi idő alatt megnyílna
    await expect(page.locator('[data-testid="parent-panel"]')).toHaveCount(0);
    await expect(btn).not.toHaveClass(/holding/);

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.waitForTimeout(3300);
    await page.mouse.up();
    await expect(page.locator('[data-testid="parent-panel"]')).toBeVisible();
  });

  test('témakör ki/be, haladás törlése (kétlépcsős), bezárás', async ({ page }) => {
    // Készre jelölünk egy lapot, hogy legyen mit törölni.
    await page.goto('/');
    await page.evaluate(() =>
      localStorage.setItem('szinkorong:v1', JSON.stringify({ v: 1, done: { 'minta:0': { at: 1, tries: 1 } }, settings: { volume: 0.8, disabled: [] } })),
    );
    await page.reload();
    await expect(page.locator('.tile[data-topic="minta"] .dots i.on')).toHaveCount(1);

    const open = async () => {
      const b = (await page.locator('.parent-btn').boundingBox())!;
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(3300);
      await page.mouse.up();
      await expect(page.locator('[data-testid="parent-panel"]')).toBeVisible();
    };

    await open();
    // Első nyomás: csak megerősítést kér.
    await page.locator('[data-act="reset"]').click();
    await expect(page.locator('[data-act="reset"]')).toContainText('Biztosan');
    await page.locator('[data-act="close"]').click();
    await expect(page.locator('.tile[data-topic="minta"] .dots i.on')).toHaveCount(1);

    await open();
    await page.locator('[data-act="reset"]').click();
    await page.locator('[data-act="reset"]').click();
    await expect(page.locator('[data-act="reset"]')).toContainText('Törölve');
    await page.locator('[data-act="close"]').click();
    await expect(page.locator('.tile[data-topic="minta"] .dots i.on')).toHaveCount(0);

    // Témakör kikapcsolása: eltűnik a kezdőlapról.
    await open();
    await page.locator('input[data-topic="minta"]').uncheck();
    await page.locator('[data-act="close"]').click();
    await expect(page.locator('.tile[data-topic="minta"]')).toHaveCount(0);
  });
});

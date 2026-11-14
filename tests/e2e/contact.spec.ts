import { readFileSync } from 'node:fs';
import { test } from '@playwright/test';

// Kontaktlap a szókincs ellenőrzéséhez: minden szó színes képe és (ha van) az árnyéka, egymás mellett.
// Csak kérésre fut:  CONTACT=1 npx playwright test contact.spec.ts --project=ipad-mini-fekvo
test.skip(!process.env.CONTACT, 'Csak CONTACT=1 mellett fut.');

interface W {
  id: string;
  hu: string;
  category: string;
  goodShadow?: boolean;
  similar?: string;
  twin?: string;
}

const sprite = readFileSync('src/assets/sprite/openmoji.svg', 'utf8');
const { words } = JSON.parse(readFileSync('content/szokincs.json', 'utf8')) as { words: W[] };

const PER_PAGE = 36;

test('szókincs kontaktlapok', async ({ page }) => {
  for (let p = 0; p * PER_PAGE < words.length; p++) {
    const chunk = words.slice(p * PER_PAGE, (p + 1) * PER_PAGE);
    const cells = chunk
      .map((w) => {
        const color = `<svg viewBox="0 0 100 100"><use href="#w-${w.id}" x="3" y="3" width="94" height="94"/></svg>`;
        const shadow = w.goodShadow
          ? `<svg viewBox="0 0 100 100" class="sh"><use href="#s-${w.id}" x="3" y="3" width="94" height="94"/></svg>`
          : '<svg viewBox="0 0 100 100"></svg>';
        return `<div class="c"><div class="p">${color}${shadow}</div><div class="l">${w.id} <b>${w.category}</b> ${w.similar ?? ''} ${w.twin ? '⚭' + w.twin : ''}</div></div>`;
      })
      .join('');
    await page.setContent(
      `<html><body style="margin:6px;font:11px sans-serif;background:#fffdf6">${sprite}
       <style>.g{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.c{border:1px solid #ddd;padding:3px}
       .p{display:flex;gap:4px}.p svg{width:50%;height:auto;display:block}.sh{color:#2d3a55;opacity:.9}.l{text-align:center}</style>
       <div class="g">${cells}</div></body></html>`,
    );
    await page.screenshot({ path: `screenshots/szokincs-${String(p + 1).padStart(2, '0')}.png`, fullPage: true });
  }
});

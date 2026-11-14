// A Fél kép szemre is egyértelmű-e? A lapok megoldásait (jobb félképek, kivágott darabok) a sprite
// rajzaiból kis képpé rajzoljuk (sharp), és páronként összehasonlítjuk: két megoldás ne nézzen ki szinte
// ugyanúgy. Ugyanez a félképekre (1–2. szint) is.
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { range } from '../../src/engine/rng';
import type { Visual } from '../../src/render/visual';
import { buildSheet } from '../../src/topics';
import { felkep } from '../../src/topics/felkep';

const sprite = readFileSync('src/assets/sprite/openmoji.svg', 'utf8');
const SIZE = 48;
/** Két darab átlagos képpont-eltérése (0..1) ennél nagyobb kell legyen. */
const MIN_DIFF = 0.06;

function symbol(id: string): string {
  const m = sprite.match(new RegExp(`<symbol id="w-${id}" viewBox="0 0 72 72">([\\s\\S]*?)</symbol>`));
  if (!m) throw new Error(`nincs kép: ${id}`);
  return m[1]!;
}

/** A megoldás-elem önálló SVG-je (a <use> helyett a rajz maga), a cella 100 × 100-as terében. */
function standalone(v: Extract<Visual, { t: 'img' }>): Buffer {
  const art = `<svg x="3" y="3" width="94" height="94" viewBox="0 0 72 72">${symbol(v.id)}</svg>`;
  let body = art;
  if (v.piece) {
    const { x, y, r } = v.piece;
    body = `<defs><clipPath id="c"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath></defs><g clip-path="url(#c)">${art}</g>`;
    // csak a darab befoglaló négyzete számít
    return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x - r} ${y - r} ${2 * r} ${2 * r}" width="${SIZE}" height="${SIZE}"><rect x="0" y="0" width="100" height="100" fill="#fff"/>${body}</svg>`);
  }
  // jobb félkép: a 50..100 sáv
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="50 0 50 100" width="${SIZE / 2}" height="${SIZE}"><rect x="0" y="0" width="100" height="100" fill="#fff"/>${body}</svg>`);
}

async function pixels(v: Extract<Visual, { t: 'img' }>): Promise<Buffer> {
  return sharp(standalone(v)).removeAlpha().raw().toBuffer();
}

function diff(a: Buffer, b: Buffer): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i]! - b[i]!);
  return sum / (a.length * 255);
}

describe('Fél kép – a megoldások szemre is különböznek', () => {
  for (const index of range(15)) {
    it(`${index + 1}. lap: bármely két megoldás képpont-eltérése > ${MIN_DIFF}`, async () => {
      const sheet = buildSheet(felkep, index);
      const vis = sheet.answers.map((a) => a.visual as Extract<Visual, { t: 'img' }>);
      const px = await Promise.all(vis.map(pixels));
      let min = Infinity;
      let worst = '';
      for (let i = 0; i < px.length; i++) {
        for (let j = i + 1; j < px.length; j++) {
          const d = diff(px[i]!, px[j]!);
          if (d < min) {
            min = d;
            worst = `${vis[i]!.id} – ${vis[j]!.id}`;
          }
        }
      }
      expect(min, `legkevésbé különböző pár: ${worst}`).toBeGreaterThan(MIN_DIFF);
    });
  }
});

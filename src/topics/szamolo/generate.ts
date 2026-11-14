// Számoló plusz: számolás, összehasonlítás, eggyel több / kevesebb, számszomszédok, összeadás és elvétel 10-ig.
// Tartomány 1–10, nulla nélkül (terv, 14. kérdés). A képek SZÉTSZÓRVA állnak, nem tízes keretben: így a gyerek
// nem tudja alakra párosítani a pöttyökkel, meg kell számolnia.
//
// Lapfajták (ideiglenes beosztás, a szülő jóváhagyására vár):
//  • 1–3. lap (6): ugyanannyi: szétszórt képek → tízes keret ugyanannyi pöttyel.
//  • 4–5. lap (6): melyikből van több: két csoport (legalább 2 a különbség) → a több tárgy képe.
//  • 6–8. lap (8): eggyel több (+1 kép) / eggyel kevesebb (egy áthúzva) → számjegy.
//  • 9–10. lap (8): számszomszédok: három egymást követő szám, az egyik hiányzik → számjegy.
//  • 11–15. lap (10): képes összeadás (a + b) és elvétel (a, ebből b áthúzva) 10-ig → számjegy, 1-től 10-ig mind.
import { WORDS, isPictureSafe, type Word } from '../../data/vocab';
import { int, mulberry32, range, shuffle, type Rng } from '../../engine/rng';
import type { Sheet, SheetSpec } from '../../engine/sheet';
import type { ScatterItem, Visual } from '../../render/visual';
import { img, sayId, sheetFromPairs, type Matched } from '../common';

export const CONTENT_VERSION = 1;
export const SIZES = [6, 8, 10] as const;

export type Kind = 'ugyanannyi' | 'tobb' | 'egy' | 'szomszed' | 'muvelet';

/** A lap fajtája a sorszámából (a bemutató és a próbalapok is ezt használják). */
export function kindOf(index: number): Kind {
  if (index < 3) return 'ugyanannyi';
  if (index < 5) return 'tobb';
  if (index < 8) return 'egy';
  if (index < 10) return 'szomszed';
  return 'muvelet';
}

/** Megszámolható, kicsiben is felismerhető képek: gyümölcsök, édességek, játékok. */
export const COUNTABLE: readonly Word[] = WORDS.filter((w) => ['gy', 'ed', 'jt'].includes(w.category) && isPictureSafe(w) && !w.twin);

/**
 * k darab kép szétszórva: a mező kb. másfélszer annyi cellából áll, ahány kép van (így szórt, de nem apró),
 * a képek véletlen cellákba kerülnek kis elcsúsztatással; `crossed` darab véletlenszerűen áthúzva.
 */
export function scatter(r: Rng, id: string, k: number, crossed = 0): Visual {
  const cellCount = Math.min(16, Math.max(k + 1, Math.ceil(k * 1.5)));
  // Inkább magas, mint széles mező: a feladatsorban függőlegesen van hely, az összeadás két csoportja pedig egymás mellé kerül.
  const rows = Math.min(4, Math.ceil(Math.sqrt(cellCount)));
  const cols = Math.ceil(cellCount / rows);
  const cells = shuffle(r, range(cols * rows)).slice(0, k);
  const items: ScatterItem[] = cells.map((c) => ({ id, x: (c % cols) * 25 + 1 + int(r, 0, 2), y: Math.floor(c / cols) * 25 + 1 + int(r, 0, 2) }));
  for (const i of shuffle(r, range(k)).slice(0, crossed)) items[i]!.cross = true;
  return { t: 'scatter', items, w: cols * 25, h: rows * 25 };
}

const PLUS: Visual = { t: 'sym', id: 'plus' };
const SEP: Visual = { t: 'sym', id: 'sep' };
const num = (k: number): Visual => ({ t: 'glyph', ch: String(k) });

function build(r: Rng, kind: Kind, n: number): Matched[] {
  const objs = shuffle(r, COUNTABLE);
  const obj = (i: number): string => objs[i % objs.length]!.id;
  switch (kind) {
    case 'ugyanannyi':
      return shuffle(r, range(10).map((i) => i + 1))
        .slice(0, n)
        .map((k, i) => ({ task: scatter(r, obj(i), k), answer: { t: 'dots', k } }));
    case 'tobb':
      return range(n).map((i) => {
        let a = 0;
        let b = 0;
        while (Math.abs(a - b) < 2) {
          a = int(r, 1, 8);
          b = int(r, 1, 8);
        }
        const [A, B] = [obj(2 * i), obj(2 * i + 1)];
        return { task: { t: 'seq', items: [scatter(r, A, a), SEP, scatter(r, B, b)] }, answer: img(a > b ? A : B), answerSay: sayId(a > b ? A : B) };
      });
    case 'egy': {
      // Eredmények 2–9 között, mind különböző; a +1 és a −1 fele-fele.
      const results = shuffle(r, range(8).map((i) => i + 2)).slice(0, n);
      return results.map((res, i) =>
        i % 2 === 0
          ? { task: { t: 'seq', items: [scatter(r, obj(i), res - 1), PLUS, scatter(r, obj(i), 1)] }, answer: num(res) }
          : { task: scatter(r, obj(i), res + 1, 1), answer: num(res) },
      );
    }
    case 'szomszed': {
      const missing = shuffle(r, range(10).map((i) => i + 1)).slice(0, n);
      return missing.map((m) => {
        const pos = shuffle(r, [0, 1, 2].filter((p) => m - p >= 1 && m - p + 2 <= 10))[0]!;
        const start = m - pos;
        const items: Visual[] = [0, 1, 2].map((j) => (j === pos ? { t: 'blank' } : num(start + j)));
        return { task: { t: 'seq', items }, answer: num(m) };
      });
    }
    case 'muvelet': {
      const results = shuffle(r, range(10).map((i) => i + 1)).slice(0, n);
      return results.map((res, i) => {
        const add = res === 1 ? false : res === 10 ? true : r() < 0.5;
        if (add) {
          const a = int(r, 1, res - 1);
          return { task: { t: 'seq', items: [scatter(r, obj(i), a), PLUS, scatter(r, obj(i), res - a)] }, answer: num(res) };
        }
        const a = int(r, res + 1, 10);
        return { task: scatter(r, obj(i), a, a - res), answer: num(res) };
      });
    }
  }
}

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  return sheetFromPairs(spec, r, build(r, kindOf(spec.index), spec.n));
}

// Képes sudoku (latin négyzet): minden sorban és minden oszlopban minden kép pontosan egyszer szerepel.
// A kérdőjeles mezőbe melyik kép kerül?
//
// Szintek (ideiglenes beosztás, a szülő jóváhagyására vár):
//  • 1. szint (1–5. lap, 4 korong): 3 × 3, egy üres mező.
//  • 2. szint (6–10. lap, 6 korong): 4 × 4, egy üres mező.
//  • 3. szint (11–15. lap, 8 korong): 4 × 4, a kérdőjeles sorban egy MÁSIK mező is üres: a sor egymagában
//    nem dönti el, melyik kép hiányzik, az oszlopot is meg kell nézni.
//
// Képkészletek: minden feladat más képkészletből dolgozik, de a készletek „láncban” átfednek: az i. rács
// képei között ott van a saját megoldása és a következő feladat megoldása is (ahol az a sorában / oszlopában
// már szerepel, tehát oda nem illik). Így nem elég megkeresni, „melyik megoldás-kép van a rácsban”.
import { WORDS, isPictureSafe } from '../../data/vocab';
import { int, mulberry32, range, shuffle, type Rng } from '../../engine/rng';
import type { Sheet, SheetSpec } from '../../engine/sheet';
import type { Visual } from '../../render/visual';
import { pickTwinSafe, sayId, sheetFromPairs, type Matched } from '../common';

export const CONTENT_VERSION = 1;
export const SIZES = [4, 6, 8] as const;
/** A rács oldalhossza szintenként. */
export const GRID = [3, 4, 4] as const;

/** Véletlen latin négyzet: a ciklikus négyzet sorai, oszlopai és szimbólumai összekeverve. */
export function latinSquare(r: Rng, k: number): number[][] {
  const rows = shuffle(r, range(k));
  const cols = shuffle(r, range(k));
  const sym = shuffle(r, range(k));
  return rows.map((i) => cols.map((j) => sym[(i + j) % k] as number));
}

/** Jól felismerhető képek, egymástól különböző alakcsoportokból (similar), hogy a rácsban ne keveredjenek. */
function imagePool(): typeof WORDS {
  return WORDS.filter((w) => isPictureSafe(w) && ['gy', 'ja', 'ed', 'jt', 'al', 'zo', 'ru', 'ha', 'eg', 'no'].includes(w.category));
}

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  const { level, n } = spec;
  const k = GRID[level] as number;

  // n megoldás + feladatonként k − 2 töltelékkép, mind különböző.
  const words = pickTwinSafe(r, shuffle(r, imagePool()), n * (k - 1));
  const answers = words.slice(0, n);
  const fillers = words.slice(n);

  const matched: Matched[] = range(n).map((i) => {
    const symbols = [answers[i]!, answers[(i + 1) % n]!, ...fillers.slice(i * (k - 2), (i + 1) * (k - 2))];
    const sq = latinSquare(r, k);
    const row = int(r, 0, k - 1);
    const col = sq[row]!.indexOf(0); // a 0. szimbólum = a feladat megoldása
    const other = level === 2 ? shuffle(r, range(k).filter((c) => c !== col))[0]! : -1;
    const items: Visual[] = [];
    for (let y = 0; y < k; y++) {
      for (let x = 0; x < k; x++) {
        if (y === row && x === col) items.push({ t: 'blank' });
        else if (y === row && x === other) items.push({ t: 'empty' });
        else items.push({ t: 'img', id: symbols[sq[y]![x]!]!.id });
      }
    }
    return {
      task: { t: 'grid', cols: k, frame: true, items },
      answer: { t: 'img', id: answers[i]!.id },
      answerSay: sayId(answers[i]!.id),
    };
  });
  return sheetFromPairs(spec, r, shuffle(r, matched));
}

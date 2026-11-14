// Betűkereső (alak–háttér): hányszor szerepel a keretben mutatott betű a betűk között?
//
// Szintek (ideiglenes beosztás, a szülő jóváhagyására vár):
//  • 1. szint (1–5. lap, 6 korong): 12 nagybetű, a keresett betű 1–6-szor; a többi betű NEM hasonlít rá.
//    Megoldás: pöttyök (tízes keret).
//  • 2. szint (6–10. lap, 6 korong): 16 nagybetű, a keresett betű 1–8-szor; a többi betű fele hasonlít rá
//    (S–Z, O–Ö–C, E–F, M–N…). Megoldás: pöttyök.
//  • 3. szint (11–15. lap, 8 korong): 20 betű, kis- és nagybetű vegyesen; a keretben a betű nagy és kis
//    alakja is látszik, mindkettőt számolni kell (1–8). Megoldás: számjegy.
// A lapon belül minden darabszám különböző (ez adja, hogy minden megoldás más), és minden feladat más betűt keres.
import { int, mulberry32, pick, range, shuffle, type Rng } from '../../engine/rng';
import type { Sheet, SheetSpec } from '../../engine/sheet';
import type { Visual } from '../../render/visual';
import { sheetFromPairs, type Matched } from '../common';
import { LOWER, UPPER, isLower, isUpper, lookalikes, similar } from './letters';

export const CONTENT_VERSION = 1;
export const SIZES = [6, 6, 8] as const;
/** A betűmező mérete szintenként (két sorban). */
export const FIELD = [12, 16, 20] as const;
/** A legnagyobb darabszám szintenként. */
export const MAX_COUNT = [6, 8, 8] as const;

function buildField(r: Rng, level: number, target: string, count: number): string[] {
  const total = FIELD[level] as number;
  const lower = target.toLowerCase();
  let hits: string[];
  let sim: string[];
  let pool: string[];

  if (level === 2) {
    // Kis- és nagybetű vegyesen; ha legalább kettő van, mindkét alakból jut.
    const upperHits = count >= 2 ? int(r, 1, count - 1) : int(r, 0, 1);
    hits = [...Array<string>(upperHits).fill(target), ...Array<string>(count - upperHits).fill(lower)];
    const banned = new Set([target, lower, ...lookalikes(target), ...lookalikes(lower)]);
    sim = [...similar(target), ...similar(lower)].filter((c) => !banned.has(c));
    pool = [...UPPER, ...LOWER].filter((c) => !banned.has(c));
  } else {
    hits = Array<string>(count).fill(target);
    sim = similar(target);
    // Könnyű szinten a hasonló betűk kimaradnak, közepesen bármi jöhet.
    pool = UPPER.filter((c) => c !== target && (level === 1 || !sim.includes(c)));
  }

  const others = total - count;
  const distractors: string[] = [];
  const fromSimilar = level === 0 || sim.length === 0 ? 0 : Math.ceil(others / 2);
  for (let i = 0; i < fromSimilar; i++) distractors.push(pick(r, sim));
  while (distractors.length < others) distractors.push(pick(r, pool));
  if (level === 2) {
    // A mező legyen tényleg vegyes: a többi betű között is legyen nagy- és kisbetű.
    for (const sameCase of [isUpper, isLower]) {
      if (!distractors.some(sameCase)) distractors[int(r, 0, distractors.length - 1)] = pick(r, pool.filter(sameCase));
    }
  }
  return shuffle(r, [...hits, ...distractors]);
}

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  const { level, n } = spec;
  const max = MAX_COUNT[level] as number;

  // Válasz-első: előbb a különböző darabszámok, aztán hozzájuk a betűmezők.
  const counts = shuffle(r, range(max).map((i) => i + 1)).slice(0, n);
  const targets = shuffle(r, UPPER).slice(0, n);

  const matched: Matched[] = counts.map((count, i) => {
    const target = targets[i] as string;
    const field = buildField(r, level, target, count);
    const task: Visual = {
      t: 'seq',
      gap: 18,
      items: [
        { t: 'glyph', ch: level === 2 ? target + target.toLowerCase() : target, boxed: true },
        { t: 'grid', cols: field.length / 2, cell: 50, items: field.map((ch) => ({ t: 'glyph', ch })) },
      ],
    };
    const answer: Visual = level === 2 ? { t: 'glyph', ch: String(count) } : { t: 'dots', k: count };
    return { task, answer };
  });
  return sheetFromPairs(spec, r, matched);
}

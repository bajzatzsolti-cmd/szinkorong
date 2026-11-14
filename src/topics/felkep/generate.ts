// Fél kép, hiányzó darab (vizuális zárás).
//
// Szintek (ideiglenes beosztás, a szülő jóváhagyására vár):
//  • 1. szint (1–5. lap, 6 korong): a kép bal fele látszik, a megoldás a jobb fele; a képek különböző alakúak.
//  • 2. szint (6–10. lap, 8 korong): ugyanez, de hasonló alakú képek kerülnek egymás mellé (pl. több négylábú állat).
//  • 3. szint (11–15. lap, 10 korong): a képből egy kör alakú darab ki van vágva; a megoldás a kivágott darab
//    (felnagyítva), hasonló alakú képek darabjai közül.
// A kép mindig jól felismerhető körvonalú (goodShadow), és két szinte egyforma kép (twin) nem kerül egy lapra.
import { mulberry32, pick, shuffle } from '../../engine/rng';
import type { Sheet, SheetSpec } from '../../engine/sheet';
import type { Spot, Visual } from '../../render/visual';
import { pickSimilar, pickSpread, shadowPool } from '../arnyek/generate';
import { sayId, sheetFromPairs, type Matched } from '../common';

export const CONTENT_VERSION = 1;
export const SIZES = [6, 8, 10] as const;

/** A kivágott darab lehetséges helyei (a kép közepe táján, ahol a rajz biztosan nem üres). */
export const SPOTS: readonly Spot[] = [
  { x: 50, y: 50, r: 17 },
  { x: 42, y: 45, r: 17 },
  { x: 58, y: 55, r: 17 },
  { x: 45, y: 58, r: 17 },
  { x: 56, y: 43, r: 17 },
];

/** A kép két felén legalább ennyire egyformán sok rajz legyen (különben az egyik fél szinte üres, pl. átlós gitár). */
export const MIN_HALF_BALANCE = 0.55;

export const halfPool = (): ReturnType<typeof shadowPool> => shadowPool().filter((w) => w.halfBalance >= MIN_HALF_BALANCE);

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  const pool = halfPool();
  const words = spec.level === 0 ? pickSpread(r, pool, spec.n) : pickSimilar(r, pool, spec.n);

  const matched: Matched[] = shuffle(r, words).map((w) => {
    if (spec.level < 2) {
      const task: Visual = { t: 'img', id: w.id, half: 'L' };
      const answer: Visual = { t: 'img', id: w.id, half: 'R' };
      return { task, answer, taskSay: sayId(w.id) };
    }
    const spot = pick(r, SPOTS);
    return { task: { t: 'img', id: w.id, hole: { ...spot } }, answer: { t: 'img', id: w.id, piece: { ...spot } }, taskSay: sayId(w.id) };
  });
  return sheetFromPairs(spec, r, matched);
}

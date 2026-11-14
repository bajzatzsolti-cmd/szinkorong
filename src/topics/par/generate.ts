// Mi tartozik össze? Összetartozó párok (méh–méz, kulcs–ajtó…) a content/parok.json alapján.
//
// Egy lapra csak olyan párok kerülnek, amelyek között NINCS semmilyen kapcsolat (sem pár, sem 'also'),
// és egy szó sem szerepel kétszer: így minden feladathoz pontosan egy megoldás illik.
// A két kép közül véletlenül az egyik a feladat, a másik a megoldás. Mindhárom szint ugyanazokból a párokból
// dolgozik (a szintek közti különbség a szülővel egyeztetendő).
import { PAIRS, related, type Pair } from '../../data/pairs';
import { WORD_BY_ID, isPictureSafe } from '../../data/vocab';
import { mulberry32, shuffle, type Rng } from '../../engine/rng';
import type { Sheet, SheetSpec } from '../../engine/sheet';
import { img, sayId, sheetFromPairs } from '../common';

export const CONTENT_VERSION = 1;
export const SIZES = [6, 8, 10] as const;

const usable = (p: Pair): boolean => p.every((id) => {
  const w = WORD_BY_ID.get(id);
  return !!w && isPictureSafe(w);
});

/** Két pár összeférhet-e egy lapon. */
export function compatible(p: Pair, q: Pair): boolean {
  for (const u of p) {
    for (const v of q) {
      if (u === v || related(u, v)) return false;
    }
  }
  return true;
}

export function selectPairs(r: Rng, n: number): Pair[] {
  const pool = PAIRS.filter(usable);
  for (let attempt = 0; attempt < 300; attempt++) {
    const chosen: Pair[] = [];
    for (const p of shuffle(r, pool)) {
      if (chosen.every((q) => compatible(p, q))) chosen.push(p);
      if (chosen.length === n) return chosen;
    }
  }
  throw new Error(`Mi tartozik össze: nem választható ${n} összeférő pár (kevés a pár a parok.json-ban).`);
}

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  const chosen = selectPairs(r, spec.n);
  const pairs = chosen.map(([a, b]) => {
    const swap = r() < 0.5;
    const [t, s] = swap ? [b, a] : [a, b];
    return { task: img(t), answer: img(s), taskSay: sayId(t), answerSay: sayId(s) };
  });
  return sheetFromPairs(spec, r, pairs);
}

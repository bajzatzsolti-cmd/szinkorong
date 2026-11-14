// Mérleg: melyik a nehezebb? A mérleg a nehezebb oldalán billen le.
//
// Szintek (ideiglenes beosztás, a szülő jóváhagyására vár):
//  • 1. szint (1–5. lap, 6 korong): valódi tárgyak (alma, kutya, elefánt…), egy mérleg; a két tárgy közt
//    legalább tízszeres a súlykülönbség (content/suly.json), és a mérleg is a nehezebbet mutatja lent.
//  • 2. szint (6–10. lap, 8 korong): színes játékkockák (alakzatok), egy mérleg: itt CSAK a mérleg mutatja,
//    melyik a nehezebb (világismerettel nem lehet kitalálni).
//  • 3. szint (11–15. lap, 10 korong): két mérleg, láncolás: A nehezebb B-nél, B nehezebb C-nél →
//    melyik a legnehezebb? (A)
// A „mi egyensúlyozza ki” változat egyeztetésre vár, ezért még nincs benne.
//
// A lap tárgyai egyetlen súlysorrendbe rendeződnek (O0 > O1 > O2 > …), és az i. feladat az i., i+1.
// (3. szinten az i+2.) tárgyat mutatja: így egy megoldás-kép több feladatban is szerepel (egyszer a
// nehezebb, máskor a könnyebb oldalon), és nem elég megkeresni, „hol van ez a kép”.
import { WORDS, isPictureSafe, type Word } from '../../data/vocab';
import { mulberry32, range, shuffle, type Rng } from '../../engine/rng';
import type { Sheet, SheetSpec } from '../../engine/sheet';
import type { ShapeId } from '../../render/shapes';
import { TINTS, type Visual } from '../../render/visual';
import { sayId, sheetFromPairs, type Matched } from '../common';

export const CONTENT_VERSION = 1;
export const SIZES = [6, 8, 10] as const;

const TOKEN_SHAPES: readonly ShapeId[] = ['kor', 'negyzet', 'haromszog', 'csillag', 'sziv', 'hatszog', 'rombusz', 'otszog'];

/** Az n. játékkocka: egyedi alak + szín páros (24-ig mind különböző). */
export function token(j: number): Visual {
  return { t: 'shape', id: TOKEN_SHAPES[j % TOKEN_SHAPES.length]!, fill: 'solid', tint: TINTS[j % TINTS.length]! };
}

/** Egy mérleg: a nehezebb tárgy véletlenül bal vagy jobb oldalon, arra billen. */
function balance(r: Rng, heavy: Visual, light: Visual): Visual {
  return r() < 0.5
    ? { t: 'balance', left: [heavy], right: [light], tilt: 'left' }
    : { t: 'balance', left: [light], right: [heavy], tilt: 'right' };
}

/** Valódi tárgyak csökkenő súlysorrendben: súlyosztályonként legfeljebb egy, n + 1 tárgy. */
function realChain(r: Rng, count: number): Word[] | null {
  const byClass = new Map<number, Word[]>();
  for (const w of WORDS) {
    if (w.weight === undefined || !isPictureSafe(w)) continue;
    if (!byClass.has(w.weight)) byClass.set(w.weight, []);
    byClass.get(w.weight)!.push(w);
  }
  const classes = [...byClass.keys()].sort((a, b) => b - a);
  if (classes.length < count) return null;
  // Melyik osztályok kerülnek a láncba (véletlen részhalmaz, csökkenő sorrendben).
  const picked = shuffle(r, classes).slice(0, count).sort((a, b) => b - a);
  return picked.map((c) => shuffle(r, byClass.get(c)!)[0]!);
}

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  const { level, n } = spec;
  let matched: Matched[];

  if (level === 0) {
    const chain = realChain(r, n + 1);
    if (!chain) throw new Error('Mérleg: nincs elég súlyosztály a valódi tárgyakhoz (content/suly.json).');
    const vis = (w: Word): Visual => ({ t: 'img', id: w.id });
    matched = range(n).map((i) => ({
      task: balance(r, vis(chain[i]!), vis(chain[i + 1]!)),
      answer: vis(chain[i]!),
      answerSay: sayId(chain[i]!.id),
    }));
  } else {
    const order = shuffle(r, range(24)).slice(0, n + level); // O0 > O1 > …
    const tok = (i: number): Visual => token(order[i]!);
    matched = range(n).map((i) => {
      if (level === 1) return { task: balance(r, tok(i), tok(i + 1)), answer: tok(i) };
      const pair = [balance(r, tok(i), tok(i + 1)), balance(r, tok(i + 1), tok(i + 2))];
      return { task: { t: 'seq', gap: 24, items: shuffle(r, pair) }, answer: tok(i) };
    });
  }
  return sheetFromPairs(spec, r, shuffle(r, matched));
}

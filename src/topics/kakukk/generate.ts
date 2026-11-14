// Kakukktojás: négy képből egy nem illik a többihez. A megoldásoszlopban a kakukktojások állnak.
//
// Szintek (ideiglenes beosztás, a szülő jóváhagyására vár):
//  • 1. szint (1–5. lap, 6 korong): kategória szerint, könnyű csoportokból (állat, gyümölcs, jármű, ruha…).
//  • 2. szint (6–10. lap, 8 korong): kategória szerint, az összes csoportból.
//  • 3. szint (11–15. lap, 10 korong): tulajdonság szerint: IRÁNY (egy kép másfelé néz), DARABSZÁM
//    (egy helyen kettő van), SZÍN (egy alakzat más színű).
//
// A feladatok párban készülnek, és a pár két feladata ugyanabból a két „fajtából” áll, fordított arányban:
//   A = { c1, c2, c3, d1 } → kakukktojás d1      B = { d1, d2, d3, c1 } → kakukktojás c1
// Így minden megoldás-kép két feladatban is szerepel (egyszer kakukktojásként, egyszer a többiek között):
// nem elég megkeresni, „hol van ez a kép”, azt kell eldönteni, melyik lóg ki.
//
// Kategória szerinti feladatnál a kép uralkodó színe (content/kepjellemzok.json) nem adhat MÁSIK
// kakukktojást (pl. három piros és egy zöld kép, ahol a zöld nem a kilógó kategóriájú).
import { CATEGORIES, WORDS, isPictureSafe, type Word } from '../../data/vocab';
import { mulberry32, range, shuffle, type Rng } from '../../engine/rng';
import type { Sheet, SheetSpec } from '../../engine/sheet';
import type { ShapeId } from '../../render/shapes';
import { TINTS, type Visual } from '../../render/visual';
import { sayId, sheetFromPairs, type Matched } from '../common';

export const CONTENT_VERSION = 1;
export const SIZES = [6, 8, 10] as const;

/** Az 1. szint csoportjai (a legkönnyebben felismerhetők). */
export const EASY_CATEGORIES: readonly string[] = ['al', 'gy', 'ja', 'ru', 'ha', 'ed', 'zo', 'jt'];
/** Irányos képek (a tükrözés jól látszik): állatok, madarak, járművek, erős aszimmetriával. */
export const DIRECTION_CATEGORIES: readonly string[] = ['al', 'ma', 'ja'];
export const DIRECTION_MIN_ASYM = 0.3;
/** Darabszám-feladat képei. */
const COUNT_CATEGORIES: readonly string[] = ['gy', 'ed', 'jt', 'zo', 'al', 'ja'];
const TINT_SHAPES: readonly ShapeId[] = ['kor', 'negyzet', 'haromszog', 'csillag', 'sziv', 'hatszog', 'rombusz', 'otszog'];

const img = (id: string): Visual => ({ t: 'img', id });
const usable = (cat: string): Word[] => WORDS.filter((w) => w.category === cat && isPictureSafe(w));

/** Ha a négy szín közül pontosan egy tér el a másik háromtól, annak a sorszáma; különben null. */
export function colourOdd(colors: readonly string[]): number | null {
  for (let i = 0; i < colors.length; i++) {
    const others = colors.filter((_, j) => j !== i);
    if (others.every((c) => c === others[0]) && colors[i] !== others[0]) return i;
  }
  return null;
}

/** Négy elem összekeverve, a kakukktojás a `odd` sorszámon a bemenetben. */
const group = (r: Rng, items: Visual[]): Visual => ({ t: 'seq', gap: 10, items: shuffle(r, items) });

function categoryPair(r: Rng, catA: string, catB: string): Matched[] | null {
  const A = shuffle(r, usable(catA)).slice(0, 3);
  const B = shuffle(r, usable(catB)).slice(0, 3);
  if (A.length < 3 || B.length < 3) return null;
  const groupA = [...A, B[0]!]; // kakukktojás: B[0]
  const groupB = [...B, A[0]!]; // kakukktojás: A[0]
  for (const g of [groupA, groupB]) {
    const co = colourOdd(g.map((w) => w.color));
    if (co !== null && co !== 3) return null;
  }
  return [
    { task: group(r, groupA.map((w) => img(w.id))), answer: img(B[0]!.id), answerSay: sayId(B[0]!.id) },
    { task: group(r, groupB.map((w) => img(w.id))), answer: img(A[0]!.id), answerSay: sayId(A[0]!.id) },
  ];
}

/** Két változat ugyanabból: V0, V1. A = {V0, V0, V0, V1} → V1;  B = {V1, V1, V1, V0} → V0. */
function variantPair(r: Rng, v0: Visual, v1: Visual, say?: string): Matched[] {
  const m = (base: Visual, odd: Visual): Matched => {
    const out: Matched = { task: group(r, [base, base, base, odd].map((v) => structuredClone(v))), answer: structuredClone(odd) };
    if (say) out.answerSay = say;
    return out;
  };
  return [m(v0, v1), m(v1, v0)];
}

type Attr = 'flip' | 'count' | 'tint';

function attributeSheet(r: Rng, pairs: number): Matched[] {
  const kinds: Attr[] = shuffle(r, range(pairs).map((i) => (['flip', 'count', 'tint'] as const)[i % 3]));
  const dirPool = shuffle(r, WORDS.filter((w) => DIRECTION_CATEGORIES.includes(w.category) && isPictureSafe(w) && w.directional && w.asym >= DIRECTION_MIN_ASYM));
  const countPool = shuffle(r, WORDS.filter((w) => COUNT_CATEGORIES.includes(w.category) && isPictureSafe(w)));
  const shapes = shuffle(r, TINT_SHAPES);
  const used = new Set<string>();
  const out: Matched[] = [];
  for (const kind of kinds) {
    if (kind === 'flip') {
      const w = dirPool.find((x) => !used.has(x.id))!;
      used.add(w.id);
      out.push(...variantPair(r, img(w.id), { t: 'img', id: w.id, flip: true }, sayId(w.id)));
    } else if (kind === 'count') {
      const w = countPool.find((x) => !used.has(x.id))!;
      used.add(w.id);
      out.push(...variantPair(r, img(w.id), { t: 'pack', items: [img(w.id), img(w.id)] }, sayId(w.id)));
    } else {
      const shape = shapes.pop()!;
      const [t0, t1] = shuffle(r, TINTS);
      out.push(...variantPair(r, { t: 'shape', id: shape, fill: 'solid', tint: t0 }, { t: 'shape', id: shape, fill: 'solid', tint: t1 }));
    }
  }
  return out;
}

function categorySheet(r: Rng, level: number, pairs: number): Matched[] | null {
  const pool = level === 0 ? EASY_CATEGORIES : Object.values(CATEGORIES).filter((c) => c.groupable).map((c) => c.id);
  const cats = shuffle(r, pool.filter((c) => usable(c).length >= 3));
  const out: Matched[] = [];
  const usedCats = new Set<string>();
  for (let p = 0; p < pairs; p++) {
    const a = cats.find((c) => !usedCats.has(c));
    if (!a) return null;
    usedCats.add(a);
    const b = cats.find((c) => !usedCats.has(c) && CATEGORIES[c]!.family !== CATEGORIES[a]!.family);
    if (!b) return null;
    usedCats.add(b);
    const pair = categoryPair(r, a, b);
    if (!pair) return null;
    out.push(...pair);
  }
  return out;
}

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  const pairs = spec.n / 2;
  if (!Number.isInteger(pairs)) throw new Error('Kakukktojás: páros számú feladat kell.');
  for (let attempt = 0; attempt < 300; attempt++) {
    const matched = spec.level === 2 ? attributeSheet(r, pairs) : categorySheet(r, spec.level, pairs);
    if (matched) return sheetFromPairs(spec, r, shuffle(r, matched));
  }
  throw new Error('Kakukktojás: nem sikerült egyértelmű lapot készíteni.');
}


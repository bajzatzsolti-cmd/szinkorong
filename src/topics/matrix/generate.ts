// Mátrix: 2 × 2-es, majd 3 × 3-as rács egy üres mezővel. Soronként az egyik tulajdonság állandó,
// oszloponként egy másik; a hiányzó elem a sorából az egyiket, az oszlopából a másikat örökli.
//
// Tulajdonságok: alak, kitöltés (üres / halvány / telt), méret, darabszám, forgatás.
// Szintek (ideiglenes beosztás, a szülő jóváhagyására vár):
//  • 1. szint (1–5. lap, 4 korong): 2 × 2, a jobb alsó mező hiányzik; alak, kitöltés, méret, darabszám.
//  • 2. szint (6–10. lap, 6 korong): 2 × 2, bármelyik mező hiányozhat; a forgatás is szerepel.
//  • 3. szint (11–15. lap, 8 korong): 3 × 3, bármelyik mező hiányozhat.
//
// A feladatok párban készülnek: a pár két rácsa ugyanazokból az elemekből áll (más elrendezésben), és a
// két megoldás egy tulajdonságban egyezik, egyben eltér. Így minden feladatnál van egy „majdnem jó”
// megoldás is a lapon: nem elég az alakot (vagy csak a színt) nézni, a sort ÉS az oszlopot is figyelni kell.
import { int, mulberry32, pick, range, shuffle, type Rng } from '../../engine/rng';
import type { Sheet, SheetSpec } from '../../engine/sheet';
import type { ShapeId } from '../../render/shapes';
import { visualKey, type Fill, type Visual } from '../../render/visual';
import { sheetFromPairs, type Matched } from '../common';

export const CONTENT_VERSION = 1;
export const SIZES = [4, 6, 8] as const;

export type Attr = 'shape' | 'fill' | 'size' | 'count' | 'rot';
export const ATTRS: readonly Attr[] = ['shape', 'fill', 'size', 'count', 'rot'];

export interface Elem {
  shape: ShapeId;
  fill: Fill;
  size: number;
  count: number;
  rot: number;
}

/** A rács oldalhossza szintenként. */
export const GRID = [2, 2, 3] as const;

/** Melyik két tulajdonság változhat együtt (a darabszám és a méret nem: a sok kicsi elem olvashatatlan lenne). */
const ATTR_PAIRS: readonly (readonly (readonly [Attr, Attr])[])[] = [
  [['shape', 'fill'], ['shape', 'size'], ['fill', 'size'], ['shape', 'count']],
  [['shape', 'fill'], ['shape', 'size'], ['fill', 'size'], ['shape', 'count'], ['rot', 'fill'], ['rot', 'size'], ['shape', 'rot'], ['count', 'fill']],
  [['shape', 'fill'], ['shape', 'size'], ['fill', 'size'], ['shape', 'rot'], ['rot', 'fill'], ['shape', 'count'], ['count', 'fill']],
];

const ANY_SHAPES: readonly ShapeId[] = ['kor', 'negyzet', 'haromszog', 'csillag', 'sziv', 'rombusz', 'hatszog', 'kereszt', 'otszog'];
/** Olyan alakok, amelyeken a 90°-os elforgatás jól látszik. */
const ROT_SHAPES: readonly ShapeId[] = ['nyil', 'haromszog', 'felhold', 'sziv', 'felkor', 'trapez'];

export function elemVisual(e: Elem): Visual {
  const base: Extract<Visual, { t: 'shape' }> = { t: 'shape', id: e.shape, fill: e.fill };
  if (e.rot) base.rot = e.rot;
  if (e.size !== 1) base.scale = e.size;
  return e.count === 1 ? base : { t: 'pack', items: range(e.count).map(() => ({ ...base })) };
}

function values(r: Rng, attr: Attr, k: number, shapes: readonly ShapeId[]): (string | number)[] {
  switch (attr) {
    case 'shape':
      return shuffle(r, shapes).slice(0, k);
    case 'fill':
      return shuffle(r, k === 2 ? ['outline', 'solid'] : ['outline', 'light', 'solid']);
    case 'size':
      return shuffle(r, k === 2 ? [0.5, 1] : [0.45, 0.7, 1]);
    case 'count':
      return shuffle(r, k === 2 ? [1, 2] : [1, 2, 3]);
    case 'rot':
      return shuffle(r, [0, 90, 180, 270]).slice(0, k);
  }
}

/** Véletlen sorrend 0..k-1-ből úgy, hogy a `pos` helyen a `value` álljon. */
function orderWith(r: Rng, k: number, pos: number, value: number): number[] {
  const rest = shuffle(r, range(k).filter((v) => v !== value));
  return range(k).map((p) => (p === pos ? value : (rest.pop() as number)));
}

/** Egy feladatpár: közös elemkészlet, két rács, két megoldás (egy tulajdonságban egyeznek, egyben eltérnek). */
function buildPair(r: Rng, level: number, attrs: readonly [Attr, Attr]): Matched[] {
  const k = GRID[level] as number;
  const [ax, ay] = attrs;
  const shapes = attrs.includes('rot') ? ROT_SHAPES : ANY_SHAPES;
  const base: Elem = { shape: pick(r, shapes), fill: 'solid', size: 1, count: 1, rot: 0 };
  const xv = values(r, ax, k, shapes);
  const yv = values(r, ay, k, shapes);
  const elem = (i: number, j: number): Elem => ({ ...base, [ax]: xv[i], [ay]: yv[j] }) as Elem;

  const shared = int(r, 0, k - 1);
  const [d0, d1] = shuffle(r, range(k)) as [number, number];
  const targets: [number, number][] = r() < 0.5 ? [[shared, d0], [shared, d1]] : [[d0, shared], [d1, shared]];

  return targets.map(([ti, tj]) => {
    const transposed = r() < 0.5; // melyik tulajdonság megy sorok, melyik oszlopok szerint
    const missing = level === 0 ? k * k - 1 : int(r, 0, k * k - 1);
    const mr = Math.floor(missing / k);
    const mc = missing % k;
    const rowOrder = orderWith(r, k, mr, transposed ? tj : ti);
    const colOrder = orderWith(r, k, mc, transposed ? ti : tj);
    const items: Visual[] = [];
    for (let row = 0; row < k; row++) {
      for (let col = 0; col < k; col++) {
        if (row === mr && col === mc) items.push({ t: 'blank' });
        else items.push(elemVisual(transposed ? elem(colOrder[col]!, rowOrder[row]!) : elem(rowOrder[row]!, colOrder[col]!)));
      }
    }
    return { task: { t: 'grid', cols: k, frame: true, items }, answer: elemVisual(elem(ti, tj)) };
  });
}

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  const { level, n } = spec;
  const pairs = n / 2;
  if (!Number.isInteger(pairs)) throw new Error('Mátrix: páros számú feladat kell.');

  for (let attempt = 0; attempt < 500; attempt++) {
    // A lap párjai lehetőleg különböző tulajdonság-kettőst használnak.
    const combos = shuffle(r, ATTR_PAIRS[level]!);
    const matched = range(pairs).flatMap((g) => buildPair(r, level, combos[g % combos.length]!));
    const keys = matched.map((m) => visualKey(m.answer));
    if (new Set(keys).size === keys.length) return sheetFromPairs(spec, r, shuffle(r, matched));
  }
  throw new Error('Mátrix: nem sikerült csupa különböző megoldású lapot készíteni.');
}

// Analógia: A úgy aránylik B-hez, mint C a …-hez. A feladat: „A → B ┊ C → ?”, a megoldás a hiányzó negyedik kép.
//
// Viszonyok: kicsi → nagy, üres → teli (csak alakzatoknál), egész → fél, egy → kettő, kép → árnyék (csak képeknél).
// Szintek (ideiglenes beosztás, a szülő jóváhagyására vár):
//  • 1. szint (1–5. lap, 4 korong): kicsi → nagy, egy → kettő, kép → árnyék, üres → teli.
//  • 2. szint (6–10. lap, 6 korong): + egész → fél.
//  • 3. szint (11–15. lap, 8 korong): a viszonyok visszafelé is (nagy → kicsi, teli → üres, kettő → egy…).
//
// A feladatok párban készülnek: a pár két feladatában UGYANAZ a kép (C) szerepel, de más viszonnyal.
// Így a lapon mindig két megoldás mutatja ugyanazt a képet (pl. nagy alma és két alma): nem elég
// megkeresni „az almát”, a viszonyt kell megérteni.
import { WORDS, isPictureSafe } from '../../data/vocab';
import { mulberry32, range, shuffle, type Rng } from '../../engine/rng';
import type { Sheet, SheetSpec } from '../../engine/sheet';
import type { ShapeId } from '../../render/shapes';
import { visualKey, type Visual } from '../../render/visual';
import { sheetFromPairs, type Matched } from '../common';

export const CONTENT_VERSION = 1;
export const SIZES = [4, 6, 8] as const;

export type Kind = 'img' | 'shape';
export type Flag = 'small' | 'outline' | 'half' | 'double' | 'shadow';
export const FLAGS: readonly Flag[] = ['small', 'outline', 'half', 'double', 'shadow'];

/** Egy kép állapota: melyik tárgy, és milyen változatban. */
export interface State {
  kind: Kind;
  id: string;
  small: boolean;
  outline: boolean;
  half: boolean;
  double: boolean;
  shadow: boolean;
}

/** A viszony KIINDULÓ értéke „előre” irányban: kicsi → nagy (small: igaz → hamis), egész → fél (half: hamis → igaz)… */
export const FORWARD_FROM: Record<Flag, boolean> = { small: true, outline: true, half: false, double: false, shadow: false };

/** Melyik viszony használható képekkel / alakzatokkal, szintenként. */
const LEVEL_FLAGS: Record<Kind, readonly (readonly Flag[])[]> = {
  img: [['small', 'double', 'shadow'], ['small', 'double', 'shadow', 'half'], ['small', 'double', 'shadow', 'half']],
  shape: [['small', 'double', 'outline'], ['small', 'double', 'outline', 'half'], ['small', 'double', 'outline', 'half']],
};

const SHAPE_POOL: readonly ShapeId[] = ['kor', 'negyzet', 'haromszog', 'csillag', 'sziv', 'rombusz', 'hatszog', 'otszog', 'kereszt'];

const plain = (kind: Kind, id: string): State => ({ kind, id, small: false, outline: false, half: false, double: false, shadow: false });

export function stateVisual(s: State): Visual {
  let base: Visual;
  if (s.kind === 'img') {
    const v: Extract<Visual, { t: 'img' }> = { t: 'img', id: s.id };
    if (s.shadow) v.shadow = true;
    if (s.small) v.scale = 0.5;
    if (s.half) v.half = true;
    base = v;
  } else {
    const v: Extract<Visual, { t: 'shape' }> = { t: 'shape', id: s.id as ShapeId, fill: s.outline ? 'outline' : 'solid' };
    if (s.small) v.scale = 0.5;
    if (s.half) v.half = true;
    base = v;
  }
  return s.double ? { t: 'seq', gap: 4, items: [base, { ...base }] } : base;
}

interface Relation {
  flag: Flag;
  /** előre (igaz) vagy visszafelé (hamis) */
  forward: boolean;
}

const fromValue = (rel: Relation): boolean => (rel.forward ? FORWARD_FROM[rel.flag] : !FORWARD_FROM[rel.flag]);

/** A viszony alkalmazása egy tárgyra: [kiinduló állapot, eredmény]. */
function apply(kind: Kind, id: string, rel: Relation): [State, State] {
  const from = fromValue(rel);
  return [
    { ...plain(kind, id), [rel.flag]: from },
    { ...plain(kind, id), [rel.flag]: !from },
  ];
}

function buildPair(r: Rng, level: number, kind: Kind, y: string, xs: readonly [string, string]): Matched[] | null {
  const options: Relation[] = shuffle(
    r,
    LEVEL_FLAGS[kind][level]!.flatMap((flag) => (level === 2 ? [{ flag, forward: true }, { flag, forward: false }] : [{ flag, forward: true }])),
  );
  // Két viszony, amelyek ugyanarra a képre KÜLÖNBÖZŐ eredményt adnak.
  const first = options[0]!;
  const firstKey = visualKey(stateVisual(apply(kind, y, first)[1]));
  const second = options.slice(1).find((o) => visualKey(stateVisual(apply(kind, y, o)[1])) !== firstKey);
  if (!second) return null;

  return [first, second].map((rel, i) => {
    const [a, b] = apply(kind, xs[i]!, rel);
    const [c, d] = apply(kind, y, rel);
    return {
      task: {
        t: 'seq',
        gap: 10,
        items: [stateVisual(a), { t: 'sym', id: 'arrow' }, stateVisual(b), { t: 'sym', id: 'sep' }, stateVisual(c), { t: 'sym', id: 'arrow' }, { t: 'blank' }],
      },
      answer: stateVisual(d),
    };
  });
}

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  const { level, n } = spec;
  const pairs = n / 2;
  if (!Number.isInteger(pairs)) throw new Error('Analógia: páros számú feladat kell.');

  const imgPool = WORDS.filter((w) => w.goodShadow && isPictureSafe(w)).map((w) => w.id);

  for (let attempt = 0; attempt < 500; attempt++) {
    const imgs = shuffle(r, imgPool);
    const shapes = shuffle(r, SHAPE_POOL);
    const startWithImg = r() < 0.5;
    const matched: Matched[] = [];
    let ok = true;
    for (const g of range(pairs)) {
      const kind: Kind = (g % 2 === 0) === startWithImg ? 'img' : 'shape';
      const pool = kind === 'img' ? imgs : (shapes as string[]);
      const [y, x0, x1] = pool.splice(0, 3) as [string, string, string];
      const pair = y && x0 && x1 ? buildPair(r, level, kind, y, [x0, x1]) : null;
      if (!pair) {
        ok = false;
        break;
      }
      matched.push(...pair);
    }
    if (!ok) continue;
    const keys = matched.map((m) => visualKey(m.answer));
    if (new Set(keys).size === keys.length) return sheetFromPairs(spec, r, shuffle(r, matched));
  }
  throw new Error('Analógia: nem sikerült csupa különböző megoldású lapot készíteni.');
}

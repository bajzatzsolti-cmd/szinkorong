// Kódfejtő: a lap tetején a jelkulcs (melyik titkos jel melyik képet jelenti); a feladat egy jelsor,
// a megoldás a neki megfelelő képsor.
//
// Szintek (ideiglenes beosztás, a szülő jóváhagyására vár):
//  • 1. szint (1–5. lap, 6 korong): 4 jel a kulcsban, 2 jelből álló sorok.
//  • 2. szint (6–10. lap, 8 korong): 5 jel, 3 jelből álló sorok.
//  • 3. szint (11–15. lap, 10 korong): 6 jel, 4 jelből álló sorok.
// A jelek a „Tükör és forgatás” kitalált, betűszerű jelei (nem valódi betűk).
//
// A sorok párban készülnek: a pár két sora csak EGY helyen tér el. Így minden megoldás mellett ott van
// egy „majdnem jó” képsor is: nem elég az első jelet megfejteni, az egész sort végig kell nézni.
import { WORDS, isPictureSafe } from '../../data/vocab';
import { int, mulberry32, range, shuffle, type Rng } from '../../engine/rng';
import type { Sheet, SheetSpec } from '../../engine/sheet';
import type { Visual } from '../../render/visual';
import { sheetFromPairs, type Matched } from '../common';
import { RUNES } from '../tukor/figures';

export const CONTENT_VERSION = 1;
export const SIZES = [6, 8, 10] as const;
export const KEY_SIZE = [4, 5, 6] as const;
export const SEQ_LEN = [2, 3, 4] as const;

const KEY_CATEGORIES = ['gy', 'ja', 'al', 'ed', 'jt', 'eg', 'no', 'ru'];

/** Különböző alakcsoportú, különböző kategóriájú, jól felismerhető képek a kulcsba. */
function keyImages(r: Rng, m: number): string[] {
  const chosen: string[] = [];
  const cats = new Set<string>();
  const groups = new Set<string>();
  for (const w of shuffle(r, WORDS.filter((x) => isPictureSafe(x) && KEY_CATEGORIES.includes(x.category)))) {
    if (cats.has(w.category) || (w.similar && groups.has(w.similar))) continue;
    chosen.push(w.id);
    cats.add(w.category);
    if (w.similar) groups.add(w.similar);
    if (chosen.length === m) return chosen;
  }
  throw new Error('Kódfejtő: nincs elég különböző kép a kulcshoz.');
}

/** n különböző sor (hossz L, m jelből), párokban: a pár két tagja pontosan egy helyen tér el. */
function sequences(r: Rng, n: number, m: number, L: number): number[][] {
  const used = new Set<string>();
  const out: number[][] = [];
  let guard = 0;
  while (out.length < n) {
    if (++guard > 10_000) throw new Error('Kódfejtő: nem sikerült elég különböző sort készíteni.');
    const a = range(L).map(() => int(r, 0, m - 1));
    const b = [...a];
    const pos = int(r, 0, L - 1);
    b[pos] = (a[pos]! + int(r, 1, m - 1)) % m;
    const ka = a.join(',');
    const kb = b.join(',');
    if (used.has(ka) || used.has(kb)) continue;
    used.add(ka);
    used.add(kb);
    out.push(a, b);
  }
  return out.slice(0, n);
}

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  const { level, n } = spec;
  const m = KEY_SIZE[level] as number;
  const L = SEQ_LEN[level] as number;
  if (n % 2) throw new Error('Kódfejtő: páros számú feladat kell.');

  const runes = shuffle(r, RUNES).slice(0, m);
  const images = keyImages(r, m);
  const rune = (i: number): Visual => ({ t: 'rune', edges: runes[i]!.data });
  const image = (i: number): Visual => ({ t: 'img', id: images[i]! });

  const matched: Matched[] = sequences(r, n, m, L).map((s) => ({
    task: { t: 'seq', gap: 6, items: s.map(rune) },
    answer: { t: 'seq', gap: 4, items: s.map(image) },
  }));

  const header: Visual = {
    t: 'seq',
    gap: 6,
    items: range(m).flatMap((i) => [
      ...(i ? [{ t: 'sym', id: 'sep' } as Visual] : []),
      rune(i),
      { t: 'sym', id: 'arrow' } as Visual,
      image(i),
    ]),
  };
  return { ...sheetFromPairs(spec, r, shuffle(r, matched)), header };
}

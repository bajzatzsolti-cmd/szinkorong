// Csoportosító: melyik kettő való egy csoportba? A feladat egy kép, a megoldás egy másik kép ugyanabból a csoportból.
//
// Szintek (ideiglenes beosztás, a szülő jóváhagyására vár): a szintek a csoportok körét bővítik.
//  • 1. szint: állat, gyümölcs, jármű, ruha, hangszer, édesség.
//  • 2. szint: + zöldség, játék, az égen látható dolgok.
//  • 3. szint: + étel/ital, szerszám, növény, testrész, madár, bogár.
// A madár és a bogár is állat: az állat, madár, bogár családból egy lapon legfeljebb egy csoport szerepel.
import { CATEGORIES, WORDS, isPictureSafe, type Word } from '../../data/vocab';
import { mulberry32, shuffle, type Rng } from '../../engine/rng';
import type { Sheet, SheetSpec } from '../../engine/sheet';
import { img, sayId, sheetFromPairs } from '../common';

export const CONTENT_VERSION = 1;
export const SIZES = [6, 8, 10] as const;

const LEVEL_CATEGORIES: readonly (readonly string[])[] = [
  ['al', 'gy', 'ja', 'ru', 'ha', 'ed'],
  ['al', 'gy', 'ja', 'ru', 'ha', 'ed', 'zo', 'jt', 'eg'],
  ['al', 'gy', 'ja', 'ru', 'ha', 'ed', 'zo', 'jt', 'eg', 'et', 'sz', 'no', 'te', 'ma', 'bo'],
];

const wordsOf = (category: string): Word[] => WORDS.filter((w) => w.category === category && isPictureSafe(w));

/** n csoport a szint köréből, családonként legfeljebb egy. */
function pickCategories(r: Rng, level: number, n: number): string[] {
  const chosen: string[] = [];
  const families = new Set<string>();
  for (const id of shuffle(r, LEVEL_CATEGORIES[level] as readonly string[])) {
    const cat = CATEGORIES[id];
    if (!cat || !cat.groupable || families.has(cat.family) || wordsOf(id).length < 2) continue;
    chosen.push(id);
    families.add(cat.family);
    if (chosen.length === n) return chosen;
  }
  throw new Error(`Csoportosító: nincs elég csoport a ${level + 1}. szinthez (${chosen.length} / ${n}).`);
}

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  const categories = pickCategories(r, spec.level, spec.n);
  const pairs = categories.map((c) => {
    const [t, a] = shuffle(r, wordsOf(c)) as [Word, Word];
    return { task: img(t.id), answer: img(a.id), taskSay: sayId(t.id), answerSay: sayId(a.id) };
  });
  return sheetFromPairs(spec, r, pairs);
}

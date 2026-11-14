// Tükör és forgatás (alakállandóság): melyik ugyanaz az alakzat elforgatva, és melyik a tükörképe?
//
// Minden feladat előtt jel mutatja, mit kell keresni: körbe forduló nyíl = „ugyanez, elforgatva”,
// tükör = „a tükörképe”. Szintek (ideiglenes beosztás, a szülő jóváhagyására vár):
//  • 1. szint (1–5. lap, 6 korong): csak forgatás, rácsnégyzetes alakzatokkal.
//  • 2. szint (6–10. lap, 8 korong): csak tükrözés, rácsnégyzetes alakzatokkal.
//  • 3. szint (11–15. lap, 10 korong): vegyesen, vonalas, betűszerű jelekkel.
// A szinten belül haladva egyre több „tükörpár” kerül a lapra: ugyanannak az alakzatnak mindkét
// (jobbos és balos) változata szerepel, így a gyereknek tényleg az irányra kell figyelnie.
//
// A megoldás forgatásnál a feladat alakzata 90°, 180° vagy 270°-kal elforgatva; tükrözésnél a feladat
// alakzatának pontos jobb–bal tükörképe (nem elforgatva).
import { int, mulberry32, pick, shuffle, type Rng } from '../../engine/rng';
import type { Sheet, SheetSpec } from '../../engine/sheet';
import { mirror, rotate, type Pts } from '../../render/lattice';
import type { Visual } from '../../render/visual';
import { sheetFromPairs, type Matched } from '../common';
import { POLYS, RUNES } from './figures';

export const CONTENT_VERSION = 1;
export const SIZES = [6, 8, 10] as const;

/** Hány tükörpár van a lapon, a szinten belüli sorszám (0..4) szerint. */
const PAIRS_BY_SHEET: readonly (readonly number[])[] = [
  [0, 0, 1, 1, 2],
  [0, 1, 1, 2, 2],
  [1, 1, 2, 2, 3],
];

export type Kind = 'rotate' | 'mirror';

const figure = (level: number, data: Pts): Visual => (level === 2 ? { t: 'rune', edges: data } : { t: 'poly', cells: data });

interface Entry {
  data: Pts;
  kind: Kind;
}

function kindsFor(r: Rng, level: number, groups: number): Kind[] {
  if (level === 0) return Array<Kind>(groups).fill('rotate');
  if (level === 1) return Array<Kind>(groups).fill('mirror');
  // Vegyes: nagyjából fele-fele, de mindkettőből legalább egy.
  const rot = Math.max(1, Math.min(groups - 1, Math.round(groups / 2) + int(r, -1, 1)));
  return shuffle(r, [...Array<Kind>(rot).fill('rotate'), ...Array<Kind>(groups - rot).fill('mirror')]);
}

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  const { level, n } = spec;
  const pool = level === 2 ? RUNES : POLYS;
  const pairs = Math.min(PAIRS_BY_SHEET[level]![spec.index % 5]!, Math.floor(n / 2));
  const groups = n - pairs; // ennyi különböző fajta alakzat kell
  const chosen = shuffle(r, pool).slice(0, groups);
  if (chosen.length < groups) throw new Error('Tükör és forgatás: nincs elég alakzat a készletben.');
  const kinds = kindsFor(r, level, groups);

  // Egy tükörpár két tagja ugyanolyan fajta feladat (különben ugyanaz a megoldás két feladathoz illene).
  const entries: Entry[] = [];
  chosen.forEach((fig, g) => {
    const kind = kinds[g] as Kind;
    if (g < pairs) entries.push({ data: fig.data, kind }, { data: mirror(fig.data), kind });
    else entries.push({ data: r() < 0.5 ? fig.data : mirror(fig.data), kind });
  });

  const matched: Matched[] = shuffle(r, entries).map((e) => {
    const shown = rotate(e.data, int(r, 0, 3));
    const answer = e.kind === 'rotate' ? rotate(shown, pick(r, [1, 2, 3])) : mirror(shown);
    return {
      task: { t: 'seq', gap: 6, items: [{ t: 'sym', id: e.kind }, figure(level, shown)] },
      answer: figure(level, answer),
    };
  });
  return sheetFromPairs(spec, r, matched);
}

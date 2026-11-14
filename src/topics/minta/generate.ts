// Sorminta: ismétlődő minta, mi következik / mi hiányzik a sor közepéről.
//
// FIGYELEM – ideiglenes szabályrendszer (1. sprint, a motor kipróbálására), a szülő jóváhagyására vár:
//  • 1. szint (1–5. lap): AB, AAB, ABB egységek, a sor végéről hiányzó elem.
//  • 2. szint (6–10. lap): + ABC, AABB, a sor végéről hiányzó elem.
//  • 3. szint (11–15. lap): AAB, ABB, ABC, AABB, a sor KÖZEPÉRŐL hiányzó elem
//    (mindkét oldalon legalább 2 elem). A „növekvő minta” még nincs benne: a szabálya egyeztetésre vár.
//
// Generálás „válasz-elsőként”: előbb a lap N különböző megoldás-szimbóluma készül el, aztán minden
// feladat sora ezekből épül. A sorokban a lap MÁS megoldásai is szerepelnek, így a helyes megoldás
// nem találhatható meg azzal, hogy „melyik kép szerepel a sorban” – a mintát kell megérteni.
import { int, mulberry32, pick, range, shuffle, type Rng } from '../../engine/rng';
import type { AnswerCell, Sheet, SheetSpec, TaskCell } from '../../engine/sheet';
import { PATTERN_SHAPES } from '../../render/shapes';
import type { Visual } from '../../render/visual';

export const CONTENT_VERSION = 1;
export const SIZES = [6, 8, 10] as const;
/** Egy sorban (a ? hellyel együtt) legfeljebb ennyi elem fér el a kis kijelzőn is. */
export const MAX_ELEMENTS = 9;

const UNITS: readonly (readonly string[])[] = [
  ['AB', 'AAB', 'ABB'],
  ['AB', 'AAB', 'ABB', 'ABC', 'AABB'],
  ['AAB', 'ABB', 'ABC', 'AABB'],
];

const BLANK: Visual = { t: 'blank' };

function buildSequence(r: Rng, level: number, i: number, symbols: readonly Visual[]): Visual {
  const unit = pick(r, UNITS[level] as readonly string[]);
  const p = unit.length;

  let total: number;
  let gap: number;
  if (level === 2) {
    // A sor közepéről hiányzik egy elem; mindkét oldalon legalább 2 elem marad.
    total = int(r, 2 * p + 1, Math.min(3 * p, MAX_ELEMENTS));
    gap = int(r, 2, total - 3);
  } else {
    // A sor végéről hiányzik az elem: legalább két teljes ismétlődés látszik.
    const visible = int(r, 2 * p, Math.min(3 * p - 1, MAX_ELEMENTS - 1));
    total = visible + 1;
    gap = visible;
  }

  // Betű → szimbólum. A hiányzó helyre kerülő betű a feladat megoldása; a többi betű a lap
  // más feladatainak megoldás-szimbólumaiból jön.
  const answerLetter = unit[gap % p] as string;
  const letters = [...new Set(unit.split(''))];
  const others = shuffle(r, symbols.filter((_, k) => k !== i));
  const map = new Map<string, Visual>([[answerLetter, symbols[i] as Visual]]);
  let o = 0;
  for (const ch of letters) {
    if (!map.has(ch)) map.set(ch, others[o++] as Visual);
  }

  const items = range(total).map((pos) => (pos === gap ? BLANK : (map.get(unit[pos % p] as string) as Visual)));
  return { t: 'seq', items };
}

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  const n = spec.n;

  // A lap N különböző megoldása: N különböző alak, véletlen kitöltéssel (telt / körvonalas).
  const shapes = shuffle(r, PATTERN_SHAPES).slice(0, n);
  const symbols: Visual[] = shapes.map((id) => ({
    t: 'shape',
    id,
    fill: r() < 0.5 ? 'solid' : 'outline',
  }));

  // Az első n korong; melyik feladat melyiket kapja, véletlen.
  const discs = shuffle(r, range(n));

  const tasks: TaskCell[] = range(n).map((i) => ({
    disc: discs[i] as number,
    visual: buildSequence(r, spec.level, i, symbols),
  }));

  // A megoldások más sorrendben állnak, mint a feladatok.
  const answers: AnswerCell[] = shuffle(r, range(n)).map((i) => ({
    disc: discs[i] as number,
    visual: symbols[i] as Visual,
  }));

  return { spec, tasks, answers };
}

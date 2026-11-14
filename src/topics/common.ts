// Közös segédek a témakörök generátoraihoz.
import { range, shuffle, type Rng } from '../engine/rng';
import type { AnswerCell, Sheet, SheetSpec, TaskCell } from '../engine/sheet';
import type { Visual } from '../render/visual';

/** Egy feladat–megoldás pár a lapon. */
export interface Matched {
  task: Visual;
  answer: Visual;
  /** Hanganyag-azonosító: a képre koppintva elhangzik. */
  taskSay?: string;
  answerSay?: string;
}

/** Szóhoz tartozó hanganyag azonosítója (content/audio/manifest.json). */
export const sayId = (wordId: string): string => `szo-${wordId}`;

export const img = (id: string, extra: { shadow?: boolean; flip?: boolean; rot?: number } = {}): Visual => {
  const v: Visual = { t: 'img', id };
  if (extra.shadow) v.shadow = true;
  if (extra.flip) v.flip = true;
  if (extra.rot) v.rot = extra.rot;
  return v;
};

/**
 * A lap összerakása párokból: a korongok véletlen kiosztásúak, a megoldások más sorrendben állnak,
 * mint a feladatok (a feladatok a megadott sorrendben maradnak).
 */
export function sheetFromPairs(spec: SheetSpec, r: Rng, pairs: readonly Matched[]): Sheet {
  const n = pairs.length;
  const discs = shuffle(r, range(n));
  const cell = <T extends TaskCell | AnswerCell>(i: number, visual: Visual, say?: string): T => {
    const c: TaskCell | AnswerCell = { disc: discs[i] as number, visual };
    if (say) c.say = say;
    return c as T;
  };
  const tasks: TaskCell[] = pairs.map((p, i) => cell<TaskCell>(i, p.task, p.taskSay));
  const answers: AnswerCell[] = shuffle(r, range(n)).map((i) => cell<AnswerCell>(i, (pairs[i] as Matched).answer, (pairs[i] as Matched).answerSay));
  return { spec, tasks, answers };
}

/** n különböző szó a készletből; „iker” (twin) csoportból legfeljebb egy. */
export function pickTwinSafe<T extends { twin?: string }>(r: Rng, pool: readonly T[], n: number): T[] {
  const chosen: T[] = [];
  const twins = new Set<string>();
  for (const w of shuffle(r, pool)) {
    if (w.twin && twins.has(w.twin)) continue;
    chosen.push(w);
    if (w.twin) twins.add(w.twin);
    if (chosen.length === n) return chosen;
  }
  throw new Error(`Nincs elég (${chosen.length} / ${n}) különböző szó a készletben.`);
}

/** Véletlen felbontás 2-es és 3-as részekre (sosem marad 1): pl. 10 = 3+3+2+2. */
export function splitInto2and3(r: Rng, n: number): number[] {
  const parts: number[] = [];
  let remaining = n;
  while (remaining > 0) {
    const options = [2, 3].filter((p) => remaining - p === 0 || remaining - p >= 2);
    if (options.length === 0) throw new Error(`Nem bontható 2 és 3 hosszú részekre: ${n}`);
    const part = options[Math.floor(r() * options.length)] as number;
    parts.push(part);
    remaining -= part;
  }
  return parts;
}

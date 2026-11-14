// Árnyékvadász: melyik árnyék melyik képé?
//
// Szintek (ideiglenes beosztás, a szülő jóváhagyására vár):
//  • 1. szint (1–5. lap): az árnyék ugyanúgy áll, mint a kép; a lapon különböző alakú képek vannak.
//  • 2. szint (6–10. lap): az árnyékok TÜKRÖZVE állnak.
//  • 3. szint (11–15. lap): az árnyékok ELFORGATVA állnak (90°, 180° vagy 270°), és a lapon
//    hasonló alakú képek vannak egymás mellett (pl. több négylábú állat).
//
// A lapon sosem szerepel két „iker” (majdnem egyforma árnyékú) kép (twin), és csak jó árnyékú (goodShadow),
// a szülő által nem vitatott (nincs nyitott [ELLENŐRIZNI] jelzésű) szó kerül rá.
import { WORDS, isPictureSafe, type Word } from '../../data/vocab';
import { mulberry32, pick, shuffle, type Rng } from '../../engine/rng';
import type { Sheet, SheetSpec } from '../../engine/sheet';
import { img, sayId, sheetFromPairs, splitInto2and3 } from '../common';

export const CONTENT_VERSION = 1;
export const SIZES = [6, 8, 10] as const;
export const ROTATIONS = [90, 180, 270] as const;

export const shadowPool = (): Word[] => WORDS.filter((w) => w.goodShadow && isPictureSafe(w));

/** Közepes szinten a képek lehetőleg különböző alakcsoportból (similar) valók, hogy jól elkülönüljenek. */
function pickSpread(r: Rng, pool: readonly Word[], n: number): Word[] {
  const chosen: Word[] = [];
  const twins = new Set<string>();
  const groups = new Set<string>();
  const ok = (w: Word, strict: boolean): boolean =>
    !chosen.includes(w) && !(w.twin && twins.has(w.twin)) && !(strict && w.similar && groups.has(w.similar));
  const add = (w: Word): void => {
    chosen.push(w);
    if (w.twin) twins.add(w.twin);
    if (w.similar) groups.add(w.similar);
  };
  const order = shuffle(r, pool);
  for (const w of order) if (chosen.length < n && ok(w, true)) add(w);
  for (const w of order) if (chosen.length < n && ok(w, false)) add(w);
  return chosen;
}

/** Nehéz szinten a képek 2–3 fős, hasonló alakú csoportokban állnak. */
function pickSimilar(r: Rng, pool: readonly Word[], n: number): Word[] {
  const groups = new Map<string, Word[]>();
  for (const w of pool) {
    if (!w.similar) continue;
    if (!groups.has(w.similar)) groups.set(w.similar, []);
    groups.get(w.similar)!.push(w);
  }
  const clusters = shuffle(r, [...groups.values()]);
  const chosen: Word[] = [];
  const twins = new Set<string>();
  const usedClusters = new Set<Word[]>();

  for (const part of splitInto2and3(r, n)) {
    let placed = false;
    for (const cluster of clusters) {
      if (usedClusters.has(cluster)) continue;
      // az iker-szabályt betartó, véletlen részhalmaz
      const picked: Word[] = [];
      const localTwins = new Set(twins);
      for (const w of shuffle(r, cluster)) {
        if (picked.length === part) break;
        if (w.twin && localTwins.has(w.twin)) continue;
        picked.push(w);
        if (w.twin) localTwins.add(w.twin);
      }
      if (picked.length === part) {
        chosen.push(...picked);
        localTwins.forEach((t) => twins.add(t));
        usedClusters.add(cluster);
        placed = true;
        break;
      }
    }
    if (!placed) throw new Error('Árnyékvadász: nincs elég hasonló alakú kép a nehéz laphoz.');
  }
  return chosen;
}

export function generate(spec: SheetSpec): Sheet {
  const r = mulberry32(spec.seed);
  const pool = shadowPool();
  const words = spec.level === 2 ? pickSimilar(r, pool, spec.n) : pickSpread(r, pool, spec.n);

  const pairs = shuffle(r, words).map((w) => ({
    task: img(w.id),
    answer: img(w.id, {
      shadow: true,
      flip: spec.level === 1,
      rot: spec.level === 2 ? pick(r, ROTATIONS) : 0,
    }),
    taskSay: sayId(w.id),
  }));
  return sheetFromPairs(spec, r, pairs);
}

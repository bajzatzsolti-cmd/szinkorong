// Témakörtől független ellenőrzések minden lapra. A témakör-specifikus verifikátor
// (pl. topics/minta/verify.ts) ezekre épít, és maga oldja meg a feladatokat szabály alapján.
import { visualKey } from '../render/visual';
import type { Sheet } from './sheet';

export function verifyCommon(sheet: Sheet, expectedSizes: readonly number[]): string[] {
  const problems: string[] = [];
  const { tasks, answers, spec } = sheet;
  const n = spec.n;

  if (expectedSizes[spec.level] !== n) {
    problems.push(`A lap mérete (${n}) nem egyezik a szinthez tartozóval (${expectedSizes[spec.level]}).`);
  }
  if (tasks.length !== n) problems.push(`A feladatok száma ${tasks.length}, kellene: ${n}.`);
  if (answers.length !== n) problems.push(`A megoldások száma ${answers.length}, kellene: ${n}.`);

  // A korongok: pont az első n korong, feladatonként egy, megoldásonként egy.
  const taskDiscs = tasks.map((t) => t.disc);
  const answerDiscs = answers.map((a) => a.disc);
  if (new Set(taskDiscs).size !== taskDiscs.length) problems.push('Két feladat ugyanazt a korongot kapta.');
  if (new Set(answerDiscs).size !== answerDiscs.length) problems.push('Két megoldás ugyanahhoz a koronghoz tartozik.');
  for (const d of taskDiscs) {
    if (!(d >= 0 && d < n)) problems.push(`A(z) ${d}. korong nincs a lap első ${n} korongja között.`);
    if (!answerDiscs.includes(d)) problems.push(`A(z) ${d}. korongnak nincs megoldása.`);
  }

  // A lapon belül minden megoldás különböző.
  const keys = answers.map((a) => visualKey(a.visual));
  if (new Set(keys).size !== keys.length) problems.push('Két megoldás egyforma a lapon.');

  return problems;
}

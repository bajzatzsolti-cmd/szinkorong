// A „Mi tartozik össze?” verifikátora: a teljes kapcsolati háló (párok + also) alapján megoldja a lapot.
import { related } from '../../data/pairs';
import { WORD_BY_ID, isPictureSafe } from '../../data/vocab';
import type { Sheet } from '../../engine/sheet';
import { verifyCommon } from '../../engine/verify';
import { SIZES } from './generate';

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);

  const idOf = (v: { t: string; id?: string }): string | null => (v.t === 'img' && v.id ? v.id : null);
  const taskIds = sheet.tasks.map((t) => idOf(t.visual));
  const answerIds = sheet.answers.map((a) => idOf(a.visual));

  if ([...taskIds, ...answerIds].some((id) => id === null)) {
    problems.push('Nem minden elem kép.');
    return problems;
  }
  const all = [...taskIds, ...answerIds] as string[];
  if (new Set(all).size !== all.length) problems.push('Egy szó kétszer szerepel a lapon.');
  for (const id of all) {
    const w = WORD_BY_ID.get(id);
    if (!w) problems.push(`Ismeretlen szó: ${id}.`);
    else if (!isPictureSafe(w)) problems.push(`${id}: az adata ellenőrzésre vár.`);
  }

  const claimed = new Map<number, number>();
  sheet.tasks.forEach((task, ti) => {
    const label = `${ti + 1}. feladat (${taskIds[ti]})`;
    const fits = answerIds.flatMap((a, ai) => (related(taskIds[ti] as string, a as string) ? [ai] : []));
    if (fits.length !== 1) return void problems.push(`${label}: ${fits.length} megoldás illik hozzá (pontosan 1 kellene).`);
    const ai = fits[0] as number;
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== task.disc) problems.push(`${label}: az illő megoldás más koronghoz van rendelve.`);
  });
  sheet.answers.forEach((_, ai) => {
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${ai + 1}. megoldás: nem pontosan egy feladathoz tartozik.`);
  });
  return problems;
}

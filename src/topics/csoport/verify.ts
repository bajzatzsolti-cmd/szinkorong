// A Csoportosító verifikátora: a szókincs kategóriái alapján, a generátortól függetlenül megoldja a lapot.
// Két kép akkor „való egy csoportba”, ha a kategóriájuk családja azonos (a madár és a bogár is állat).
import { CATEGORIES, WORD_BY_ID, isPictureSafe } from '../../data/vocab';
import type { Sheet } from '../../engine/sheet';
import { verifyCommon } from '../../engine/verify';
import { SIZES } from './generate';

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);

  const familyOf = (v: { t: string; id?: string }, label: string): string | null => {
    if (v.t !== 'img' || !v.id) {
      problems.push(`${label}: nem kép.`);
      return null;
    }
    const w = WORD_BY_ID.get(v.id);
    if (!w) {
      problems.push(`${label}: ismeretlen szó (${v.id}).`);
      return null;
    }
    if (!isPictureSafe(w)) problems.push(`${label}: ${v.id} adata ellenőrzésre vár.`);
    const cat = CATEGORIES[w.category];
    if (!cat?.groupable) problems.push(`${label}: a(z) ${w.category} kategória nem csoportosítható.`);
    return cat?.family ?? null;
  };

  const taskFam = sheet.tasks.map((t, i) => familyOf(t.visual, `${i + 1}. feladat`));
  const answerFam = sheet.answers.map((a, i) => familyOf(a.visual, `${i + 1}. megoldás`));

  const ids = [...sheet.tasks, ...sheet.answers].map((c) => (c.visual.t === 'img' ? c.visual.id : ''));
  if (new Set(ids).size !== ids.length) problems.push('Egy kép kétszer szerepel a lapon.');
  if (new Set(taskFam).size !== taskFam.length) problems.push('Két feladat ugyanabból a csoportból (családból) való.');

  const claimed = new Map<number, number>();
  sheet.tasks.forEach((task, ti) => {
    const label = `${ti + 1}. feladat`;
    const fits = answerFam.flatMap((f, ai) => (f !== null && f === taskFam[ti] ? [ai] : []));
    if (fits.length !== 1) return void problems.push(`${label}: ${fits.length} megoldás való a csoportba (pontosan 1 kellene).`);
    const ai = fits[0] as number;
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== task.disc) problems.push(`${label}: az illő megoldás más koronghoz van rendelve.`);
  });
  sheet.answers.forEach((_, ai) => {
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${ai + 1}. megoldás: nem pontosan egy feladathoz tartozik.`);
  });
  return problems;
}

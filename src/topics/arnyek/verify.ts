// Az Árnyékvadász verifikátora: a generátortól függetlenül, szabály alapján megoldja a lapot.
import { WORD_BY_ID, isPictureSafe } from '../../data/vocab';
import type { Sheet } from '../../engine/sheet';
import { verifyCommon } from '../../engine/verify';
import { ROTATIONS, SIZES } from './generate';

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);
  const level = sheet.spec.level;

  const claimed = new Map<number, number>();
  const taskIds: string[] = [];

  sheet.tasks.forEach((task, ti) => {
    const label = `${ti + 1}. feladat`;
    const v = task.visual;
    if (v.t !== 'img' || v.shadow || v.rot || v.flip) {
      problems.push(`${label}: a feladat nem egy sima (színes, forgatás nélküli) kép.`);
      return;
    }
    taskIds.push(v.id);
    const w = WORD_BY_ID.get(v.id);
    if (!w) return void problems.push(`${label}: ismeretlen szó (${v.id}).`);
    if (!w.goodShadow) problems.push(`${label}: ${v.id} nem jó árnyékú.`);
    if (!isPictureSafe(w)) problems.push(`${label}: ${v.id} adata ellenőrzésre vár.`);

    // Megoldás: az az árnyék, amely ugyanennek a képnek az árnyéka.
    const fits = sheet.answers.flatMap((a, ai) => (a.visual.t === 'img' && a.visual.shadow && a.visual.id === v.id ? [ai] : []));
    if (fits.length !== 1) return void problems.push(`${label}: ${fits.length} árnyék illeszkedik (pontosan 1 kellene).`);
    const ai = fits[0] as number;
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== task.disc) problems.push(`${label}: az illeszkedő árnyék más koronghoz van rendelve.`);
  });

  // A megoldások: árnyékok, a szintnek megfelelő átalakítással.
  sheet.answers.forEach((a, ai) => {
    const label = `${ai + 1}. megoldás`;
    const v = a.visual;
    if (v.t !== 'img' || !v.shadow) return void problems.push(`${label}: nem árnyék.`);
    if (level === 0 && (v.flip || v.rot)) problems.push(`${label}: az 1. szinten az árnyék nem lehet átalakítva.`);
    if (level === 1 && (!v.flip || v.rot)) problems.push(`${label}: a 2. szinten az árnyék tükrözött kell legyen.`);
    if (level === 2 && !(ROTATIONS as readonly number[]).includes(v.rot ?? 0)) problems.push(`${label}: a 3. szinten az árnyék el kell legyen forgatva.`);
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${label}: nem pontosan egy feladathoz tartozik.`);
  });

  // Iker-képek (majdnem egyforma árnyék) nem lehetnek egy lapon.
  const twins = taskIds.flatMap((id) => (WORD_BY_ID.get(id)?.twin ? [WORD_BY_ID.get(id)!.twin as string] : []));
  if (new Set(twins).size !== twins.length) problems.push('Két iker-kép (majdnem egyforma árnyék) van a lapon.');

  // Nehéz szinten minden képnek van hasonló alakú társa a lapon.
  if (level === 2) {
    for (const id of taskIds) {
      const sim = WORD_BY_ID.get(id)?.similar;
      const mates = taskIds.filter((o) => o !== id && WORD_BY_ID.get(o)?.similar === sim && sim);
      if (!mates.length) problems.push(`${id}: a nehéz szinten nincs hasonló alakú társa a lapon.`);
    }
  }
  return problems;
}

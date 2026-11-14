// A Fél kép verifikátora: a fél képhez a SAJÁT másik fele, a kivágott lyukhoz a SAJÁT, ugyanonnan
// kivágott darabja illik. (Hogy a darabok és a félképek szemre is jól megkülönböztethetők, azt a
// tests/unit/felkep-raster.test.ts méri a megrajzolt képekből.)
import { WORD_BY_ID, isPictureSafe } from '../../data/vocab';
import type { Sheet } from '../../engine/sheet';
import { verifyCommon } from '../../engine/verify';
import type { Visual } from '../../render/visual';
import { MIN_HALF_BALANCE, SIZES } from './generate';

type Img = Extract<Visual, { t: 'img' }>;
const sameSpot = (a: Img['hole'], b: Img['piece']): boolean => !!a && !!b && a.x === b.x && a.y === b.y && a.r === b.r;

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);
  const level = sheet.spec.level;
  const claimed = new Map<number, number>();
  const ids: string[] = [];

  const answers = sheet.answers.map((a, ai) => {
    const v = a.visual;
    if (v.t !== 'img' || v.shadow || v.flip || v.rot) {
      problems.push(`${ai + 1}. megoldás: nem sima kép.`);
      return null;
    }
    if (level < 2 && v.half !== 'R') problems.push(`${ai + 1}. megoldás: a kép jobb fele kell.`);
    if (level === 2 && !v.piece) problems.push(`${ai + 1}. megoldás: kivágott darab kell.`);
    return v;
  });

  sheet.tasks.forEach((task, ti) => {
    const label = `${ti + 1}. feladat`;
    const v = task.visual;
    if (v.t !== 'img' || v.shadow || v.flip || v.rot) return void problems.push(`${label}: nem sima kép.`);
    ids.push(v.id);
    const w = WORD_BY_ID.get(v.id);
    if (!w) return void problems.push(`${label}: ismeretlen szó (${v.id}).`);
    if (!isPictureSafe(w)) problems.push(`${label}: ${v.id} adata ellenőrzésre vár.`);
    if (!w.goodShadow) problems.push(`${label}: ${v.id} körvonala nem elég jellegzetes.`);
    if (w.halfBalance < MIN_HALF_BALANCE) problems.push(`${label}: ${v.id} egyik felén alig van rajz.`);

    let fits: number[];
    if (level < 2) {
      if (v.half !== true && v.half !== 'L') return void problems.push(`${label}: a kép bal fele kell.`);
      fits = answers.flatMap((a, ai) => (a && a.id === v.id && a.half === 'R' ? [ai] : []));
    } else {
      if (!v.hole) return void problems.push(`${label}: hiányzik a kivágott lyuk.`);
      fits = answers.flatMap((a, ai) => (a && a.id === v.id && sameSpot(v.hole, a.piece) ? [ai] : []));
    }
    if (fits.length !== 1) return void problems.push(`${label}: ${fits.length} megoldás illik (pontosan 1 kellene).`);
    const ai = fits[0]!;
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== task.disc) problems.push(`${label}: az illő megoldás más koronghoz van rendelve.`);
  });

  const twins = ids.flatMap((id) => (WORD_BY_ID.get(id)?.twin ? [WORD_BY_ID.get(id)!.twin!] : []));
  if (new Set(twins).size !== twins.length) problems.push('Két iker-kép (szinte egyforma) van a lapon.');
  if (level > 0) {
    for (const id of ids) {
      const sim = WORD_BY_ID.get(id)?.similar;
      if (!sim || !ids.some((o) => o !== id && WORD_BY_ID.get(o)?.similar === sim)) problems.push(`${id}: nincs hasonló alakú társa a lapon.`);
    }
  }
  sheet.answers.forEach((_, ai) => {
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${ai + 1}. megoldás: nem pontosan egy feladathoz tartozik.`);
  });
  return problems;
}

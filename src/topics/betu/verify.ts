// A Betűkereső verifikátora: megszámolja a keresett betűt a mezőben, és ellenőrzi a szint szabályait.
import type { Sheet } from '../../engine/sheet';
import { verifyCommon } from '../../engine/verify';
import type { Visual } from '../../render/visual';
import { FIELD, MAX_COUNT, SIZES } from './generate';
import { LOWER, UPPER, isLower, isUpper, letterSayId, lookalikes, similar } from './letters';

/** A megoldás értéke: pöttyök száma vagy számjegy. */
function valueOf(v: Visual): { value: number; kind: 'dots' | 'digit' } | null {
  if (v.t === 'dots') return { value: v.k, kind: 'dots' };
  if (v.t === 'glyph' && /^\d+$/.test(v.ch)) return { value: Number(v.ch), kind: 'digit' };
  return null;
}

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);
  const level = sheet.spec.level;

  const answers = sheet.answers.map((a, ai) => {
    const val = valueOf(a.visual);
    if (!val) problems.push(`${ai + 1}. megoldás: nem mennyiség.`);
    else if (val.kind !== (level === 2 ? 'digit' : 'dots')) problems.push(`${ai + 1}. megoldás: nem a szinthez illő alak (pötty / számjegy).`);
    return val;
  });

  const claimed = new Map<number, number>();
  const seenTargets = new Set<string>();

  sheet.tasks.forEach((task, ti) => {
    const label = `${ti + 1}. feladat`;
    const v = task.visual;
    if (v.t !== 'seq' || v.items.length !== 2) return void problems.push(`${label}: nem „keresett betű + betűmező”.`);
    const [box, grid] = v.items as [Visual, Visual];
    if (box.t !== 'glyph' || !box.boxed) return void problems.push(`${label}: hiányzik a keretes, keresett betű.`);
    if (grid.t !== 'grid' || grid.items.some((g) => g.t !== 'glyph')) return void problems.push(`${label}: a mező nem betűkből áll.`);

    const targets = [...box.ch];
    const field = grid.items.map((g) => (g as Extract<Visual, { t: 'glyph' }>).ch);

    // A keresett betű alakja a szint szerint.
    if (level === 2) {
      if (targets.length !== 2 || !isUpper(targets[0]!) || targets[1] !== targets[0]!.toLowerCase()) problems.push(`${label}: a keretben a betű nagy és kis alakja kell.`);
    } else if (targets.length !== 1 || !isUpper(targets[0]!)) problems.push(`${label}: a keretben egy nagybetű kell.`);
    const key = targets[0]!.toUpperCase();
    if (seenTargets.has(key)) problems.push(`${label}: ezt a betűt már egy másik feladat is keresi.`);
    seenTargets.add(key);

    // Koppintásra minden betű a saját nevét mondja (rossz név rosszul tanítana).
    for (const g of [box, ...grid.items] as Extract<Visual, { t: 'glyph' }>[]) {
      if (g.say !== letterSayId(g.ch)) problems.push(`${label}: a(z) ${g.ch} betű koppintásra nem a saját nevét mondja.`);
    }

    // A mező.
    if (field.length !== FIELD[level]) problems.push(`${label}: a mező ${field.length} betű, kellene: ${FIELD[level]}.`);
    for (const ch of field) {
      if (!UPPER.includes(ch) && !LOWER.includes(ch)) problems.push(`${label}: ismeretlen betű a mezőben (${ch}).`);
      if (level < 2 && !isUpper(ch)) problems.push(`${label}: kisbetű a mezőben (${ch}).`);
    }
    const others = field.filter((ch) => !targets.includes(ch));
    for (const t of targets) {
      const bad = others.filter((ch) => lookalikes(t).includes(ch));
      if (bad.length) problems.push(`${label}: a mezőben a keresett betűvel összetéveszthető másik betű van (${bad[0]}).`);
    }
    const sim = targets.flatMap((t) => similar(t));
    const similarOthers = others.filter((ch) => sim.includes(ch)).length;
    if (level === 0 && similarOthers > 0) problems.push(`${label}: a könnyű szinten nem lehet hasonló betű a mezőben.`);
    if (level > 0 && sim.length > 0 && similarOthers === 0) problems.push(`${label}: nincs hasonló betű a mezőben.`);

    // Megszámolás.
    const count = field.filter((ch) => targets.includes(ch)).length;
    if (count < 1 || count > MAX_COUNT[level]!) problems.push(`${label}: a darabszám (${count}) kívül esik az 1–${MAX_COUNT[level]} tartományon.`);
    if (level === 2 && count >= 2) {
      if (!field.some((ch) => ch === targets[0]) || !field.some((ch) => ch === targets[1])) problems.push(`${label}: a nagy és a kis alak közül csak az egyik szerepel.`);
    }
    if (level === 2 && (!others.some(isUpper) || !others.some(isLower))) problems.push(`${label}: a mező nem vegyes (kis- és nagybetű).`);

    const fits = answers.flatMap((a, ai) => (a && a.value === count ? [ai] : []));
    if (fits.length !== 1) return void problems.push(`${label}: ${fits.length} megoldás illik a ${count} darabhoz (pontosan 1 kellene).`);
    const ai = fits[0] as number;
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== task.disc) problems.push(`${label}: az illő megoldás más koronghoz van rendelve.`);
  });

  sheet.answers.forEach((_, ai) => {
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${ai + 1}. megoldás: nem pontosan egy feladathoz tartozik.`);
  });
  return problems;
}

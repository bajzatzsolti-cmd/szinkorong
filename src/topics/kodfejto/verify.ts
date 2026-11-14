// A Kódfejtő verifikátora: a fejlécből kiolvassa a jelkulcsot, megfejti a feladatok jelsorait, és megnézi,
// hogy pontosan egy képsor egyezik-e. A generátor adataira nem támaszkodik.
import { WORD_BY_ID, isPictureSafe } from '../../data/vocab';
import type { Sheet } from '../../engine/sheet';
import { verifyCommon } from '../../engine/verify';
import { visualKey, type Visual } from '../../render/visual';
import { KEY_SIZE, SEQ_LEN, SIZES } from './generate';

/** A fejléc: „jel → kép” párok, elválasztóval. Visszaadja a jel-kulcs → kép-azonosító táblát. */
export function parseKey(header: Visual | undefined): Map<string, string> | string {
  if (!header || header.t !== 'seq') return 'hiányzik a jelkulcs';
  const items = header.items.filter((i) => !(i.t === 'sym' && i.id === 'sep'));
  if (items.length % 3) return 'a jelkulcs nem „jel → kép” hármasokból áll';
  const map = new Map<string, string>();
  for (let i = 0; i < items.length; i += 3) {
    const [r, arrow, im] = items.slice(i, i + 3) as [Visual, Visual, Visual];
    if (r.t !== 'rune' || arrow.t !== 'sym' || arrow.id !== 'arrow' || im.t !== 'img') return 'a jelkulcs egy eleme hibás';
    const key = visualKey(r);
    if (map.has(key)) return 'egy jel kétszer szerepel a kulcsban';
    map.set(key, im.id);
  }
  if (new Set(map.values()).size !== map.size) return 'egy kép kétszer szerepel a kulcsban';
  return map;
}

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);
  const level = sheet.spec.level;
  const key = parseKey(sheet.header);
  if (typeof key === 'string') return [...problems, key];
  if (key.size !== KEY_SIZE[level]) problems.push(`A kulcsban ${key.size} jel van, ${KEY_SIZE[level]} kellene.`);
  for (const id of key.values()) {
    const w = WORD_BY_ID.get(id);
    if (!w) problems.push(`Ismeretlen szó a kulcsban: ${id}.`);
    else if (!isPictureSafe(w)) problems.push(`${id}: az adata ellenőrzésre vár.`);
  }

  const answers = sheet.answers.map((a, ai) => {
    const v = a.visual;
    if (v.t !== 'seq' || v.items.some((i) => i.t !== 'img')) {
      problems.push(`${ai + 1}. megoldás: nem képsor.`);
      return null;
    }
    return v.items.map((i) => (i as Extract<Visual, { t: 'img' }>).id);
  });

  const claimed = new Map<number, number>();
  sheet.tasks.forEach((task, ti) => {
    const label = `${ti + 1}. feladat`;
    const v = task.visual;
    if (v.t !== 'seq' || v.items.some((i) => i.t !== 'rune')) return void problems.push(`${label}: nem jelsor.`);
    if (v.items.length !== SEQ_LEN[level]) problems.push(`${label}: a sor ${v.items.length} jelből áll, ${SEQ_LEN[level]} kellene.`);
    const decoded = v.items.map((i) => key.get(visualKey(i)));
    if (decoded.some((d) => !d)) return void problems.push(`${label}: olyan jel van benne, ami nincs a kulcsban.`);

    const same = (a: string[] | null): boolean => !!a && a.length === decoded.length && a.every((x, i) => x === decoded[i]);
    const fits = answers.flatMap((a, ai) => (same(a) ? [ai] : []));
    if (fits.length !== 1) return void problems.push(`${label}: ${fits.length} megoldás illik (pontosan 1 kellene).`);
    const ai = fits[0]!;
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== task.disc) problems.push(`${label}: az illő megoldás más koronghoz van rendelve.`);

    // Kerülőút-ellenőrzés: legyen egy másik képsor, amely csak egy helyen tér el (nem elég egy jelet megfejteni).
    const nearMiss = answers.some((a, j) => j !== ai && !!a && a.length === decoded.length && a.filter((x, i) => x !== decoded[i]).length === 1);
    if (!nearMiss) problems.push(`${label}: kerülőúton is megoldható (nincs „majdnem jó” képsor a lapon).`);
  });

  sheet.answers.forEach((_, ai) => {
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${ai + 1}. megoldás: nem pontosan egy feladathoz tartozik.`);
  });
  return problems;
}

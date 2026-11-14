// A Mérleg verifikátora: a mérleg(ek) dőléséből kiolvassa, mi minél nehezebb, és ebből megmondja a
// legnehezebbet. Valódi tárgyaknál azt is ellenőrzi, hogy a mérleg nem mond ellent a világismeretnek.
import { WORD_BY_ID, isPictureSafe } from '../../data/vocab';
import type { Sheet } from '../../engine/sheet';
import { verifyCommon } from '../../engine/verify';
import { visualKey, type Visual } from '../../render/visual';
import { SIZES } from './generate';

interface Relation {
  heavy: Visual;
  light: Visual;
}

function relationOf(v: Visual): Relation | string {
  if (v.t !== 'balance') return 'nem mérleg';
  if (v.left.length !== 1 || v.right.length !== 1) return 'a mérleg mindkét oldalán pontosan egy tárgy kell';
  if (v.tilt === 'level') return 'a mérleg egyensúlyban van (melyik a nehezebb?)';
  return v.tilt === 'left' ? { heavy: v.left[0]!, light: v.right[0]! } : { heavy: v.right[0]!, light: v.left[0]! };
}

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);
  const level = sheet.spec.level;
  const answerKeys = sheet.answers.map((a) => visualKey(a.visual));
  const claimed = new Map<number, number>();
  let singleAnswerTasks = 0;

  sheet.tasks.forEach((task, ti) => {
    const label = `${ti + 1}. feladat`;
    const v = task.visual;
    const balances = level === 2 ? (v.t === 'seq' ? v.items : []) : [v];
    if (balances.length !== (level === 2 ? 2 : 1)) return void problems.push(`${label}: ${level === 2 ? 'két' : 'egy'} mérleg kell.`);
    const rels: Relation[] = [];
    for (const b of balances) {
      const rel = relationOf(b);
      if (typeof rel === 'string') return void problems.push(`${label}: ${rel}.`);
      rels.push(rel);
    }

    let heaviest: Visual;
    if (level < 2) {
      heaviest = rels[0]!.heavy;
      const items = [rels[0]!.heavy, rels[0]!.light];
      if (level === 0) {
        // Valódi tárgyak: a mérleg ugyanazt mutatja, mint a világismeret (legalább egy súlyosztálynyi különbség).
        const [h, l] = items.map((it) => (it.t === 'img' ? WORD_BY_ID.get(it.id) : undefined));
        if (!h || !l) return void problems.push(`${label}: az 1. szinten valódi tárgyak (képek) kellenek.`);
        if (!isPictureSafe(h) || !isPictureSafe(l)) problems.push(`${label}: egy kép adata ellenőrzésre vár.`);
        if (h.weight === undefined || l.weight === undefined) problems.push(`${label}: hiányzik a súlyosztály (${h.id} / ${l.id}).`);
        else if (h.weight <= l.weight) problems.push(`${label}: a mérleg ellentmond a világismeretnek (${h.id} nem nehezebb, mint ${l.id}).`);
      } else if (items.some((it) => it.t !== 'shape')) problems.push(`${label}: a 2. szinten játékkockák (alakzatok) kellenek.`);
    } else {
      // Láncolás: A > B és B > C (a közös tárgy egyszer könnyebb, egyszer nehezebb) → A a legnehezebb.
      const [r1, r2] = rels as [Relation, Relation];
      const k = (x: Visual): string => visualKey(x);
      let chain: [Visual, Visual, Visual] | null = null;
      if (k(r1.light) === k(r2.heavy)) chain = [r1.heavy, r1.light, r2.light];
      else if (k(r2.light) === k(r1.heavy)) chain = [r2.heavy, r2.light, r1.light];
      if (!chain) return void problems.push(`${label}: a két mérleg nem láncolható (A > B, B > C).`);
      if (new Set(chain.map(k)).size !== 3) return void problems.push(`${label}: a láncban ismétlődő tárgy van.`);
      if (chain.some((it) => it.t !== 'shape')) problems.push(`${label}: a 3. szinten játékkockák (alakzatok) kellenek.`);
      heaviest = chain[0];
    }

    const hk = visualKey(heaviest);
    const fits = answerKeys.flatMap((key, ai) => (key === hk ? [ai] : []));
    if (fits.length !== 1) return void problems.push(`${label}: ${fits.length} megoldás illik (pontosan 1 kellene).`);
    const ai = fits[0]!;
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== task.disc) problems.push(`${label}: az illő megoldás más koronghoz van rendelve.`);

    const present = new Set(rels.flatMap((rel) => [visualKey(rel.heavy), visualKey(rel.light)]).filter((key) => answerKeys.includes(key)));
    if (present.size < 2) singleAnswerTasks++;
  });

  // Kerülőút-ellenőrzés: a súlysorrend végén lévő egy feladat kivételével minden feladatban legalább két
  // megoldás-kép szerepeljen (különben elég volna megkeresni, melyik megoldás-kép van a mérlegen).
  if (singleAnswerTasks > 1) problems.push(`${singleAnswerTasks} feladat kerülőúton is megoldható (legfeljebb 1 lehet).`);

  sheet.answers.forEach((_, ai) => {
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${ai + 1}. megoldás: nem pontosan egy feladathoz tartozik.`);
  });
  return problems;
}

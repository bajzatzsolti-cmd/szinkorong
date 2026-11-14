// A „Tükör és forgatás” verifikátora. Magából a rajzból (a cellákból / élekből) dönti el, mi minek az
// elforgatottja vagy tükörképe; a generátor adataira nem támaszkodik.
import type { Sheet } from '../../engine/sheet';
import { verifyCommon } from '../../engine/verify';
import { exactKey, hasFourOrientations, isChiral, mirror, orientedKey, type Pts } from '../../render/lattice';
import type { Visual } from '../../render/visual';
import { SIZES } from './generate';

const ptsOf = (v: Visual): Pts | null => (v.t === 'poly' ? v.cells : v.t === 'rune' ? v.edges : null);

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);
  const level = sheet.spec.level;
  const wantType = level === 2 ? 'rune' : 'poly';

  const answerPts = sheet.answers.map((a, ai) => {
    const p = ptsOf(a.visual);
    if (!p || a.visual.t !== wantType) problems.push(`${ai + 1}. megoldás: nem a szinthez illő alakzat.`);
    return p;
  });

  const claimed = new Map<number, number>();
  const kinds = new Set<string>();

  sheet.tasks.forEach((task, ti) => {
    const label = `${ti + 1}. feladat`;
    const v = task.visual;
    if (v.t !== 'seq' || v.items.length !== 2) return void problems.push(`${label}: nem „jel + alakzat”.`);
    const [sym, fig] = v.items as [Visual, Visual];
    if (sym.t !== 'sym' || (sym.id !== 'rotate' && sym.id !== 'mirror')) return void problems.push(`${label}: hiányzik a forgatás/tükör jel.`);
    const data = ptsOf(fig);
    if (!data || fig.t !== wantType) return void problems.push(`${label}: nem a szinthez illő alakzat.`);
    kinds.add(sym.id);

    if (!isChiral(data)) problems.push(`${label}: az alakzat nem királis (a tükörképe önmagába forgatható).`);
    if (!hasFourOrientations(data)) problems.push(`${label}: az alakzatnak forgási szimmetriája van.`);

    // Forgatás: ugyanaz az alakzat, bármilyen állásban. Tükör: a tükörképe, bármilyen állásban.
    // (Tágan értjük, hogy semmilyen más megoldásra se lehessen ráfogni, hogy „az is jó”.)
    const expected = sym.id === 'rotate' ? orientedKey(data) : orientedKey(mirror(data));
    const fits = answerPts.flatMap((p, ai) => (p && orientedKey(p) === expected ? [ai] : []));
    if (fits.length !== 1) return void problems.push(`${label}: ${fits.length} megoldás illik (pontosan 1 kellene).`);
    const ai = fits[0] as number;
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== task.disc) problems.push(`${label}: az illő megoldás más koronghoz van rendelve.`);

    const ans = answerPts[ai] as Pts;
    if (sym.id === 'rotate' && exactKey(ans) === exactKey(data)) problems.push(`${label}: a megoldás nincs elforgatva (ugyanaz a rajz).`);
    if (sym.id === 'mirror' && exactKey(ans) !== exactKey(mirror(data))) problems.push(`${label}: a megoldás nem a pontos jobb–bal tükörkép.`);
  });

  sheet.answers.forEach((_, ai) => {
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${ai + 1}. megoldás: nem pontosan egy feladathoz tartozik.`);
  });

  if (level === 0 && (kinds.size !== 1 || !kinds.has('rotate'))) problems.push('Az 1. szinten csak forgatás lehet.');
  if (level === 1 && (kinds.size !== 1 || !kinds.has('mirror'))) problems.push('A 2. szinten csak tükrözés lehet.');
  if (level === 2 && kinds.size !== 2) problems.push('A 3. szinten forgatás és tükrözés is kell legyen.');
  return problems;
}

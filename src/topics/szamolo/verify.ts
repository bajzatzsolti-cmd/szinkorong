// Számoló plusz verifikátora: a feladat képéből, a generátortól függetlenül kiszámolja a választ.
//  • szétszórt csoport: a darabszám (az áthúzottak nélkül);  csoport + csoport: az összeg;
//  • két csoport elválasztóval: a több tárgy képe (a különbség legalább 2, a kevesebb tárgy nem lehet megoldás);
//  • számsor egy hiánnyal: a hiányzó szám (egymást követő számok).
// Pöttyös keret és számjegy ugyanannak a számnak számít: ha mindkettő a lapon van, az kétértelmű, ezt is elkapja.
import { WORD_BY_ID, isPictureSafe } from '../../data/vocab';
import type { Sheet } from '../../engine/sheet';
import { verifyCommon } from '../../engine/verify';
import type { Visual } from '../../render/visual';
import { SIZES } from './generate';

type Value = { n: number } | { obj: string };
const same = (a: Value, b: Value): boolean => ('n' in a && 'n' in b ? a.n === b.n : 'obj' in a && 'obj' in b ? a.obj === b.obj : false);

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);
  const notChosen: string[] = [];

  const groupCount = (v: Visual, label: string): { id: string; count: number } | null => {
    if (v.t !== 'scatter' || v.items.length === 0) return null;
    const ids = new Set(v.items.map((i) => i.id));
    if (ids.size !== 1) problems.push(`${label}: egy csoportban többféle kép van.`);
    const id = v.items[0]!.id;
    const w = WORD_BY_ID.get(id);
    if (!w || !isPictureSafe(w)) problems.push(`${label}: a(z) ${id} kép nem használható.`);
    if (v.items.length > 10) problems.push(`${label}: 10-nél több kép.`);
    const count = v.items.filter((i) => !i.cross).length;
    if (count < 1) problems.push(`${label}: nem maradt kép (a nulla nem szerepel).`);
    return { id, count };
  };

  const solve = (v: Visual, label: string): Value | null => {
    if (v.t === 'scatter') {
      const g = groupCount(v, label);
      return g ? { n: g.count } : null;
    }
    if (v.t === 'seq' && v.items.length === 3 && v.items[1]!.t === 'sym') {
      const [a, op, b] = v.items as [Visual, Extract<Visual, { t: 'sym' }>, Visual];
      const ga = groupCount(a, label);
      const gb = groupCount(b, label);
      if (!ga || !gb) return null;
      if (op.id === 'plus') {
        if (ga.id !== gb.id) problems.push(`${label}: az összeadás két csoportja különböző kép.`);
        if (ga.count + gb.count > 10) problems.push(`${label}: az összeg 10-nél több.`);
        return { n: ga.count + gb.count };
      }
      if (op.id === 'sep') {
        if (Math.abs(ga.count - gb.count) < 2) problems.push(`${label}: a két csoport között 2-nél kisebb a különbség.`);
        if (ga.id === gb.id) problems.push(`${label}: a két csoport ugyanaz a kép.`);
        notChosen.push(ga.count > gb.count ? gb.id : ga.id);
        return { obj: ga.count > gb.count ? ga.id : gb.id };
      }
    }
    if (v.t === 'seq' && v.items.length === 3 && v.items.every((x) => x.t === 'glyph' || x.t === 'blank')) {
      const blanks = v.items.filter((x) => x.t === 'blank').length;
      if (blanks !== 1) return null;
      const nums = v.items.map((x) => (x.t === 'glyph' ? Number(x.ch) : null));
      const known = nums.findIndex((x) => x !== null);
      const start = nums[known]! - known;
      if (nums.some((x, j) => x !== null && x !== start + j)) problems.push(`${label}: a számsor nem egymást követő számokból áll.`);
      const missing = start + v.items.findIndex((x) => x.t === 'blank');
      if (start < 1 || start + 2 > 10) problems.push(`${label}: a számsor kilóg az 1–10 tartományból.`);
      return { n: missing };
    }
    problems.push(`${label}: ismeretlen feladatforma.`);
    return null;
  };

  const answers: (Value | null)[] = sheet.answers.map((a, i) => {
    const v = a.visual;
    if (v.t === 'dots') return { n: v.k };
    if (v.t === 'glyph' && /^\d+$/.test(v.ch)) return { n: Number(v.ch) };
    if (v.t === 'img') return { obj: v.id };
    problems.push(`${i + 1}. megoldás: ismeretlen forma.`);
    return null;
  });
  for (const a of answers) if (a && 'n' in a && (a.n < 1 || a.n > 10)) problems.push(`A(z) ${a.n} kívül esik az 1–10 tartományon.`);

  const claimed = new Map<number, number>();
  sheet.tasks.forEach((t, ti) => {
    const label = `${ti + 1}. feladat`;
    const value = solve(t.visual, label);
    if (!value) return;
    const fits = answers.flatMap((a, ai) => (a && same(a, value) ? [ai] : []));
    if (fits.length !== 1) {
      problems.push(`${label}: ${fits.length} megoldás illik (pontosan 1 kellene).`);
      return;
    }
    const ai = fits[0]!;
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== t.disc) problems.push(`${label}: az illő megoldás más koronghoz van rendelve.`);
  });
  for (const id of notChosen) {
    if (answers.some((a) => a && 'obj' in a && a.obj === id)) problems.push(`A kevesebb tárgy (${id}) is megoldás a lapon: összezavarhatja a gyereket.`);
  }
  sheet.answers.forEach((_, ai) => {
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${ai + 1}. megoldás: nem pontosan egy feladathoz tartozik.`);
  });
  return problems;
}

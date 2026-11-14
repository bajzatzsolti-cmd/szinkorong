// A Mátrix verifikátora: a rácsból kikövetkezteti a szabályt (melyik tulajdonság állandó soronként,
// melyik oszloponként), és ebből megmondja a hiányzó elemet. A generátor adataira nem támaszkodik.
import type { Sheet } from '../../engine/sheet';
import { verifyCommon } from '../../engine/verify';
import { visualKey, type Visual } from '../../render/visual';
import { ATTRS, GRID, SIZES, type Attr, type Elem } from './generate';

/** A rajzból visszafejtett elem (alak, kitöltés, méret, darabszám, forgatás). */
export function parseElem(v: Visual): Elem | null {
  let count = 1;
  let base = v;
  if (v.t === 'pack') {
    const first = v.items[0];
    if (!first) return null;
    const key = visualKey(first);
    if (!v.items.every((i) => visualKey(i) === key)) return null;
    count = v.items.length;
    base = first;
  }
  if (base.t !== 'shape' || base.flip || base.half) return null;
  return { shape: base.id, fill: base.fill, size: base.scale ?? 1, count, rot: base.rot ?? 0 };
}

export type Solved = { ok: true; elem: Elem; rowAttr: Attr; colAttr: Attr } | { ok: false; why: string };

/**
 * @param cells A rács elemei sorfolytonosan; a hiányzó mező: null.
 * Minden tulajdonságra megnézi: mindenhol azonos-e, soronként állandó-e, vagy oszloponként állandó-e.
 * Pontosan egy soronként és egy oszloponként állandó (de nem mindenhol azonos) tulajdonságnak kell lennie.
 */
export function solveMatrix(cells: readonly (Elem | null)[], k: number): Solved {
  const missing = cells.flatMap((c, i) => (c === null ? [i] : []));
  if (missing.length !== 1 || cells.length !== k * k) return { ok: false, why: 'Pontosan egy üres mező kell egy teljes rácsban.' };
  const mr = Math.floor(missing[0]! / k);
  const mc = missing[0]! % k;
  const at = (row: number, col: number): Elem | null => cells[row * k + col] ?? null;
  const known = cells.filter((c): c is Elem => c !== null);

  const required: Partial<Record<Attr, string | number>> = {};
  const rowAttrs: Attr[] = [];
  const colAttrs: Attr[] = [];

  for (const attr of ATTRS) {
    if (known.every((c) => c[attr] === known[0]![attr])) {
      required[attr] = known[0]![attr];
      continue;
    }
    const lineConstant = (byRow: boolean): boolean =>
      [...Array(k).keys()].every((a) => {
        const line = [...Array(k).keys()].map((b) => (byRow ? at(a, b) : at(b, a))).filter((c): c is Elem => c !== null);
        return line.every((c) => c[attr] === line[0]![attr]);
      });
    const rowConst = lineConstant(true);
    const colConst = lineConstant(false);
    if (rowConst && !colConst) {
      rowAttrs.push(attr);
      required[attr] = [...Array(k).keys()].map((c) => at(mr, c)).find((c): c is Elem => c !== null)![attr];
    } else if (colConst && !rowConst) {
      colAttrs.push(attr);
      required[attr] = [...Array(k).keys()].map((row) => at(row, mc)).find((c): c is Elem => c !== null)![attr];
    } else {
      return { ok: false, why: `A(z) „${attr}” tulajdonság se soronként, se oszloponként nem állandó.` };
    }
  }
  if (rowAttrs.length !== 1 || colAttrs.length !== 1) {
    return { ok: false, why: `Pontosan egy sor- és egy oszlop-tulajdonság kell (most: ${rowAttrs.length} és ${colAttrs.length}).` };
  }
  return { ok: true, elem: required as unknown as Elem, rowAttr: rowAttrs[0]!, colAttr: colAttrs[0]! };
}

const sameElem = (a: Elem, b: Elem): boolean => ATTRS.every((attr) => a[attr] === b[attr]);

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);
  const level = sheet.spec.level;
  const k = GRID[level] as number;

  const answers = sheet.answers.map((a, ai) => {
    const e = parseElem(a.visual);
    if (!e) problems.push(`${ai + 1}. megoldás: nem értelmezhető elem.`);
    return e;
  });

  const claimed = new Map<number, number>();
  sheet.tasks.forEach((task, ti) => {
    const label = `${ti + 1}. feladat`;
    const v = task.visual;
    if (v.t !== 'grid' || !v.frame || v.cols !== k || v.items.length !== k * k) return void problems.push(`${label}: nem ${k} × ${k}-as keretes rács.`);
    const cells = v.items.map((item) => (item.t === 'blank' ? null : parseElem(item)));
    if (v.items.some((item, i) => item.t !== 'blank' && cells[i] === null)) return void problems.push(`${label}: nem értelmezhető elem a rácsban.`);
    if (level === 0 && cells[k * k - 1] !== null) problems.push(`${label}: az 1. szinten a jobb alsó mezőnek kell hiányoznia.`);

    const solved = solveMatrix(cells, k);
    if (!solved.ok) return void problems.push(`${label}: ${solved.why}`);

    const fits = answers.flatMap((a, ai) => (a && sameElem(a, solved.elem) ? [ai] : []));
    if (fits.length !== 1) return void problems.push(`${label}: ${fits.length} megoldás illik (pontosan 1 kellene).`);
    const ai = fits[0] as number;
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== task.disc) problems.push(`${label}: az illő megoldás más koronghoz van rendelve.`);

    // Kerülőút-ellenőrzés: legyen a lapon „majdnem jó” megoldás is, amely csak a sor- vagy csak az
    // oszlop-tulajdonságban tér el a helyestől (különben elég volna egyetlen tulajdonságot nézni).
    const nearMiss = answers.some((a, j) => {
      if (!a || j === ai) return false;
      const diff = ATTRS.filter((attr) => a[attr] !== solved.elem[attr]);
      return diff.length === 1 && (diff[0] === solved.rowAttr || diff[0] === solved.colAttr);
    });
    if (!nearMiss) problems.push(`${label}: kerülőúton is megoldható (nincs „majdnem jó” megoldás a lapon).`);
  });

  sheet.answers.forEach((_, ai) => {
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${ai + 1}. megoldás: nem pontosan egy feladathoz tartozik.`);
  });
  return problems;
}

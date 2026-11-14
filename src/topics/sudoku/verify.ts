// A Képes sudoku verifikátora: ellenőrzi, hogy a rács latin négyzet (a hiányzó mezőktől eltekintve), és a
// sudoku szabálya szerint megoldja a kérdőjeles mezőt. A generátor adataira nem támaszkodik.
import { WORD_BY_ID, isPictureSafe } from '../../data/vocab';
import type { Sheet } from '../../engine/sheet';
import { verifyCommon } from '../../engine/verify';
import type { Visual } from '../../render/visual';
import { GRID, SIZES } from './generate';

export type Cell = string | 'blank' | 'empty';

export type Solved = { ok: true; symbol: string; symbols: Set<string> } | { ok: false; why: string };

/**
 * A kérdőjeles mezőbe az a kép kerül, amelyik a rács képei közül sem a sorában, sem az oszlopában nem szerepel.
 * Pontosan egy ilyen képnek kell lennie.
 */
export function solveSudoku(cells: readonly Cell[], k: number): Solved {
  if (cells.length !== k * k) return { ok: false, why: 'Nem teljes rács.' };
  const blanks = cells.flatMap((c, i) => (c === 'blank' ? [i] : []));
  if (blanks.length !== 1) return { ok: false, why: 'Pontosan egy kérdőjeles mező kell.' };
  const symbols = new Set(cells.filter((c) => c !== 'blank' && c !== 'empty'));
  if (symbols.size !== k) return { ok: false, why: `${symbols.size} különböző kép van a rácsban, ${k} kellene.` };

  const at = (y: number, x: number): Cell => cells[y * k + x]!;
  for (let a = 0; a < k; a++) {
    const row = [...Array(k).keys()].map((x) => at(a, x)).filter((c) => c !== 'blank' && c !== 'empty');
    const col = [...Array(k).keys()].map((y) => at(y, a)).filter((c) => c !== 'blank' && c !== 'empty');
    if (new Set(row).size !== row.length) return { ok: false, why: `A(z) ${a + 1}. sorban ismétlődik egy kép.` };
    if (new Set(col).size !== col.length) return { ok: false, why: `A(z) ${a + 1}. oszlopban ismétlődik egy kép.` };
  }

  const by = Math.floor(blanks[0]! / k);
  const bx = blanks[0]! % k;
  const seen = new Set<Cell>([...[...Array(k).keys()].map((x) => at(by, x)), ...[...Array(k).keys()].map((y) => at(y, bx))]);
  const candidates = [...symbols].filter((s) => !seen.has(s));
  if (candidates.length !== 1) return { ok: false, why: `${candidates.length} kép illene a kérdőjel helyére.` };
  return { ok: true, symbol: candidates[0]!, symbols };
}

export function verify(sheet: Sheet): string[] {
  const problems = verifyCommon(sheet, SIZES);
  const level = sheet.spec.level;
  const k = GRID[level] as number;

  const answerIds = sheet.answers.map((a, ai) => {
    if (a.visual.t !== 'img' || a.visual.shadow || a.visual.flip) {
      problems.push(`${ai + 1}. megoldás: nem sima kép.`);
      return '';
    }
    return a.visual.id;
  });

  const claimed = new Map<number, number>();
  sheet.tasks.forEach((task, ti) => {
    const label = `${ti + 1}. feladat`;
    const v = task.visual;
    if (v.t !== 'grid' || !v.frame || v.cols !== k || v.items.length !== k * k) return void problems.push(`${label}: nem ${k} × ${k}-as keretes rács.`);
    const cells: Cell[] = v.items.map((item: Visual) => (item.t === 'blank' ? 'blank' : item.t === 'empty' ? 'empty' : item.t === 'img' ? item.id : '?'));
    if (cells.includes('?')) return void problems.push(`${label}: ismeretlen elem a rácsban.`);
    for (const c of cells) {
      if (c === 'blank' || c === 'empty') continue;
      const w = WORD_BY_ID.get(c);
      if (!w) problems.push(`${label}: ismeretlen szó (${c}).`);
      else if (!isPictureSafe(w)) problems.push(`${label}: ${c} adata ellenőrzésre vár.`);
    }
    const empties = cells.filter((c) => c === 'empty').length;
    if (level < 2 && empties !== 0) problems.push(`${label}: az 1–2. szinten csak egy üres mező lehet.`);
    if (level === 2) {
      const bi = cells.indexOf('blank');
      const ei = cells.indexOf('empty');
      if (empties !== 1 || Math.floor(bi / k) !== Math.floor(ei / k)) problems.push(`${label}: a 3. szinten a kérdőjeles sorban egy másik üres mező is kell.`);
    }

    const solved = solveSudoku(cells, k);
    if (!solved.ok) return void problems.push(`${label}: ${solved.why}`);

    // Illik-e egy megoldás: a rács képei közül való, és se a sorában, se az oszlopában nincs.
    const fits = answerIds.flatMap((id, ai) => (id === solved.symbol ? [ai] : []));
    if (fits.length !== 1) return void problems.push(`${label}: ${fits.length} megoldás illik (pontosan 1 kellene).`);
    const ai = fits[0]!;
    claimed.set(ai, (claimed.get(ai) ?? 0) + 1);
    if (sheet.answers[ai]!.disc !== task.disc) problems.push(`${label}: az illő megoldás más koronghoz van rendelve.`);

    // Kerülőút-ellenőrzés: legalább két megoldás-kép szerepeljen a rácsban.
    const present = answerIds.filter((id) => solved.symbols.has(id));
    if (present.length < 2) problems.push(`${label}: kerülőúton is megoldható (csak egy megoldás-kép van a rácsban).`);
  });

  sheet.answers.forEach((_, ai) => {
    if ((claimed.get(ai) ?? 0) !== 1) problems.push(`${ai + 1}. megoldás: nem pontosan egy feladathoz tartozik.`);
  });
  return problems;
}

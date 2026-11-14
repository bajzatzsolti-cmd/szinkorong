import { describe, expect, it } from 'vitest';
import { mulberry32, range } from '../../src/engine/rng';
import type { Sheet } from '../../src/engine/sheet';
import type { Visual } from '../../src/render/visual';
import { buildDemo, buildSheet } from '../../src/topics';
import { sudoku } from '../../src/topics/sudoku';
import { latinSquare } from '../../src/topics/sudoku/generate';
import { solveSudoku, verify, type Cell } from '../../src/topics/sudoku/verify';
import { clone, topicSuite } from './topic-suite';

topicSuite(sudoku);

type Grid = Extract<Visual, { t: 'grid' }>;
const cellsOf = (v: Visual): Cell[] => (v as Grid).items.map((i) => (i.t === 'blank' ? 'blank' : i.t === 'empty' ? 'empty' : (i as { id: string }).id));

describe('latin négyzet', () => {
  it('minden sorban és oszlopban minden szimbólum pontosan egyszer', () => {
    for (const k of [3, 4]) {
      for (let seed = 1; seed < 50; seed++) {
        const sq = latinSquare(mulberry32(seed), k);
        for (let a = 0; a < k; a++) {
          expect(new Set(sq[a]).size).toBe(k);
          expect(new Set(sq.map((row) => row[a])).size).toBe(k);
        }
      }
    }
  });
});

describe('solveSudoku', () => {
  it('3 × 3, egy üres mező', () => {
    const cells: Cell[] = ['a', 'b', 'c', 'b', 'c', 'a', 'c', 'a', 'blank'];
    const s = solveSudoku(cells, 3);
    expect(s.ok && s.symbol).toBe('b');
  });
  it('4 × 4, a sorban két üres mező: az oszlop dönt', () => {
    const cells: Cell[] = ['a', 'b', 'c', 'd', 'b', 'a', 'd', 'c', 'c', 'd', 'a', 'b', 'blank', 'c', 'empty', 'a'];
    const s = solveSudoku(cells, 4);
    expect(s.ok && s.symbol).toBe('d');
  });
  it('elutasítja: ismétlődő kép a sorban', () => {
    expect(solveSudoku(['a', 'a', 'c', 'b', 'c', 'a', 'c', 'b', 'blank'], 3).ok).toBe(false);
  });
  it('elutasítja: két kép is illene (sem a sor, sem az oszlop nem dönt)', () => {
    // a kérdőjel sorából c és d hiányzik, az oszlopában pedig csak a és b van
    const cells: Cell[] = ['a', 'b', 'c', 'd', 'b', 'a', 'd', 'c', 'empty', 'd', 'a', 'b', 'blank', 'empty', 'b', 'a'];
    expect(solveSudoku(cells, 4).ok).toBe(false);
  });
});

describe('Képes sudoku – szabályok', () => {
  it('a rács 3 × 3, 4 × 4, 4 × 4; a 3. szinten a kérdőjeles sorban van egy másik üres mező', () => {
    expect([0, 5, 10].map((i) => (buildSheet(sudoku, i).tasks[0]!.visual as Grid).cols)).toEqual([3, 4, 4]);
    for (const index of range(5).map((i) => i + 10)) {
      for (const t of buildSheet(sudoku, index).tasks) {
        const cells = cellsOf(t.visual);
        expect(Math.floor(cells.indexOf('blank') / 4)).toBe(Math.floor(cells.indexOf('empty') / 4));
      }
    }
  });

  it('minden rácsban két megoldás-kép van (a sajátja és a következő feladaté)', () => {
    for (const index of range(15)) {
      const sheet = buildSheet(sudoku, index);
      const answers = sheet.answers.map((a) => (a.visual as { id: string }).id);
      for (const t of sheet.tasks) expect(answers.filter((id) => cellsOf(t.visual).includes(id))).toHaveLength(2);
    }
  });

  it('a bemutató lap 2 feladatos, és megfelel a szabályoknak', () => {
    const demo = buildDemo(sudoku);
    expect(demo.tasks).toHaveLength(2);
    expect(verify(demo)).toEqual([]);
  });
});

describe('Képes sudoku – a verifikátor elkapja a hibákat', () => {
  const base = (index: number): Sheet => clone(buildSheet(sudoku, index));

  it('egy kép kicserélve: a rács nem latin négyzet', () => {
    const s = base(0);
    const g = s.tasks[0]!.visual as Grid;
    const i = g.items.findIndex((x) => x.t === 'img');
    const j = g.items.findIndex((x, n) => x.t === 'img' && n !== i && (x as { id: string }).id !== (g.items[i] as { id: string }).id);
    g.items[i] = clone(g.items[j]!);
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('a 3. szinten hiányzik a második üres mező', () => {
    const s = base(11);
    const g = s.tasks[0]!.visual as Grid;
    const e = g.items.findIndex((x) => x.t === 'empty');
    const row = Math.floor(e / 4);
    const present = new Set(g.items.slice(row * 4, row * 4 + 4).filter((x) => x.t === 'img').map((x) => (x as { id: string }).id));
    const all = new Set(g.items.filter((x) => x.t === 'img').map((x) => (x as { id: string }).id));
    const answer = (s.answers.find((a) => a.disc === s.tasks[0]!.disc)!.visual as { id: string }).id;
    const missing = [...all].find((id) => !present.has(id) && id !== answer)!;
    g.items[e] = { t: 'img', id: missing };
    expect(verify(s).some((p) => p.includes('3. szinten'))).toBe(true);
  });
});

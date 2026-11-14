import { describe, expect, it } from 'vitest';
import { range } from '../../src/engine/rng';
import type { Sheet } from '../../src/engine/sheet';
import type { Visual } from '../../src/render/visual';
import { buildDemo, buildSheet } from '../../src/topics';
import { matrix } from '../../src/topics/matrix';
import type { Elem } from '../../src/topics/matrix/generate';
import { parseElem, solveMatrix, verify } from '../../src/topics/matrix/verify';
import { clone, topicSuite } from './topic-suite';

topicSuite(matrix);

type Grid = Extract<Visual, { t: 'grid' }>;
const e = (shape: Elem['shape'], fill: Elem['fill'], size = 1, count = 1, rot = 0): Elem => ({ shape, fill, size, count, rot });

describe('Mátrix – témakör-specifikus szabályok', () => {
  it('a korongszám szintenként 4, 6, 8; a rács 2 × 2, 2 × 2, 3 × 3', () => {
    expect([0, 5, 10].map((i) => buildSheet(matrix, i).spec.n)).toEqual([4, 6, 8]);
    expect([0, 5, 10].map((i) => (buildSheet(matrix, i).tasks[0]!.visual as Grid).cols)).toEqual([2, 2, 3]);
  });

  it('az 1. szinten mindig a jobb alsó mező hiányzik; a 2–3. szinten máshol is', () => {
    const blanks = (index: number): number[] => buildSheet(matrix, index).tasks.map((t) => (t.visual as Grid).items.findIndex((i) => i.t === 'blank'));
    for (const index of range(5)) expect(blanks(index).every((b) => b === 3)).toBe(true);
    const later = range(10).flatMap((i) => blanks(i + 5));
    expect(new Set(later).size).toBeGreaterThan(2);
  });

  it('minden rácsban pontosan egy üres mező van', () => {
    for (const index of range(15)) {
      for (const t of buildSheet(matrix, index).tasks) {
        expect((t.visual as Grid).items.filter((i) => i.t === 'blank')).toHaveLength(1);
      }
    }
  });

  it('a bemutató lap 2 feladatos, és megfelel a szabályoknak', () => {
    const demo = buildDemo(matrix);
    expect(demo.tasks).toHaveLength(2);
    expect(demo.spec.demo).toBe(true);
    expect(verify(demo)).toEqual([]);
  });
});

describe('solveMatrix', () => {
  it('2 × 2: soronként az alak, oszloponként a kitöltés állandó', () => {
    const cells = [e('kor', 'solid'), e('kor', 'outline'), e('negyzet', 'solid'), null];
    const s = solveMatrix(cells, 2);
    expect(s.ok && s.elem).toEqual(e('negyzet', 'outline'));
    expect(s.ok && [s.rowAttr, s.colAttr]).toEqual(['shape', 'fill']);
  });

  it('2 × 2: bármelyik mező hiányozhat', () => {
    const cells = [null, e('kor', 'outline'), e('negyzet', 'solid'), e('negyzet', 'outline')];
    const s = solveMatrix(cells, 2);
    expect(s.ok && s.elem).toEqual(e('kor', 'solid'));
  });

  it('3 × 3: soronként a méret, oszloponként az alak állandó', () => {
    const shapes: Elem['shape'][] = ['kor', 'negyzet', 'csillag'];
    const sizes = [0.45, 0.7, 1];
    const cells: (Elem | null)[] = sizes.flatMap((size) => shapes.map((shape) => e(shape, 'solid', size)));
    cells[4] = null;
    const s = solveMatrix(cells, 3);
    expect(s.ok && s.elem).toEqual(e('negyzet', 'solid', 0.7));
  });

  it('elutasítja: nincs szabály (egy elem kilóg)', () => {
    const cells = [e('kor', 'solid'), e('csillag', 'outline'), e('negyzet', 'solid'), null];
    expect(solveMatrix(cells, 2).ok).toBe(false);
  });

  it('elutasítja: csak egy tulajdonság változik (nincs sor- és oszlopszabály is)', () => {
    const cells = [e('kor', 'solid'), e('kor', 'solid'), e('negyzet', 'solid'), null];
    expect(solveMatrix(cells, 2).ok).toBe(false);
  });

  it('elutasítja: nincs vagy több az üres mező', () => {
    expect(solveMatrix([e('kor', 'solid'), e('kor', 'outline'), e('negyzet', 'solid'), e('negyzet', 'outline')], 2).ok).toBe(false);
    expect(solveMatrix([null, null, e('negyzet', 'solid'), e('negyzet', 'outline')], 2).ok).toBe(false);
  });
});

describe('Mátrix – a verifikátor elkapja a hibákat', () => {
  const base = (index: number): Sheet => clone(buildSheet(matrix, index));

  it('a helyes megoldás egy tulajdonsága elromlik', () => {
    const s = base(0);
    const t = s.tasks[0]!;
    const a = s.answers.find((x) => x.disc === t.disc)!;
    const el = parseElem(a.visual)!;
    a.visual = { t: 'shape', id: el.shape === 'kor' ? 'negyzet' : 'kor', fill: el.fill };
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('a rács egy eleme kilóg a szabályból', () => {
    const s = base(0);
    const grid = s.tasks[0]!.visual as Grid;
    grid.items[0] = { t: 'shape', id: 'nyil', fill: 'light', rot: 90 };
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('kerülőút: nincs „majdnem jó” megoldás a lapon', () => {
    const s = base(0);
    const t = s.tasks[0]!;
    const ai = s.answers.findIndex((x) => x.disc === t.disc);
    // minden más megoldást olyanra cserélünk, ami semmiben nem hasonlít
    const odd: Visual[] = [
      { t: 'shape', id: 'nyil', fill: 'light', rot: 90, scale: 0.7 },
      { t: 'shape', id: 'trapez', fill: 'light', rot: 180, scale: 0.7 },
      { t: 'shape', id: 'felkor', fill: 'light', rot: 270, scale: 0.7 },
    ];
    let k = 0;
    s.answers.forEach((a, j) => {
      if (j !== ai) a.visual = odd[k++]!;
    });
    expect(verify(s).some((p) => p.includes('kerülőút'))).toBe(true);
  });
});

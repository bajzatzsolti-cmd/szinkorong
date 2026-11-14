import { describe, expect, it } from 'vitest';
import { range } from '../../src/engine/rng';
import type { Sheet } from '../../src/engine/sheet';
import { exactKey, freeKey, mirror, orientedKey, rotate, type Pts } from '../../src/render/lattice';
import type { Visual } from '../../src/render/visual';
import { buildSheet } from '../../src/topics';
import { tukor } from '../../src/topics/tukor';
import { verify } from '../../src/topics/tukor/verify';
import { clone, topicSuite } from './topic-suite';

topicSuite(tukor);

type Seq = Extract<Visual, { t: 'seq' }>;
const pts = (v: Visual): Pts => (v.t === 'poly' ? v.cells : (v as Extract<Visual, { t: 'rune' }>).edges);
const taskParts = (v: Visual) => {
  const [sym, fig] = (v as Seq).items as [Extract<Visual, { t: 'sym' }>, Visual];
  return { kind: sym.id, fig, data: pts(fig) };
};

describe('Tükör és forgatás – témakör-specifikus szabályok', () => {
  it('1. szint: csak forgatás; 2. szint: csak tükrözés; 3. szint: mindkettő', () => {
    for (const index of range(15)) {
      const kinds = new Set(buildSheet(tukor, index).tasks.map((t) => taskParts(t.visual).kind));
      if (index < 5) expect([...kinds]).toEqual(['rotate']);
      else if (index < 10) expect([...kinds]).toEqual(['mirror']);
      else expect(kinds.size).toBe(2);
    }
  });

  it('1–2. szint rácsnégyzetes alakzat, 3. szint betűszerű jel', () => {
    expect(buildSheet(tukor, 0).answers.every((a) => a.visual.t === 'poly')).toBe(true);
    expect(buildSheet(tukor, 9).answers.every((a) => a.visual.t === 'poly')).toBe(true);
    expect(buildSheet(tukor, 14).answers.every((a) => a.visual.t === 'rune')).toBe(true);
  });

  it('forgatásnál a megoldás ugyanaz az alakzat más állásban; tükrözésnél a pontos jobb–bal tükörkép', () => {
    for (const index of range(15)) {
      const sheet = buildSheet(tukor, index);
      for (const t of sheet.tasks) {
        const { kind, data } = taskParts(t.visual);
        const ans = pts(sheet.answers.find((a) => a.disc === t.disc)!.visual);
        if (kind === 'rotate') {
          expect(orientedKey(ans)).toBe(orientedKey(data));
          expect(exactKey(ans)).not.toBe(exactKey(data));
        } else {
          expect(exactKey(ans)).toBe(exactKey(mirror(data)));
        }
      }
    }
  });

  it('a szinten belül haladva megjelennek a tükörpárok (ugyanaz a fajta, mindkét irányban)', () => {
    const pairCount = (index: number): number => {
      const keys = buildSheet(tukor, index).tasks.map((t) => freeKey(taskParts(t.visual).data));
      return keys.length - new Set(keys).size;
    };
    expect(pairCount(0)).toBe(0);
    expect(pairCount(4)).toBe(2);
    expect(pairCount(5)).toBe(0);
    expect(pairCount(9)).toBe(2);
    expect(pairCount(14)).toBe(3);
  });
});

describe('Tükör és forgatás – a verifikátor elkapja a hibákat', () => {
  const base = (index: number): Sheet => clone(buildSheet(tukor, index));
  const setFig = (v: Visual, data: Pts): void => {
    if (v.t === 'poly') v.cells = data;
    else if (v.t === 'rune') v.edges = data;
  };

  it('forgatás helyett tükörkép a megoldás', () => {
    const s = base(0);
    const t = s.tasks[0]!;
    const a = s.answers.find((x) => x.disc === t.disc)!;
    setFig(a.visual, mirror(pts(a.visual)));
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('a megoldás nincs elforgatva (ugyanaz a rajz, mint a feladat)', () => {
    const s = base(0);
    const t = s.tasks[0]!;
    const a = s.answers.find((x) => x.disc === t.disc)!;
    setFig(a.visual, taskParts(t.visual).data);
    expect(verify(s).some((p) => p.includes('nincs elforgatva'))).toBe(true);
  });

  it('tükrözésnél a megoldás el is van forgatva (nem a pontos tükörkép)', () => {
    const s = base(6);
    const t = s.tasks[0]!;
    const a = s.answers.find((x) => x.disc === t.disc)!;
    setFig(a.visual, rotate(pts(a.visual), 1));
    expect(verify(s).some((p) => p.includes('tükörkép'))).toBe(true);
  });

  it('nem királis alakzat (a tükörképe önmagába forgatható)', () => {
    const s = base(0);
    const square = [[0, 0], [1, 0], [0, 1], [1, 1]];
    setFig(taskParts(s.tasks[0]!.visual).fig, square);
    expect(verify(s).some((p) => p.includes('királis'))).toBe(true);
  });

  it('hiányzó jel a feladat elől', () => {
    const s = base(0);
    (s.tasks[0]!.visual as Seq).items.shift();
    expect(verify(s).length).toBeGreaterThan(0);
  });
});

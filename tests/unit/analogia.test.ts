import { describe, expect, it } from 'vitest';
import { range } from '../../src/engine/rng';
import type { Sheet } from '../../src/engine/sheet';
import type { Visual } from '../../src/render/visual';
import { buildDemo, buildSheet } from '../../src/topics';
import { analogia } from '../../src/topics/analogia';
import { FLAGS, FORWARD_FROM, stateVisual, type State } from '../../src/topics/analogia/generate';
import { parseState, verify } from '../../src/topics/analogia/verify';
import { clone, topicSuite } from './topic-suite';

topicSuite(analogia);

type Seq = Extract<Visual, { t: 'seq' }>;
const abc = (v: Visual) => {
  const items = (v as Seq).items;
  return { a: parseState(items[0]!)!, b: parseState(items[2]!)!, c: parseState(items[4]!)! };
};
const relOf = (v: Visual) => {
  const { a, b } = abc(v);
  const flag = FLAGS.find((f) => a[f] !== b[f])!;
  return { flag, forward: a[flag] === FORWARD_FROM[flag] };
};

describe('Analógia – témakör-specifikus szabályok', () => {
  it('a korongszám szintenként 4, 6, 8', () => {
    expect([0, 5, 10].map((i) => buildSheet(analogia, i).spec.n)).toEqual([4, 6, 8]);
  });

  it('a feladat „A → B ┊ C → ?” alakú, A és B ugyanaz a tárgy, C más tárgy', () => {
    for (const index of range(15)) {
      for (const t of buildSheet(analogia, index).tasks) {
        const items = (t.visual as Seq).items;
        expect(items).toHaveLength(7);
        expect(items[6]!.t).toBe('blank');
        const { a, b, c } = abc(t.visual);
        expect(a.id).toBe(b.id);
        expect(c.id).not.toBe(a.id);
      }
    }
  });

  it('1–2. szint: csak előre irányú viszonyok; az 1. szinten nincs egész → fél; a 3. szinten van visszafelé is', () => {
    const rels = (from: number) => range(5).flatMap((i) => buildSheet(analogia, from + i).tasks.map((t) => relOf(t.visual)));
    expect(rels(0).every((r) => r.forward && r.flag !== 'half')).toBe(true);
    expect(rels(5).every((r) => r.forward)).toBe(true);
    expect(rels(5).some((r) => r.flag === 'half')).toBe(true);
    expect(rels(10).some((r) => !r.forward)).toBe(true);
  });

  it('mind az öt viszony előfordul a 15 lapon', () => {
    const flags = new Set(range(15).flatMap((i) => buildSheet(analogia, i).tasks.map((t) => relOf(t.visual).flag)));
    expect([...flags].sort()).toEqual([...FLAGS].sort());
  });

  it('minden feladathoz van a lapon egy másik megoldás is ugyanarról a tárgyról (nincs kerülőút)', () => {
    for (const index of range(15)) {
      const sheet = buildSheet(analogia, index);
      const ids = sheet.answers.map((a) => parseState(a.visual)!.id);
      for (const id of ids) expect(ids.filter((x) => x === id).length).toBeGreaterThanOrEqual(2);
    }
  });

  it('a bemutató lap 2 feladatos, és megfelel a szabályoknak', () => {
    const demo = buildDemo(analogia);
    expect(demo.tasks).toHaveLength(2);
    expect(verify(demo)).toEqual([]);
  });

  it('stateVisual és parseState egymás inverzei', () => {
    const states: State[] = [
      { kind: 'img', id: 'alma', small: true, outline: false, half: false, double: false, shadow: false },
      { kind: 'img', id: 'cica', small: false, outline: false, half: false, double: true, shadow: false },
      { kind: 'img', id: 'cica', small: false, outline: false, half: true, double: false, shadow: false },
      { kind: 'img', id: 'cica', small: false, outline: false, half: false, double: false, shadow: true },
      { kind: 'shape', id: 'kor', small: false, outline: true, half: false, double: false, shadow: false },
    ];
    for (const s of states) expect(parseState(stateVisual(s))).toEqual(s);
  });
});

describe('Analógia – a verifikátor elkapja a hibákat', () => {
  const base = (index: number): Sheet => clone(buildSheet(analogia, index));

  it('a helyes megoldás másik változatra cserélve', () => {
    const s = base(0);
    const t = s.tasks[0]!;
    const a = s.answers.find((x) => x.disc === t.disc)!;
    const st = parseState(a.visual)!;
    a.visual = stateVisual({ ...st, half: !st.half });
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('A és B között két tulajdonság változik', () => {
    const s = base(0);
    const items = (s.tasks[0]!.visual as Seq).items;
    const b = parseState(items[2]!)!;
    items[2] = stateVisual({ ...b, half: !b.half, small: !b.small, double: false });
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('visszafelé irányú viszony az 1. szinten', () => {
    const s = base(0);
    const items = (s.tasks[0]!.visual as Seq).items;
    [items[0], items[2]] = [items[2]!, items[0]!];
    expect(verify(s).some((p) => p.includes('visszafelé') || p.includes('állapotban'))).toBe(true);
  });

  it('kerülőút: a tárgyat csak egy megoldás mutatja', () => {
    const s = base(0);
    const t = s.tasks[0]!;
    const { c } = abc(t.visual);
    const ai = s.answers.findIndex((x) => x.disc === t.disc);
    s.answers.forEach((a, j) => {
      const st = parseState(a.visual)!;
      if (j !== ai && st.id === c.id) a.visual = stateVisual({ ...st, id: st.kind === 'img' ? 'krokodil' : 'kereszt' });
    });
    expect(verify(s).some((p) => p.includes('kerülőút'))).toBe(true);
  });
});

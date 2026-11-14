import { describe, expect, it } from 'vitest';
import { WORD_BY_ID } from '../../src/data/vocab';
import { range } from '../../src/engine/rng';
import type { Sheet } from '../../src/engine/sheet';
import { visualKey, type Visual } from '../../src/render/visual';
import { buildSheet } from '../../src/topics';
import { merleg } from '../../src/topics/merleg';
import { token } from '../../src/topics/merleg/generate';
import { verify } from '../../src/topics/merleg/verify';
import { clone, topicSuite } from './topic-suite';

topicSuite(merleg);

type Bal = Extract<Visual, { t: 'balance' }>;
const heavyOf = (b: Bal): Visual => (b.tilt === 'left' ? b.left[0]! : b.right[0]!);
const lightOf = (b: Bal): Visual => (b.tilt === 'left' ? b.right[0]! : b.left[0]!);

describe('Mérleg – szabályok', () => {
  it('a játékkockák (alakzat + szín) 24-ig mind különbözők', () => {
    const keys = range(24).map((j) => visualKey(token(j)));
    expect(new Set(keys).size).toBe(24);
  });

  it('1. szint: valódi tárgyak, a lent lévő legalább egy súlyosztállyal nehezebb', () => {
    for (const index of range(5)) {
      for (const t of buildSheet(merleg, index).tasks) {
        const b = t.visual as Bal;
        expect(b.t).toBe('balance');
        const h = WORD_BY_ID.get((heavyOf(b) as { id: string }).id)!;
        const l = WORD_BY_ID.get((lightOf(b) as { id: string }).id)!;
        expect(h.weight! - l.weight!).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('a nehezebb tárgy hol a bal, hol a jobb oldalon van', () => {
    const tilts = range(10).flatMap((i) => buildSheet(merleg, i).tasks.map((t) => (t.visual as Bal).tilt));
    expect(tilts).toContain('left');
    expect(tilts).toContain('right');
  });

  it('3. szint: két mérleg, A > B és B > C; a megoldás A', () => {
    for (const index of range(5).map((i) => i + 10)) {
      const sheet = buildSheet(merleg, index);
      for (const t of sheet.tasks) {
        const [b1, b2] = (t.visual as Extract<Visual, { t: 'seq' }>).items as [Bal, Bal];
        const rels = [b1, b2].map((b) => [visualKey(heavyOf(b)), visualKey(lightOf(b))]);
        const shared = rels[0]![1] === rels[1]![0] ? rels[0]![0] : rels[1]![0];
        const answer = visualKey(sheet.answers.find((a) => a.disc === t.disc)!.visual);
        expect(answer).toBe(shared);
      }
    }
  });
});

describe('Mérleg – a verifikátor elkapja a hibákat', () => {
  const base = (index: number): Sheet => clone(buildSheet(merleg, index));

  it('a mérleg rossz irányba billen (ellentmond a világismeretnek)', () => {
    const s = base(0);
    const b = s.tasks[0]!.visual as Bal;
    b.tilt = b.tilt === 'left' ? 'right' : 'left';
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('egyensúlyban lévő mérleg', () => {
    const s = base(6);
    (s.tasks[0]!.visual as Bal).tilt = 'level';
    expect(verify(s).some((p) => p.includes('egyensúly'))).toBe(true);
  });

  it('a 3. szinten nem láncolható a két mérleg', () => {
    const s = base(11);
    const [b1] = (s.tasks[0]!.visual as Extract<Visual, { t: 'seq' }>).items as [Bal, Bal];
    b1.left = [token(23)];
    b1.right = [token(22)];
    expect(verify(s).length).toBeGreaterThan(0);
  });
});

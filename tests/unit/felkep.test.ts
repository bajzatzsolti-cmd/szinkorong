import { describe, expect, it } from 'vitest';
import { range } from '../../src/engine/rng';
import type { Sheet } from '../../src/engine/sheet';
import type { Visual } from '../../src/render/visual';
import { buildSheet } from '../../src/topics';
import { felkep } from '../../src/topics/felkep';
import { verify } from '../../src/topics/felkep/verify';
import { clone, topicSuite } from './topic-suite';

topicSuite(felkep);

type Img = Extract<Visual, { t: 'img' }>;

describe('Fél kép – szabályok', () => {
  it('1–2. szint: a feladat a kép bal fele, a megoldás a jobb fele', () => {
    for (const index of range(10)) {
      const sheet = buildSheet(felkep, index);
      for (const t of sheet.tasks) expect((t.visual as Img).half).toBe('L');
      for (const a of sheet.answers) expect((a.visual as Img).half).toBe('R');
    }
  });

  it('3. szint: lyukas kép és kivágott darab, ugyanarról a helyről', () => {
    for (const index of range(5).map((i) => i + 10)) {
      const sheet = buildSheet(felkep, index);
      for (const t of sheet.tasks) {
        const a = sheet.answers.find((x) => x.disc === t.disc)!.visual as Img;
        expect((t.visual as Img).hole).toEqual(a.piece);
      }
    }
  });
});

describe('Fél kép – a verifikátor elkapja a hibákat', () => {
  const base = (index: number): Sheet => clone(buildSheet(felkep, index));

  it('a darab más helyről van kivágva', () => {
    const s = base(12);
    const t = s.tasks[0]!;
    const a = s.answers.find((x) => x.disc === t.disc)!.visual as Img;
    a.piece = { x: 30, y: 30, r: 17 };
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('a megoldás a bal fél (nem a hiányzó jobb fél)', () => {
    const s = base(1);
    (s.answers[0]!.visual as Img).half = 'L';
    expect(verify(s).length).toBeGreaterThan(0);
  });
});

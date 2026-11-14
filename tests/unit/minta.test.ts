import { describe, expect, it } from 'vitest';
import { range } from '../../src/engine/rng';
import { SHEETS_PER_TOPIC, levelOf, type Sheet, type SheetSpec } from '../../src/engine/sheet';
import { PATTERN_SHAPES } from '../../src/render/shapes';
import { visualKey, type Visual } from '../../src/render/visual';
import { buildSheet } from '../../src/topics';
import { minta } from '../../src/topics/minta';
import { solveSequence, verify } from '../../src/topics/minta/verify';

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

describe('Sorminta – mind a 15 lap', () => {
  for (const index of range(SHEETS_PER_TOPIC)) {
    it(`${index + 1}. lap: megfelelő elemszám, különböző megoldások, egyértelműség`, () => {
      const sheet = buildSheet(minta, index);
      expect(sheet.tasks).toHaveLength(minta.sizes[levelOf(index)]!);
      expect(sheet.answers).toHaveLength(sheet.spec.n);
      expect(minta.verify(sheet)).toEqual([]);
    });
  }

  it('a korongszám szintenként 6, 8, 10', () => {
    expect([0, 5, 10].map((i) => buildSheet(minta, i).spec.n)).toEqual([6, 8, 10]);
  });

  it('determinisztikus: ugyanaz a lap mindig ugyanaz', () => {
    for (const index of [0, 7, 14]) {
      expect(buildSheet(minta, index)).toEqual(buildSheet(minta, index));
    }
  });

  it('a lapok különböznek egymástól', () => {
    const keys = range(SHEETS_PER_TOPIC).map((i) => JSON.stringify(buildSheet(minta, i)));
    expect(new Set(keys).size).toBe(SHEETS_PER_TOPIC);
  });

  it('a 3. szinten a hiányzó elem a sor közepéről hiányzik (mindkét oldalon van elem)', () => {
    for (const index of range(5).map((i) => i + 10)) {
      for (const t of buildSheet(minta, index).tasks) {
        const items = (t.visual as Extract<Visual, { t: 'seq' }>).items;
        const gap = items.findIndex((v) => v.t === 'blank');
        expect(gap).toBeGreaterThanOrEqual(2);
        expect(gap).toBeLessThanOrEqual(items.length - 3);
      }
    }
  });
});

describe('Sorminta – a generátor sok különböző maggal is hibátlan', () => {
  for (const level of [0, 1, 2]) {
    it(`${level + 1}. szint, 300 különböző mag`, () => {
      const n = minta.sizes[level]!;
      for (let seed = 1; seed <= 300; seed++) {
        const spec: SheetSpec = { topic: 'minta', level, index: level * 5, n, seed: seed * 7919 };
        const problems = verify(minta.generate(spec));
        expect(problems, `mag: ${spec.seed}`).toEqual([]);
      }
    });
  }

  it('a lap szimbólumai a PATTERN_SHAPES készletből valók', () => {
    const sheet = buildSheet(minta, 14);
    for (const a of sheet.answers) {
      expect(a.visual.t).toBe('shape');
      if (a.visual.t === 'shape') expect(PATTERN_SHAPES).toContain(a.visual.id);
    }
  });
});

describe('Sorminta – a verifikátor valóban elkapja a hibákat', () => {
  const base = (): Sheet => clone(buildSheet(minta, 3));

  it('két egyforma megoldás', () => {
    const s = base();
    s.answers[1]!.visual = clone(s.answers[0]!.visual);
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('felcserélt korongok (a megoldás más feladathoz van rendelve)', () => {
    const s = base();
    const d = s.answers[0]!.disc;
    s.answers[0]!.disc = s.answers[1]!.disc;
    s.answers[1]!.disc = d;
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('hiányzó megoldás', () => {
    const s = base();
    s.answers.pop();
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('kerülőút: a sorban csak egy megoldás-kép szerepel', () => {
    const s = base();
    const t = s.tasks[0]!;
    const items = (t.visual as Extract<Visual, { t: 'seq' }>).items;
    const answerKeys = new Set(s.answers.map((a) => visualKey(a.visual)));
    const own = s.answers.find((a) => a.disc === t.disc)!.visual;
    // A sorban minden, a megoldáson kívüli megoldás-képet egy lapon kívüli képre cserélünk.
    const foreign: Visual = { t: 'shape', id: 'teglalap', fill: 'solid' };
    for (let i = 0; i < items.length; i++) {
      const k = visualKey(items[i]!);
      if (answerKeys.has(k) && k !== visualKey(own)) items[i] = foreign;
    }
    expect(verify(s).some((p) => p.includes('kerülőút'))).toBe(true);
  });

  it('egyértelműtlen sor: a minta nem rekonstruálható', () => {
    const s = base();
    (s.tasks[0]!.visual as Extract<Visual, { t: 'seq' }>).items = [
      { t: 'shape', id: 'kor', fill: 'solid' },
      { t: 'shape', id: 'negyzet', fill: 'solid' },
      { t: 'shape', id: 'csillag', fill: 'solid' },
      { t: 'blank' },
    ];
    expect(verify(s).length).toBeGreaterThan(0);
  });
});

describe('solveSequence', () => {
  it('AB minta, sor vége', () => {
    expect(solveSequence(['a', 'b', 'a', 'b', 'blank'])).toEqual({ ok: true, symbol: 'a' });
  });
  it('AAB minta, sor vége', () => {
    expect(solveSequence(['a', 'a', 'b', 'a', 'a', 'b', 'blank'])).toEqual({ ok: true, symbol: 'a' });
  });
  it('ABC minta, a sor közepéről hiányzik', () => {
    expect(solveSequence(['a', 'b', 'c', 'a', 'blank', 'c', 'a'])).toEqual({ ok: true, symbol: 'b' });
  });
  it('AABB minta, sor vége', () => {
    expect(solveSequence(['a', 'a', 'b', 'b', 'a', 'a', 'b', 'b', 'blank'])).toEqual({ ok: true, symbol: 'a' });
  });
  it('elutasítja: csupa egyforma elem', () => {
    expect(solveSequence(['a', 'a', 'a', 'a', 'blank']).ok).toBe(false);
  });
  it('elutasítja: az egység nem látszik kétszer', () => {
    expect(solveSequence(['a', 'b', 'a', 'blank']).ok).toBe(false);
  });
  it('elutasítja: nincs ismétlődés', () => {
    expect(solveSequence(['a', 'b', 'c', 'd', 'e', 'blank']).ok).toBe(false);
  });
  it('elutasítja: nincs vagy több az üres hely', () => {
    expect(solveSequence(['a', 'b', 'a', 'b']).ok).toBe(false);
    expect(solveSequence(['a', 'blank', 'a', 'b', 'blank']).ok).toBe(false);
  });
});

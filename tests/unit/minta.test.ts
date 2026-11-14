import { describe, expect, it } from 'vitest';
import { WORD_BY_ID } from '../../src/data/vocab';
import { range } from '../../src/engine/rng';
import type { Sheet } from '../../src/engine/sheet';
import { visualKey, type Visual } from '../../src/render/visual';
import { buildSheet } from '../../src/topics';
import { SYMBOL_CATEGORIES } from '../../src/topics/minta/generate';
import { minta } from '../../src/topics/minta';
import { solveSequence, verify } from '../../src/topics/minta/verify';
import { clone, topicSuite } from './topic-suite';

topicSuite(minta);

describe('Sorminta – témakör-specifikus szabályok', () => {
  it('a korongszám szintenként 6, 8, 10', () => {
    expect([0, 5, 10].map((i) => buildSheet(minta, i).spec.n)).toEqual([6, 8, 10]);
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

  it('a lap szimbólumai szókincs-képek a megengedett kategóriákból, ikerképekből legfeljebb egy', () => {
    for (const index of range(15)) {
      const sheet = buildSheet(minta, index);
      const twins: string[] = [];
      for (const a of sheet.answers) {
        expect(a.visual.t).toBe('img');
        if (a.visual.t !== 'img') continue;
        const w = WORD_BY_ID.get(a.visual.id)!;
        expect(SYMBOL_CATEGORIES as readonly string[]).toContain(w.category);
        if (w.twin) twins.push(w.twin);
      }
      expect(new Set(twins).size).toBe(twins.length);
    }
  });
});

describe('Sorminta – a verifikátor valóban elkapja a minta-specifikus hibákat', () => {
  const base = (): Sheet => clone(buildSheet(minta, 3));

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
      { t: 'img', id: 'alma' },
      { t: 'img', id: 'banan' },
      { t: 'img', id: 'korte' },
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

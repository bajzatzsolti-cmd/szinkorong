import { describe, expect, it } from 'vitest';
import { ALSO, PAIRS, related } from '../../src/data/pairs';
import { WORD_BY_ID } from '../../src/data/vocab';
import { range } from '../../src/engine/rng';
import { buildSheet } from '../../src/topics';
import { par } from '../../src/topics/par';
import { compatible } from '../../src/topics/par/generate';
import { verify } from '../../src/topics/par/verify';
import { clone, topicSuite } from './topic-suite';

topicSuite(par);

describe('párok tartalma (content/parok.json)', () => {
  it('minden pár és also-bejegyzés létező szókincs-szóra mutat', () => {
    for (const [a, b] of [...PAIRS, ...ALSO]) {
      expect(WORD_BY_ID.has(a), `ismeretlen szó: ${a}`).toBe(true);
      expect(WORD_BY_ID.has(b), `ismeretlen szó: ${b}`).toBe(true);
      expect(a).not.toBe(b);
    }
  });

  it('nincs ismétlődő pár (a sorrendtől függetlenül)', () => {
    const keys = PAIRS.map(([a, b]) => [a, b].sort().join('|'));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('az also-bejegyzés nem ismétli a párokat', () => {
    const pairKeys = new Set(PAIRS.map(([a, b]) => [a, b].sort().join('|')));
    for (const [a, b] of ALSO) expect(pairKeys.has([a, b].sort().join('|')), `${a}–${b} már pár`).toBe(false);
  });

  it('a kapcsolat szimmetrikus', () => {
    for (const [a, b] of [...PAIRS, ...ALSO]) {
      expect(related(a, b)).toBe(true);
      expect(related(b, a)).toBe(true);
    }
  });

  it('legalább 40 pár van (a tervezet minimuma; a változatossághoz ~80 kell)', () => {
    expect(PAIRS.length).toBeGreaterThanOrEqual(40);
  });
});

describe('Mi tartozik össze? – témakör-specifikus szabályok', () => {
  it('két olyan pár nem összeférő, amely között kapcsolat van (pl. méh–méz és lepke–virág)', () => {
    expect(compatible(['meh', 'mez'], ['lepke', 'virag'])).toBe(false);
    expect(compatible(['kutya', 'csont'], ['lepke', 'virag'])).toBe(true);
  });

  it('a feladat és a megoldás oldala vegyesen fordul elő a párok sorrendjéhez képest', () => {
    const firstIsPairFirst: boolean[] = [];
    for (const index of range(15)) {
      const sheet = buildSheet(par, index);
      for (const t of sheet.tasks) {
        if (t.visual.t !== 'img') continue;
        const id = t.visual.id;
        firstIsPairFirst.push(PAIRS.some(([a]) => a === id));
      }
    }
    expect(firstIsPairFirst.some(Boolean)).toBe(true);
    expect(firstIsPairFirst.some((x) => !x)).toBe(true);
  });

  it('egy szó sem szerepel kétszer a lapon', () => {
    for (const index of range(15)) {
      const sheet = buildSheet(par, index);
      const ids = [...sheet.tasks, ...sheet.answers].map((c) => (c.visual.t === 'img' ? c.visual.id : ''));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('a verifikátor elkapja: a lapon két olyan szó van, amely ugyanahhoz a szóhoz is illik', () => {
    const s = clone(buildSheet(par, 3));
    // az első feladat képét egy olyan szóra cseréljük, amely a második feladat megoldásához is kapcsolódik
    s.tasks[0]!.visual = { t: 'img', id: 'meh' };
    s.tasks[1]!.visual = { t: 'img', id: 'lepke' };
    const ansFor = (i: number, id: string) => {
      const j = s.answers.findIndex((a) => a.disc === s.tasks[i]!.disc);
      s.answers[j]!.visual = { t: 'img', id };
    };
    ansFor(0, 'mez');
    ansFor(1, 'virag');
    expect(verify(s).some((p) => p.includes('megoldás illik'))).toBe(true);
  });
});

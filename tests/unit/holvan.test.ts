import { describe, expect, it } from 'vitest';
import { range } from '../../src/engine/rng';
import type { Visual } from '../../src/render/visual';
import { buildSheet } from '../../src/topics';
import { holvan } from '../../src/topics/holvan';
import { PLACES, SENTENCES, parseSentenceId, relsOf } from '../../src/topics/holvan/data';
import { verify } from '../../src/topics/holvan/verify';
import { clone, topicSuite } from './topic-suite';

topicSuite(holvan);

type Scene = Extract<Visual, { t: 'scene' }>;
const scenes = (index: number): Scene[] => buildSheet(holvan, index).answers.map((a) => a.visual as Scene);

describe('Hol van? – tartalom és szintek', () => {
  it('minden mondat-azonosító értelmes (szereplő-tárgy-viszony), és a viszony a tárgynál rajzolható', () => {
    for (const id of Object.keys(SENTENCES)) {
      const p = parseSentenceId(id);
      expect(p, id).not.toBeNull();
      expect(relsOf(p!.place), id).toContain(p!.rel);
    }
  });

  it('a mondatok helyesek: nagybetűvel kezdődnek, „van.”-nal végződnek', () => {
    for (const s of Object.values(SENTENCES)) expect(s).toMatch(/^A[z]? .+ van\.$/);
  });

  it('1. szint: egy tárgy; 2–3. szint: két tárgy; egy lapon mindig egy szereplő', () => {
    for (const index of range(15)) {
      const s = scenes(index);
      expect(new Set(s.map((x) => x.fig)).size).toBe(1);
      expect(new Set(s.map((x) => x.place)).size).toBe(index < 5 ? 1 : 2);
    }
  });

  it('jobbra/balra csak a 3. szinten, ott mindkét tárgynál; mellett/mögött ilyenkor nincs', () => {
    for (const index of range(15)) {
      const rels = scenes(index).map((x) => x.rel);
      if (index < 10) expect(rels.some((r) => r === 'jobbra' || r === 'balra')).toBe(false);
      else {
        expect(rels.filter((r) => r === 'jobbra')).toHaveLength(2);
        expect(rels.filter((r) => r === 'balra')).toHaveLength(2);
        expect(rels.some((r) => r === 'mellett' || r === 'mogott')).toBe(false);
      }
    }
  });

  it('a széknél nincs „mögött” (szemből átlátszó, összetéveszthető az „alatt”-tal)', () => {
    expect(relsOf('szek')).not.toContain('mogott');
    expect(PLACES).toContain('szek');
  });
});

describe('Hol van? – a verifikátor elkapja a hibákat', () => {
  it('rossz viszony a képen (a mondat „alatt”, a kép „fölött”)', () => {
    const s = clone(buildSheet(holvan, 2));
    const v = s.answers[0]!.visual as Scene;
    v.rel = v.rel === 'folott' ? 'elott' : 'folott';
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('két szereplő egy lapon', () => {
    const s = clone(buildSheet(holvan, 7));
    const v = s.answers[0]!.visual as Scene;
    v.fig = v.fig === 'cica' ? 'kutya' : 'cica';
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('jobbra és mellett ugyanazzal a tárggyal', () => {
    const s = clone(buildSheet(holvan, 12));
    const lr = s.answers.find((a) => (a.visual as Scene).rel === 'jobbra')!;
    const other = s.answers.find((a) => {
      const v = a.visual as Scene;
      return v.place === (lr.visual as Scene).place && v.rel !== 'jobbra' && v.rel !== 'balra';
    })!;
    (other.visual as Scene).rel = 'mellett';
    expect(verify(s).length).toBeGreaterThan(0);
  });
});

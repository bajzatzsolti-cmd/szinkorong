import { describe, expect, it } from 'vitest';
import { WORD_BY_ID } from '../../src/data/vocab';
import { range } from '../../src/engine/rng';
import { buildSheet } from '../../src/topics';
import { arnyek } from '../../src/topics/arnyek';
import { verify } from '../../src/topics/arnyek/verify';
import { clone, topicSuite } from './topic-suite';

topicSuite(arnyek);

describe('Árnyékvadász – témakör-specifikus szabályok', () => {
  it('az árnyék átalakítása szintenként: egyenes, tükrözött, elforgatott', () => {
    const shadows = (index: number) => buildSheet(arnyek, index).answers.map((a) => (a.visual.t === 'img' ? a.visual : null)!);
    for (const index of range(5)) expect(shadows(index).every((v) => !v.flip && !v.rot)).toBe(true);
    for (const index of range(5).map((i) => i + 5)) expect(shadows(index).every((v) => v.flip && !v.rot)).toBe(true);
    for (const index of range(5).map((i) => i + 10)) expect(shadows(index).every((v) => !v.flip && [90, 180, 270].includes(v.rot ?? 0))).toBe(true);
  });

  it('csak jó árnyékú szó kerül a lapra, iker-képekből legfeljebb egy', () => {
    for (const index of range(15)) {
      const twins: string[] = [];
      for (const t of buildSheet(arnyek, index).tasks) {
        if (t.visual.t !== 'img') throw new Error('nem kép');
        const w = WORD_BY_ID.get(t.visual.id)!;
        expect(w.goodShadow).toBe(true);
        if (w.twin) twins.push(w.twin);
      }
      expect(new Set(twins).size).toBe(twins.length);
    }
  });

  it('a nehéz szinten minden képnek van hasonló alakú társa a lapon', () => {
    for (const index of range(5).map((i) => i + 10)) {
      const sims = buildSheet(arnyek, index).tasks.map((t) => (t.visual.t === 'img' ? WORD_BY_ID.get(t.visual.id)!.similar : undefined));
      for (const s of sims) expect(sims.filter((x) => x === s).length).toBeGreaterThanOrEqual(2);
    }
  });

  it('a képre koppintva elhangzik a neve, az árnyékra nem (nem árulja el a megoldást)', () => {
    const sheet = buildSheet(arnyek, 0);
    expect(sheet.tasks.every((t) => t.say?.startsWith('szo-'))).toBe(true);
    expect(sheet.answers.every((a) => !a.say)).toBe(true);
  });

  it('a verifikátor elkapja: nem átalakított árnyék a 2. szinten, iker-kép, hiányzó sziluett-társ', () => {
    const s = clone(buildSheet(arnyek, 6));
    const v = s.answers[0]!.visual;
    if (v.t === 'img') delete v.flip;
    expect(verify(s).some((p) => p.includes('tükrözött'))).toBe(true);

    const s2 = clone(buildSheet(arnyek, 0));
    // egy feladat képét a zebrára, egy másikét a lóra cseréljük (iker-kép), az árnyékokkal együtt
    const set = (i: number, id: string) => {
      s2.tasks[i]!.visual = { t: 'img', id };
      const j = s2.answers.findIndex((a) => a.disc === s2.tasks[i]!.disc);
      s2.answers[j]!.visual = { t: 'img', id, shadow: true };
    };
    set(0, 'zebra');
    set(1, 'lo');
    expect(verify(s2).some((p) => p.includes('iker'))).toBe(true);
  });
});

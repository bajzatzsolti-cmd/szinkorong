import { describe, expect, it } from 'vitest';
import { CATEGORIES, WORD_BY_ID } from '../../src/data/vocab';
import { range } from '../../src/engine/rng';
import { buildSheet } from '../../src/topics';
import { csoport } from '../../src/topics/csoport';
import { verify } from '../../src/topics/csoport/verify';
import { clone, topicSuite } from './topic-suite';

topicSuite(csoport);

const catOf = (v: { t: string; id?: string }): string => WORD_BY_ID.get((v as { id: string }).id)!.category;

describe('Csoportosító – témakör-specifikus szabályok', () => {
  it('minden feladathoz pontosan egy azonos csoportból való megoldás tartozik', () => {
    for (const index of range(15)) {
      const sheet = buildSheet(csoport, index);
      for (const t of sheet.tasks) {
        const same = sheet.answers.filter((a) => catOf(a.visual) === catOf(t.visual));
        expect(same).toHaveLength(1);
        expect(same[0]!.disc).toBe(t.disc);
      }
    }
  });

  it('az állat, madár, bogár családból egy lapon legfeljebb egy csoport szerepel', () => {
    for (const index of range(15)) {
      const fams = buildSheet(csoport, index).tasks.map((t) => CATEGORIES[catOf(t.visual)]!.family);
      expect(new Set(fams).size).toBe(fams.length);
    }
  });

  it('csak csoportosítható kategóriák szerepelnek', () => {
    for (const index of range(15)) {
      for (const t of buildSheet(csoport, index).tasks) expect(CATEGORIES[catOf(t.visual)]!.groupable).toBe(true);
    }
  });

  it('az 1. szint csak az alap csoportokat használja', () => {
    const base = ['al', 'gy', 'ja', 'ru', 'ha', 'ed'];
    for (const index of range(5)) {
      for (const t of buildSheet(csoport, index).tasks) expect(base).toContain(catOf(t.visual));
    }
  });

  it('a verifikátor elkapja: a madár is állat (két feladat egy családból)', () => {
    const s = clone(buildSheet(csoport, 0));
    const idx = (cat: string) => s.tasks.findIndex((t) => catOf(t.visual) === cat);
    const i = idx('al');
    // az „állat” feladat képét madárra cseréljük, és egy másik feladatét is állatra, így két feladat egy családba esik
    s.tasks[i]!.visual = { t: 'img', id: 'kacsa' };
    const j = idx('gy');
    s.tasks[j]!.visual = { t: 'img', id: 'kutya' };
    expect(verify(s).length).toBeGreaterThan(0);
  });
});

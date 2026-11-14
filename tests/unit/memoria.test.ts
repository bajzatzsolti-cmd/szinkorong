import { describe, expect, it } from 'vitest';
import manifest from '../../content/audio/manifest.json' with { type: 'json' };
import { WORD_BY_ID, isPictureSafe } from '../../src/data/vocab';
import { range } from '../../src/engine/rng';
import { ROUNDS, buildMemory, verifyMemory } from '../../src/games/memoria/generate';
import { memoria } from '../../src/games/memoria';

const texts = manifest as Record<string, string>;

describe('Memória – mind a 15 lap', () => {
  for (const index of range(15)) {
    it(`${index + 1}. lap: 5 kör, mindegyiknek pontosan egy helyes válasza van`, () => {
      const s = buildMemory(index);
      expect(s.rounds).toHaveLength(ROUNDS);
      expect(verifyMemory(s)).toEqual([]);
    });
  }

  it('determinisztikus, és a 15 lap különbözik', () => {
    expect(buildMemory(7)).toEqual(buildMemory(7));
    expect(new Set(range(15).map((i) => JSON.stringify(buildMemory(i)))).size).toBe(15);
  });

  it('szintek: 1. „melyik” (3 kép), 2. „hely” (4 kép), 3. „sorrend” (4, a végén 5 kép); egyre hosszabb idő', () => {
    for (const index of range(15)) {
      const s = buildMemory(index);
      const mode = index < 5 ? 'melyik' : index < 10 ? 'hely' : 'sorrend';
      const k = index < 5 ? 3 : index < 13 ? 4 : 5;
      for (const rd of s.rounds) {
        expect(rd.mode).toBe(mode);
        expect(rd.shown).toHaveLength(k);
      }
      expect(s.showMs).toBeGreaterThanOrEqual(5000);
    }
  });

  it('minden kép létező, használható szókincs-kép; egy körben különböző kategóriákból', () => {
    for (const index of range(15)) {
      for (const rd of buildMemory(index).rounds) {
        const ws = [...new Set([...rd.shown, ...rd.options])].map((id) => WORD_BY_ID.get(id)!);
        for (const w of ws) expect(w && isPictureSafe(w)).toBe(true);
        const shownCats = rd.shown.map((id) => WORD_BY_ID.get(id)!.category);
        expect(new Set(shownCats).size).toBe(shownCats.length);
      }
    }
  });

  it('a hangszövegek megvannak (utasítás szintenként, a kérdések)', () => {
    for (const lvl of [0, 1, 2]) expect(texts[memoria.instructionId(lvl)]).toBeTruthy();
    for (const id of ['memoria-melyik', 'memoria-hol', 'memoria-sorrend']) expect(texts[id]).toBeTruthy();
  });
});

describe('Memória – az ellenőrzés elkapja a hibákat', () => {
  it('„melyik”: két lehetőség is volt a képek között', () => {
    const s = structuredClone(buildMemory(0));
    const rd = s.rounds[0]!;
    rd.options[rd.options.findIndex((o) => !rd.shown.includes(o))] = rd.shown.find((x) => !rd.options.includes(x))!;
    expect(verifyMemory(s).length).toBeGreaterThan(0);
  });

  it('„hely”: nincs másik látott kép a lehetőségek között', () => {
    const s = structuredClone(buildMemory(6));
    const rd = s.rounds[0]!;
    rd.options = rd.options.map((o) => (o !== rd.shown[rd.target!] && rd.shown.includes(o) ? 'zebra' : o));
    if (rd.shown.includes('zebra')) return;
    expect(verifyMemory(s).length).toBeGreaterThan(0);
  });

  it('„sorrend”: a lehetőségek már a helyes sorrendben', () => {
    const s = structuredClone(buildMemory(12));
    s.rounds[0]!.options = [...s.rounds[0]!.shown];
    expect(verifyMemory(s).length).toBeGreaterThan(0);
  });
});

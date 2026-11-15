import { describe, expect, it } from 'vitest';
import { range } from '../../src/engine/rng';
import type { Sheet } from '../../src/engine/sheet';
import type { Visual } from '../../src/render/visual';
import { buildSheet } from '../../src/topics';
import { betu } from '../../src/topics/betu';
import { FIELD } from '../../src/topics/betu/generate';
import manifest from '../../content/audio/manifest.json' with { type: 'json' };
import { LETTER_NAMES, LOWER, UPPER, letterSayId, lookalikes, similar } from '../../src/topics/betu/letters';
import { verify } from '../../src/topics/betu/verify';
import { clone, topicSuite } from './topic-suite';

const texts = manifest as Record<string, string>;

topicSuite(betu);

type Seq = Extract<Visual, { t: 'seq' }>;
type Grid = Extract<Visual, { t: 'grid' }>;
type Glyph = Extract<Visual, { t: 'glyph' }>;

const parts = (v: Visual) => {
  const [box, grid] = (v as Seq).items as [Glyph, Grid];
  return { targets: [...box.ch], field: grid.items.map((g) => (g as Glyph).ch), grid };
};

describe('Betűkereső – betűkészlet', () => {
  it('26 nagy- és 26 kisbetű, a hosszú magánhangzók nélkül', () => {
    expect(UPPER).toHaveLength(26);
    expect(LOWER).toHaveLength(26);
    for (const ch of 'ÍÓŐÚŰíóőúű') expect([...UPPER, ...LOWER]).not.toContain(ch);
  });

  it('minden nagybetűnek van hasonló társa; a hasonlóság kölcsönös', () => {
    for (const ch of UPPER) {
      expect(similar(ch).length, ch).toBeGreaterThan(0);
      for (const s of similar(ch)) expect(similar(s), `${s} ↔ ${ch}`).toContain(ch);
    }
    expect(similar('S')).toContain('Z');
    expect(similar('O')).toEqual(expect.arrayContaining(['Ö', 'C']));
    expect(similar('E')).toContain('F');
    expect(similar('M')).toContain('N');
  });

  it('minden betűnek van neve és saját hangja; kis- és nagybetű ugyanazt mondja', () => {
    const ids = new Set<string>();
    for (const ch of UPPER) {
      const id = letterSayId(ch);
      expect(id, ch).toMatch(/^betu-[a-z]+$/);
      expect(letterSayId(ch.toLowerCase())).toBe(id);
      expect(texts[id], id).toBe(`${LETTER_NAMES[ch]} betű.`);
      ids.add(id);
    }
    expect(ids.size).toBe(UPPER.length);
    expect(letterSayId('Pp')).toBe('betu-p');
    expect(letterSayId('ö')).toBe('betu-oe');
  });

  it('a nagy I és a kis l összetéveszthető', () => {
    expect(lookalikes('I')).toEqual(['l']);
    expect(lookalikes('l')).toEqual(['I']);
    expect(lookalikes('A')).toEqual([]);
  });
});

describe('Betűkereső – témakör-specifikus szabályok', () => {
  it('a korongszám szintenként 6, 6, 8', () => {
    expect([0, 5, 10].map((i) => buildSheet(betu, i).spec.n)).toEqual([6, 6, 8]);
  });

  it('a mező mérete 12, 16, 20 betű, két sorban', () => {
    for (const index of range(15)) {
      const sheet = buildSheet(betu, index);
      for (const t of sheet.tasks) {
        const { field, grid } = parts(t.visual);
        expect(field).toHaveLength(FIELD[sheet.spec.level]!);
        expect(grid.cols).toBe(field.length / 2);
      }
    }
  });

  it('a lapon belül minden darabszám különböző, és minden feladat más betűt keres', () => {
    for (const index of range(15)) {
      const sheet = buildSheet(betu, index);
      const counts = sheet.tasks.map((t) => {
        const { targets, field } = parts(t.visual);
        return field.filter((ch) => targets.includes(ch)).length;
      });
      expect(new Set(counts).size).toBe(counts.length);
      const targets = sheet.tasks.map((t) => parts(t.visual).targets[0]);
      expect(new Set(targets).size).toBe(targets.length);
    }
  });

  it('1–2. szint: pöttyök a megoldás; 3. szint: számjegy, és a keretben nagy + kis betű', () => {
    expect(buildSheet(betu, 0).answers.every((a) => a.visual.t === 'dots')).toBe(true);
    expect(buildSheet(betu, 7).answers.every((a) => a.visual.t === 'dots')).toBe(true);
    const hard = buildSheet(betu, 12);
    expect(hard.answers.every((a) => a.visual.t === 'glyph')).toBe(true);
    for (const t of hard.tasks) {
      const { targets } = parts(t.visual);
      expect(targets).toHaveLength(2);
      expect(targets[1]).toBe(targets[0]!.toLowerCase());
    }
  });

  it('a könnyű szinten nincs a keresetthez hasonló betű a mezőben', () => {
    for (const index of range(5)) {
      for (const t of buildSheet(betu, index).tasks) {
        const { targets, field } = parts(t.visual);
        const sim = similar(targets[0]!);
        expect(field.filter((ch) => sim.includes(ch))).toEqual([]);
      }
    }
  });
});

describe('Betűkereső – a verifikátor elkapja a hibákat', () => {
  const base = (index: number): Sheet => clone(buildSheet(betu, index));

  it('egy plusz keresett betű a mezőben (rossz darabszám)', () => {
    const s = base(2);
    const { targets, grid } = parts(s.tasks[0]!.visual);
    const i = grid.items.findIndex((g) => (g as Glyph).ch !== targets[0]);
    (grid.items[i] as Glyph).ch = targets[0]!;
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('hasonló betű a könnyű szint mezőjében', () => {
    const s = base(0);
    const { targets, grid } = parts(s.tasks[0]!.visual);
    const i = grid.items.findIndex((g) => (g as Glyph).ch !== targets[0]);
    (grid.items[i] as Glyph).ch = similar(targets[0]!)[0]!;
    expect(verify(s).some((p) => p.includes('hasonló'))).toBe(true);
  });

  it('összetéveszthető betű (kis l) ott, ahol a nagy I-t keressük', () => {
    const s = base(12);
    const task = s.tasks[0]!.visual as Seq;
    (task.items[0] as Glyph).ch = 'Ii';
    const grid = task.items[1] as Grid;
    grid.items.forEach((g, i) => ((g as Glyph).ch = i === 0 ? 'I' : i === 1 ? 'l' : i % 2 ? 'M' : 'm'));
    expect(verify(s).some((p) => p.includes('összetéveszthető'))).toBe(true);
  });

  it('a betű koppintásra rossz nevet mondana', () => {
    const s = base(3);
    const { grid } = parts(s.tasks[0]!.visual);
    const g = grid.items[0] as Glyph;
    g.say = letterSayId(g.ch === 'A' ? 'B' : 'A');
    expect(verify(s).some((p) => p.includes('saját nevét'))).toBe(true);
  });

  it('kisbetű az 1. szint mezőjében', () => {
    const s = base(0);
    const { targets, grid } = parts(s.tasks[0]!.visual);
    const i = grid.items.findIndex((g) => (g as Glyph).ch !== targets[0]);
    (grid.items[i] as Glyph).ch = 'k';
    expect(verify(s).some((p) => p.includes('kisbetű'))).toBe(true);
  });
});

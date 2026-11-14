import { describe, expect, it } from 'vitest';
import { range } from '../../src/engine/rng';
import type { SheetSpec } from '../../src/engine/sheet';
import type { Visual } from '../../src/render/visual';
import { buildSheet } from '../../src/topics';
import { szamolo } from '../../src/topics/szamolo';
import { COUNTABLE, kindOf } from '../../src/topics/szamolo/generate';
import { verify } from '../../src/topics/szamolo/verify';
import { clone, topicSuite } from './topic-suite';

topicSuite(szamolo);

describe('Számoló plusz – lapfajták', () => {
  it('a lapfajták sorrendje: ugyanannyi, több, eggyel több/kevesebb, szomszéd, művelet', () => {
    expect(range(15).map(kindOf)).toEqual([
      'ugyanannyi', 'ugyanannyi', 'ugyanannyi', 'tobb', 'tobb',
      'egy', 'egy', 'egy', 'szomszed', 'szomszed',
      'muvelet', 'muvelet', 'muvelet', 'muvelet', 'muvelet',
    ]);
  });

  it('minden lapfajta sok véletlen maggal is hibátlan (a közös készlet csak a szintek első lapját próbálja)', () => {
    for (const index of [3, 8]) {
      const level = Math.floor(index / 5);
      for (let seed = 1; seed <= 300; seed++) {
        const spec: SheetSpec = { topic: 'szamolo', level, index, n: szamolo.sizes[level]!, seed: seed * 7919 };
        expect(verify(szamolo.generate(spec)), `${index}. lap, mag: ${spec.seed}`).toEqual([]);
      }
    }
  });

  it('elég megszámolható kép van (a „több” lapon 12 különböző kell)', () => {
    expect(COUNTABLE.length).toBeGreaterThanOrEqual(12);
  });

  it('a 3. szinten minden eredmény 1-től 10-ig pontosan egyszer szerepel', () => {
    for (const index of range(5).map((i) => i + 10)) {
      const nums = buildSheet(szamolo, index).answers.map((a) => Number((a.visual as Extract<Visual, { t: 'glyph' }>).ch));
      expect(nums.sort((a, b) => a - b)).toEqual(range(10).map((i) => i + 1));
    }
  });

  it('a képek szétszórva állnak, legfeljebb 10 egy csoportban', () => {
    for (const index of range(15)) {
      for (const t of buildSheet(szamolo, index).tasks) {
        const groups = t.visual.t === 'scatter' ? [t.visual] : t.visual.t === 'seq' ? t.visual.items.filter((x) => x.t === 'scatter') : [];
        for (const g of groups) expect((g as Extract<Visual, { t: 'scatter' }>).items.length).toBeLessThanOrEqual(10);
      }
    }
  });
});

describe('Számoló plusz – a verifikátor elkapja a hibákat', () => {
  it('egy képpel több a csoportban, mint a megoldás', () => {
    const s = clone(buildSheet(szamolo, 0));
    const t = s.tasks[0]!.visual as Extract<Visual, { t: 'scatter' }>;
    if (t.items.length < 10) t.items.push({ ...t.items[0]!, x: 0, y: 0 });
    else t.items.pop();
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('pötty és számjegy ugyanarra a számra egy lapon (kétértelmű)', () => {
    const s = clone(buildSheet(szamolo, 12));
    const a = s.answers[0]!.visual as Extract<Visual, { t: 'glyph' }>;
    s.answers[0]!.visual = { t: 'dots', k: Number(a.ch) };
    s.answers[1]!.visual = { t: 'glyph', ch: a.ch };
    expect(verify(s).length).toBeGreaterThan(0);
  });

  it('a „több” lapon a kevesebb tárgy a megoldás', () => {
    const s = clone(buildSheet(szamolo, 3));
    const t = s.tasks[0]!.visual as Extract<Visual, { t: 'seq' }>;
    const [a, , b] = t.items as Extract<Visual, { t: 'scatter' }>[];
    const less = a!.items.length < b!.items.length ? a! : b!;
    const ans = s.answers.find((x) => x.disc === s.tasks[0]!.disc)!;
    ans.visual = { t: 'img', id: less.items[0]!.id };
    expect(verify(s).length).toBeGreaterThan(0);
  });
});

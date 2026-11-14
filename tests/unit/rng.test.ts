import { describe, expect, it } from 'vitest';
import { hashString, int, mulberry32, pick, range, shuffle } from '../../src/engine/rng';

describe('rng', () => {
  it('ugyanaz a mag ugyanazt a sorozatot adja', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 50; i++) expect(a()).toBe(b());
  });

  it('különböző magok különböző sorozatot adnak', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  it('az értékek [0, 1) között vannak', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('int: mindkét végpontot eléri, és nem lép túl', () => {
    const r = mulberry32(3);
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(int(r, 2, 5));
    expect([...seen].sort()).toEqual([2, 3, 4, 5]);
  });

  it('shuffle: permutáció, az eredetit nem módosítja', () => {
    const src = range(10);
    const out = shuffle(mulberry32(9), src);
    expect(src).toEqual(range(10));
    expect([...out].sort((x, y) => x - y)).toEqual(range(10));
  });

  it('pick: a tömb eleme', () => {
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 20; i++) expect(arr).toContain(pick(mulberry32(i), arr));
  });

  it('hashString: stabil és különböző szövegekre különböző', () => {
    expect(hashString('minta|0|v1')).toBe(hashString('minta|0|v1'));
    expect(hashString('minta|0|v1')).not.toBe(hashString('minta|1|v1'));
  });
});

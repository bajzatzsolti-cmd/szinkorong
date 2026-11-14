import { describe, expect, it } from 'vitest';
import { DISCS, discInner } from '../../src/render/disc';

describe('korongok', () => {
  it('10 korong van: 6 telt és 4 gyűrűs', () => {
    expect(DISCS).toHaveLength(10);
    expect(DISCS.filter((d) => !d.ring)).toHaveLength(6);
    expect(DISCS.filter((d) => d.ring)).toHaveLength(4);
  });

  it('színtévesztő-barát: minden koronghoz egyedi jel tartozik', () => {
    const glyphs = DISCS.map((d) => d.glyph);
    expect(new Set(glyphs).size).toBe(10);
  });

  it('a szín + gyűrű páros is egyedi', () => {
    const keys = DISCS.map((d) => `${d.hex}:${d.ring}`);
    expect(new Set(keys).size).toBe(10);
  });

  it('az azonosítók 0..9 sorrendben vannak', () => {
    expect(DISCS.map((d) => d.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('minden korongnak van rajzolható jele', () => {
    for (const d of DISCS) expect(discInner(d.id)).toContain('<svg');
  });
});

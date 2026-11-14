import { describe, expect, it } from 'vitest';
import {
  exactKey,
  extent,
  freeKey,
  hasFourOrientations,
  isChiral,
  mirror,
  normalize,
  orientedKey,
  parseRune,
  rotate,
} from '../../src/render/lattice';
import { POLYS, RUNES } from '../../src/topics/tukor/figures';

const L = [[0, 0], [0, 1], [0, 2], [1, 2]]; // L-tetromino
const SQUARE = [[0, 0], [1, 0], [0, 1], [1, 1]];
const T = [[0, 0], [1, 0], [2, 0], [1, 1]]; // T-tetromino: tükörszimmetrikus

describe('rácsalakzatok geometriája', () => {
  it('normalize: a bal felső sarokba tol és sorba rendez', () => {
    expect(normalize([[5, 7], [4, 7]])).toEqual([[0, 0], [1, 0]]);
    expect(normalize([[2, 2, 2, 1]])).toEqual([[0, 0, 0, 1]]); // él: a végpontok is rendezve
  });

  it('négy 90°-os forgatás visszaadja az eredetit', () => {
    expect(exactKey(rotate(L, 4))).toBe(exactKey(L));
    expect(exactKey(rotate(rotate(L, 1), 3))).toBe(exactKey(L));
  });

  it('a tükrözés önmaga inverze', () => {
    expect(exactKey(mirror(mirror(L)))).toBe(exactKey(L));
  });

  it('az elforgatott alakzat forgatás-független kulcsa azonos, a tükörképé (királis alakzatnál) más', () => {
    for (const k of [1, 2, 3]) expect(orientedKey(rotate(L, k))).toBe(orientedKey(L));
    expect(orientedKey(mirror(L))).not.toBe(orientedKey(L));
    expect(freeKey(mirror(L))).toBe(freeKey(L));
    expect(freeKey(rotate(mirror(L), 3))).toBe(freeKey(L));
  });

  it('királis-e: az L igen, a négyzet és a T nem', () => {
    expect(isChiral(L)).toBe(true);
    expect(isChiral(SQUARE)).toBe(false);
    expect(isChiral(T)).toBe(false);
  });

  it('forgási szimmetria: az L-nek négy különböző állása van, a négyzetnek egy', () => {
    expect(hasFourOrientations(L)).toBe(true);
    expect(hasFourOrientations(SQUARE)).toBe(false);
  });

  it('parseRune: töröttvonalból egységnyi élek, az átló is megengedett', () => {
    expect(parseRune('0,0 0,2')).toEqual([[0, 0, 0, 1], [0, 1, 0, 2]]);
    expect(parseRune('0,0 1,1')).toEqual([[0, 0, 1, 1]]);
    expect(() => parseRune('0,0 2,1')).toThrow();
  });

  it('a b-szerű jel elforgatva q, tükrözve d: ugyanaz a fajta, de a b és a d nem forgatható egymásba', () => {
    const b = parseRune('0,0 0,3; 0,3 1,3 1,2 0,2');
    expect(orientedKey(rotate(b, 2))).toBe(orientedKey(b)); // q
    expect(orientedKey(mirror(b))).not.toBe(orientedKey(b)); // d
    expect(freeKey(mirror(b))).toBe(freeKey(b));
  });
});

describe('a „Tükör és forgatás” alakzatkészlete', () => {
  for (const [name, pool, maxW, maxH] of [
    ['rácsnégyzetes alakzatok', POLYS, 4, 4],
    ['betűszerű jelek', RUNES, 3, 3],
  ] as const) {
    describe(name, () => {
      it('legalább 10 alakzat van', () => {
        expect(pool.length).toBeGreaterThanOrEqual(10);
      });

      for (const fig of pool) {
        it(`${fig.id}: királis, nincs forgási szimmetriája, belefér a rajzterületbe`, () => {
          expect(isChiral(fig.data)).toBe(true);
          expect(hasFourOrientations(fig.data)).toBe(true);
          const e = extent(fig.data);
          expect(Math.max(e.w, e.h)).toBeLessThanOrEqual(Math.max(maxW, maxH));
        });
      }

      it('az alakzatok páronként különböző fajtájúak (forgatva, tükrözve sem egyeznek)', () => {
        const keys = pool.map((f) => freeKey(f.data));
        expect(new Set(keys).size).toBe(keys.length);
      });
    });
  }
});

// Determinisztikus véletlen: ugyanaz a mag mindig ugyanazt a sorozatot adja.
// Ettől lesz minden lap mindig ugyanaz (a nyomtatáshoz és a teszteléshez is ez kell).

export type Rng = () => number;

/** FNV-1a 32 bites hash: szövegből magot készít. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: kicsi, gyors, jó eloszlású generátor. [0, 1) közötti számokat ad. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Egész szám min..max között (mindkét végpont benne van). */
export function int(r: Rng, min: number, max: number): number {
  return min + Math.floor(r() * (max - min + 1));
}

export function pick<T>(r: Rng, arr: readonly T[]): T {
  return arr[Math.floor(r() * arr.length)] as T;
}

/** Fisher–Yates keverés; az eredeti tömböt nem módosítja. */
export function shuffle<T>(r: Rng, arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

export const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);

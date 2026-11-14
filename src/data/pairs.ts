// A „Mi tartozik össze?” párok betöltése (content/parok.json) és a kapcsolati háló.
import raw from '../../content/parok.json' with { type: 'json' };

export type Pair = readonly [string, string];

const data = raw as unknown as { pairs: Pair[]; also: Pair[] };

/** A párként használható összetartozások. */
export const PAIRS: readonly Pair[] = data.pairs;

/** További elfogadható összetartozások (nem használjuk párként, de ütközést jeleznek). */
export const ALSO: readonly Pair[] = data.also;

/** Szó → mindazok a szavak, amelyek hozzá tartozhatnak (párok + also; szimmetrikus). */
export const RELATED: ReadonlyMap<string, ReadonlySet<string>> = (() => {
  const m = new Map<string, Set<string>>();
  const add = (a: string, b: string): void => {
    if (!m.has(a)) m.set(a, new Set());
    m.get(a)!.add(b);
  };
  for (const [a, b] of [...PAIRS, ...ALSO]) {
    add(a, b);
    add(b, a);
  }
  return m;
})();

export const related = (a: string, b: string): boolean => RELATED.get(a)?.has(b) ?? false;

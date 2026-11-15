// A Betűkereső betűkészlete és a „hasonló betűk” csoportjai.
//
// A készletből szándékosan kimaradnak a hosszú magánhangzók (Í, Ó, Ő, Ú, Ű): ezek csak az ékezet
// fajtájában térnek el rövid párjuktól (O–Ó, Ö–Ő), ami egy ötévesnek betűkeresésben túl finom különbség.
// (Ideiglenes döntés, a szülő jóváhagyására vár.)

export const UPPER: readonly string[] = [...'AÁBCDEÉFGHIJKLMNOÖPRSTUÜVZ'];
export const LOWER: readonly string[] = UPPER.map((c) => c.toLowerCase());

/** Egymáshoz hasonló alakú nagybetűk. */
const GROUPS_UPPER: readonly (readonly string[])[] = [
  ['S', 'Z'],
  ['O', 'Ö', 'C', 'G'],
  ['E', 'É', 'F'],
  ['M', 'N', 'H'],
  ['A', 'Á', 'V'],
  ['U', 'Ü', 'V'],
  ['B', 'P', 'R', 'D'],
  ['I', 'J', 'L', 'T'],
  ['K', 'H'],
];

/** Egymáshoz hasonló alakú kisbetűk. */
const GROUPS_LOWER: readonly (readonly string[])[] = [
  ['s', 'z'],
  ['o', 'ö', 'c', 'e', 'a', 'á'],
  ['e', 'é'],
  ['m', 'n', 'h', 'u'],
  ['u', 'ü', 'v'],
  ['b', 'd', 'p'],
  ['i', 'j', 'l', 't', 'f'],
  ['k', 'h'],
  ['r', 'n'],
];

/** A betűhöz hasonló alakú (azonos írásmódú: kis- vagy nagy-) betűk. */
export function similar(ch: string): string[] {
  const out = new Set<string>();
  for (const g of [...GROUPS_UPPER, ...GROUPS_LOWER]) {
    if (g.includes(ch)) for (const c of g) if (c !== ch) out.add(c);
  }
  return [...out];
}

/** Más betű, de a kerekített betűtípusban ugyanúgy néz ki: az egyik nem lehet ott, ahol a másikat keressük. */
const LOOKALIKE: readonly (readonly [string, string])[] = [['I', 'l']];

export const lookalikes = (ch: string): string[] =>
  LOOKALIKE.flatMap(([a, b]) => (a === ch ? [b] : b === ch ? [a] : []));

/**
 * A betűk neve, ahogy koppintásra elhangzik („Pé betű.”). A gépi hang a betű puszta alakját („P betű”) néha
 * rosszul olvassa, ezért a hangszöveg a kiejtett nevet írja. A kis- és nagybetű ugyanazt a hangot kapja.
 */
export const LETTER_NAMES: Readonly<Record<string, string>> = {
  A: 'A', Á: 'Á', B: 'Bé', C: 'Cé', D: 'Dé', E: 'E', É: 'É', F: 'Ef', G: 'Gé', H: 'Há', I: 'I', J: 'Jé', K: 'Ká',
  L: 'El', M: 'Em', N: 'En', O: 'O', Ö: 'Ö', P: 'Pé', R: 'Er', S: 'Es', T: 'Té', U: 'U', Ü: 'Ü', V: 'Vé', Z: 'Zé',
};

const ASCII: Readonly<Record<string, string>> = { Á: 'aa', É: 'ee', Ö: 'oe', Ü: 'ue' };

/** A betű hang-azonosítója a manifestben (ékezet nélkül, hogy a saját felvétel fájlneve is egyszerű legyen): betu-p, betu-aa. */
export const letterSayId = (ch: string): string => {
  const up = [...ch][0]!.toUpperCase();
  return `betu-${ASCII[up] ?? up.toLowerCase()}`;
};

export const isUpper = (ch: string): boolean => UPPER.includes(ch);
export const isLower = (ch: string): boolean => LOWER.includes(ch);

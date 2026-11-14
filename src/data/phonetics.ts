// Magyar hangtani segédfüggvények a szókincshez: hangokra bontás, szótagszám.
// A fájl szándékosan importmentes és csak törölhető típusszintaxist használ, hogy a Node
// közvetlenül is futtathassa (scripts/vocab-report.mjs), a böngészős kód pedig ugyanezt használja.
//
// Szabályok:
//  • A kétjegyű betűk (cs, sz, zs, gy, ny, ty, ly, dz) és a háromjegyű dzs EGY hangnak számítanak.
//  • A kettőzött betűvel írt hosszú mássalhangzók (ssz, ccs, ggy, lly, nny, tty, zzs) két egyforma hangot adnak (ssz = sz + sz).
//  • A szótagszám a magánhangzók száma (a magyarban minden magánhangzó-betű egy szótag magja),
//    KIVÉVE az au/eu hangkapcsolatot idegen szavakban (autó, euró): ott bizonytalan, ezért megjelöljük.

export const VOWELS = 'aáeéiíoóöőuúüű';

const TRIGRAPHS = ['dzs'];
const DIGRAPHS = ['cs', 'dz', 'gy', 'ly', 'ny', 'sz', 'ty', 'zs'];
const LONG_DIGRAPHS = ['ssz', 'ccs', 'ggy', 'lly', 'nny', 'tty', 'zzs'];

/** Szó → hangok. A kétjegyű betű egy elem: "csiga" → ["cs","i","g","a"]. */
export function tokenize(word: string): string[] {
  const w = word.toLowerCase();
  const out: string[] = [];
  let i = 0;
  while (i < w.length) {
    const three = w.slice(i, i + 3);
    const two = w.slice(i, i + 2);
    if (TRIGRAPHS.includes(three)) {
      out.push(three);
      i += 3;
    } else if (LONG_DIGRAPHS.includes(three)) {
      const d = three.slice(1);
      out.push(d, d);
      i += 3;
    } else if (DIGRAPHS.includes(two)) {
      out.push(two);
      i += 2;
    } else {
      out.push(w[i] as string);
      i += 1;
    }
  }
  return out;
}

export interface Derived {
  phon: string[];
  startSound: string;
  endSound: string;
  syllables: number;
  /** Bizonytalan nyelvi adat: a szülő ellenőrzésére vár. */
  flags: string[];
}

export const CHECK = '[ELLENŐRIZNI]';

export function derive(word: string): Derived {
  const phon = tokenize(word);
  const flags: string[] = [];
  const lower = word.toLowerCase();
  const syllables = [...lower].filter((c) => VOWELS.includes(c)).length;

  if (/(au|eu)/.test(lower)) flags.push(`${CHECK} szótagszám: az „au/eu” egy vagy két szótag? (autó: au-tó = 2?)`);
  const edges = [phon[0], phon[phon.length - 1]];
  if (edges.includes('ly')) flags.push(`${CHECK} az „ly” hangja j: kezdő/végső hangnál ne használjuk`);
  if (edges.includes('dz') || edges.includes('dzs')) flags.push(`${CHECK} dz/dzs hang a szó szélén`);

  return {
    phon,
    startSound: phon[0] as string,
    endSound: phon[phon.length - 1] as string,
    syllables,
    flags,
  };
}

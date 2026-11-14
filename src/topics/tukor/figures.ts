// A „Tükör és forgatás” alakzatkészlete. Minden alakzat KIRÁLIS (a tükörképe nem forgatható önmagába,
// mint a b és a d) és nincs forgási szimmetriája (a négy elforgatottja négy különböző rajz).
// Ezt a tests/unit/lattice.test.ts minden alakzatra ellenőrzi.
import { parseRune, type Pts } from '../../render/lattice';

export interface Figure {
  id: string;
  data: Pts;
}

/** Rácsnégyzetekből álló alakzatok (legfeljebb 4 × 4 cella). */
export const POLYS: readonly Figure[] = [
  { id: 'l4', data: [[0, 0], [0, 1], [0, 2], [1, 2]] },
  { id: 'f5', data: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]] },
  { id: 'l5', data: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]] },
  { id: 'n5', data: [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3]] },
  { id: 'p5', data: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]] },
  { id: 'y5', data: [[0, 0], [0, 1], [1, 1], [0, 2], [0, 3]] },
  { id: 'p6', data: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [0, 3]] },
  { id: 'c6', data: [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2], [1, 2]] },
  { id: 't6', data: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2], [2, 2]] },
  { id: 's6', data: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2], [2, 3]] },
];

/**
 * Vonalas, betűszerű jelek (kitalált jelek, nem valódi betűk): egy szár és rajta aszimmetrikus ágak,
 * ugyanolyan jellegű tévesztésekhez, mint a b–d–p–q. Rács: x 0..2, y 0..3.
 */
export const RUNES: readonly Figure[] = [
  ['r1', '0,0 0,3; 0,0 1,0 1,1'],
  ['r2', '0,0 0,3; 0,1 1,2'], // (nem a szár végéről induló ág: az az 1-es számjegyre hasonlítana)
  ['r3', '0,0 0,3; 0,2 2,2'], // (nem „csésze”: az a 4-es számjegyre hasonlítana)
  ['r4', '1,0 1,3; 1,0 0,0; 1,2 2,2'],
  ['r5', '0,0 0,3 1,3; 0,1 1,1'],
  ['r6', '0,0 2,0; 1,0 1,3 2,3'],
  ['r7', '1,0 0,0 0,2 1,3'],
  ['r8', '0,3 0,0 1,1 2,0'],
  ['r9', '0,0 0,3; 0,3 1,2; 0,0 1,0'],
  ['r10', '0,3 0,1 1,0 2,1'],
  ['r11', '0,0 1,0 1,3 2,3; 1,1 2,1'],
  ['r12', '0,0 0,3 2,3 2,2'],
].map(([id, spec]) => ({ id: id as string, data: parseRune(spec as string) }));

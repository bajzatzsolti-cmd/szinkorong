// Hangoló plusz: a hangtani szabályok (a generátor és a verifikátor is ezekből dolgozik; ezek adatok, nem megoldó logika).
//
// A szülővel egyeztetett elvek (terv, 12. kérdés, „Mind javaslat szerint”):
//  • a kétjegyű betű (cs, sz, zs, gy, ny, ty, ly, dz) és a dzs EGY hang (a szókincs hangokra bontása így készül);
//  • az „ly” hangja j: a j-vel vagy ly-nal kezdődő (végződő) szavak a kezdőhang (végső hang) feladatból kimaradnak;
//  • a zöngés–zöngétlen párok (b–p, d–t, g–k, v–f, z–sz, zs–s, gy–ty, dz–c, dzs–cs) nem lehetnek egy lapon
//    ugyanabban a szerepben: egy ötévesnek ezek könnyen összecsúsznak;
//  • a rövid és a hosszú magánhangzó (a–á, o–ó…) különböző hang;
//  • csak egyértelmű nevű, ellenőrzésre nem váró szó (a szókincs clearName és [ELLENŐRIZNI] jelzése alapján);
//  • szótagszám: 1–4 (a megoldás a tapsok száma, pöttyökkel).
import { CATEGORIES, type Word } from '../../data/vocab';
import { related } from '../../data/pairs';

/** Korongszám szintenként. */
export const SIZES = [6, 8, 10] as const;

export type Rule = 'kezdo' | 'veg' | 'szotag';
export type SoundRule = Exclude<Rule, 'szotag'>;

/** A feladat melletti jel: melyik szabály szerint kell keresni. */
export const RULE_SYM = { kezdo: 'snd-start', veg: 'snd-end', szotag: 'syl' } as const;

export const MAX_SYLLABLES = 4;

const VOICED_PAIRS: readonly (readonly [string, string])[] = [
  ['b', 'p'],
  ['d', 't'],
  ['g', 'k'],
  ['v', 'f'],
  ['z', 'sz'],
  ['zs', 's'],
  ['gy', 'ty'],
  ['dz', 'c'],
  ['dzs', 'cs'],
];

/** Az „ly” ugyanúgy hangzik, mint a „j”. */
const norm = (s: string): string => (s === 'ly' ? 'j' : s);

export const soundOf = (w: Word, rule: SoundRule): string => norm(rule === 'kezdo' ? w.startSound : w.endSound);

/** Ugyanaz a hang, vagy egy ötévesnek könnyen összetéveszthető (zöngés–zöngétlen pár). */
export function confusable(a: string, b: string): boolean {
  const x = norm(a);
  const y = norm(b);
  return x === y || VOICED_PAIRS.some(([p, q]) => (x === p && y === q) || (x === q && y === p));
}

/** Hangoló plusz feladatban használható szó (egyértelmű név, nincs nyitott hangtani vagy képi kérdés). */
export const isSoundSafe = (w: Word): boolean => w.clearName && w.flags.length === 0 && !/\s/.test(w.hu);

/** A szó használható-e az adott szabályhoz. */
export function fitsRule(w: Word, rule: Rule): boolean {
  if (!isSoundSafe(w)) return false;
  if (rule === 'szotag') return w.syllables >= 1 && w.syllables <= MAX_SYLLABLES;
  return soundOf(w, rule) !== 'j';
}

/**
 * „Kerülőút”: a feladat képe és a megoldás képe más módon is összetartozik (azonos csoport, összetartozó pár),
 * így a gyerek a hang nélkül is megtalálhatná. Ezt a hangtani feladatban kerülni kell.
 */
export function shortcut(a: Word, b: Word): boolean {
  const fa = CATEGORIES[a.category]?.family ?? a.category;
  const fb = CATEGORIES[b.category]?.family ?? b.category;
  return fa === fb || related(a.id, b.id) || (!!a.twin && a.twin === b.twin);
}

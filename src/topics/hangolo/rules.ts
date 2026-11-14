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
import rimekRaw from '../../../content/rimek.json' with { type: 'json' };
import { CATEGORIES, WORD_BY_ID, type Word } from '../../data/vocab';
import { VOWELS } from '../../data/phonetics';
import { related } from '../../data/pairs';

/** Korongszám szintenként. */
export const SIZES = [6, 8, 10] as const;

export type Rule = 'kezdo' | 'veg' | 'szotag' | 'rim';
export type SoundRule = 'kezdo' | 'veg';

/** A feladat melletti jel: melyik szabály szerint kell keresni. */
export const RULE_SYM = { kezdo: 'snd-start', veg: 'snd-end', szotag: 'syl', rim: 'snd-rhyme' } as const;

/** A jóváhagyott rímpárok (content/rimek.json). */
export const RHYME_PAIRS: readonly (readonly [string, string])[] = (rimekRaw as unknown as { parok: [string, string][] }).parok;
const PARTNER = new Map<string, string>(RHYME_PAIRS.flatMap(([a, b]) => [[a, b], [b, a]] as [string, string][]));
export const rhymePartner = (w: Word): Word | undefined => {
  const id = PARTNER.get(w.id);
  return id ? WORD_BY_ID.get(id) : undefined;
};

/**
 * A szó „rímkulcsa” (a majdnem-rímek kiszűréséhez): mássalhangzóra végződő szónál az utolsó magánhangzótól a
 * végéig (kéz → éz, bárány → ány), magánhangzóra végződőnél az utolsó mássalhangzó + a záró magánhangzó
 * (róka → ka, esernyő → nyő, olló → ló). Két szó, amelynek azonos a rímkulcsa, egy ötévesnek rímel.
 */
export function rimeKey(w: Word): string {
  const p = w.phon;
  const isV = (t: string): boolean => VOWELS.includes(t);
  if (isV(p[p.length - 1]!)) {
    const cons = p.length >= 2 && !isV(p[p.length - 2]!) ? p[p.length - 2]! : '';
    return cons + p[p.length - 1]!;
  }
  let i = p.length - 1;
  while (i > 0 && !isV(p[i]!)) i--;
  return p.slice(i).join('');
}

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
  if (rule === 'rim') {
    const p = rhymePartner(w);
    return !!p && isSoundSafe(p);
  }
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
